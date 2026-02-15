import { exec, spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

type Language = 'javascript' | 'python' | 'java' | 'cpp';

interface ExecutionCommand {
    command: string;
    args: string[];
    postCompile?: {
        command: string;
        args: string[];
    };
}

interface ExecutionResult {
    output: string;
    error: string;
    executionTime: number;
    memoryUsage?: number;
    isError: boolean;
}

const TEMP_DIR = path.join(os.tmpdir(), 'code-exec');

// Ensure temp directory exists
import { mkdir } from 'fs/promises';
mkdir(TEMP_DIR, { recursive: true }).catch(console.error);

export class CodeExecutionService {
    private static normalizeInputToStdin(raw: unknown): string {
        if (raw === null || raw === undefined) return '';

        if (Array.isArray(raw)) {
            return raw
                .map((v) => {
                    if (v === null || v === undefined) return '';
                    if (typeof v === 'string') return v;
                    if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
                    try {
                        return JSON.stringify(v);
                    } catch {
                        return String(v);
                    }
                })
                .join('\n');
        }

        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            if (!trimmed) return '';

            if (
                (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
                (trimmed.startsWith('{') && trimmed.endsWith('}'))
            ) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return this.normalizeInputToStdin(parsed);
                    }
                } catch {
                    // fall through
                }
            }

            return raw;
        }

        if (typeof raw === 'number' || typeof raw === 'boolean' || typeof raw === 'bigint') return String(raw);

        try {
            return JSON.stringify(raw);
        } catch {
            return String(raw);
        }
    }

    private static async writeToTempFile(code: string, extension: string): Promise<{ filePath: string, className?: string }> {
        const filename = `${uuidv4()}.${extension}`;
        const filePath = join(TEMP_DIR, filename);
        await writeFile(filePath, code);
        return { filePath };
    }

    private static buildFunctionRunnerSource(language: Language, userCode: string): { source: string; extension: string } {
        switch (language) {
            case 'javascript': {
                const source = `"use strict";
const __INPUT__ = process.env.INPUT ?? "";
const __ORIGINAL_CONSOLE_LOG__ = console.log;
console.log = () => {};
console.error = () => {};

${userCode}

async function __run__() {
  try {
    const fn = (typeof solve === "function") ? solve : (typeof run === "function" ? run : null);
    if (!fn) {
      __ORIGINAL_CONSOLE_LOG__("ERROR: Please define a function named solve(input) (or run(input)) that returns the output.");
      process.exitCode = 1;
      return;
    }
    const result = await fn(__INPUT__);
    const out = (result === undefined || result === null) ? "" : String(result);
    __ORIGINAL_CONSOLE_LOG__(out);
  } catch (e) {
    __ORIGINAL_CONSOLE_LOG__(String(e && e.stack ? e.stack : e));
    process.exitCode = 1;
  }
}

__run__();
`;
                return { source, extension: 'js' };
            }
            case 'python': {
                const source = `import os
import sys
import builtins

_orig_print = builtins.print
def _blocked_print(*args, **kwargs):
    return None
builtins.print = _blocked_print

INPUT = os.environ.get("INPUT", "")

${userCode}

def __get_fn():
    if "solve" in globals() and callable(globals()["solve"]):
        return globals()["solve"]
    if "run" in globals() and callable(globals()["run"]):
        return globals()["run"]
    return None

def __main():
    fn = __get_fn()
    if fn is None:
        _orig_print("ERROR: Please define a function named solve(input) (or run(input)) that returns the output.")
        sys.exit(1)
    try:
        result = fn(INPUT)
        out = "" if result is None else str(result)
        sys.stdout.write(out)
    except Exception as e:
        _orig_print(str(e))
        sys.exit(1)

if __name__ == "__main__":
    __main()
`;
                return { source, extension: 'py' };
            }
            case 'java': {
                const normalizedUserCode = this.stripJavaPackageDeclaration(userCode);
                const solutionHasClass = /\bclass\s+Solution\b/.test(normalizedUserCode);
                const imports = `import java.io.*;\nimport java.util.*;\n`;

                const solutionSource = solutionHasClass
                    ? `${imports}\n${normalizedUserCode}\n`
                    : `${imports}\nclass Solution {\n${normalizedUserCode}\n}\n`;

                const mainSource = `import java.io.*;\nimport java.util.*;\nimport java.lang.reflect.*;\n\npublic class Main {\n\n    public static void main(String[] args) throws Exception {\n        String inputStr = System.getenv("INPUT");\n        if (inputStr == null) inputStr = "";\n\n        Scanner sc = new Scanner(inputStr);\n        ArrayList<Integer> allInts = new ArrayList<>();\n        while (sc.hasNextInt()) {\n            allInts.add(sc.nextInt());\n        }\n\n        PrintStream originalOut = System.out;\n        try {\n            System.setOut(new PrintStream(OutputStream.nullOutputStream()));\n\n            Class<?> cls = Class.forName("Solution");\n            Object instance = null;\n\n            Method m = null;\n            Object[] params = null;\n\n            // Try solve(int[], int) - e.g. for target sum problems\n            try {\n                m = cls.getDeclaredMethod("solve", int[].class, int.class);\n                if (allInts.size() >= 2) {\n                    int n = allInts.get(0);\n                    int[] arr = new int[n];\n                    for (int i = 0; i < n && i + 1 < allInts.size(); i++) {\n                        arr[i] = allInts.get(i + 1);\n                    }\n                    int target = allInts.get(allInts.size() - 1);\n                    params = new Object[]{arr, target};\n                }\n            } catch (NoSuchMethodException ignored) {}\n\n            // Try solve(int[])\n            if (m == null) {\n                try {\n                    m = cls.getDeclaredMethod("solve", int[].class);\n                    if (allInts.size() > 0) {\n                        int n = allInts.get(0);\n                        if (n == allInts.size() - 1) {\n                            int[] arr = new int[n];\n                            for (int i = 0; i < n; i++) arr[i] = allInts.get(i + 1);\n                            params = new Object[]{arr};\n                        } else {\n                            int[] arr = new int[allInts.size()];\n                            for (int i = 0; i < allInts.size(); i++) arr[i] = allInts.get(i);\n                            params = new Object[]{arr};\n                        }\n                    } else {\n                        params = new Object[]{new int[0]};\n                    }\n                } catch (NoSuchMethodException ignored) {}\n            }\n\n            // Try solve(String)\n            if (m == null) {\n                try {\n                    m = cls.getDeclaredMethod("solve", String.class);\n                    params = new Object[]{inputStr};\n                } catch (NoSuchMethodException ignored) {}\n            }\n\n            // Try solve()\n            if (m == null) {\n                try {\n                    m = cls.getDeclaredMethod("solve");\n                    params = new Object[]{};\n                } catch (NoSuchMethodException ignored) {}\n            }\n\n            if (m == null) {\n                System.setOut(originalOut);\n                System.out.print("ERROR: Suitable solve method not found. Found methods: " + Arrays.toString(cls.getDeclaredMethods()));\n                System.exit(1);\n            }\n\n            m.setAccessible(true);\n            if (!Modifier.isStatic(m.getModifiers())) {\n                instance = cls.getDeclaredConstructor().newInstance();\n            }\n\n            Object ret = m.invoke(instance, params);\n\n            System.setOut(originalOut);\n            if (m.getReturnType() != Void.TYPE && ret != null) {\n                System.out.print(String.valueOf(ret));\n            }\n        } catch (Throwable t) {\n            System.setOut(originalOut);\n            t.printStackTrace(originalOut);\n            System.exit(1);\n        }\n    }\n}\n`;

                const combined = `//__JAVA_MULTIFILE__\n${solutionSource}\n//__JAVA_MAIN__\n${mainSource}`;
                return { source: combined, extension: 'java' };
            }
            case 'cpp': {
                const source = `#include <bits/stdc++.h>
using namespace std;

${userCode}

int main() {
    const char* envInput = std::getenv("INPUT");
    std::string input = envInput ? std::string(envInput) : std::string();

    std::streambuf* oldCout = std::cout.rdbuf();
    std::ostringstream nullStream;
    std::cout.rdbuf(nullStream.rdbuf());

    try {
        std::string result = solve(input);
        std::cout.rdbuf(oldCout);
        std::cout << result;
    } catch (...) {
        std::cout.rdbuf(oldCout);
        std::cerr << "Runtime Error";
        return 1;
    }
    return 0;
}
`;
                return { source, extension: 'cpp' };
            }
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    private static stripJavaComments(code: string): string {
        const withoutBlockComments = code.replace(/\/\*[\s\S]*?\*\//g, '');
        const withoutLineComments = withoutBlockComments.replace(/(^|\s)\/\/.*$/gm, '$1');
        return withoutLineComments;
    }

    private static extractPublicJavaClassName(code: string): string | undefined {
        const match = code.match(/public\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
        return match?.[1];
    }

    private static stripJavaPackageDeclaration(code: string): string {
        return code.replace(/^\s*package\s+[^;]+;\s*/m, '');
    }

    private static async prepareJavaWorkDir(code: string): Promise<{ workDir: string; mainClass: string; cleanupFiles: string[]; compileArgs: string[] }> {
        const workDir = path.join(TEMP_DIR, uuidv4());
        await mkdir(workDir, { recursive: true });

        const cleanupFiles: string[] = [];
        const codeWithoutComments = this.stripJavaComments(code);
        const hasMain = /public\s+static\s+void\s+main\s*\(/.test(codeWithoutComments);
        const publicClass = this.extractPublicJavaClassName(codeWithoutComments);

        if (hasMain && publicClass) {
            const sourcePath = path.join(workDir, `${publicClass}.java`);
            await writeFile(sourcePath, code);
            cleanupFiles.push(sourcePath);
            return { workDir, mainClass: publicClass, cleanupFiles, compileArgs: [`${publicClass}.java`] };
        }

        const normalizedUserCode = this.stripJavaPackageDeclaration(code);

        const solutionHasClass = /\bclass\s+Solution\b/.test(normalizedUserCode);
        const solutionSource = solutionHasClass
            ? normalizedUserCode
            : `import java.io.*;\nimport java.util.*;\n\nclass Solution {\n${normalizedUserCode}\n}\n`;

        const solutionPath = path.join(workDir, 'Solution.java');
        await writeFile(solutionPath, solutionSource);
        cleanupFiles.push(solutionPath);

        const hasStaticSolve = /static\s+void\s+solve\s*\(/.test(solutionSource);
        const solveCall = hasStaticSolve ? 'Solution.solve();' : 'new Solution().solve();';

        const mainSource = `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        ${solveCall}\n    }\n}\n`;
        const mainPath = path.join(workDir, 'Main.java');
        await writeFile(mainPath, mainSource);
        cleanupFiles.push(mainPath);

        return { workDir, mainClass: 'Main', cleanupFiles, compileArgs: ['Main.java', 'Solution.java'] };
    }

    private static async executeCommand(
        command: string,
        args: string[],
        input?: string,
        cwd: string = TEMP_DIR,
        extraEnv?: Record<string, string>
    ): Promise<ExecutionResult> {
        return new Promise((resolve) => {
            const startTime = process.hrtime();
            const processEnv = { ...process.env, PWD: cwd, ...(extraEnv ?? {}) };

            const child = spawn(command, args, {
                cwd,
                env: processEnv,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let errorOutput = '';
            let timeout: NodeJS.Timeout;

            // Set a timeout for the execution
            timeout = setTimeout(() => {
                child.kill();
                errorOutput = 'Execution timed out (5 seconds)';
                resolve({
                    output: output.trim(),
                    error: errorOutput.trim(),
                    executionTime: 5000,
                    isError: true
                });
            }, 5000);

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                clearTimeout(timeout);
                const endTime = process.hrtime(startTime);
                const executionTime = endTime[0] * 1000 + endTime[1] / 1e6; // Convert to ms

                resolve({
                    output: output.trim(),
                    error: errorOutput.trim(),
                    executionTime,
                    isError: code !== 0
                });
            });

            if (input) {
                child.stdin.write(input);
                child.stdin.end();
            }
        });
    }

    private static getExecutionCommand(language: string, filePath: string): ExecutionCommand {
        const fileName = path.basename(filePath);
        const baseName = path.basename(filePath, path.extname(filePath));
        const dirName = path.dirname(filePath);

        switch (language) {
            case 'javascript':
                return { command: 'node', args: [filePath] };
            case 'python':
                return { command: 'python', args: [filePath] };
            case 'java':
                return {
                    command: 'javac',
                    args: [filePath],
                    postCompile: {
                        command: 'java',
                        args: ['-cp', dirName, baseName]
                    }
                };
            case 'cpp':
                const outputFile = path.join(dirName, baseName);
                return {
                    command: 'g++',
                    args: [filePath, '-o', outputFile],
                    postCompile: {
                        command: outputFile,
                        args: []
                    }
                };
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    public static async executeCode(
        code: string,
        language: Language,
        input?: unknown
    ): Promise<ExecutionResult> {
        const normalizedInput = this.normalizeInputToStdin(input);
        const runner = this.buildFunctionRunnerSource(language, code);
        const { filePath } = await this.writeToTempFile(runner.source, runner.extension);
        const fileDir = path.dirname(filePath);
        const baseName = path.basename(filePath, `.${runner.extension}`);

        try {
            // Compile if needed
            if (language === 'java') {
                const workDir = path.join(TEMP_DIR, uuidv4());
                await mkdir(workDir, { recursive: true });

                const combined = runner.source;
                const parts = combined.split(/\/\/__JAVA_MAIN__\n/);
                const solutionPart = parts[0].replace(/^\/\/__JAVA_MULTIFILE__\n/, '');
                const mainPart = parts[1] ?? '';

                const solutionPath = path.join(workDir, 'Solution.java');
                const mainPath = path.join(workDir, 'Main.java');
                await writeFile(solutionPath, solutionPart);
                await writeFile(mainPath, mainPart);

                const cleanupFiles: string[] = [solutionPath, mainPath];

                const compileResult = await this.executeCommand('javac', ['Main.java', 'Solution.java'], undefined, workDir);
                if (compileResult.isError) {
                    return {
                        ...compileResult,
                        error: `Compilation Error: ${compileResult.error}`
                    };
                }

                const result = await this.executeCommand('java', ['-cp', workDir, 'Main'], undefined, workDir, {
                    INPUT: normalizedInput
                });

                try {
                    for (const f of cleanupFiles) {
                        await unlink(f);
                    }
                    await unlink(filePath);
                } catch (e) { /* Ignore cleanup errors */ }

                return result;

            } else if (language === 'cpp') {
                const outputFile = path.join(fileDir, baseName);
                const compileResult = await this.executeCommand(
                    'g++',
                    [filePath, '-o', outputFile],
                    undefined,
                    fileDir
                );

                if (compileResult.isError) {
                    return {
                        ...compileResult,
                        error: `Compilation Error: ${compileResult.error}`
                    };
                }

                // Execute the compiled binary
                const result = await this.executeCommand(
                    process.platform === 'win32' ? `${outputFile}.exe` : outputFile,
                    [],
                    undefined,
                    fileDir,
                    { INPUT: normalizedInput }
                );

                // Clean up
                try {
                    await unlink(filePath);
                    await unlink(outputFile);
                    if (process.platform === 'win32') {
                        await unlink(`${outputFile}.exe`);
                    }
                } catch (e) { /* Ignore cleanup errors */ }

                return result;
            } else {
                // For interpreted languages (JavaScript, Python)
                const { command, args } = this.getExecutionCommand(language, filePath);
                const result = await this.executeCommand(command, args, undefined, fileDir, {
                    INPUT: normalizedInput
                });

                // Clean up
                try {
                    await unlink(filePath);
                } catch (e) { /* Ignore cleanup errors */ }

                return result;
            }
        } catch (error) {
            return {
                output: '',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                executionTime: 0,
                isError: true
            };
        }
    }

    public static async testCode(
        code: string,
        language: Language,
        testCases: Array<{ input: unknown; expectedOutput: string }>
    ): Promise<Array<{
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        error: string;
        executionTime: number;
    }>> {
        const results = [];

        for (const testCase of testCases) {
            const { input, expectedOutput } = testCase;
            const result = await this.executeCode(code, language, input);

            // Robust canonical comparison
            let passed = false;
            try {
                const actualTrimmed = result.output.trim();
                const expectedTrimmed = expectedOutput.trim();

                if (actualTrimmed === expectedTrimmed) {
                    passed = true;
                } else {
                    // Normalize by removing all whitespace
                    const normActual = actualTrimmed.replace(/\s+/g, '');
                    const normExpected = expectedTrimmed.replace(/\s+/g, '');

                    if (normActual === normExpected) {
                        passed = true;
                    } else {
                        // Attempt to parse as JSON for deeper comparison (e.g., order of triplets)
                        try {
                            const actualObj = JSON.parse(actualTrimmed);
                            const expectedObj = JSON.parse(expectedTrimmed);

                            if (Array.isArray(actualObj) && Array.isArray(expectedObj)) {
                                // Canonical sort for nested arrays
                                const canonicalize = (arr: any[]): string => {
                                    return JSON.stringify(arr.map(sub => {
                                        return Array.isArray(sub) ? [...sub].sort((a, b) => a - b) : sub;
                                    }).sort((a, b) => {
                                        const sA = JSON.stringify(a);
                                        const sB = JSON.stringify(b);
                                        return sA.localeCompare(sB);
                                    }));
                                };
                                passed = canonicalize(actualObj) === canonicalize(expectedObj);
                            } else if (typeof actualObj === 'object' && actualObj !== null &&
                                typeof expectedObj === 'object' && expectedObj !== null) {
                                // For non-array objects, deep comparison might be needed,
                                // but for now, we'll just stringify and compare sorted keys.
                                // This is a basic canonicalization for objects.
                                const canonicalizeObject = (obj: object): string => {
                                    return JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => {
                                        // @ts-ignore
                                        acc[key] = obj[key];
                                        return acc;
                                    }, {}));
                                };
                                passed = canonicalizeObject(actualObj) === canonicalizeObject(expectedObj);
                            } else {
                                // If JSON parse succeeds but not arrays/objects, rely on normalized string comparison
                                passed = normActual === normExpected;
                            }
                        } catch {
                            // If JSON parse fails, rely on normalized string comparison
                            passed = normActual === normExpected;
                        }
                    }
                }
            } catch (e) {
                passed = false;
            }

            results.push({
                input: this.normalizeInputToStdin(input),
                expectedOutput,
                actualOutput: result.output,
                passed: passed && !result.isError,
                error: result.error,
                executionTime: result.executionTime
            });
        }

        return results;
    }

    public static async runCleanup(): Promise<{
        tempFilesCleaned: boolean;
        dockerPruned: boolean;
        error?: string;
    }> {
        const result = {
            tempFilesCleaned: false,
            dockerPruned: false
        };

        try {
            // 1. Clean TEMP_DIR
            // Using fs/promises mkdir and rm which are already available or can be imported
            const { rm } = require('fs/promises');
            await rm(TEMP_DIR, { recursive: true, force: true });
            await mkdir(TEMP_DIR, { recursive: true });
            result.tempFilesCleaned = true;

            // 2. Prune Docker (if available)
            // We use child_process.exec which is already imported as exec
            const { exec: execCallback } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(execCallback);

            try {
                // Try several docker cleanup commands
                // Prune stopped containers
                await execAsync('docker container prune -f');
                // Prune unused networks
                await execAsync('docker network prune -f');
                result.dockerPruned = true;
            } catch (dockerErr: any) {
                // Docker might not be installed or accessible
                console.warn('Docker prune failed or not available:', dockerErr.message);
            }

            return result;
        } catch (error) {
            console.error('Cleanup error:', error);
            return {
                ...result,
                error: error instanceof Error ? error.message : 'Unknown error during cleanup'
            };
        }
    }
}

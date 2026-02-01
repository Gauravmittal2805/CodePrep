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

    private static async writeToTempFile(code: string, extension: string): Promise<{filePath: string, className?: string}> {
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

                const mainSource = `import java.io.*;\nimport java.util.*;\nimport java.lang.reflect.*;\n\npublic class Main {\n\n    private static int[] parseIntArray(String input) {\n        if (input == null) return new int[0];\n        String s = input.trim();\n        if (s.isEmpty()) return new int[0];\n\n        // Support JSON-like array string: [1,2,3]\n        if (s.startsWith(\"[\") && s.endsWith(\"]\")) {\n            String inner = s.substring(1, s.length() - 1).trim();\n            if (inner.isEmpty()) return new int[0];\n            String[] parts = inner.split(\",\");\n            int[] a = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) {\n                a[i] = Integer.parseInt(parts[i].trim());\n            }\n            return a;\n        }\n\n        // Default: whitespace/newline separated tokens\n        ArrayList<Integer> vals = new ArrayList<>();\n        Scanner sc = new Scanner(s);\n        while (sc.hasNext()) {\n            String tok = sc.next();\n            if (tok == null || tok.isEmpty()) continue;\n            vals.add(Integer.parseInt(tok));\n        }\n        int[] a = new int[vals.size()];\n        for (int i = 0; i < vals.size(); i++) a[i] = vals.get(i);\n        return a;\n    }\n\n    public static void main(String[] args) throws Exception {\n        String input = System.getenv(\"INPUT\");\n        if (input == null) input = \"\";\n\n        PrintStream originalOut = System.out;\n        try {\n            System.setOut(new PrintStream(OutputStream.nullOutputStream()));\n\n            Class<?> cls = Class.forName(\"Solution\");\n            Object instance = null;\n\n            Method m = null;\n            int mode = 0;\n            try {\n                m = cls.getDeclaredMethod(\"solve\", int[].class);\n                mode = 1;\n            } catch (NoSuchMethodException ignored0) {\n                try {\n                    m = cls.getDeclaredMethod(\"solve\", String.class);\n                    mode = 2;\n                } catch (NoSuchMethodException ignored) {\n                    try {\n                        m = cls.getDeclaredMethod(\"solve\");\n                        mode = 3;\n                    } catch (NoSuchMethodException ignored2) {\n                        System.setOut(originalOut);\n                        System.out.print("ERROR: Please define a method named solve(int[] input) OR solve(String input) OR solve() inside class Solution.");\n                        System.exit(1);\n                        return;\n                    }\n                }\n            }\n\n            m.setAccessible(true);\n\n            if (!Modifier.isStatic(m.getModifiers())) {\n                instance = cls.getDeclaredConstructor().newInstance();\n            }\n\n            Object ret;\n            if (mode == 1) {\n                ret = m.invoke(instance, (Object) parseIntArray(input));\n            } else if (mode == 2) {\n                ret = m.invoke(instance, input);\n            } else {\n                ret = m.invoke(instance);\n            }\n\n            System.setOut(originalOut);\n            if (m.getReturnType() != Void.TYPE) {\n                System.out.print(String.valueOf(ret));\n            }\n        } catch (Throwable t) {\n            System.setOut(originalOut);\n            t.printStackTrace(originalOut);\n            System.exit(1);\n        }\n    }\n}\n`;

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
                return { command: 'python3', args: [filePath] };
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
            
            results.push({
                input: this.normalizeInputToStdin(input),
                expectedOutput,
                actualOutput: result.output,
                passed: result.output.trim() === expectedOutput.trim() && !result.isError,
                error: result.error,
                executionTime: result.executionTime
            });
        }

        return results;
    }
}

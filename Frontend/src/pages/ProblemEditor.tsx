import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ChevronLeft,
    Settings,
    Info,
    Play,
    Send,
    BrainCircuit,
    Building2,
    ArrowRight,
    Maximize2
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

// Function to generate code templates based on problem title and language
const getDefaultCodeTemplate = (language: string) => {
  const templates = {
    java: `import java.util.*;

class Solution {
    List<List<Integer>> solve(int[] input) {
        // Parse input from the given string and return output as string.
        // Do not use stdin/print.
        return new ArrayList<>();
    }
}
`,

    python: `from typing import List, Optional

def solve(input: str) -> str:
    # Parse input from the given string and return output as string.
    # Do not use input() / print().
    return ""
`,

    cpp: `#include <string>
using namespace std;

string solve(const string& input) {
    // Parse input from the given string and return output as string.
    // Do not use cin/cout.
    return "";
}
`,

    javascript: `/**
 * @param {string} input
 * @returns {string}
 */
function solve(input) {
    // Parse input from the given string and return output as string.
    // Do not use prompt/console.log.
    return "";
}
`
  };

  return templates[language as keyof typeof templates] || `// No template available for ${language}`;
};

const ProblemEditor = () => {
    const { id } = useParams();
    const { user } = useAuth();
    
    // State declarations
    const [problem, setProblem] = useState<any | null>(null);
    const [isLoadingProblem, setIsLoadingProblem] = useState(true);
    const [problemError, setProblemError] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState("java");
    const lastAutoTemplateRef = useRef<string>('');
    const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
    const [testSummary, setTestSummary] = useState<{ verdict: string; passedCount: number; totalTests: number } | null>(null);
    const [testResults, setTestResults] = useState<Array<{
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        error: string;
        executionTime: number;
    }> | null>(null);
    const [isRunningTests, setIsRunningTests] = useState(false);

    const runTests = async (isSubmit: boolean = false) => {
        if (!problem || !user) return;
        
        setIsRunningTests(true);
        if (isSubmit) {
            setTestSummary(null);
            setTestResults(null);
        }
        
        try {
            const token = await user.getIdToken();

            const response = await fetch('http://localhost:5001/api/code/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code,
                    language,
                    problemIdentifier: problem.slug || problem.id || id,
                    includeDetails: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to run tests');
            }

            const data = await response.json();
            const allPassed = data.allPassed || (data.passedCount === data.totalTests);
            
            setTestSummary({
                verdict: data.verdict || (allPassed ? 'AC' : 'WA'),
                passedCount: data.passedCount ?? 0,
                totalTests: data.totalTests ?? 0
            });
            
            setTestResults(Array.isArray(data.results) ? data.results : null);
            
            // Show success message if all tests passed and it's a submission
            if (isSubmit && allPassed) {
                // You can add a toast notification here if you have a toast system
                console.log('All test cases passed!');
            }
            
            return allPassed;
        } catch (error) {
            console.error('Error running tests:', error);
            setTestSummary({ verdict: 'ERROR', passedCount: 0, totalTests: 0 });
            setTestResults([{
                input: '',
                expectedOutput: '',
                actualOutput: '',
                passed: false,
                error: error instanceof Error ? error.message : 'Failed to run tests',
                executionTime: 0
            }]);
            return false;
        } finally {
            setIsRunningTests(false);
        }
    };
    
    const handleSubmit = async () => {
        const success = await runTests(true);
        if (success) {
            // Optional: Add code to handle successful submission
            // For example, show a success message or redirect
        }
    };

    // Update code template when problem or language changes
    useEffect(() => {
        if (problem?.title) {
            const defaultCode = getDefaultCodeTemplate(language);
            const shouldReplace = code.trim().length === 0 || code === lastAutoTemplateRef.current;
            if (shouldReplace) {
                setCode(defaultCode);
                lastAutoTemplateRef.current = defaultCode;
            }
        }
    }, [problem, language, code]);

    useEffect(() => {
        const fetchProblem = async () => {
            if (!id) {
                setProblem(null);
                setIsLoadingProblem(false);
                return;
            }

            if (!user) {
                setProblem(null);
                setIsLoadingProblem(false);
                setProblemError('Not authenticated');
                return;
            }

            try {
                setIsLoadingProblem(true);
                setProblemError(null);

                const token = await user.getIdToken();

                const response = await fetch(`http://localhost:5001/api/problems/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    let details = '';
                    try {
                        const body = await response.json();
                        details = body?.error || body?.message || JSON.stringify(body);
                    } catch {
                        try {
                            details = await response.text();
                        } catch {
                            details = '';
                        }
                    }

                    throw new Error(`Failed to fetch problem (HTTP ${response.status})${details ? `: ${details}` : ''}`);
                }

                const data = await response.json();
                if (!data?.success || !data?.data) {
                    throw new Error(data?.error || 'Failed to load problem');
                }

                setProblem(data.data);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                setProblemError(msg);
                setProblem(null);
            } finally {
                setIsLoadingProblem(false);
            }
        };

        fetchProblem();
    }, [id, user]);

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-foreground overflow-hidden">
            {/* Header */}
            <header className="h-12 border-b border-border/40 flex items-center justify-between px-4 bg-[#1a1a1a]">
                <div className="flex items-center gap-4">
                    <Link to="/problems" className="hover:bg-secondary/30 p-1.5 rounded-md transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-4 w-px bg-border/40" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground font-mono">{problem?.id || problem?.slug || id}.</span>
                        <h1 className="text-sm font-bold">{problem?.title || 'Loading...'}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Run and Submit buttons removed */}
                    <div className="h-4 w-px bg-border/40 mx-2" />
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 overflow-hidden p-2 flex gap-2">
                <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-xl overflow-hidden border border-border/40">
                    {/* Left Panel: Problem Information */}
                    <ResizablePanel defaultSize="40" minSize="25">
                        <div className="h-full bg-[#1e1e1e] flex flex-col overflow-hidden">
                            <Tabs defaultValue="description" className="h-full flex flex-col">
                                <div className="px-4 border-b border-border/40 bg-[#1a1a1a] flex-shrink-0">
                                    <TabsList className="bg-transparent h-10 gap-4">
                                        <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-0 translate-y-[1px]">
                                            Description
                                        </TabsTrigger>
                                        <TabsTrigger value="submissions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-0 translate-y-[1px]">
                                            Submissions
                                        </TabsTrigger>
                                        <TabsTrigger value="discussions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-0 translate-y-[1px]">
                                            Discussions
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div 
                                    className="flex-1 overflow-y-auto p-6" 
                                    style={{ 
                                        maxHeight: 'calc(100vh - 200px)',
                                        scrollbarWidth: 'none',  /* Firefox */
                                        msOverflowStyle: 'none',  /* IE and Edge */
                                    }}
                                >
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                        .overflow-y-auto::-webkit-scrollbar {
                                            display: none !important;
                                            width: 0 !important;
                                            height: 0 !important;
                                        }
                                        .overflow-y-auto {
                                            -ms-overflow-style: none !important;  /* IE and Edge */
                                            scrollbar-width: none !important;  /* Firefox */
                                        }
                                    `
                                }} />
                                    <TabsContent value="description" className="m-0 space-y-6">
                                        {isLoadingProblem ? (
                                            <div className="text-sm text-muted-foreground">Loading problem...</div>
                                        ) : problemError ? (
                                            <div className="text-sm text-red-400">Error: {problemError}</div>
                                        ) : !problem ? (
                                            <div className="text-sm text-muted-foreground">Problem not found.</div>
                                        ) : (
                                            <div>
                                                <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                        {problem.difficulty}
                                                    </Badge>
                                                    {Array.isArray(problem.companies) && problem.companies.length > 0 && (
                                                        <Badge variant="secondary" className="bg-secondary/30">
                                                            <Building2 className="w-3 h-3 mr-1" />
                                                            {problem.companies[0]}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
                                                    {problem.statement}
                                                </p>

                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Input Format</h3>
                                                        <div className="bg-black/20 rounded-lg p-4 text-sm whitespace-pre-wrap border border-border/20">
                                                            {problem.input_format}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Output Format</h3>
                                                        <div className="bg-black/20 rounded-lg p-4 text-sm whitespace-pre-wrap border border-border/20">
                                                            {problem.output_format}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Sample</h3>
                                                        <div className="space-y-4">
                                                            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm space-y-4 border border-border/20">
                                                                <div>
                                                                    <div className="text-muted-foreground">Sample Input</div>
                                                                    <pre className="whitespace-pre-wrap">{problem.sample_input ?? problem.sampleInput ?? problem.sample?.input ?? 'N/A'}</pre>
                                                                </div>
                                                                <div>
                                                                    <div className="text-muted-foreground">Sample Output</div>
                                                                    <pre className="whitespace-pre-wrap">{problem.sample_output ?? problem.sampleOutput ?? problem.sample?.output ?? 'N/A'}</pre>
                                                                </div>
                                                            </div>
                                                            {problem.explanation && (
                                                                <div className="bg-secondary/10 rounded-lg p-4 text-sm leading-relaxed border border-border/10">
                                                                    <h4 className="font-bold mb-2">Explanation:</h4>
                                                                    <pre className="whitespace-pre-wrap font-sans text-muted-foreground italic">
                                                                        {problem.explanation}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {Array.isArray(problem.constraints) && problem.constraints.length > 0 && (
                                                        <div className="space-y-2">
                                                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Constraints</h3>
                                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                                {problem.constraints.map((c: string, idx: number) => (
                                                                    <li key={idx} className="whitespace-pre-wrap">{c}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-1 bg-[#0a0a0a] hover:bg-primary/20 transition-colors" />

                    {/* Right Panel: Code Editor */}
                    <ResizablePanel defaultSize="60">
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize="70" minSize="30">
                                <div className="h-full bg-[#1e1e1e] flex flex-col">
                                    {/* Editor Toolbar */}
                                    <div className="h-10 border-b border-border/40 bg-[#1a1a1a] flex items-center justify-between px-4">
                                        <div className="flex items-center gap-4">
                                            <Select value={language} onValueChange={setLanguage}>
                                                <SelectTrigger className="h-7 w-[100px] bg-secondary/20 border-border/40 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="java">Java 15</SelectItem>
                                                    <SelectItem value="python">Python 3</SelectItem>
                                                    <SelectItem value="cpp">C++ 17</SelectItem>
                                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                                <Info className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                                <Maximize2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Monaco Editor */}
                                    <div className="flex-1 overflow-hidden">
                                        <Editor
                                            height="100%"
                                            language={language}
                                            theme="vs-dark"
                                            value={code}
                                            onChange={(value) => setCode(value || '')}
                                            options={{
                                                fontSize: 14,
                                                minimap: { enabled: false },
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                padding: { top: 16 },
                                            }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle className="h-2 bg-[#0a0a0a] hover:bg-primary/20 transition-colors cursor-row-resize" />

                            {/* Console / Test Results */}
                            <ResizablePanel defaultSize="35" minSize="10">
                                <div className="h-full bg-[#1e1e1e] flex flex-col">
                                    <div className="h-9 border-b border-border/40 bg-[#1a1a1a] flex items-center justify-between px-4">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Test Results</span>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 text-xs gap-1.5"
                                                onClick={() => runTests(false)}
                                                disabled={isRunningTests}
                                            >
                                                <Play className="w-3.5 h-3.5" />
                                                {isRunningTests ? 'Running...' : 'Run Tests'}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-6 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white border-0"
                                                onClick={handleSubmit}
                                                disabled={isRunningTests}
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                {isRunningTests ? 'Submitting...' : 'Submit'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-4 font-mono text-xs text-muted-foreground bg-black/10 overflow-y-auto">
                                        {testSummary && (
                                            <div className={`mb-4 p-3 rounded-lg border ${
                                                testSummary.verdict === 'AC' 
                                                    ? 'bg-green-900/20 border-green-500/30' 
                                                    : testSummary.verdict === 'WA' 
                                                        ? 'bg-red-900/20 border-red-500/30' 
                                                        : 'bg-yellow-900/20 border-yellow-500/30'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="font-bold flex items-center gap-2">
                                                        <span>Verdict:</span>
                                                        <span className={testSummary.verdict === 'AC' ? 'text-green-400' : 'text-red-400'}>
                                                            {testSummary.verdict === 'AC' ? 'Accepted' : testSummary.verdict}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className={testSummary.passedCount === testSummary.totalTests ? 'text-green-400' : 'text-red-400'}>
                                                            {testSummary.passedCount}
                                                        </span>
                                                        <span className="opacity-70"> / {testSummary.totalTests} test cases passed</span>
                                                    </div>
                                                </div>
                                                {testSummary.verdict === 'AC' && (
                                                    <div className="mt-2 text-green-400 text-sm font-medium">
                                                        🎉 All test cases passed! Your solution is correct.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {testResults ? (
                                            <div className="space-y-3">
                                                {testResults.map((result, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`p-3 rounded-lg border ${
                                                            result.passed 
                                                                ? 'bg-green-900/10 border-green-500/20 hover:bg-green-900/20' 
                                                                : 'bg-red-900/10 border-red-500/20 hover:bg-red-900/20'
                                                        } transition-colors`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`w-2 h-2 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                            <span className="font-bold">Test Case {index + 1}</span>
                                                            <span className="text-xs opacity-70 ml-auto">{result.executionTime.toFixed(2)}ms</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                result.passed 
                                                                    ? 'bg-green-900/30 text-green-400' 
                                                                    : 'bg-red-900/30 text-red-400'
                                                            }`}>
                                                                {result.passed ? 'Passed' : 'Failed'}
                                                            </span>
                                                        </div>
                                                        
                                                        {result.error ? (
                                                            <div className="mt-2 p-2 bg-black/30 rounded text-red-400 text-xs font-mono whitespace-pre-wrap">
                                                                {result.error}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground mb-1">Input</div>
                                                                        <div className="p-2 bg-black/30 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                                            {result.input || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground mb-1">Expected</div>
                                                                        <div className="p-2 bg-black/30 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                                            {result.expectedOutput || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-muted-foreground mb-1">Your Output</div>
                                                                    <div className={`p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto ${
                                                                        result.passed 
                                                                            ? 'bg-green-900/20 text-green-400' 
                                                                            : 'bg-red-900/20 text-red-400'
                                                                    }`}>
                                                                        {result.actualOutput || 'No output'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                                <Play className="w-8 h-8 mb-2 text-muted-foreground/30" />
                                                <p className="text-muted-foreground/70">Click "Run Tests" to see results</p>
                                                <p className="text-xs text-muted-foreground/50 mt-1">Your code will be tested against sample test cases</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>

                {/* AI Tutor Sidebar (Collapsible) - Moved outside ResizablePanelGroup */}
                <div className={cn(
                    "h-full border border-border/40 rounded-xl transition-all duration-300 flex flex-col bg-[#1a1a1a] overflow-hidden shadow-2xl",
                    isAiTutorOpen ? "w-80" : "w-12"
                )}>
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="h-12 flex items-center px-3 border-b border-border/10 bg-[#1e1e1e]">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 transition-colors"
                                onClick={() => setIsAiTutorOpen(!isAiTutorOpen)}
                            >
                                <BrainCircuit className={cn("w-5 h-5", isAiTutorOpen ? "text-primary" : "text-muted-foreground")} />
                            </Button>
                            {isAiTutorOpen && (
                                <div className="ml-2 flex items-center justify-between flex-1">
                                    <span className="font-bold text-sm">AI Tutor</span>
                                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">PRO</Badge>
                                </div>
                            )}
                        </div>

                        {isAiTutorOpen ? (
                            <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-black/20 to-transparent">
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-border/20">
                                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-xs leading-relaxed text-foreground/90 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                                        Hello! I'm your AI coding tutor. Stuck on this interval problem? I can give you a hint or explain the logic.
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        AI is ready to assist
                                    </div>
                                </div>
                                <div className="mt-4 relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Ask AI Tutor..."
                                            className="w-full bg-[#0a0a0a] border border-border/40 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary/50 transition-all shadow-inner"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center pt-8 gap-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsAiTutorOpen(true)}>
                                <div className="[writing-mode:vertical-lr] text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">
                                    AI ASSISTANT
                                </div>
                                <div className="mt-auto pb-8">
                                    <div className="w-1 h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProblemEditor;

import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Play,
    Send,
    ChevronLeft,
    Maximize2,
    Settings,
    Building2,
    History
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
const getDefaultCodeTemplate = (language: string, problem?: any) => {
    // Priority 1: Backend starter code
    if (problem?.starterCode && typeof problem.starterCode === 'object' && problem.starterCode[language]) {
        return problem.starterCode[language];
    }

    // Priority 2: Standard defaults
    const templates: Record<string, string> = {
        java: `import java.util.*;

public class Solution {
    public List<List<Integer>> solve(int[] input) {
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
#include <vector>
using namespace std;

class Solution {
public:
    string solve(const string& input) {
        // Parse input from the given string and return output as string.
        // Do not use cin/cout.
        return "";
    }
};
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

    return templates[language] || `// No template available for ${language}`;
};

const ProblemEditor = () => {
    const { id, contestId } = useParams();
    const { user } = useAuth();

    // State declarations
    const [problem, setProblem] = useState<any | null>(null);
    const [isLoadingProblem, setIsLoadingProblem] = useState(true);
    const [problemError, setProblemError] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState("java");
    const lastAutoTemplateRef = useRef<string>('');
    const [testSummary, setTestSummary] = useState<{ verdict: string; passedCount: number; totalTests: number } | null>(null);
    const [testResults, setTestResults] = useState<any[] | null>(null);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmissionResult, setIsSubmissionResult] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [testCases, setTestCases] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [comments, setComments] = useState<any[]>([]);
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const fetchComments = async () => {
        if (!problem || !user) return;
        setIsLoadingComments(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/discussions/${problem.slug || problem.id || id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setComments(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const postComment = async () => {
        if (!commentContent.trim() || !problem || !user) return;
        setIsPostingComment(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/discussions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    problemIdentifier: problem.slug || problem.id || id,
                    content: commentContent
                })
            });
            if (response.ok) {
                setCommentContent('');
                fetchComments();
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsPostingComment(false);
        }
    };

    const fetchSubmissions = async () => {
        if (!problem || !user) return;
        setIsLoadingSubmissions(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/code/submissions/${problem.slug || problem.id || id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setIsLoadingSubmissions(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'submissions') {
            fetchSubmissions();
        } else if (activeTab === 'discussions') {
            fetchComments();
        }
    }, [activeTab, problem, user]);

    const runTests = async (isSubmit: boolean = false) => {
        if (!problem || !user) return;

        setIsRunningTests(true);
        if (isSubmit) {
            setIsSubmitting(true);
            setTestSummary(null);
            setTestResults(null);
        } else {
            setIsRunning(true);
        }

        setIsSubmissionResult(isSubmit);

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
                    includeDetails: true,
                    runHidden: isSubmit,
                    contestId: contestId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to run tests');
            }

            const data = await response.json();
            const allPassed = data.allPassed || (data.passedCount === data.totalTests);

            const resultsWithVisibility = Array.isArray(data.results) ? data.results.map((result: any, index: number) => ({
                ...result,
                isHidden: testCases[index]?.isHidden || false
            })) : null;

            setTestSummary({
                verdict: data.verdict || (allPassed ? 'AC' : 'WA'),
                passedCount: data.passedCount ?? 0,
                totalTests: data.totalTests ?? 0
            });

            setTestResults(resultsWithVisibility);

            if (isSubmit && allPassed) {
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
                executionTime: 0,
                isHidden: false
            }]);
            return false;
        } finally {
            setIsRunningTests(false);
            setIsSubmitting(false);
            setIsRunning(false);
            if (isSubmit) {
                fetchSubmissions();
            }
        }
    };

    const handleSubmit = async () => {
        await runTests(true);
    };

    const isInitialLoadRef = useRef<boolean>(true);

    // Update code template only when language or problem definition changes
    useEffect(() => {
        const loadInitialCode = async () => {
            // Only set default if code is empty or it's a fresh problem load
            if (!code || code === lastAutoTemplateRef.current) {
                const defaultCode = getDefaultCodeTemplate(language, problem);
                setCode(defaultCode);
                lastAutoTemplateRef.current = defaultCode;
            }
        };

        loadInitialCode();
    }, [problem?.id, language]);

    // Reset initialization when problem ID or user changes
    useEffect(() => {
        setCode(''); // CRITICAL: Reset code state to prevent leakage
        setSubmissions([]); // Reset submissions as well
        setTestSummary(null);
        setTestResults(null);
        isInitialLoadRef.current = true;
    }, [id, user]);

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

                let token = await user.getIdToken();

                const response = await fetch(`http://localhost:5001/api/problems/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch problem (HTTP ${response.status})`);
                }

                const data = await response.json();
                if (!data?.success || !data?.data) {
                    throw new Error(data?.error || 'Failed to load problem');
                }

                setProblem(data.data);
                const fetchedTestCases = Array.isArray(data.data.test_cases) ? data.data.test_cases : [];
                setTestCases(fetchedTestCases);

                if (fetchedTestCases.length > 0) {
                    setSelectedTestCase(0);
                }

                // Fetch real user submissions
                token = await user.getIdToken();
                const subResponse = await fetch(`http://localhost:5001/api/code/submissions/${data.data.slug || data.data.id || id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (subResponse.ok) {
                    const subData = await subResponse.json();
                    setSubmissions(subData.data || []);
                }

            } catch (error) {
                console.error('Error fetching problem:', error);
                setProblemError('Failed to load problem. Please try again.');
            } finally {
                setIsLoadingProblem(false);
            }
        };

        fetchProblem();
    }, [id, user]);

    if (isLoadingProblem) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-foreground overflow-hidden">
            {/* Header */}
            <header className="h-12 border-b border-border/40 flex items-center justify-between px-4 bg-[#1a1a1a]">
                <div className="flex items-center gap-4">
                    <Link to={contestId ? `/contest/${contestId}/arena` : "/problems"} className="hover:bg-secondary/30 p-1.5 rounded-md transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-4 w-px bg-border/40" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground font-mono">{problem?.id || problem?.slug || id}.</span>
                        <h1 className="text-sm font-bold">{problem?.title || 'Loading...'}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                <div className="px-4 border-b border-border/40 bg-[#1a1a1a] flex-shrink-0">
                                    <TabsList className="bg-transparent h-10 gap-4">
                                        <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-0 translate-y-[1px]">
                                            Description
                                        </TabsTrigger>
                                        {!contestId && (
                                            <>
                                                <TabsTrigger value="submissions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-0 translate-y-[1px]">
                                                    Submissions
                                                </TabsTrigger>
                                                <TabsTrigger value="discussions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-0 translate-y-[1px]">
                                                    Discussions
                                                </TabsTrigger>
                                            </>
                                        )}
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                    <TabsContent value="description" className="m-0 space-y-6">
                                        {problemError ? (
                                            <div className="text-sm text-red-400">Error: {problemError}</div>
                                        ) : !problem ? (
                                            <div className="text-sm text-muted-foreground">Problem not found.</div>
                                        ) : (
                                            <div className="space-y-6">
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
                                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                        {problem.statement}
                                                    </p>
                                                </div>

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
                                                        <div className="bg-black/20 rounded-lg p-4 font-mono text-sm space-y-4 border border-border/20">
                                                            <div>
                                                                <div className="text-muted-foreground">Sample Input</div>
                                                                <pre className="whitespace-pre-wrap">{problem.sample_input ?? problem.sampleInput ?? 'N/A'}</pre>
                                                            </div>
                                                            <div>
                                                                <div className="text-muted-foreground">Sample Output</div>
                                                                <pre className="whitespace-pre-wrap">{problem.sample_output ?? problem.sampleOutput ?? 'N/A'}</pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {!contestId && (
                                        <>
                                            <TabsContent value="submissions" className="m-0 overflow-y-auto">
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Submission History</h3>
                                                    {isLoadingSubmissions ? (
                                                        <div className="text-muted-foreground text-sm">Loading history...</div>
                                                    ) : submissions.length === 0 ? (
                                                        <div className="text-center py-12 bg-black/10 rounded-xl border border-dashed border-border/20">
                                                            <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                            <p className="text-sm text-muted-foreground">No submissions yet.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {submissions.map((sub, idx) => (
                                                                <div key={sub._id || idx} className="p-3 rounded-lg bg-black/20 border border-border/20 hover:border-primary/30 transition-colors">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className={cn("font-bold text-sm", sub.verdict === 'AC' ? "text-green-400" : "text-red-400")}>
                                                                            {sub.verdict === 'AC' ? 'Accepted' : 'Wrong Answer'}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground opacity-60">
                                                                            {new Date(sub.createdAt).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                                        <div>Passed: <span className="text-foreground">{sub.passedCount}/{sub.totalTests}</span></div>
                                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 opacity-70 uppercase">
                                                                            {sub.language}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="discussions" className="m-0">
                                                <div className="space-y-4">
                                                    <textarea
                                                        value={commentContent}
                                                        onChange={(e) => setCommentContent(e.target.value)}
                                                        placeholder="Share your thoughts..."
                                                        className="w-full h-24 bg-black/20 border border-border/20 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none text-white"
                                                    />
                                                    <Button size="sm" onClick={postComment} disabled={isPostingComment || !commentContent.trim()}>
                                                        {isPostingComment ? 'Posting...' : 'Post Comment'}
                                                    </Button>
                                                    <div className="space-y-4 mt-6">
                                                        {isLoadingComments ? (
                                                            <p className="text-xs text-muted-foreground">Loading comments...</p>
                                                        ) : (
                                                            comments.map(comment => (
                                                                <div key={comment._id} className="p-4 rounded-xl bg-black/20 border border-border/10">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="text-[13px] font-bold text-white">{comment.userName}</span>
                                                                        <span className="text-[10px] text-muted-foreground">• {new Date(comment.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground/90">{comment.content}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </>
                                    )}
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
                                    <div className="h-10 border-b border-border/40 bg-[#1a1a1a] flex items-center justify-between px-4">
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger className="h-7 w-[100px] bg-secondary/20 border-border/40 text-xs text-white">
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
                                            <Maximize2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        <Editor
                                            key={`editor-${problem?.id || id}-${language}-${user?.uid}`}
                                            height="100%"
                                            language={language}
                                            theme="vs-dark"
                                            value={code}
                                            onChange={(val) => setCode(val || '')}
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

                            <ResizablePanel defaultSize="35" minSize="10">
                                <div className="h-full bg-[#1e1e1e] flex flex-col">
                                    <div className="h-9 border-b border-border/40 bg-[#1a1a1a] flex items-center justify-between px-4">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Test Results</span>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1.5" onClick={() => runTests(false)} disabled={isRunningTests}>
                                                <Play className="w-3.5 h-3.5" />
                                                {isRunning ? 'Running...' : 'Run Tests'}
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-6 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white border-0" onClick={handleSubmit} disabled={isRunningTests}>
                                                <Send className="w-3.5 h-3.5" />
                                                {isSubmitting ? 'Submitting...' : 'Submit'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-4 font-mono text-xs text-muted-foreground bg-black/10 overflow-y-auto">
                                        {testSummary && isSubmissionResult ? (
                                            <div className="flex flex-col h-full gap-6">
                                                {/* Submission Verdict Banner */}
                                                <div className={cn(
                                                    "p-6 rounded-2xl border",
                                                    testSummary.verdict === 'AC'
                                                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                                )}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-black uppercase tracking-widest">
                                                            Verdict: {testSummary.verdict === 'AC' ? 'Accepted' : 'Wrong Answer'}
                                                        </span>
                                                        <span className="text-xs font-bold opacity-80">
                                                            {testSummary.passedCount} / {testSummary.totalTests} test cases passed
                                                        </span>
                                                    </div>
                                                    {testSummary.verdict === 'AC' && (
                                                        <p className="text-xs font-bold flex items-center gap-2">
                                                            🎉 Congrats! You have passed all hidden test cases.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Submission Body */}
                                                <div className="flex flex-1 gap-8">
                                                    {/* Sidebar */}
                                                    <div className="w-1/4 space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-6">Submission Result</h4>
                                                        <div className="space-y-2">
                                                            {testResults?.map((res, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setSelectedTestCase(i)}
                                                                    className={cn(
                                                                        "w-full text-left p-3 rounded-xl transition-all flex items-center gap-3",
                                                                        selectedTestCase === i ? "bg-white/5 border border-white/10" : "hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "w-2 h-2 rounded-full",
                                                                        res.passed ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                                                    )} />
                                                                    <span className={cn(
                                                                        "text-[11px] font-bold",
                                                                        selectedTestCase === i ? "text-white" : "text-muted-foreground"
                                                                    )}>
                                                                        Testcase {i + 1}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Main Content */}
                                                    <div className="flex-1 space-y-8">
                                                        <div className="space-y-3">
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Compiler Message</h4>
                                                            <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                                                                <span className={cn(
                                                                    "text-sm font-bold",
                                                                    testResults?.[selectedTestCase]?.passed ? "text-green-400" : "text-red-400"
                                                                )}>
                                                                    {testResults?.[selectedTestCase]?.passed ? "Success" : "Wrong Answer"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Time (sec)</h4>
                                                            <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                                                                <span className="text-sm font-bold text-white/90">
                                                                    {(testResults?.[selectedTestCase]?.executionTime / 1000).toFixed(4)} s
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : testResults ? (
                                            <div className="flex flex-col gap-10">
                                                {testSummary && (
                                                    <div className={`mb-4 p-3 rounded-lg border ${testSummary.verdict === 'AC' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold uppercase tracking-wider text-[10px]">
                                                                Verdict: <span className={testSummary.verdict === 'AC' ? 'text-green-400' : 'text-red-400'}>{testSummary.verdict}</span>
                                                            </span>
                                                            <span className="text-[10px] font-bold opacity-70">{testSummary.passedCount} / {testSummary.totalTests} Passed</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {testResults.map((result, i) => (
                                                    <div key={i} className="space-y-6 border-b border-white/5 pb-10 last:border-0">
                                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                                                            <div className="flex items-center gap-3">
                                                                <span className={cn(
                                                                    "w-5 h-5 rounded flex items-center justify-center text-[8px]",
                                                                    result.passed ? "bg-green-500 text-black" : "bg-red-500 text-white"
                                                                )}>
                                                                    {i + 1}
                                                                </span>
                                                                <span className="text-muted-foreground">Test Case {i + 1} {result.isHidden && "(Hidden)"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {result.isHidden && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-amber-500/20 bg-amber-500/5 text-amber-500 uppercase tracking-tighter">
                                                                        Hidden
                                                                    </span>
                                                                )}
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                                                                    result.passed
                                                                        ? "text-green-400 border-green-500/20 bg-green-500/5"
                                                                        : "text-red-400 border-red-500/20 bg-red-500/5"
                                                                )}>
                                                                    {result.passed ? "Passed" : "Failed"} • {result.executionTime}ms
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6 px-1">
                                                            <div className="space-y-2">
                                                                <div className="text-[9px] uppercase font-black opacity-30 tracking-tighter">Input</div>
                                                                <pre className="p-4 rounded-xl bg-black/40 text-white/90 whitespace-pre-wrap border border-white/5 text-[11px] font-mono leading-relaxed">
                                                                    {result.isHidden ? "[HIDDEN TEST CASE]" : (result.input || "N/A")}
                                                                </pre>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <div className="text-[9px] uppercase font-black opacity-30 tracking-tighter">Expected Output</div>
                                                                    <pre className="p-4 rounded-xl bg-black/40 text-green-400/80 whitespace-pre-wrap border border-white/5 text-[11px] font-mono leading-relaxed">
                                                                        {result.isHidden ? "[HIDDEN TEST CASE]" : (result.expectedOutput || "N/A")}
                                                                    </pre>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-[9px] uppercase font-black opacity-30 tracking-tighter">Actual Output</div>
                                                                    <pre className={cn(
                                                                        "p-4 rounded-xl bg-black/40 whitespace-pre-wrap border border-white/5 text-[11px] font-mono leading-relaxed",
                                                                        result.passed ? "text-green-400/80" : "text-red-400/80"
                                                                    )}>
                                                                        {result.isHidden ? "[HIDDEN TEST CASE]" : (result.actualOutput || "N/A")}
                                                                    </pre>
                                                                </div>
                                                            </div>

                                                            {!result.passed && result.error && (
                                                                <div className="space-y-2">
                                                                    <div className="text-[9px] uppercase font-black text-red-400 opacity-60 tracking-tighter">Runtime Error</div>
                                                                    <div className="p-4 rounded-xl bg-red-400/5 text-red-400/90 text-[11px] font-mono border border-red-400/10 italic">
                                                                        {result.error}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}

                                        {!testSummary && !isRunningTests && (
                                            <div className="h-full flex flex-col items-center justify-center opacity-40 py-12">
                                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center mb-4">
                                                    <Play className="w-6 h-6 text-primary" />
                                                </div>
                                                <p className="font-bold uppercase tracking-widest text-[10px]">Run Code to see results</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
    );
};

export default ProblemEditor;

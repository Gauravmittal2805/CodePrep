import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Send,
    Clock,
    AlertCircle,
    CheckCircle2,
    Monitor,
    Shield,
    Maximize2,
    Smile,
    Frown,
    Meh,
    Star,
    LogOut,
    OctagonAlert
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Question {
    _id: string;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    sampleTestcases: { input: string; output: string }[];
    difficulty: string;
    timeLimit: number;
    memoryLimit: number;
    starterCode?: Record<string, string>;
}

// Function to generate code templates (Mirroring ProblemEditor.tsx)
const getDefaultCodeTemplate = (language: string, question?: any) => {
    // Priority 1: Backend starter code
    if (question?.starterCode && typeof question.starterCode === 'object' && question.starterCode[language]) {
        return question.starterCode[language];
    }

    // Priority 2: Standard defaults
    const templates: Record<string, string> = {
        java: `import java.util.*;\n\npublic class Solution {\n    public String solve(String input) {\n        // Parse input and return output.\n        return "";\n    }\n}\n`,
        python: `def solve(input):\n    # Parse input and return output.\n    return ""\n`,
        cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string solve(string input) {\n        // Parse input and return output.\n        return "";\n    }\n};\n`,
        javascript: `function solve(input) {\n    // Parse input and return output.\n    return "";\n}\n`
    };

    return templates[language] || `// No template available for ${language}`;
};

interface MockOA {
    _id: string;
    title: string;
    company: string;
    duration: number;
    questions: Question[];
    securitySettings: {
        shuffleQuestions: boolean;
        disableCopyPaste: boolean;
    };
}

const MockOAAttempt: React.FC = () => {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // State
    const [mockOA, setMockOA] = useState<MockOA | null>(null);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [codes, setCodes] = useState<Record<string, string>>({});
    const [languages, setLanguages] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, any>>({});
    const [isRunning, setIsRunning] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
    const [showViolation, setShowViolation] = useState(false);

    // Fullscreen and Violation Logic
    const enterFullscreen = async () => {
        try {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if ((element as any).webkitRequestFullscreen) {
                await (element as any).webkitRequestFullscreen();
            } else if ((element as any).msRequestFullscreen) {
                await (element as any).msRequestFullscreen();
            }
        } catch (error) {
            console.error("Fullscreen request failed:", error);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;

            // If the assessment has started and user exits fullscreen, show violation
            if (mockOA && submissionId && !isFull && !isFinishing) {
                setShowViolation(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [mockOA, submissionId, isFinishing]);

    // Auto-enter fullscreen when OA starts
    useEffect(() => {
        if (mockOA && submissionId && !isLoading) {
            enterFullscreen();
        }
    }, [mockOA, submissionId, isLoading]);

    // Fetch OA Details and Start Submission
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast.error("Please login to attempt this assessment");
            navigate('/dashboard');
            return;
        }

        const initializeOA = async () => {
            console.log("[OA] Starting initialization for ID:", id);
            try {
                const token = await user.getIdToken();

                // 1. Get OA Details
                console.log("[OA] Fetching details...");
                const oaRes = await fetch(`http://localhost:5001/api/mockoa/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const oaData = await oaRes.json();
                console.log("[OA] Details received:", oaData.success);

                if (!oaData.success || !oaData.data) {
                    throw new Error(oaData.error || "OA not found or missing data");
                }
                setMockOA(oaData.data);

                // 2. Start Assessment (Session)
                console.log("[OA] Starting session...");
                const startRes = await fetch(`http://localhost:5001/api/mockoa/${id}/start`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const startData = await startRes.json();
                console.log("[OA] Session started:", startData.success);

                if (startData.success && startData.data) {
                    setSubmissionId(startData.data.submissionId);
                    setTimeLeft(startData.data.remainingTime);
                } else {
                    throw new Error(startData.error || "Could not start assessment");
                }

                // Initialize codes/languages
                const initialCodes: Record<string, string> = {};
                const initialLangs: Record<string, string> = {};
                const qs = oaData.data.questions || [];

                qs.forEach((q: any) => {
                    if (q && q._id) {
                        const defaultLang = "java";
                        initialLangs[q._id] = defaultLang;
                        initialCodes[q._id] = getDefaultCodeTemplate(defaultLang, q);
                    }
                });
                setCodes(initialCodes);
                setLanguages(initialLangs);
                console.log("[OA] Initialization complete");

            } catch (error: any) {
                console.error("[OA] Initialization failed:", error);
                toast.error(error.message || "Failed to start assessment");
                setTimeout(() => navigate('/dashboard'), 2000);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) initializeOA();
    }, [user, id, authLoading]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) {
            if (timeLeft === 0) handleFinishOA();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Security: Anti-cheat
    useEffect(() => {
        if (!mockOA?.securitySettings?.disableCopyPaste) return;

        const preventCopyPaste = (e: any) => {
            e.preventDefault();
            toast.error("Copy-paste is disabled for this assessment", {
                icon: <Shield className="w-4 h-4 text-rose-500" />
            });
        };

        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        return () => {
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
        };
    }, [mockOA]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };


    const runTests = async (isSubmit: boolean = false) => {
        if (!user || !submissionId || !mockOA) return;

        const currentQuestion = mockOA.questions[currentQuestionIndex];
        if (!currentQuestion) return;

        if (isSubmit) setIsSubmitting(true);
        else setIsRunning(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/code/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: codes[currentQuestion._id],
                    language: languages[currentQuestion._id],
                    problemIdentifier: currentQuestion._id,
                    includeDetails: true,
                    runHidden: isSubmit
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error || "Execution failed");

            // Update local results state
            setResults(prev => ({
                ...prev,
                [currentQuestion._id]: {
                    verdict: data.verdict,
                    passedCount: data.passedCount,
                    totalTests: data.totalTests,
                    results: data.results,
                    executionTime: data.results?.[0]?.executionTime || 0,
                    isSubmitRun: isSubmit
                }
            }));

            // Reset loading state early for responsiveness
            setIsSubmitting(false);
            setIsRunning(false);

            // Sync with backend OA submission (so progress is saved)
            // We don't 'await' this strictly for the UI to be responsive, 
            // but we'll still catch errors if they happen.
            fetch(`http://localhost:5001/api/mockoa/${submissionId}/submit-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionId: currentQuestion._id,
                    code: codes[currentQuestion._id],
                    language: languages[currentQuestion._id]
                })
            }).catch(e => console.error("[OA] Background sync failed:", e));

            if (isSubmit) toast.success("Solution submitted!");
            else toast.success("Tests completed!");

        } catch (error: any) {
            console.error("[OA] Execution failed:", error);
            toast.error(error.message || "Execution failed");
        } finally {
            setIsSubmitting(false);
            setIsRunning(false);
        }
    };

    const handleFinishOA = async () => {
        if (isFinishing || !submissionId || !user) return;
        setIsFinishing(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/mockoa/${submissionId}/finish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    feedback: {
                        difficulty: selectedDifficulty,
                        rating: selectedDifficulty === 'very_easy' ? 5 : selectedDifficulty === 'easy' ? 4 : selectedDifficulty === 'medium' ? 3 : selectedDifficulty === 'hard' ? 2 : 1
                    }
                })
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Assessment submitted successfully!");
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                }
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error("Failed to finish assessment");
        } finally {
            setIsFinishing(false);
            setShowFinishModal(false);
        }
    };

    const handleLeave = () => {
        if (window.confirm("Are you sure you want to leave? Your progress will only be saved for submitted questions.")) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            navigate('/dashboard');
        }
    };

    if (isLoading || !mockOA) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse text-sm">Preparing your assessment...</p>
                </div>
            </div>
        );
    }

    if (!mockOA.questions || mockOA.questions.length === 0) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                    <h2 className="text-xl font-bold">No questions found</h2>
                    <p className="text-muted-foreground">This assessment doesn't have any questions yet.</p>
                    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    const currentQuestion = mockOA.questions[currentQuestionIndex];

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="h-16 border-b border-white/5 bg-[#111111] px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold truncate max-w-[200px]">{mockOA.title}</h1>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{mockOA.company} • Online Assessment</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/5" />

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <Clock className={cn("w-4 h-4 text-rose-500", timeLeft !== null && timeLeft < 300 && "animate-pulse")} />
                        <span className="text-sm font-black font-mono text-rose-500">
                            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <Shield className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secured Session</span>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleLeave}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-bold h-10 px-4 rounded-xl transition-all"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave
                    </Button>
                    <Button
                        onClick={() => setShowFinishModal(true)}
                        disabled={isFinishing}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold h-10 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                    >
                        {isFinishing ? "Finalizing..." : "Finish Assessment"}
                    </Button>
                </div>
            </header>

            {/* Question Navigation */}
            <div className="h-12 border-b border-white/5 bg-[#0d0d0d] px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {mockOA.questions.map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={cn(
                                "w-8 h-8 rounded-lg text-xs font-bold transition-all border",
                                currentQuestionIndex === idx
                                    ? "bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-110"
                                    : (results[q._id]?.verdict === 'AC' && results[q._id]?.isSubmitRun)
                                        ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                                        : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10"
                            )}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                        Question {currentQuestionIndex + 1} of {mockOA.questions.length}
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <main className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* Left: Question Description */}
                    <ResizablePanel defaultSize={40} minSize={30}>
                        <div className="h-full bg-[#0a0a0a] overflow-y-auto p-8 scrollbar-none">
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                                            {currentQuestion.difficulty}
                                        </Badge>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {currentQuestion.timeLimit}s Time Limit • {currentQuestion.memoryLimit}MB Memory
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-3xl font-black text-white tracking-tight leading-none">{currentQuestion.title}</h2>
                                        {results[currentQuestion._id]?.verdict === 'AC' && results[currentQuestion._id]?.isSubmitRun && (
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-black uppercase tracking-tighter px-2 flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Solved
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed prose-headings:text-white">
                                    <p className="whitespace-pre-wrap text-base">{currentQuestion.description}</p>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-primary" />
                                                Input Format
                                            </h3>
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {currentQuestion.inputFormat}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-primary" />
                                                Output Format
                                            </h3>
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {currentQuestion.outputFormat}
                                            </div>
                                        </div>
                                    </div>

                                    {currentQuestion.sampleTestcases && currentQuestion.sampleTestcases.length > 0 && (
                                        <div className="space-y-4 pt-4">
                                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-primary" />
                                                Example
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="rounded-xl border border-white/5 overflow-hidden">
                                                    <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sample Input</div>
                                                    <pre className="p-4 text-xs font-mono text-primary/80 bg-black/40 overflow-x-auto scrollbar-none">{currentQuestion.sampleTestcases[0].input}</pre>
                                                </div>
                                                <div className="rounded-xl border border-white/5 overflow-hidden">
                                                    <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sample Output</div>
                                                    <pre className="p-4 text-xs font-mono text-green-400/80 bg-black/40 overflow-x-auto scrollbar-none">{currentQuestion.sampleTestcases[0].output}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-[1px] bg-white/5 hover:bg-primary/50 transition-colors" />

                    {/* Right: Code Editor & Results */}
                    <ResizablePanel defaultSize={60} minSize={30}>
                        <ResizablePanelGroup direction="vertical">
                            {/* Editor */}
                            <ResizablePanel defaultSize={70}>
                                <div className="h-full flex flex-col bg-[#1e1e1e]">
                                    <div className="h-10 px-4 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={languages[currentQuestion._id]}
                                                onValueChange={(val) => setLanguages(prev => ({ ...prev, [currentQuestion._id]: val }))}
                                            >
                                                <SelectTrigger className="w-[120px] h-7 bg-white/5 border-white/10 text-[10px] font-bold uppercase tracking-wider">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-white/10">
                                                    <SelectItem value="java">Java 15</SelectItem>
                                                    <SelectItem value="python">Python 3</SelectItem>
                                                    <SelectItem value="cpp">C++ 17</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-white/5">
                                                <Maximize2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <Editor
                                            key={`${currentQuestion._id}-${languages[currentQuestion._id]}`}
                                            height="100%"
                                            language={languages[currentQuestion._id]}
                                            theme="vs-dark"
                                            value={codes[currentQuestion._id] || ""}
                                            onChange={(val) => setCodes(prev => ({ ...prev, [currentQuestion._id]: val || "" }))}
                                            options={{
                                                fontSize: 14,
                                                minimap: { enabled: false },
                                                scrollbar: { vertical: 'hidden' },
                                                padding: { top: 20 },
                                                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                                lineHeight: 1.6,
                                                smoothScrolling: true,
                                                cursorBlinking: 'smooth',
                                                cursorSmoothCaretAnimation: 'on'
                                            }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle className="h-[1px] bg-white/5 hover:bg-primary/50 transition-colors" />

                            {/* Control Bar & Results */}
                            <ResizablePanel defaultSize={30}>
                                <div className="h-full flex flex-col bg-[#0d0d0d]">
                                    <div className="h-12 px-6 border-b border-white/5 flex items-center justify-between bg-[#111111]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Execution Console</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => runTests(false)}
                                                disabled={isRunning || isSubmitting}
                                                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/5 px-4"
                                            >
                                                <Play className={cn("w-3.5 h-3.5", isRunning && "animate-spin")} />
                                                {isRunning ? "Running..." : "Test Code"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => runTests(true)}
                                                disabled={isRunning || isSubmitting}
                                                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest px-6 rounded-lg bg-primary hover:bg-primary/90"
                                            >
                                                <Send className={cn("w-3.5 h-3.5", isSubmitting && "animate-pulse")} />
                                                {isSubmitting ? "Submitting..." : "Submit Solution"}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto font-mono text-sm scrollbar-none">
                                        {results[currentQuestion._id] ? (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                                <div className={cn(
                                                    "p-4 rounded-xl border flex items-center justify-between",
                                                    results[currentQuestion._id].verdict === 'AC'
                                                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                                )}>
                                                    <div className="flex items-center gap-3">
                                                        {results[currentQuestion._id].verdict === 'AC' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                                        <div>
                                                            <div className="text-lg font-black uppercase tracking-tighter">
                                                                {results[currentQuestion._id].verdict === 'AC' ? "Passed" : "Failed"}
                                                            </div>
                                                            <div className="text-[10px] font-bold opacity-60">
                                                                {results[currentQuestion._id].passedCount} / {results[currentQuestion._id].totalTests} TEST CASES PASSED
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-bold opacity-60">{results[currentQuestion._id].executionTime}ms</div>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-4">
                                                    {results[currentQuestion._id].isSubmitRun ? (
                                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                            {results[currentQuestion._id].verdict === 'AC' ? (
                                                                <div className="p-10 rounded-3xl bg-green-500/[0.03] border border-green-500/10 flex flex-col items-center justify-center text-center shadow-2xl shadow-green-500/5">
                                                                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                                                                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                                                                    </div>
                                                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Assessment Secure</h3>
                                                                    <p className="text-green-400/60 font-medium text-sm">Successfully passed all {results[currentQuestion._id].totalTests} hidden test cases.</p>
                                                                    <div className="mt-8 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-400 uppercase tracking-[0.2em]">Solution Encrypted & Stored</div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-10 rounded-3xl bg-rose-500/[0.03] border border-rose-500/10 flex flex-col items-center justify-center text-center shadow-2xl shadow-rose-500/5">
                                                                    <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
                                                                        <AlertCircle className="w-10 h-10 text-rose-400" />
                                                                    </div>
                                                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Tests Incomplete</h3>
                                                                    <p className="text-rose-400/60 font-medium text-sm">Passed {results[currentQuestion._id].passedCount} / {results[currentQuestion._id].totalTests} hidden test cases.</p>
                                                                    <div className="mt-8 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Attempt Captured</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        results[currentQuestion._id].results?.map((res: any, i: number) => (
                                                            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden group hover:bg-white/[0.04] transition-all">
                                                                <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={cn(
                                                                            "w-2 h-2 rounded-full",
                                                                            res.passed ? "bg-green-400" : "bg-rose-400"
                                                                        )} />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest">Case {i + 1}</span>
                                                                    </div>
                                                                    <span className={cn(
                                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                                        res.passed ? "bg-green-500/10 text-green-400" : "bg-rose-500/10 text-rose-400"
                                                                    )}>
                                                                        {res.passed ? "PASSED" : "FAILED"}
                                                                    </span>
                                                                </div>
                                                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Input</div>
                                                                        <pre className="p-2.5 rounded-lg bg-black/40 text-[11px] font-mono text-primary/80 truncate border border-white/5">{res.input || 'N/A'}</pre>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Expected</div>
                                                                        <pre className="p-2.5 rounded-lg bg-black/40 text-[11px] font-mono text-green-400/80 truncate border border-white/5">{res.expectedOutput || 'N/A'}</pre>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Actual</div>
                                                                        <pre className={cn(
                                                                            "p-2.5 rounded-lg bg-black/40 text-[11px] font-mono truncate border border-white/5",
                                                                            res.passed ? "text-green-400/80" : "text-rose-400/80"
                                                                        )}>{res.actualOutput || 'N/A'}</pre>
                                                                    </div>
                                                                </div>
                                                                {!res.passed && res.error && (
                                                                    <div className="px-4 pb-4">
                                                                        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-[10px] text-rose-400/80 font-mono italic">
                                                                            Error: {res.error}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-4 opacity-50">
                                                <Play className="w-10 h-10 border-4 border-dashed border-current rounded-full" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ready for execution</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>

            {/* Footer / Navigation */}
            <footer className="h-14 border-t border-white/5 bg-[#111111] px-6 flex items-center justify-between z-20">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </Button>

                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {mockOA.questions.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    currentQuestionIndex === idx ? "bg-primary w-4" : "bg-white/10"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentQuestionIndex === mockOA.questions.length - 1}
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </footer>

            {/* Finish Assessment Modal */}
            <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
                <DialogContent className="bg-[#111111] border-white/5 text-white max-w-md rounded-3xl p-8">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
                            <Send className="w-8 h-8 text-green-400" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-center uppercase tracking-tighter">Submit Assessment?</DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground text-sm leading-relaxed">
                            Great job! You have completed the assessment. Before you submit, please tell us how was the difficulty of the questions?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8">
                        <div className="grid grid-cols-5 gap-3">
                            {[
                                { emoji: "😫", label: "Very Hard", value: "very_hard" },
                                { emoji: "😕", label: "Hard", value: "hard" },
                                { emoji: "😐", label: "Medium", value: "medium" },
                                { emoji: "🙂", label: "Easy", value: "easy" },
                                { emoji: "🤩", label: "Excellent", value: "very_easy" }
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setSelectedDifficulty(item.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all hover:scale-110",
                                        selectedDifficulty === item.value
                                            ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10"
                                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    <span className="text-2xl">{item.emoji}</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col gap-3 sm:flex-col sm:space-x-0">
                        <Button
                            onClick={handleFinishOA}
                            disabled={!selectedDifficulty || isFinishing}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12 rounded-2xl transition-all shadow-lg shadow-green-500/10"
                        >
                            {isFinishing ? "Submitting..." : "Confirm & Submit"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowFinishModal(false)}
                            className="text-muted-foreground hover:text-white text-xs font-bold uppercase tracking-widest"
                        >
                            Go Back
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Fullscreen Violation Overlay */}
            <Dialog open={showViolation} onOpenChange={() => { }}>
                <DialogContent className="bg-[#0a0a0a]/95 backdrop-blur-xl border-rose-500/20 text-white max-w-lg rounded-[2.5rem] p-10 shadow-2xl shadow-rose-500/10">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
                            <div className="relative w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse">
                                <OctagonAlert className="w-12 h-12 text-rose-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Security Violation</h2>
                            <p className="text-rose-400 font-bold text-xs uppercase tracking-[0.2em]">Fullscreen Restricted</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You have exited fullscreen mode. This assessment requires a secure, distraction-free environment. Your actions have been logged as a potential violation.
                            </p>
                            <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/5 py-2 px-4 rounded-full border border-rose-500/10">
                                <Shield className="w-3 h-3" />
                                Action Logged: Fullscreen Exit
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setShowViolation(false);
                                enterFullscreen();
                            }}
                            className="w-full bg-white text-black hover:bg-white/90 font-black h-14 rounded-2xl text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
                        >
                            Back to Secure Mode
                        </Button>

                        <button
                            onClick={handleLeave}
                            className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-rose-400 transition-colors"
                        >
                            Exit Assessment
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MockOAAttempt;

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import {
    Mic, Video, VideoOff, MicOff, PhoneOff, AlertTriangle,
    MessageSquare, Timer,
    CheckCircle2, TrendingUp,
    Activity, BrainCircuit, RefreshCw
} from "lucide-react";
import roboImg from "@/assets/robo.avif";

// Interview Room Component

export default function InterviewRoom() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const config = location.state?.config || { questionCount: 3, difficulty: "medium", focusArea: "General" };
    const interviewType = location.state?.type || "Technical";

    // --- STATE ---
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [aiStatus, setAiStatus] = useState<'listening' | 'speaking' | 'thinking' | 'idle'>('thinking');
    const [transcript, setTranscript] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: "Initializing your interview session..." }
    ]);
    const [notes, setNotes] = useState("");
    const [currentStep, setCurrentStep] = useState(0); // Index for questions
    const [questions, setQuestions] = useState<string[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

    // Evaluation & Report States
    const [isEnding, setIsEnding] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // Per-question tracking
    const [questionWiseData, setQuestionWiseData] = useState<{ question: string, duration: number }[]>([]);
    const startTimeRef = useRef<number>(Date.now());

    const [answerTime, setAnswerTime] = useState(0);
    const [warning, setWarning] = useState<string | null>(null);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef(transcript);

    // Keep ref in sync
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    const [micLevel, setMicLevel] = useState(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initial Questions Generation
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await axios.post("http://localhost:5001/api/ai/generate-questions", {
                    type: interviewType,
                    difficulty: config.difficulty,
                    focusArea: config.focusArea,
                    questionCount: config.questionCount,
                    aiFocusTags: location.state?.aiFocusTags || [],
                    resumeText: location.state?.resumeText || ""
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const generatedQuestions = response.data.data.questions;
                    setQuestions(generatedQuestions);
                    setIsLoadingQuestions(false);

                    // Start the interview with the first question
                    const welcomeMsg = `Hello ${user?.displayName || 'Candidate'}! I have prepared ${generatedQuestions.length} questions for your ${interviewType} round. Let's begin.`;
                    const firstQuestion = generatedQuestions[0];

                    setTranscript([
                        { role: 'ai', text: welcomeMsg },
                        { role: 'ai', text: firstQuestion }
                    ]);
                    setAiStatus('speaking');
                }
            } catch (error) {
                console.error("Failed to generate questions:", error);
                setTranscript([{ role: 'ai', text: "Ready to start when you are." }]);
                setAiStatus('listening');
            }
        };

        if (user) fetchQuestions();
    }, [user]);

    // Audio level analysis
    useEffect(() => {
        if (!streamRef.current || !isMicOn) {
            setMicLevel(0);
            return;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(streamRef.current);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animationId: number;

        const updateLevel = () => {
            if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
                setMicLevel(avg);
            }
            animationId = requestAnimationFrame(updateLevel);
        };
        updateLevel();

        return () => {
            cancelAnimationFrame(animationId);
            if (audioContext.state !== 'closed') audioContext.close();
        };
    }, [isMicOn, isCameraOn, aiStatus]);

    const [currentSpeech, setCurrentSpeech] = useState("");
    const silenceTimerRef = useRef<any>(null);

    // Main Timers
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
            if (aiStatus === 'listening') setAnswerTime((prev: number) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [aiStatus]);

    // Auto-scroll Transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript]);

    // Tab Switch Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarning("Tab switching detected! This will be noted in your report.");
                setTimeout(() => setWarning(null), 5000);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    // Camera and Audio Feed Logic
    useEffect(() => {
        const startStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: isCameraOn,
                    audio: isMicOn
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing media devices:", err);
            }
        };

        const stopStream = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        if (isCameraOn || isMicOn) {
            startStream();
        } else {
            stopStream();
        }

        return () => stopStream();
    }, [isCameraOn, isMicOn]);

    // Speech Recognition Setup
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-IN';

            recognitionRef.current.onresult = (event: any) => {
                if (!isMicOn) return;
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (interimTranscript) {
                    setCurrentSpeech(interimTranscript);
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = setTimeout(() => {
                        const pulseText = interimTranscript;
                        setCurrentSpeech("");
                        handleUserSpeech(pulseText);
                    }, 1500);
                }

                if (finalTranscript) {
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    setCurrentSpeech("");
                    handleUserSpeech(finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                if (event.error === 'no-speech') return;
                console.error("Speech Recognition Error:", event.error);
            };

            recognitionRef.current.onend = () => {
                if (aiStatus === 'listening' && isMicOn) {
                    try { recognitionRef.current.start(); } catch (e) { }
                }
            };
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [aiStatus, isMicOn]);

    // Control Speech Recognition based on AI Status
    useEffect(() => {
        if (aiStatus === 'listening' && isMicOn && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) { }
        } else if (recognitionRef.current) {
            recognitionRef.current.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            setCurrentSpeech("");
        }
    }, [aiStatus, isMicOn]);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleUserSpeech = async (text: string) => {
        if (!isMicOn || !text || text.trim().length === 0 || isCompleted || isProcessing) return;

        setIsProcessing(true);
        setTranscript(prev => [...prev, { role: 'user' as const, text }]);
        setAiStatus('thinking');

        try {
            setAnswerTime(0);
            const token = await user?.getIdToken();

            // Determine if more questions exist
            const isLastQuestion = currentStep === questions.length - 1;
            const nextQuestionIndex = currentStep + 1;
            const nextQuestion = isLastQuestion ? null : questions[nextQuestionIndex];

            // Clean up history to prevent AI confusion (only send last 6 messages + current context)
            const recentHistory = transcriptRef.current.slice(-6).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const response = await axios.post("http://localhost:5001/api/ai/chat", {
                messages: [
                    ...recentHistory,
                    { role: 'user', content: text },
                    {
                        role: 'system',
                        content: isLastQuestion
                            ? "This was the last question. Briefly acknowledge the user's answer and conclude the interview professionally. Say: 'That's all for today. You've completed the interview. Best of luck!'"
                            : `Acknowledge the user's answer briefly (under 10 words) and then ask the EXACT next question which is Question #${nextQuestionIndex + 1} from our list: "${nextQuestion}". DO NOT repeat previous questions.`
                    }
                ]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const aiMsg = response.data.data.response;
                setTranscript(prev => [...prev, { role: 'ai' as const, text: aiMsg }]);
                setAiStatus('speaking');

                if (isLastQuestion) {
                    setIsCompleted(true);
                } else {
                    // Save duration for current question
                    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    setQuestionWiseData(prev => [...prev, {
                        question: questions[currentStep],
                        duration: durationSeconds
                    }]);
                    startTimeRef.current = Date.now();
                    setCurrentStep(nextQuestionIndex);
                }
            } else {
                setAiStatus('listening');
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setAiStatus('listening');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleEndInterview = async () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsEnding(true);
        setIsGeneratingReport(true);

        try {
            const token = await user?.getIdToken();
            const sessionData = {
                transcript,
                questionWiseAnswers: questionWiseData,
                metrics: {
                    totalDuration: 45 * 60 - timeLeft,
                    wpm: 0, // Calculated on backend
                    silencePauses: 0 // Mock for now
                },
                type: interviewType,
                difficulty: config.difficulty,
                companyTag: location.state?.companyId || location.state?.company || 'General',
                aiFocusTags: location.state?.aiFocusTags || [],
                resumeContent: location.state?.resumeText || ""
            };

            const response = await axios.post("http://localhost:5001/api/ai/submit-session", sessionData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                navigate(`/interview/report/${response.data.data.sessionId}`, {
                    state: {
                        report: response.data.data.report,
                        type: interviewType,
                        difficulty: config.difficulty,
                        company: location.state?.companyName || location.state?.company || "Custom",
                        title: location.state?.role || "Interview Session",
                        metrics: {
                            ...sessionData.metrics,
                            wpm: response.data.data.computedMetrics?.wpm || 0
                        },
                        aiFocusTags: sessionData.aiFocusTags
                    }
                });
            }
        } catch (error) {
            console.error("Report Generation Failed:", error);
        } finally {
            setIsGeneratingReport(false);
            setIsEnding(false);
        }
    };

    const askDoubts = () => {
        setIsCompleted(false);
        setAiStatus('speaking');
        const doubtMsg = "Sure, I'm here to help. I've noted your primary responses. Are there any specific parts of the questions or your answers you'd like to discuss further, or any other doubts you have?";
        setTranscript(prev => [...prev, { role: 'ai', text: doubtMsg }]);
    };

    const insertSTAR = () => {
        setNotes("S (Situation): \nT (Task): \nA (Action): \nR (Result): ");
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1.1;

            const setVoice = () => {
                const voices = window.speechSynthesis.getVoices();
                const femaleVoice = voices.find(v =>
                    v.name.includes("Samantha") ||
                    v.name.includes("Female") ||
                    v.name.includes("Google US English") ||
                    v.name.includes("Microsoft Zira")
                );
                if (femaleVoice) utterance.voice = femaleVoice;
                window.speechSynthesis.speak(utterance);
            };

            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = setVoice;
            } else {
                setVoice();
            }

            utterance.onend = () => {
                if (isCompleted) {
                    setAiStatus('idle');
                } else {
                    setAiStatus('listening');
                }
            };
        }
    };

    // Trigger TTS when AI speaks
    useEffect(() => {
        if (aiStatus === 'speaking' && !isEnding) {
            const lastMsg = transcript[transcript.length - 1];
            if (lastMsg && lastMsg.role === 'ai') {
                speak(lastMsg.text);
            }
        }
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [aiStatus, transcript, isEnding]);

    return (
        <div className="h-screen bg-[#020817] text-white flex flex-col overflow-hidden font-sans selection:bg-primary/30">

            {/* 1. TOP BAR */}
            <div className="flex flex-col border-b border-white/5 shrink-0">
                <header className="h-16 flex items-center justify-between px-6 bg-secondary/5 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Activity className="text-black w-5 h-5" />
                            </div>
                            <span className="font-bold tracking-tight text-white">CodePrep AI</span>
                        </div>
                        <Separator orientation="vertical" className="h-8 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mb-1">Session Round</span>
                            <span className="text-sm font-medium flex items-center gap-2">
                                {interviewType.toUpperCase()} ROUND
                                – {isCompleted ? 'Completed' : `R${currentStep + (isLoadingQuestions ? 0 : 1)} / ${questions.length}`}
                                <Badge className={`bg-primary/10 text-primary border-none text-[10px] h-4 py-0 ${isCompleted ? 'bg-green-500/10 text-green-500' : ''}`}>
                                    {isCompleted ? 'Finished' : 'Live'}
                                </Badge>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${aiStatus === 'thinking' ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]' : aiStatus === 'speaking' ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]' : aiStatus === 'idle' ? 'bg-blue-500' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
                                <span className="text-xs font-mono uppercase tracking-tighter">
                                    {aiStatus === 'thinking' ? 'Ava is Thinking' : aiStatus === 'speaking' ? 'Ava is Speaking' : aiStatus === 'idle' ? 'Session Paused' : 'Ava is Listening'}
                                </span>
                            </div>
                            <Separator orientation="vertical" className="h-4 bg-white/10" />
                            <div className="text-sm font-mono tracking-tighter tabular-nums flex items-center gap-2">
                                <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={handleEndInterview} className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-500 font-bold transition-all px-4 h-9">
                            <PhoneOff className="w-4 h-4 mr-2" /> End Interview
                        </Button>
                    </div>
                </header>
                <Progress value={isLoadingQuestions ? 0 : isCompleted ? 100 : ((currentStep + 1) / questions.length) * 100} className="h-[2px] rounded-none bg-transparent" />
            </div>

            {/* MAIN LAYOUT: 25% | 50% | 25% (1:2:1 Grid) */}
            <main className="flex-1 grid grid-cols-4 gap-6 p-6 min-h-0">

                {/* LEFT COLUMN: 25% (1 col) */}
                <div className="col-span-1 flex flex-col gap-6 min-h-0">
                    {/* Character Card */}
                    <Card className="shrink-0 bg-[#111827] border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="aspect-video relative flex flex-col items-center justify-center p-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-50" />
                            <div className="relative z-10 w-full flex flex-col items-center">
                                <div className={`w-24 h-24 rounded-full bg-[#1F2937]/50 border border-white/10 flex items-center justify-center transition-all duration-700 overflow-hidden ${aiStatus === 'speaking' ? 'scale-110 shadow-[0_0_60px_rgba(var(--primary),0.2)] border-primary/30' : ''}`}>
                                    <img
                                        src={roboImg}
                                        alt="AI Robot"
                                        className={`w-full h-full object-cover transition-all duration-500 ${aiStatus === 'thinking' ? 'animate-pulse opacity-80' : 'opacity-100'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1F2937]/80 backdrop-blur-xl border-t border-white/5 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-sm font-black text-black">
                                        {user?.displayName?.charAt(0) || "C"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold tracking-tight text-white">{user?.displayName || "Candidate"}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{interviewType} Round • {config.difficulty}</span>
                                    </div>
                                </div>
                                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black tracking-[0.2em] px-2 h-5">VERIFIED</Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Question Card */}
                    <Card className="flex-1 bg-[#111827] border-white/5 flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active Question</span>
                            </div>
                            <div className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                                Timer: {formatTime(answerTime)}
                            </div>
                        </div>
                        <CardContent className="p-8 overflow-y-auto flex-1 flex flex-col leading-relaxed">
                            {isLoadingQuestions ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-30">
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Generating...</span>
                                </div>
                            ) : isCompleted ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in zoom-in slide-in-from-bottom-4 duration-500">
                                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <CheckCircle2 className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">Round Complete</h3>
                                        <p className="text-sm text-muted-foreground max-w-[200px] mx-auto opacity-70">You have completed all preset questions successfully.</p>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full max-w-[240px]">
                                        <Button onClick={handleEndInterview} className="h-12 bg-primary text-black font-black uppercase rounded-2xl hover:scale-105 transition-transform">
                                            GET PERFORMANCE REPORT
                                        </Button>
                                        <Button variant="ghost" onClick={askDoubts} className="h-12 border-white/10 font-bold uppercase rounded-2xl flex gap-2 text-white/60 hover:text-white">
                                            ASK MORE DOUBTS
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xl font-medium text-slate-200 animate-in slide-in-from-bottom-4 duration-500">
                                    "{questions[currentStep]}"
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* CENTER COLUMN: 50% (2 cols) */}
                <div className="col-span-2 flex flex-col gap-6 min-h-0">
                    <Card className="flex-1 bg-black rounded-[3rem] border-white/5 relative overflow-hidden flex items-center justify-center group shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                        {isCameraOn ? (
                            <div className="w-full h-full bg-black relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover mirror-mode"
                                />
                                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                                    <VideoOff className="w-10 h-10 opacity-20" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Feed Suspended</span>
                            </div>
                        )}

                        {/* CONTROL BAR: Overlaid at the very bottom of the video */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-5 bg-black/60 backdrop-blur-2xl border border-white/10 p-2 rounded-full z-30 transition-all hover:bg-black/80 shadow-2xl">
                            <div className="pl-4 pr-5 py-1 border-r border-white/10 flex items-center gap-1.5 min-w-[100px] justify-center">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div
                                        key={i}
                                        className={`w-1 rounded-full bg-primary transition-all duration-75 ${aiStatus === 'listening' ? 'animate-pulse' : 'opacity-20'}`}
                                        style={{ height: `${Math.max(4, (micLevel / 128) * 24 * (i % 2 === 0 ? 1 : i % 3 === 0 ? 1.5 : 0.8))}px` }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className={`h-11 w-11 rounded-[20px] transition-all ${!isMicOn ? 'bg-red-500/20 text-red-500' : 'text-white hover:bg-white/10'}`} onClick={() => setIsMicOn(!isMicOn)}>
                                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                </Button>
                                <Button size="icon" variant="ghost" className={`h-11 w-11 rounded-[20px] transition-all ${!isCameraOn ? 'bg-red-500/20 text-red-500' : 'text-white hover:bg-white/10'}`} onClick={() => setIsCameraOn(!isCameraOn)}>
                                    {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="h-44 bg-[#111827] border-white/5 flex flex-col overflow-hidden shrink-0 shadow-xl">
                        <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scratchpad Area</span>
                            </div>
                            <Button variant="ghost" className="h-6 text-[9px] font-black text-primary hover:bg-primary/10 rounded px-2" onClick={insertSTAR}>USE STAR TEMPLATE</Button>
                        </div>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Jot down keywords or draft your answer structure here..."
                            className="flex-1 bg-transparent p-5 resize-none font-mono text-xs border-0 focus-visible:ring-0 placeholder:opacity-30 text-slate-300"
                        />
                    </Card>
                </div>

                {/* RIGHT COLUMN: 25% (1 col) */}
                <Card className="col-span-1 bg-[#0F172A] border-white/5 flex flex-col h-full min-h-0 overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/5">
                        <MessageSquare className="w-4 h-4 text-muted-foreground opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Session Log</span>
                        <Badge className="ml-auto bg-white/5 text-[9px] font-mono text-muted-foreground h-5 flex items-center justify-center">LIVE</Badge>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto space-y-8 scroll-smooth scrollbar-thin scrollbar-thumb-white/10">
                        {transcript.map((msg, i) => (
                            <div key={i} className={`flex flex-col gap-2 ${msg.role === 'ai' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`p-4 rounded-3xl text-xs leading-[1.6] max-w-[90%] ${msg.role === 'ai' ? 'bg-[#1E293B] text-slate-300 rounded-tl-none border border-white/10' : 'bg-primary/20 text-primary-foreground/90 rounded-tr-none border border-primary/20'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {currentSpeech && (
                            <div className="flex flex-col items-end opacity-40">
                                <div className="p-3.5 rounded-2xl text-[10px] bg-white/5 border border-white/5 rounded-tr-none italic text-primary/80">
                                    {currentSpeech}...
                                </div>
                            </div>
                        )}
                        <div ref={transcriptEndRef} />
                    </div>
                </Card>
            </main>

            {/* OVERLAYS */}
            {warning && (
                <div className="absolute inset-x-0 top-20 flex justify-center z-[100] animate-in slide-in-from-top-4">
                    <div className="bg-red-500/20 backdrop-blur-3xl border border-red-500/50 text-red-500 px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-2xl">
                        <AlertTriangle className="w-5 h-5 animate-bounce" />
                        {warning}
                    </div>
                </div>
            )}

            {isGeneratingReport && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-xl">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BrainCircuit className="w-12 h-12 text-primary animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 animate-pulse">Syncing AI Analysis</h2>
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px]">Evaluating your performance metrics...</p>

                    <div className="mt-12 flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                </div>
            )}

            {isEnding && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                    <AlertTriangle className="w-16 h-16 text-primary animate-pulse mb-6" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Ending Session...</h2>
                    <p className="mt-2 text-muted-foreground font-bold italic">"Finalizing your conversation logs..."</p>
                </div>
            )}
        </div>
    );
}

function Separator({ className, orientation = "horizontal" }: { className?: string, orientation?: "horizontal" | "vertical" }) {
    return <div className={`shrink-0 bg-border ${orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'} ${className}`} />;
}

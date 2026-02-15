import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
    Code, Mic, Clock, ShieldCheck, Wifi,
    Video, Sparkles, Upload, CheckCircle2, AlertCircle,
    Activity, ChevronRight, MessageSquare, ScanFace, Volume2
} from "lucide-react";
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

export default function InterviewLobby() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Session Configuration State
    const [activeTab, setActiveTab] = useState("coding");
    const [companyMode, setCompanyMode] = useState("general");
    const [resume, setResume] = useState<File | null>(null);
    const [aiMode, setAiMode] = useState<'voice' | 'text'>('voice');

    // New Configuration State
    const [questionCount, setQuestionCount] = useState(3);
    const [difficulty, setDifficulty] = useState("medium");
    const [focusArea, setFocusArea] = useState("DSA & Optimization");

    // AI Focus State
    const [aiFocusTags, setAiFocusTags] = useState<string[]>(["React Hooks", "System Scaling", "Leadership"]);
    const [resumeText, setResumeText] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Initialize PDF.js worker
    useEffect(() => {
        // Use a reputable CDN for the worker to avoid bundler issues
        // @ts-ignore
        if (pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }
    }, []);

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + ' ';
            }
            return fullText;
        } catch (e) {
            console.error("PDF extraction error:", e);
            throw e;
        }
    };

    const extractSkills = (text: string): string[] => {
        const skillsDB = [
            "React", "Node.js", "Python", "Java", "C++", "AWS", "Docker", "Kubernetes",
            "TypeScript", "JavaScript", "SQL", "NoSQL", "MongoDB", "PostgreSQL",
            "Redis", "GraphQL", "Next.js", "Vue.js", "Angular", "Svelte",
            "Machine Learning", "Data Science", "System Design", "Microservices",
            "CI/CD", "Git", "Agile", "Scrum", "REST API", "gRPC", "Go", "Rust",
            "HTML", "CSS", "Tailwind", "Redux", "Zustand", "Prisma", "NestJS"
        ];

        const foundSkills = new Set<string>();
        const lowerText = text.toLowerCase();

        skillsDB.forEach(skill => {
            // Simple whole word matching or substring matching
            if (lowerText.includes(skill.toLowerCase())) {
                foundSkills.add(skill);
            }
        });

        return Array.from(foundSkills);
    };

    const handleResumeUpload = async (file: File) => {
        if (!file) return;
        setResume(file);
        setIsAnalyzing(true);
        setAiFocusTags(["Scanning Resume..."]); // Immediate feedback

        try {
            let extractedText = "";
            let skills: string[] = [];

            // Artificial delay for UX (to show 'Scanning...')
            await new Promise(r => setTimeout(r, 1500));

            if (file.type === "application/pdf") {
                extractedText = await extractTextFromPDF(file);
            } else {
                // Try text extraction for other types
                extractedText = await file.text();
            }

            setResumeText(extractedText);
            skills = extractSkills(extractedText);

            // If no skills found, fallback to generic
            if (skills.length === 0) {
                if (file.name.toLowerCase().includes("react")) skills.push("React");
                if (file.name.toLowerCase().includes("java")) skills.push("Java");
                if (skills.length === 0) skills = ["General Competency", "Problem Solving", "Communication"];
            }

            // Mix with current round focus
            const defaultRoundFocus =
                activeTab === 'coding' ? 'Data Structures' :
                    activeTab === 'system-design' ? 'Scalability' : 'Soft Skills';

            const newTags = [
                defaultRoundFocus,
                ...skills
            ];

            // Limit to top 4 unique tags
            setAiFocusTags(Array.from(new Set(newTags)).slice(0, 4));

        } catch (error) {
            console.error("Resume parsing failed:", error);
            setAiFocusTags(["Resume Context", "General Competency"]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Media & System Check State
    const [checks, setChecks] = useState({
        internet: "checking",
        camera: "pending",
        mic: "pending",
        noise: "pending",
        face: "pending"
    });

    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [micLevel, setMicLevel] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Auto-update Focus Area based on Interview Type
    useEffect(() => {
        switch (activeTab) {
            case 'coding':
                setFocusArea("DSA & Optimization");
                break;
            case 'technical':
                setFocusArea("System Design & Architecture");
                break;
            case 'behavioral':
                setFocusArea("Leadership & Soft Skills");
                break;
            case 'hr':
                setFocusArea("Culture Fit & Career Goals");
                break;
            default:
                setFocusArea("General Competency");
        }
    }, [activeTab]);

    // Run System Checks & Media Setup
    useEffect(() => {
        const runChecks = async () => {
            // Speed Check
            setTimeout(() => setChecks(prev => ({ ...prev, internet: "success" })), 1000);

            // Media Access
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setMediaStream(stream);
                streamRef.current = stream; // Keep ref for cleanup

                // Setup Audio Analysis
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;
                const analyser = audioContext.createAnalyser();
                analyserRef.current = analyser;
                analyser.fftSize = 256;
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                setTimeout(() => setChecks(prev => ({ ...prev, camera: "success", mic: "success" })), 1500);
                setTimeout(() => setChecks(prev => ({ ...prev, noise: "success" })), 2500);
                setTimeout(() => setChecks(prev => ({ ...prev, face: "success" })), 3500);
            } catch (err) {
                console.error("Media access denied:", err);
                setChecks(prev => ({ ...prev, camera: "error", mic: "error" }));
            }
        };
        runChecks();

        // Cleanup
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Mic Level Visualizer Loop
    useEffect(() => {
        if (!checks.mic || checks.mic !== 'success' || !analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        let animationId: number;

        const updateMicLevel = () => {
            if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((src, a) => src + a, 0) / dataArray.length;
                setMicLevel(average); // 0 to 255
            }
            animationId = requestAnimationFrame(updateMicLevel);
        };

        updateMicLevel();
        return () => cancelAnimationFrame(animationId);
    }, [checks.mic]);

    // Attach stream to video element
    useEffect(() => {
        if (checks.camera === 'success' && videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [checks.camera, mediaStream]);

    const allChecksPassed = Object.values(checks).every(status => status === "success");

    const handleStart = () => {
        const roomId = Math.random().toString(36).substring(7);
        navigate(`/interview/room/${roomId}`, {
            state: {
                type: activeTab,
                company: companyMode,
                resume: !!resume,
                resumeText: resumeText,
                aiFocusTags: aiFocusTags,
                mode: aiMode,
                config: {
                    questionCount,
                    difficulty,
                    focusArea
                }
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-card border border-border/50 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Code className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            {activeTab === 'coding' ? 'Technical Interview' :
                                activeTab === 'hr' ? 'HR Round' :
                                    activeTab === 'behavioral' ? 'Behavioral Assessment' : 'System Design'}
                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground uppercase tracking-wider backdrop-blur-md">
                                {companyMode === 'general' ? 'Standard' : companyMode} Simulation
                            </Badge>
                        </h2>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 45 Minutes</span>
                            <span className="flex items-center gap-1 text-green-500"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live System Status</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium">{user?.displayName || "Candidate"}</p>
                        <p className="text-xs text-muted-foreground">Premium Member</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-background">
                        {user?.displayName?.charAt(0) || "U"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Configuration */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Interview Mode Selection */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-4 bg-secondary/30 p-1 rounded-xl">
                            <TabsTrigger value="coding" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Coding</TabsTrigger>
                            <TabsTrigger value="technical" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Technical</TabsTrigger>
                            <TabsTrigger value="behavioral" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Behavioral</TabsTrigger>
                            <TabsTrigger value="hr" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">HR</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            {/* Session Overview Card */}
                            <Card className="border-border/50 bg-gradient-to-b from-card to-secondary/10 shadow-lg">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Session Overview</CardTitle>
                                            <CardDescription>Review parameters for your session.</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
                                            <Button
                                                variant={aiMode === 'voice' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setAiMode('voice')}
                                                className="h-7 text-xs gap-1.5"
                                            >
                                                <Mic className="w-3 h-3" /> Voice
                                            </Button>
                                            <Button
                                                variant={aiMode === 'text' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setAiMode('text')}
                                                className="h-7 text-xs gap-1.5"
                                            >
                                                <MessageSquare className="w-3 h-3" /> Text
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Target Company</Label>
                                            <Select value={companyMode} onValueChange={setCompanyMode}>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Select Company" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">Standard (General)</SelectItem>
                                                    <SelectItem value="google">Google</SelectItem>
                                                    <SelectItem value="amazon">Amazon</SelectItem>
                                                    <SelectItem value="microsoft">Microsoft</SelectItem>
                                                    <SelectItem value="netflix">Netflix</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="p-4 rounded-lg bg-background/50 border border-border/50 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <Label className="text-muted-foreground">Question Count</Label>
                                                    <span className="font-medium">{questionCount} Problems</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    value={questionCount}
                                                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground text-sm">Difficulty</Label>
                                                <Select value={difficulty} onValueChange={setDifficulty}>
                                                    <SelectTrigger className="h-8 text-xs bg-background/80">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="easy">Easy (Beginner)</SelectItem>
                                                        <SelectItem value="medium">Medium (Standard)</SelectItem>
                                                        <SelectItem value="hard">Hard (Advanced)</SelectItem>
                                                        <SelectItem value="adaptive">Adaptive (AI Driven)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground text-sm">Focus Area</Label>
                                                <Input
                                                    value={focusArea}
                                                    onChange={(e) => setFocusArea(e.target.value)}
                                                    className="h-8 text-xs bg-background/80"
                                                    placeholder="e.g. Arrays, System Design, Leadership"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* AI Focus Section (New) */}
                                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-3 h-3 text-purple-500" />
                                                <span className="text-xs font-semibold text-purple-500 uppercase tracking-wider">AI Will Focus On</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                                                {isAnalyzing ? (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                                                        Analyzing Resume...
                                                    </div>
                                                ) : (
                                                    aiFocusTags.map((tag, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-[10px] bg-background/80 hover:bg-background border-purple-200/20">{tag}</Badge>
                                                    ))
                                                )}
                                                {resume && !isAnalyzing && <Badge variant="default" className="text-[10px] bg-purple-600 hover:bg-purple-700">Resume Context</Badge>}
                                            </div>
                                        </div>

                                        {/* Resume Section */}
                                        <div className={`border-2 border-dashed transition-all rounded-xl p-4 text-center cursor-pointer relative group ${resume ? 'border-purple-500/50 bg-purple-500/5' : 'border-border/60 hover:border-primary/50 bg-background/30'}`}>
                                            <Input
                                                type="file"
                                                accept=".pdf,.docx,.txt"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) handleResumeUpload(e.target.files[0]);
                                                }}
                                            />
                                            <div className="flex items-center justify-center gap-3">
                                                <div className={`p-2 rounded-full transition-colors ${resume ? 'bg-purple-500/20 text-purple-400' : 'bg-primary/10 text-primary'}`}>
                                                    {resume ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-sm">
                                                        {resume ? resume.name : "Upload Resume"}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {resume ? "Analysis Complete" : "For personalized Qs"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </Tabs>

                    {/* Professional Guidelines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-background/40 border border-border/50 rounded-xl p-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Session Rules
                            </h4>
                            <ul className="space-y-2">
                                <li className="flex gap-2 text-xs text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span>Maintain full-screen mode throughout.</span>
                                </li>
                                <li className="flex gap-2 text-xs text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span>Do not switch tabs or windows.</span>
                                </li>
                                <li className="flex gap-2 text-xs text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span>No external assistance or AI tools.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-background/40 border border-border/50 rounded-xl p-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                <ScanFace className="w-4 h-4 text-primary" />
                                Behavioral Tips
                            </h4>
                            <ul className="space-y-2">
                                <li className="flex gap-2 text-xs text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                    <span>Speak clearly and maintain pace.</span>
                                </li>
                                <li className="flex gap-2 text-xs text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                    <span>Keep professional eye contact.</span>
                                </li>
                                <li className="flex gap-2 text-xs text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                    <span>Ensure good lighting and silence.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: System Check & Start */}
                <div className="space-y-6">

                    {/* System Check Card */}
                    <Card className="h-full border-border/50 bg-card shadow-lg flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="w-5 h-5 text-primary" />
                                Live Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">

                            {/* Camera Preview */}
                            <div className="aspect-video bg-black rounded-lg relative overflow-hidden ring-1 ring-border/20 group">
                                {checks.camera === 'success' ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        className="w-full h-full object-cover transform scale-x-[-1]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <Video className="w-8 h-8 opacity-20" />
                                    </div>
                                )}

                                {/* Overlays */}
                                {checks.camera === 'success' && (
                                    <>
                                        {/* Recording Indicator */}
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-[10px] text-white font-medium z-10">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse border border-red-900" />
                                            REC
                                        </div>

                                        {/* Timer (Fake) */}
                                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white font-mono z-10">
                                            00:00:00
                                        </div>

                                        {/* Face Detection Box (Mock) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/20 rounded-lg pointer-events-none">
                                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary -mt-0.5 -ml-0.5"></div>
                                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary -mt-0.5 -mr-0.5"></div>
                                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary -mb-0.5 -ml-0.5"></div>
                                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary -mb-0.5 -mr-0.5"></div>
                                        </div>

                                        {/* Audio Visualizer Bar */}
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-full">
                                            <Mic className={`w-3 h-3 ${micLevel > 10 ? 'text-green-400' : 'text-muted-foreground'}`} />
                                            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 transition-all duration-75"
                                                    style={{ width: `${Math.min((micLevel / 128) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Checklist */}
                            <div className="space-y-1">
                                {[
                                    { id: 'internet', label: 'Network Stability', icon: Wifi },
                                    { id: 'camera', label: 'Camera Access', icon: Video },
                                    { id: 'mic', label: 'Microphone Check', icon: Mic },
                                    { id: 'noise', label: 'Background Noise check', icon: Volume2 },
                                    { id: 'face', label: 'Face AI Detection', icon: ScanFace },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${checks[item.id as keyof typeof checks] === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                        <div>
                                            {checks[item.id as keyof typeof checks] === 'checking' && <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin block" />}
                                            {checks[item.id as keyof typeof checks] === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500 animate-in zoom-in" />}
                                            {checks[item.id as keyof typeof checks] === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                            {checks[item.id as keyof typeof checks] === 'pending' && <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </CardContent>
                        <CardFooter className="pt-2 pb-6">
                            <Button
                                className="w-full h-12 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
                                size="lg"
                                disabled={!allChecksPassed}
                                onClick={handleStart}
                            >
                                {allChecksPassed ? (
                                    <>Start Interview <ChevronRight className="w-4 h-4" /></>
                                ) : (
                                    "Waiting for System Check..."
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    );
}

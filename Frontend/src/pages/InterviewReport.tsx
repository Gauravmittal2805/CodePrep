import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Activity, TrendingUp, AlertTriangle, RefreshCw,
    CheckCircle2, ArrowLeft, Download, Share2,
    BrainCircuit, MessageSquare, Timer, Target,
    BookOpen, BarChart2, Info, Building2, Briefcase,
    Layers, Zap, Clock, Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function InterviewReport() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [report, setReport] = useState<any>(location.state?.report || null);
    const [isLoading, setIsLoading] = useState(!report);
    const [meta, setMeta] = useState<any>({
        type: location.state?.type || "Technical",
        difficulty: location.state?.difficulty || "Medium",
        company: location.state?.company || "Custom",
        title: location.state?.title || "Role Based Interview",
        aiFocusTags: location.state?.aiFocusTags || [],
        metrics: location.state?.metrics || { totalDuration: 0, wpm: 0 }
    });

    useEffect(() => {
        if (!report && id) {
            const fetchReport = async () => {
                try {
                    const token = await user?.getIdToken();
                    const response = await axios.get(`http://localhost:5001/api/ai/report/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        const data = response.data.data;
                        setReport(data.aiReport);
                        setMeta({
                            type: data.interviewType,
                            difficulty: data.difficulty,
                            company: data.companyTag || "General",
                            title: data.title || "Standard Interview",
                            aiFocusTags: data.aiFocusTags || [],
                            metrics: data.metrics || { totalDuration: 0, wpm: 0 }
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch report:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchReport();
        }
    }, [id, report, user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter animate-pulse">Retrieving Analysis...</h2>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-10 text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Report Not Found</h2>
                <p className="text-muted-foreground mt-2 max-w-md italic">We couldn't find the requested interview session. It may have been deleted or the link is invalid.</p>
                <Button onClick={() => navigate('/interview')} className="mt-8 bg-primary text-black font-black px-10 rounded-2xl h-14">
                    BACK TO DASHBOARD
                </Button>
            </div>
        );
    }

    const metricTooltips: Record<string, string> = {
        'Technical Accuracy': 'Analyzes the correctness of your technical explanations, use of industry terminology, and problem-solving logic.',
        'Communication clarity': 'Measures your articulation, vocabulary range, speaking pace, and the logical flow of your verbal delivery.',
        'Behavioral Confidence': 'Evaluates vocal stability, tone, and the decisiveness of your answers to assess your professional presence.',
        'Solution Structure': 'Checks if your answers follow a professional framework (like STAR) and if you address all parts of a problem systematically.',
        'Overall Score': 'The weighted average of all performance metrics, benchmarking you against industry expectations for your selected level.'
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-[#020617] text-white selection:bg-primary selection:text-black">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/interview')}
                                className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl h-12 w-12 p-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Session Insights</h1>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-primary">Performance Artifacts</span>
                                    <span className="opacity-30">•</span>
                                    <span>Generated by CodePrep AI</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="hidden md:flex bg-white/5 border-white/5 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl border border-white/10 px-6 gap-2 hover:bg-white/10">
                                <Share2 className="w-4 h-4" /> Share
                            </Button>
                            <Button className="bg-primary text-black text-[10px] font-black uppercase tracking-widest h-12 rounded-xl px-8 shadow-[0_4px_20px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform gap-2">
                                <Download className="w-4 h-4" /> Download Report
                            </Button>
                        </div>
                    </div>
                </div>

                <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
                    {/* Interview Details Header (New) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-white/[0.03] border border-white/5 rounded-[40px] backdrop-blur-md">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Company Focus</span>
                            </div>
                            <span className="text-sm font-black text-primary">{meta.company}</span>
                        </div>
                        <div className="flex flex-col gap-2 border-l border-white/5 pl-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Interview Title</span>
                            </div>
                            <span className="text-sm font-black truncate">{meta.title}</span>
                        </div>
                        <div className="flex flex-col gap-2 border-l border-white/5 pl-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Layers className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Difficulty</span>
                            </div>
                            <Badge variant="outline" className="w-fit border-primary/20 text-primary bg-primary/5 text-[9px] px-3 py-1 font-black uppercase">{meta.difficulty}</Badge>
                        </div>
                        <div className="flex flex-col gap-2 border-l border-white/5 pl-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Zap className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Category</span>
                            </div>
                            <span className="text-sm font-black">{meta.type} Round</span>
                        </div>
                    </div>

                    {/* AI Focus Tags Section (New) */}
                    {meta.aiFocusTags && meta.aiFocusTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 px-8 py-4 bg-primary/5 border border-primary/10 rounded-[30px] animate-in slide-in-from-left-4 duration-700">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary mr-2">Evaluation Focus:</span>
                            {meta.aiFocusTags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-background/50 border-primary/20 text-white text-[9px] px-3 py-1 font-bold">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* 1. Executive Summary & Core Scores */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Overall Score Card */}
                        <div className="lg:col-span-4 p-12 bg-white/5 rounded-[48px] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 transition-colors group-hover:bg-primary/20" />

                            <div className="flex items-center gap-2 mb-8 relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Overall Performance</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-white transition-colors cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 border-white/10 text-white max-w-xs">
                                        <p>{metricTooltips['Overall Score']}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="relative w-56 h-56 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="112" cy="112" r="104"
                                        stroke="currentColor" strokeWidth="6" fill="transparent"
                                        className="text-white/5"
                                    />
                                    <circle
                                        cx="112" cy="112" r="104"
                                        stroke="currentColor" strokeWidth="6" fill="transparent"
                                        strokeDasharray={653}
                                        strokeDashoffset={653 - (653 * report.overallScore) / 100}
                                        className="text-primary transition-all duration-[2000ms] ease-out-expo"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-7xl font-black tracking-tighter">{report.overallScore}%</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-1">CANDIDATE RANK</span>
                                </div>
                            </div>

                            <div className="mt-12 text-center relative z-10 w-full">
                                <div className="p-4 bg-primary/5 rounded-3xl border border-primary/20 mb-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Hiring Recommendation</p>
                                    <h4 className="text-2xl font-black text-white">{report.hireRecommendation}</h4>
                                </div>
                                <p className="text-sm font-bold text-muted-foreground italic leading-relaxed px-6 opacity-70">
                                    "{report.detailedFeedback?.[0] || "Analysis completed based on the session transcript."}"
                                </p>
                            </div>
                        </div>

                        {/* Skill Distribution */}
                        <div className="lg:col-span-8 p-12 bg-white/5 border border-white/5 rounded-[48px] flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mb-48 -mr-48" />

                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mb-12 flex items-center gap-4">
                                    <BarChart2 className="w-4 h-4 text-primary" /> Multi-Aspect Performance (Percentage)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                    {[
                                        { label: 'Technical Accuracy', val: report.technicalScore, color: 'bg-blue-400', icon: Target },
                                        { label: 'Communication clarity', val: report.communicationScore, color: 'bg-primary', icon: MessageSquare },
                                        { label: 'Behavioral Confidence', val: report.confidenceScore, color: 'bg-purple-400', icon: Activity },
                                        { label: 'Solution Structure', val: Math.round(report.overallScore * 0.9), color: 'bg-green-400', icon: BrainCircuit }
                                    ].map(skill => (
                                        <div key={skill.label} className="group/item">
                                            <div className="flex justify-between items-end mb-3">
                                                <div className="flex items-center gap-2">
                                                    <skill.icon className="w-3.5 h-3.5 text-muted-foreground group-hover/item:text-white transition-colors" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover/item:text-white transition-colors">{skill.label}</span>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info className="w-3 h-3 text-muted-foreground/40 hover:text-white transition-colors cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 border-white/10 text-white p-3 max-w-xs">
                                                            <p className="font-bold mb-1 text-primary uppercase text-[10px]">{skill.label}</p>
                                                            <p className="text-xs opacity-80">{metricTooltips[skill.label]}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <span className="text-xl font-black text-white">{skill.val}%</span>
                                            </div>
                                            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className={`h-full ${skill.color} transition-all duration-[1500ms] ease-out-expo shadow-[0_0_15px_rgba(var(--primary),0.3)]`}
                                                    style={{ width: `${skill.val}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-3 gap-8 relative z-10">
                                {[
                                    { label: 'Session Time', val: formatDuration(meta.metrics?.totalDuration || 0), icon: Clock },
                                    { label: 'Average WPM', val: `${meta.metrics?.wpm || 0} wpm`, icon: TrendingUp },
                                    { label: 'Key Questions', val: report.questionFeedback?.length || 0, icon: BookOpen },
                                ].map(m => (
                                    <div key={m.label} className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{m.label}</span>
                                        <span className="text-base font-black flex items-center gap-2 transition-colors hover:text-primary">
                                            <m.icon className="w-4 h-4 text-primary" /> {m.val}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. Qualitative Feedback - Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Strengths */}
                        <div className="p-10 bg-primary/5 border border-primary/10 rounded-[48px] space-y-8 group hover:bg-primary/[0.08] transition-all">
                            <div className="flex items-center gap-4 text-primary">
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shadow-[0_4px_15px_rgba(var(--primary),0.1)]">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-[0.4em]">Core Strengths</h3>
                            </div>
                            <div className="space-y-4">
                                {report.strengths?.map((s: string, i: number) => (
                                    <div key={i} className="flex gap-5 items-start p-5 bg-black/20 rounded-3xl border border-white/5 group/s">
                                        <span className="text-primary mt-1 font-black text-xs">0{i + 1}</span>
                                        <p className="text-sm font-bold opacity-80 leading-relaxed group-hover/s:opacity-100 transition-opacity">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="p-10 bg-red-400/5 border border-red-400/10 rounded-[48px] space-y-8 group hover:bg-red-400/[0.08] transition-all">
                            <div className="flex items-center gap-4 text-red-400">
                                <div className="w-12 h-12 rounded-2xl bg-red-400/20 flex items-center justify-center shadow-[0_4px_15px_rgba(248,113,113,0.1)]">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-[0.4em]">Growth Gaps</h3>
                            </div>
                            <div className="space-y-4">
                                {report.weaknesses?.map((w: string, i: number) => (
                                    <div key={i} className="flex gap-5 items-start p-5 bg-black/20 rounded-3xl border border-white/5 group/w">
                                        <span className="text-red-400 mt-1 font-black text-xs">0{i + 1}</span>
                                        <p className="text-sm font-bold opacity-80 leading-relaxed group-hover/w:opacity-100 transition-opacity">{w}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Question-Wise Analysis */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground flex items-center gap-4">
                                <Target className="w-4 h-4 text-primary" /> Step-By-Step Evaluation
                            </h3>
                            <Badge variant="outline" className="border-white/10 text-[9px] font-black uppercase tracking-widest px-5 py-1.5 bg-white/5">RESPONSE LOGS</Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {report.questionFeedback?.map((q: any, i: number) => (
                                <div key={i} className="p-10 bg-white/[0.03] border border-white/5 rounded-[48px] hover:bg-white/[0.06] transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-8 relative z-10">
                                        <div className="flex items-start gap-8 max-w-3xl">
                                            <div className="w-14 h-14 bg-white/5 rounded-[22px] border border-white/10 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-500 shadow-xl">
                                                0{i + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-2xl mb-5 group-hover:text-primary transition-colors leading-tight">{q.question}</h4>
                                                <div className="flex flex-wrap items-center gap-6">
                                                    <Badge className="bg-white/10 border-white/10 text-[9px] font-black px-4 py-1 tracking-widest">TYPE: {meta.type}</Badge>
                                                    <Badge className="bg-primary/5 border-primary/20 text-primary text-[9px] font-black px-4 py-1 tracking-widest">STRENGTH: HIGH</Badge>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                        <span className="text-[11px] font-bold text-muted-foreground uppercase opacity-60">Verified Response</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center px-12 py-8 bg-black/40 rounded-[32px] border border-white/10 shrink-0 shadow-2xl group-hover:border-primary/30 transition-colors">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black text-primary leading-none transition-transform group-hover:scale-110 duration-500">{q.score}</span>
                                                <span className="text-xl font-black opacity-20">/10</span>
                                            </div>
                                            <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] mt-3">Accuracy</span>
                                        </div>
                                    </div>
                                    <div className="lg:ml-22 pl-12 border-l-2 border-white/5 py-2 relative z-10">
                                        <div className="flex items-center gap-3 mb-4 text-muted-foreground">
                                            <div className="w-2 h-0.5 bg-primary/40 rounded-full" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">AI Feedback</span>
                                        </div>
                                        <p className="text-base font-bold opacity-60 leading-relaxed group-hover:opacity-100 transition-opacity">
                                            {q.feedback}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Growth Roadmap */}
                    <div className="p-12 md:p-20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-white/10 rounded-[64px] relative overflow-hidden group shadow-[inset_0_0_100px_rgba(var(--primary),0.05)]">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-[1500ms]" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-8 mb-16">
                                <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center shadow-[0_10px_40px_rgba(var(--primary),0.4)] transition-transform group-hover:rotate-12 duration-500">
                                    <RefreshCw className="w-8 h-8 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter">Growth Strategy</h3>
                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] mt-1">Custom Actionable Roadmap</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {report.improvementPlan?.map((p: string, i: number) => (
                                    <div key={i} className="p-10 bg-black/40 backdrop-blur-md rounded-[40px] border border-white/5 flex flex-col gap-8 hover:border-primary/40 transition-all duration-500 hover:-translate-y-3 shadow-2xl group/card">
                                        <div className="w-12 h-12 bg-primary/10 rounded-[18px] flex items-center justify-center border border-primary/20 transition-colors group-hover/card:bg-primary/20">
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed opacity-70 group-hover/card:opacity-100">{p}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-24 pb-48 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-10 shadow-2xl group hover:border-primary/30 transition-all">
                            <Target className="w-10 h-10 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all duration-700" />
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-6">Elevate your game.</h3>
                        <p className="text-muted-foreground text-sm font-bold italic mb-16 max-w-sm opacity-60 uppercase tracking-widest">
                            Practice leads to professional mastery.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8">
                            <Button
                                onClick={() => navigate('/interview/lobby')}
                                className="bg-primary text-black font-black px-14 h-20 rounded-[32px] shadow-[0_10px_40px_rgba(var(--primary),0.3)] hover:scale-105 transition-all text-xs uppercase tracking-[0.2em]"
                            >
                                Start New Session
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                className="bg-white/5 border-white/10 text-white font-black px-14 h-20 rounded-[32px] hover:bg-white/10 text-xs uppercase tracking-[0.2em] backdrop-blur-md"
                            >
                                Export Artifacts
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .ease-out-expo {
                    transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
                }
                :root {
                    --primary: 34, 211, 238;
                }
                @media print {
                    .sticky, button { display: none !important; }
                    .min-h-screen { background: white !important; color: black !important; }
                    .bg-white\\/5 { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
                }
            ` }} />
        </TooltipProvider>
    );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Target,
    Zap,
    PieChart,
    CheckCircle2,
    Play,
    ArrowRight,


    Briefcase,
    Timer,
    Code,
    HelpCircle,
    Info,
    AlertCircle,
    XCircle,
    Loader2,
    Copy,
    FileDown
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { companiesApi, type Company } from "@/services/companiesApi";
import { problemsApi, type Problem } from "@/services/problemsApi";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import AICompanyPattern from '@/components/company/AICompanyPattern';


interface PracticePlanRendererProps {
    plan: string;
}

const PracticePlanRenderer = ({ plan }: PracticePlanRendererProps) => {
    // Simple parser for Day sections
    const sections = plan.split(/### Day /i);
    const intro = sections[0].trim();
    const days = sections.slice(1);

    return (
        <div className="space-y-10">
            {intro && (
                <div className="text-white/80 leading-relaxed font-normal text-sm border-l-2 border-primary/30 pl-6 py-4 bg-primary/[0.03] rounded-r-xl whitespace-pre-wrap italic">
                    {intro.replace(/### |#### |## |# /g, '')}
                </div>
            )}

            <div className="grid gap-6">
                {days.map((dayContent, idx) => {
                    const lines = dayContent.split('\n').filter(l => l.trim() !== '');
                    const title = lines[0].trim();
                    const bodyLines = lines.slice(1);

                    return (
                        <div key={idx} className="relative group overflow-hidden rounded-2xl bg-[#0d0d0d] border border-white/5 hover:border-primary/20 transition-all duration-300 shadow-xl">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 group-hover:bg-primary/40 transition-colors" />
                            <div className="p-7">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                        {idx + 1}
                                    </div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Day {title}</h3>
                                </div>

                                <div className="space-y-4">
                                    {bodyLines.map((line, lidx) => {
                                        const isTable = line.includes('|');
                                        const isList = line.trim().startsWith('-') || line.trim().startsWith('*');

                                        if (line.includes('---')) return null;

                                        return (
                                            <div key={lidx} className={cn(
                                                "text-sm leading-relaxed",
                                                isTable ? "font-mono text-[11px] bg-white/[0.02] p-3 rounded-lg overflow-x-auto text-primary/70" : "text-white/60"
                                            )}>
                                                {isList ? (
                                                    <div className="flex gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                                                        <span>{line.replace(/^[-\*]\s+/, '').replace(/\*\*/g, '')}</span>
                                                    </div>
                                                ) : (
                                                    line.replace(/\*\*/g, '')
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

    const handleGeneratePlan = async () => {
        if (!id) return;
        if (!auth.currentUser) {
            toast.error("Please log in to generate a personalized practice plan");
            return;
        }
        setIsGeneratingPlan(true);
        const toastId = toast.loading(`Generating your personalized ${company?.name} plan...`);
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/ai/generate-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ companyId: id })
            });
            const result = await response.json();
            if (result.success) {
                setGeneratedPlan(result.data.plan);
                toast.success("Practice plan generated! Check it below.", { id: toastId });
                // Scroll to plan
                setTimeout(() => {
                    document.getElementById('practice-plan-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                toast.error(result.error || "Failed to generate plan", { id: toastId });
            }
        } catch (error) {
            console.error("AI Plan Error:", error);
            toast.error("An error occurred while generating the plan", { id: toastId });
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                // Fetch company details and problems in parallel
                const [companyData, problemsData] = await Promise.all([
                    companiesApi.getById(id),
                    problemsApi.getByCompany(id)
                ]);
                setCompany(companyData);
                setProblems(problemsData);
            } catch (error) {
                console.error("Failed to fetch company data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Mock company data for features not yet in DB
    // Readiness and stats calculation
    const solvedCount = problems.filter(p => p.userStatus?.status === 'solved').length;
    const totalCount = problems.length; // Removed default fallback
    const readiness = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

    const mockUserData = {
        weakness: [
            { id: 1, text: solvedCount === 0 ? "No practice data yet" : "Keep solving to improve", type: solvedCount === 0 ? "negative" : "positive" },
            { id: 2, text: "Patterns not analyzed", type: "negative" },
        ]
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
                <Navbar
                    isLoginOpen={isLoginOpen}
                    setIsLoginOpen={setIsLoginOpen}
                    isRegisterOpen={isRegisterOpen}
                    setIsRegisterOpen={setIsRegisterOpen}
                />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground animate-pulse">Analyzing company patterns...</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-white">
                <Navbar
                    isLoginOpen={isLoginOpen}
                    setIsLoginOpen={setIsLoginOpen}
                    isRegisterOpen={isRegisterOpen}
                    setIsRegisterOpen={setIsRegisterOpen}
                />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
                    <h1 className="text-3xl font-bold mb-2">Company Not Found</h1>
                    <p className="text-muted-foreground mb-8 text-center max-w-md">The company you are looking for might not be in our database yet or there was an error.</p>
                    <Button onClick={() => navigate("/companies")} variant="outline" className="border-primary/20 hover:bg-primary/10">
                        Back to Companies
                    </Button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground">
            <Navbar
                isLoginOpen={isLoginOpen}
                setIsLoginOpen={setIsLoginOpen}
                isRegisterOpen={isRegisterOpen}
                setIsRegisterOpen={setIsRegisterOpen}
            />

            <main className="container mx-auto px-4 pt-32 pb-24">
                {/* Back Button & Header */}
                <div className="mb-10 animate-fade-in">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/companies")}
                        className="mb-6 hover:bg-white/5 text-muted-foreground hover:text-white group"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Companies
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl overflow-hidden",
                                company.logo && company.logo.startsWith('http') ? "bg-white p-4" : `bg-gradient-to-br ${company.color}`
                            )}>
                                {company.logo && company.logo.startsWith('http') ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                                ) : (
                                    company.logo
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">{company.name} Prep</h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    Software Engineering | SDE-1 / SDE-2
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    const url = company.website || `https://en.wikipedia.org/wiki/${company.name.replace(/\s+/g, '_')}`;
                                    window.open(url, '_blank', 'noopener,noreferrer');
                                }}
                                className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 h-10 px-4 rounded-xl font-bold uppercase tracking-tight text-[10px] gap-2"
                            >
                                <Info className="w-4 h-4" />
                                About Company
                            </Button>
                            <Button
                                onClick={handleGeneratePlan}
                                disabled={isGeneratingPlan}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-5 rounded-xl font-bold uppercase tracking-tight text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {isGeneratingPlan ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "🧩"
                                )}
                                Generate Practice Plan
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Practice Plan Dialog */}
                <Dialog open={!!generatedPlan} onOpenChange={(open) => !open && setGeneratedPlan(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-[#0a0a0a] border-primary/20 p-0 flex flex-col gap-0 select-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                        <DialogHeader className="p-6 border-b border-white/5 relative z-10 bg-black/20 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                                        Personalized {company.name} Practice Plan
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground text-sm flex items-center gap-2 mt-0.5">
                                        <Target className="w-3.5 h-3.5" />
                                        AI-Powered Roadmap • {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar bg-grid-white/[0.02]">
                            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <PracticePlanRenderer plan={generatedPlan || ""} />

                                <div className="pt-8 border-t border-white/5 opacity-50 text-center mt-12">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                        Generated by CodePrep AI • For educational purposes only
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center relative z-10">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                                        {i}
                                    </div>
                                ))}
                                <div className="pl-4 text-[10px] font-medium text-muted-foreground flex items-center h-7 italic">
                                    "Your roadmap to success"
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors gap-2"
                                    onClick={() => {
                                        if (generatedPlan) {
                                            navigator.clipboard.writeText(generatedPlan);
                                            toast.success("Copied to clipboard");
                                        }
                                    }}
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors gap-2"
                                    onClick={() => {
                                        if (generatedPlan) {
                                            const element = document.createElement("a");
                                            const file = new Blob([generatedPlan], { type: 'text/markdown' });
                                            element.href = URL.createObjectURL(file);
                                            element.download = `${company?.name}_Practice_Plan.md`;
                                            document.body.appendChild(element);
                                            element.click();
                                            toast.success("Plan downloaded as .md file");
                                        }
                                    }}
                                >
                                    <FileDown className="w-3 h-3" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN (Readiness & Breakdown) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Readiness Meter */}
                        <Card className="bg-[#111111] border-border/40 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
                                    <Target className="w-6 h-6 text-primary" />
                                    {company.name} Readiness Meter
                                </CardTitle>
                                <CardDescription>Calculated based on topics solved, difficulty coverage, and mock performance</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                            <circle
                                                cx="96" cy="96" r="85"
                                                stroke="currentColor" strokeWidth="12" fill="transparent"
                                                strokeDasharray={534}
                                                strokeDashoffset={534 * (1 - readiness / 100)}
                                                className="text-primary transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-black text-white">{readiness}%</span>
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Overall Readiness</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                                                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">{company.name} Tags Solved</p>
                                                <p className="text-xl font-bold text-white">{solvedCount}/{totalCount}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                                                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">Difficulty Score</p>
                                                <p className="text-xl font-bold text-white">0</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                                            <p className="text-sm text-primary font-medium flex items-center gap-2">
                                                <Info className="w-4 h-4 shrink-0" />
                                                Insight: Start solving high-frequency problems to build your readiness score.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Topic Breakdown */}
                        <Card className="bg-[#111111] border-border/40 overflow-hidden relative group">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
                                    <PieChart className="w-6 h-6 text-purple-400" />
                                    Company Pattern Breakdown
                                </CardTitle>
                                <CardDescription>Frequency of topics asked in {company.name} OA & Technical rounds</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {company.pattern.map((item, i) => (
                                    <div key={item.topic} className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-sm font-bold text-white/90 uppercase tracking-tighter">{item.topic}</span>
                                            <span className="text-sm font-black text-muted-foreground">{item.percentage}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-1000 ease-out"
                                                style={{
                                                    width: `${item.percentage}%`,
                                                    transitionDelay: `${i * 100}ms`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <p className="text-[10px] text-muted-foreground italic">Based on real interview experiences analyzed by AI</p>
                                    <Button variant="link" className="text-primary text-xs font-bold gap-1 p-0 h-auto">
                                        Full Pattern Analysis
                                        <ArrowRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI-Powered OA Pattern Analysis */}
                        <Card className="bg-[#111111] border-border/40 overflow-hidden relative group">
                            <CardContent className="p-6">
                                <AICompanyPattern companyId={company.companyId} companyName={company.name} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN (Must-Do & OA Simulation & Weakness) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* 3. Must-Do Problems */}
                        <Card className="bg-[#111111] border-border/40">
                            <CardHeader className="pb-3 border-b border-white/10">
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    Must-Do Problems
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 px-0">
                                <div className="space-y-1 max-h-[440px] overflow-y-auto custom-scrollbar">
                                    {problems.length > 0 ? (
                                        problems.map((prob) => (
                                            <div
                                                key={prob._id}
                                                onClick={() => navigate(`/problem/${prob.slug}`)}
                                                className="flex items-center gap-3 px-6 py-3 hover:bg-white/5 cursor-pointer transition-colors group"
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
                                                    prob.userStatus?.status === "solved"
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : "border-white/20 group-hover:border-primary group-hover:scale-110"
                                                )}>
                                                    {prob.userStatus?.status === "solved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "text-sm font-medium transition-colors",
                                                        prob.userStatus?.status === "solved" ? "text-muted-foreground line-through" : "text-white group-hover:text-primary"
                                                    )}>{prob.title}</span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest",
                                                        prob.difficulty === 'Easy' ? 'text-green-500' :
                                                            prob.difficulty === 'Medium' ? 'text-yellow-500' : 'text-rose-500'
                                                    )}>
                                                        {prob.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-10 text-center">
                                            <p className="text-sm text-muted-foreground">No problems tagged for {company.name} yet.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="px-6 pt-6">
                                    <Button className="w-full h-11 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl font-bold uppercase tracking-tight text-xs">
                                        Explore All Problems
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. OA Simulation */}
                        <Card className="bg-gradient-to-br from-[#1c1c1c] to-[#111111] border-primary/20 border-2 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-2xl rounded-full -mr-10 -mt-10" />
                            <CardHeader>
                                <div className="bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest w-fit px-2 py-1 rounded-md mb-2 border border-primary/20">
                                    Real-time Sim
                                </div>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                                    <Timer className="w-5 h-5 text-primary" />
                                    {company.name} OA Simulation
                                </CardTitle>
                                <CardDescription>Feel the real heat before the actual exam</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Timer className="w-3.5 h-3.5" /> Duration
                                        </span>
                                        <span className="font-bold text-white">{company.oaSimulation.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Code className="w-3.5 h-3.5" /> Coding Questions
                                        </span>
                                        <span className="font-bold text-white">{company.oaSimulation.coding}</span>
                                    </div>
                                    {company.oaSimulation.debug > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Zap className="w-3.5 h-3.5" /> Debugging Task
                                            </span>
                                            <span className="font-bold text-white">{company.oaSimulation.debug}</span>
                                        </div>
                                    )}
                                    {company.oaSimulation.mcq > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <HelpCircle className="w-3.5 h-3.5" /> Practice MCQs
                                            </span>
                                            <span className="font-bold text-white">{company.oaSimulation.mcq}</span>
                                        </div>
                                    )}
                                </div>
                                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[11px] rounded-xl shadow-[0_8px_30px_rgba(45,212,191,0.2)] gap-2 transition-all hover:scale-[1.02] active:scale-95">
                                    <Play className="w-4 h-4 fill-current" />
                                    Take Mock OA Now
                                </Button>
                            </CardContent>
                        </Card>

                        {/* 5. AI Gap Analysis */}
                        <Card className="bg-[#111111] border-orange-500/20 border-l-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-orange-400">
                                    <AlertCircle className="w-5 h-5" />
                                    AI Gap Analysis
                                </CardTitle>
                                <CardDescription>Why you're not ready for {company.name} yet</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {mockUserData.weakness.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                        {item.type === "negative" ? (
                                            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        )}
                                        <span className={cn(
                                            "text-sm font-medium",
                                            item.type === "negative" ? "text-white" : "text-muted-foreground"
                                        )}>{item.text}</span>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-white mt-4 gap-2 h-auto p-2">
                                    <HelpCircle className="w-4 h-4" />
                                    How to improve these?
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 6. Interview Rounds Roadmap */}
                <div className="mt-12 pt-12 border-t border-white/10 animate-fade-up">
                    <h2 className="text-2xl font-bold mb-10 flex items-center gap-3 justify-center text-white">
                        <ArrowRight className="w-6 h-6 text-primary" />
                        Official {company.name} Interview Roadmap
                    </h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {company.roadmap.map((step, i) => (
                            <div key={step.stage} className="relative group">
                                <div className="glass-card p-6 border border-white/5 hover:border-primary/20 transition-all text-center relative z-10 hover:bg-white/[0.02]">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 font-black text-primary group-hover:scale-110 transition-transform">
                                        {i + 1}
                                    </div>
                                    <h4 className="text-lg font-bold mb-1 uppercase tracking-tight text-white">{step.stage}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>
                                {i < company.roadmap.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 left-[calc(100%-10px)] w-[20px] h-px bg-primary/30 z-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div >
    );
};

export default CompanyDetail;

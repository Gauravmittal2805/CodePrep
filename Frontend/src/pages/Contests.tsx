import { useState, useEffect } from "react";
import {
    Search,
    ChevronRight,
    Trophy as TrophyIcon,
    Flame,
    Zap,
    Building2,
    Sparkles,
    Shield,
    BadgeCheck,
    RefreshCcw,
    Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { cn } from "@/lib/utils";

const Contests = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");

    // Login/Register Modal States (needed for Navbar)
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const fetchContests = async () => {
        setIsLoading(true);
        try {
            const headers: any = {};
            if (user) {
                const token = await user.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch('http://localhost:5001/api/contests', { headers });
            const result = await response.json();
            if (result.success) {
                setContests(result.data);
            }
        } catch (error) {
            console.error("Fetch contests error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContests();
    }, [user]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setSearchParams({ tab: value });
    };

    const filteredContests = contests.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === "all") return true;
        if (activeTab === "ongoing") return c.status === "ONGOING";
        if (activeTab === "upcoming") return c.status === "UPCOMING";
        if (activeTab === "ended") return c.status === "ENDED";
        if (activeTab === "private") return c.visibility === "INVITE_ONLY";

        return true;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col">
            <Navbar
                isLoginOpen={isLoginOpen}
                setIsLoginOpen={setIsLoginOpen}
                isRegisterOpen={isRegisterOpen}
                setIsRegisterOpen={setIsRegisterOpen}
            />

            <main className="flex-1 pt-24 pb-20 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Hero Section */}
                    <div className="relative mb-12 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20">
                        <div className="absolute top-0 right-0 p-12 opacity-10 hidden md:block">
                            <TrophyIcon className="w-64 h-64 text-primary" />
                        </div>

                        <div className="relative z-10 max-w-2xl">
                            <Badge className="mb-4 bg-primary text-black font-black uppercase tracking-widest px-4 py-1">
                                Competitive Programming
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                Showcase Your Skills in <span className="text-primary italic">Live Contests</span>
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                Join regular coding challenges, compete with top developers globally, and earn your spot on the leaderboard. From beginner basics to expert-level company OAs.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-bold uppercase text-white/80">Weekly Challenges</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs font-bold uppercase text-white/80">Premium Prizes</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-bold uppercase text-white/80">Verified Solutions</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full lg:w-auto">
                            <TabsList className="bg-[#111111] border border-white/5 p-1 h-12">
                                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest px-6 h-full">
                                    All Events
                                </TabsTrigger>
                                <TabsTrigger value="ongoing" className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest px-6 h-full">
                                    Live Now
                                </TabsTrigger>
                                <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-500 data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest px-6 h-full">
                                    Scheduled
                                </TabsTrigger>
                                <TabsTrigger value="ended" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest px-6 h-full">
                                    Past
                                </TabsTrigger>
                                <TabsTrigger value="private" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest px-6 h-full">
                                    Invite Only
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 lg:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Find a contest..."
                                    className="h-12 pl-12 bg-[#111111] border-white/5 focus:border-primary/50 transition-all rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchContests}
                                className="h-12 w-12 rounded-xl bg-[#111111] border-white/5 hover:bg-white/5 transition-all"
                            >
                                <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                            </Button>
                        </div>
                    </div>

                    {/* Contests Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-80 rounded-3xl bg-[#111111] animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : filteredContests.length === 0 ? (
                        <div className="py-32 text-center bg-[#111111] rounded-[2.5rem] border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-10 h-10 text-primary opacity-20" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No Contests Found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                We couldn't find any contests matching your filters. Try a different category or search term.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredContests.map((contest) => (
                                <Card
                                    key={contest._id}
                                    className="bg-[#111111] border-border/40 hover:border-primary/40 transition-all duration-300 group rounded-3xl overflow-hidden cursor-pointer flex flex-col h-full"
                                    onClick={() => navigate(`/contest/${contest._id}/arena`)}
                                >
                                    <div className="h-40 relative overflow-hidden bg-gradient-to-br from-primary/10 to-zinc-900">
                                        <div className="absolute top-0 right-0 p-4">
                                            <Badge className={cn(
                                                "font-black uppercase text-[10px] tracking-widest px-3 py-1 border-0 shadow-lg",
                                                contest.status === 'ONGOING' ? "bg-green-500 text-black animate-pulse" :
                                                    contest.status === 'UPCOMING' ? "bg-blue-500 text-black" : "bg-zinc-700 text-white"
                                            )}>
                                                {contest.status}
                                            </Badge>
                                        </div>

                                        <div className="absolute bottom-4 left-4 flex gap-2">
                                            <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/90">
                                                {contest.type}
                                            </Badge>
                                            <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-white/10 text-[9px] font-bold uppercase tracking-widest text-primary">
                                                {contest.difficulty}
                                            </Badge>
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform duration-500">
                                            <TrophyIcon className="w-32 h-32 text-primary" />
                                        </div>
                                    </div>

                                    <CardHeader className="pt-6">
                                        <CardTitle className="text-2xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                            {contest.title}
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground line-clamp-2 min-h-[3rem] mt-2 leading-relaxed">
                                            {contest.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="pt-0 space-y-6 flex-1 flex flex-col justify-between pb-8">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 border-y border-white/[0.05] py-4">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</span>
                                                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                                                        <Clock className="w-4 h-4 text-primary" />
                                                        {contest.duration} Min
                                                    </div>
                                                </div>
                                                <div className="space-y-1 border-l border-white/[0.05] pl-4">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Questions</span>
                                                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                                                        <BadgeCheck className="w-4 h-4 text-primary" />
                                                        {contest.problems?.length || 0} Qs
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Starts at</span>
                                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary">
                                                        <span className="text-[10px] font-black leading-none uppercase">{new Date(contest.startTime).toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-sm font-black">{new Date(contest.startTime).getDate()}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">
                                                            {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-muted-foreground">
                                                            Scheduled Start Time
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between gap-4 mt-auto">
                                            {contest.type === "COMPANY" && contest.companyDetails?.name && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5 grayscale opacity-60">
                                                        <Building2 className="w-full h-full text-white" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">{contest.companyDetails.name}</span>
                                                </div>
                                            )}

                                            <Button
                                                className={cn(
                                                    "flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 transition-all",
                                                    contest.status === 'ONGOING' ? "bg-primary text-black hover:bg-primary/90" :
                                                        "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                                                )}
                                            >
                                                {contest.status === 'ONGOING' ? 'Enter Arena' : 'Set Reminder'}
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Contests;

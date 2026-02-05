import { useState, useEffect } from "react";
import {
    Trophy,
    Medal,
    User,
    Target,
    Zap,
    Search,
    ChevronRight,
    BarChart3,
    Info,
    X,
    CheckCircle2,
    Flame,
    TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/landing/Navbar";
import { cn } from "@/lib/utils";
import { dashboardApi, type LeaderboardEntry } from "@/services/dashboardApi";

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all-time");
    const [searchQuery, setSearchQuery] = useState("");
    const [showInfo, setShowInfo] = useState(false);

    // State for login/register modals (needed by Navbar)
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const data = await dashboardApi.getLeaderboard();
                setLeaderboard(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const filteredLeaderboard = leaderboard.filter(entry =>
        entry.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const topThree = searchQuery === "" ? (filteredLeaderboard.slice(0, 3)) : [];
    const others = searchQuery === "" ? (filteredLeaderboard.slice(3)) : filteredLeaderboard;

    const getPodiumColor = (rank: number) => {
        switch (rank) {
            case 1: return "border-yellow-500/50 from-yellow-500/10 shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)]";
            case 2: return "border-slate-300/50 from-slate-300/10 shadow-[0_0_50px_-12px_rgba(203,213,225,0.2)]";
            case 3: return "border-amber-600/50 from-amber-600/10 shadow-[0_0_50px_-12px_rgba(180,83,9,0.2)]";
            default: return "border-white/5 from-white/5";
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col">
            <Navbar
                isLoginOpen={isLoginOpen}
                setIsLoginOpen={setIsLoginOpen}
                isRegisterOpen={isRegisterOpen}
                setIsRegisterOpen={setIsRegisterOpen}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 mt-12 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                            Performance Leaderboard
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium">Top performers based on consistency and accuracy</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Time Tabs */}
                        <div className="bg-[#111111] p-1 rounded-xl border border-white/5 flex items-center">
                            {["All Time", "Daily", "Weekly", "Monthly"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                        activeTab === tab.toLowerCase().replace(" ", "-")
                                            ? "bg-[#1a1a1a] text-white border border-white/10 shadow-lg"
                                            : "text-muted-foreground hover:text-white"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search & Info */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search coder..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-[#111111] border-white/5 focus-visible:ring-primary/50 rounded-xl"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowInfo(true)}
                                className="bg-[#111111] border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl h-10 w-10 shrink-0"
                            >
                                <Info className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Scoring Details Overlay */}
                {showInfo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 shadow-2xl relative animate-in slide-in-from-right-10 duration-500">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowInfo(false)}
                                className="absolute top-6 right-6 hover:bg-white/10 rounded-full"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </Button>

                            <div className="mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">Global Score Calculation</h2>
                                <p className="text-muted-foreground text-sm">How your ranking points are calculated on CodePrep.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Difficulty */}
                                <div className="group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wide">Difficulty Weighting</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-11">
                                        Points per unique problem solved:
                                        <span className="block mt-1 font-medium text-white/80">
                                            Easy: <span className="text-teal-400">+20</span> •
                                            Medium: <span className="text-teal-400">+50</span> •
                                            Hard: <span className="text-teal-400">+100</span>
                                        </span>
                                    </p>
                                </div>

                                {/* Streak */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                                            <Flame className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wide">Consistency Bonus</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-11">
                                        Earn <span className="text-orange-400 font-bold">+10 points</span> for every day of your current active streak. Missing a day reduces this bonus.
                                    </p>
                                </div>

                                {/* Accuracy */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wide">Accuracy Factor</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-11">
                                        Earn <span className="text-blue-400 font-bold">1 point for every 1%</span> of your lifetime accuracy rate (AC/Total submissions).
                                    </p>
                                </div>

                                {/* Momentum */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wide">Improvement (Momentum)</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-11">
                                        Earn <span className="text-purple-400 font-bold">+15 bonus points</span> for every additional problem solved this week compared to last week.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowInfo(false)}
                                className="w-full mt-10 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-2xl"
                            >
                                Got it, Coach!
                            </Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Top 3 Section - Only show when no search is active */}
                        {searchQuery === "" && topThree.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
                                {/* Rank 2 (Left) */}
                                {topThree[1] && (
                                    <div className="order-2 md:order-1">
                                        <TopCard entry={topThree[1]} rank={topThree[1].rank} colorClass={getPodiumColor(topThree[1].rank)} />
                                    </div>
                                )}

                                {/* Rank 1 (Center) */}
                                {topThree[0] && (
                                    <div className="order-1 md:order-2">
                                        <TopCard entry={topThree[0]} rank={topThree[0].rank} colorClass={getPodiumColor(topThree[0].rank)} isLarge />
                                    </div>
                                )}

                                {/* Rank 3 (Right) */}
                                {topThree[2] && (
                                    <div className="order-3 md:order-3">
                                        <TopCard entry={topThree[2]} rank={topThree[2].rank} colorClass={getPodiumColor(topThree[2].rank)} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* List Section */}
                        <Card className="bg-[#111111] border-white/5 overflow-hidden rounded-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.01]">
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Coder Name</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Problems Solved</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Activity</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {others.length > 0 ? (
                                            others.map((entry) => (
                                                <tr key={entry.uid} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-mono font-bold text-muted-foreground/60 w-6">{entry.rank}</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                <div className="relative w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-secondary flex items-center justify-center">
                                                                    {entry.photoURL ? (
                                                                        <img src={entry.photoURL} alt={entry.fullName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User className="w-5 h-5 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{entry.fullName}</p>
                                                                <p className="text-[10px] text-muted-foreground font-mono">CODEPREP_ID: {entry.uid.slice(-6).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-white">{entry.problemsSolved}</span>
                                                            <span className="text-[10px] text-muted-foreground">solved</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Target className="w-3.5 h-3.5 text-green-400/60" />
                                                            <span className="text-sm font-bold text-green-400">{entry.accuracy}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-white">{entry.totalSubmissions}</span>
                                                            <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">Submissions</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 w-fit">
                                                            <Zap className="w-3.5 h-3.5 text-primary fill-primary/20" />
                                                            <span className="text-sm font-black text-primary font-mono">{entry.score.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white">
                                                                <ChevronRight className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground text-sm">
                                                    No results found for "{searchQuery}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </>
                )}
            </main>
        </div>
    );
};

const TopCard = ({ entry, colorClass, isLarge = false }: { entry: LeaderboardEntry, rank: number, colorClass: string, isLarge?: boolean }) => {
    return (
        <Card className={cn(
            "relative border-2 bg-gradient-to-b overflow-hidden group transition-all duration-500",
            colorClass,
            isLarge ? "scale-105 z-10" : "hover:scale-102"
        )}>
            {/* Background Icon Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-700">
                {entry.rank === 1 ? <Trophy className="w-32 h-32" /> : <Medal className="w-28 h-28" />}
            </div>

            <CardContent className={cn("p-4 flex flex-col items-center text-center", isLarge ? "pt-10 pb-6" : "pt-8 pb-5")}>
                {/* Ranking Emblem */}
                <div className={cn(
                    "absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 border-white/10 shadow-lg",
                    entry.rank === 1 ? "bg-yellow-500 text-black" : entry.rank === 2 ? "bg-slate-300 text-black border-slate-200/50" : "bg-amber-600 text-white border-amber-500/50"
                )}>
                    #{entry.rank}
                </div>

                {/* Avatar Section */}
                <div className="relative mb-4">
                    <div className={cn(
                        "absolute -inset-2 rounded-full blur-md opacity-30 animate-pulse",
                        entry.rank === 1 ? "bg-yellow-500" : entry.rank === 2 ? "bg-slate-200" : "bg-amber-600"
                    )} />
                    <div className={cn(
                        "relative rounded-full border-4 border-[#111111] overflow-hidden bg-zinc-900 shadow-2xl transition-transform duration-500 group-hover:scale-105",
                        isLarge ? "w-20 h-20" : "w-16 h-16"
                    )}>
                        {entry.photoURL ? (
                            <img src={entry.photoURL} alt={entry.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Name & ID */}
                <div className="mb-4">
                    <h3 className={cn("font-black tracking-tight text-white mb-0.5 uppercase bg-gradient-to-b from-white to-white/60 bg-clip-text", isLarge ? "text-xl" : "text-lg")}>
                        {entry.fullName}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-mono tracking-widest bg-white/5 py-0.5 px-2 rounded-full w-fit mx-auto">
                        @{entry.fullName.toLowerCase().replace(/\s+/g, '_')}
                    </p>
                </div>

                {/* Score Panel */}
                <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 mb-4 backdrop-blur-sm group-hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Pts</span>
                        <Zap className="w-3 h-3 text-primary fill-primary/20" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={cn("font-black text-white", isLarge ? "text-2xl" : "text-xl")}>{entry.score.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-primary">XP</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center group-hover:bg-white/[0.04] transition-colors">
                        <Target className="w-4 h-4 text-green-400 mb-1.5 opacity-80" />
                        <span className="text-sm font-black text-white">{entry.accuracy}%</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest pt-0.5">Accuracy</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center group-hover:bg-white/[0.04] transition-colors">
                        <BarChart3 className="w-4 h-4 text-primary mb-1.5 opacity-80" />
                        <span className="text-sm font-black text-white">{entry.problemsSolved}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest pt-0.5">Solved</span>
                    </div>
                </div>

                {/* Profile Link */}
                <div className="flex justify-center mt-6 w-full">
                    <Button className="w-32 bg-white text-black hover:bg-[#eeeeee] font-black rounded-lg text-[9px] h-8 px-3 uppercase tracking-widest shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] transition-all">
                        View Stats
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Leaderboard;

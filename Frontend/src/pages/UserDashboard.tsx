import React, { useState, useEffect } from "react";
import {
    CheckCircle2,
    Code2,
    Trophy,
    User,
    Zap,
    Briefcase,
    Video,
    Rocket,
    Star,
    MapPin,
    Mail,
    Calendar,
    Github,
    Linkedin,
    Globe,
    ChevronRight,
    ChevronLeft,
    Terminal,
    Target,
    Gauge,
    Flame,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Building2,
    Info,
    RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { dashboardApi, type ContributionMonth, type RecentSubmission, type AcceptedSubmission, type TopicProgress, type WeakArea } from "@/services/dashboardApi";
import UserMockOAList from "@/components/dashboard/UserMockOAList";

const UserDashboard = () => {
    const { user } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    // State for dashboard data
    const [stats, setStats] = useState([
        { label: "Problems Solved", value: "0", weeklyChange: "+0", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Current Streak", value: "0 Days", weeklyChange: "+0", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Global Rank", value: "#0", weeklyChange: "+0", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
    ]);

    const [contributionData, setContributionData] = useState<ContributionMonth[]>([]);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [totalAccepted, setTotalAccepted] = useState(0);
    const [difficultyBreakdown, setDifficultyBreakdown] = useState({ Easy: 0, Medium: 0, Hard: 0 });
    const [currentStreak, setCurrentStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [improvementRate, setImprovementRate] = useState(0);
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
    const [acceptedSubmissions, setAcceptedSubmissions] = useState<AcceptedSubmission[]>([]);
    const [recentPage, setRecentPage] = useState(0);
    const [acceptedPage, setAcceptedPage] = useState(0);
    const itemsPerPage = 4;

    // DSA Mastery state
    const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
    const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
    const [dsaMasteryLoading, setDsaMasteryLoading] = useState(true);
    const [isWeakFlipped, setIsWeakFlipped] = useState(false);
    const [weakPage, setWeakPage] = useState(0);
    const itemsPerWeakPage = 4;

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            try {
                // Fetch all data in parallel
                const [statsData, contributionsData, recentData, acceptedData] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getContributions(),
                    dashboardApi.getRecentSubmissions(),
                    dashboardApi.getAcceptedSubmissions(),
                ]);

                // Update stats
                setStats([
                    {
                        label: "Problems Solved",
                        value: (statsData?.problemsSolved || 0).toString(),
                        weeklyChange: statsData?.weeklyChange || "+0",
                        icon: CheckCircle2,
                        color: "text-green-500",
                        bg: "bg-green-500/10"
                    },
                    {
                        label: "Current Streak",
                        value: `${statsData?.currentStreak || 0} Days`,
                        weeklyChange: statsData?.streakChange || "+0",
                        icon: Zap,
                        color: "text-amber-500",
                        bg: "bg-amber-500/10"
                    },
                    {
                        label: "Global Rank",
                        value: statsData?.globalRank || "#0",
                        weeklyChange: statsData?.rankChange || "+0",
                        icon: Trophy,
                        color: "text-primary",
                        bg: "bg-primary/10"
                    },
                ]);

                // Update contributions
                setContributionData(contributionsData?.contributionData || []);
                setTotalSubmissions(statsData?.totalSubmissions || contributionsData?.totalSubmissions || 0);
                setTotalAccepted(statsData?.totalAccepted || 0);
                setCurrentStreak(statsData?.currentStreak || 0);
                setMaxStreak(statsData?.maxStreak || 0);
                setImprovementRate(statsData?.improvementRate || 0);
                if (statsData?.difficultyBreakdown) {
                    setDifficultyBreakdown(statsData.difficultyBreakdown);
                }

                // Update submissions
                setRecentSubmissions(Array.isArray(recentData) ? recentData : []);
                setAcceptedSubmissions(Array.isArray(acceptedData) ? acceptedData : []);

                // Fetch DSA Mastery data
                try {
                    const dsaData = await dashboardApi.getDSAMastery();
                    setTopicProgress(dsaData.topicProgress || []);
                    setWeakAreas(dsaData.weakAreas || []);
                } catch (dsaError) {
                    console.error('Error fetching DSA mastery data:', dsaError);
                } finally {
                    setDsaMasteryLoading(false);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);

                // Set empty contribution data as fallback
                const monthsNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const currentYear = new Date().getFullYear();
                const emptyContributionData = monthsNames.map((month, index) => {
                    const daysInMonth = new Date(currentYear, index + 1, 0).getDate();
                    return {
                        name: month,
                        days: Array.from({ length: daysInMonth }, () => 0)
                    };
                });
                setContributionData(emptyContributionData);
            }
        };

        fetchDashboardData();
    }, [user]);

    const getContributionColor = (level: number) => {
        switch (level) {
            case 0: return "bg-[#1f1f1f]";
            case 1: return "bg-blue-900/60";
            case 2: return "bg-blue-700/80";
            case 3: return "bg-blue-500";
            case 4: return "bg-blue-400";
            default: return "bg-[#1f1f1f]";
        }
    };

    const navItems = [
        { label: "Current Level", icon: Star, color: "text-yellow-400", id: "level" },
        { label: "DSA Mastery", icon: Code2, color: "text-blue-400", id: "dsa" },
        { label: "Company OA", icon: Briefcase, color: "text-purple-400", id: "company" },
        { label: "Mock Interviews", icon: Video, color: "text-pink-400", id: "interviews" },
        { label: "Placement Ready", icon: Rocket, color: "text-orange-400", id: "placement" },
    ];

    const [activeNavItem, setActiveNavItem] = useState<string | null>("level");

    const handleNavClick = (id: string) => {
        setActiveNavItem(activeNavItem === id ? null : id);
    };

    const renderNavContent = () => {
        if (!activeNavItem) return null;

        const contentMap: Record<string, React.ReactNode> = {
            level: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT SIDE: Performance Insights */}
                    <Card className="bg-[#111111] border-border/40 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                                Performance Insights
                            </CardTitle>
                            <CardDescription>Comprehensive analysis of your coding journey</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            {/* Overall Level Display */}
                            <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-yellow-400/[0.03] to-transparent rounded-2xl border border-yellow-400/10">
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="7" fill="transparent" className="text-white/5" />
                                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="7" fill="transparent" strokeDasharray={314.15} strokeDashoffset={314.15 * (1 - (totalSubmissions > 0 ? (totalAccepted / totalSubmissions) * 100 : 0) / 100)} className="text-yellow-400 transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-white">{totalSubmissions > 0 ? Math.round((totalAccepted / totalSubmissions) * 100) : 0}</span>
                                        <span className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest">Accuracy</span>
                                    </div>
                                </div>
                                <div className="mt-3 text-center">
                                    <h4 className="text-lg font-bold text-white">
                                        {totalSubmissions > 0 && (totalAccepted / totalSubmissions) * 100 > 70 ? "Sharp Shooter" :
                                            totalSubmissions > 0 && (totalAccepted / totalSubmissions) * 100 > 40 ? "Steady Coder" : "Novice"}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground">{totalAccepted} Accepted / {totalSubmissions} Total</p>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    {
                                        label: "Accuracy",
                                        value: `${totalSubmissions > 0 ? Math.round((totalAccepted / totalSubmissions) * 100) : 0}%`,
                                        icon: Target,
                                        color: "text-green-400",
                                        bg: "bg-green-400/10"
                                    },
                                    {
                                        label: "Improvement",
                                        value: `${improvementRate > 0 ? '+' : ''}${improvementRate}%`,
                                        icon: improvementRate >= 0 ? TrendingUp : TrendingDown,
                                        color: improvementRate >= 0 ? "text-blue-400" : "text-rose-400",
                                        bg: improvementRate >= 0 ? "bg-blue-400/10" : "bg-rose-400/10"
                                    },
                                    {
                                        label: "Consistency",
                                        value: `${currentStreak} Days`,
                                        icon: Flame,
                                        color: "text-orange-400",
                                        bg: "bg-orange-400/10"
                                    },
                                    {
                                        label: "Difficulty",
                                        value: `${difficultyBreakdown.Easy}:${difficultyBreakdown.Medium}:${difficultyBreakdown.Hard}`,
                                        icon: Gauge,
                                        color: "text-purple-400",
                                        bg: "bg-purple-400/10"
                                    }
                                ].map((metric, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                                        <div className={cn("p-1.5 rounded-lg w-fit mb-2", metric.bg)}>
                                            <metric.icon className={cn("w-3.5 h-3.5", metric.color)} />
                                        </div>
                                        <h5 className="text-[10px] font-medium text-muted-foreground mb-0.5">{metric.label}</h5>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">{metric.value}</span>
                                            {metric.label === "Consistency" && (
                                                <span className="text-[9px] text-muted-foreground">Max: {maxStreak} days</span>
                                            )}
                                            {metric.label === "Improvement" && (
                                                <span className={cn("text-[9px] font-medium", improvementRate >= 0 ? "text-blue-400" : "text-rose-400")}>
                                                    {improvementRate >= 0 ? "📈 Improving" : "📉 Needs focus"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT SIDE: Recent Trophies */}
                    <Card className="bg-[#111111] border-border/40 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Trophy className="w-5 h-5 text-primary fill-primary/20" />
                                Recent Trophies
                            </CardTitle>
                            <CardDescription>Achievements unlocked recently</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-12 pb-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                                <Trophy className="w-8 h-8 text-muted-foreground/20" />
                            </div>
                            <h5 className="font-bold text-white mb-1">No trophies yet</h5>
                            <p className="text-xs text-muted-foreground max-w-[200px]">Keep solving problems to unlock exclusive achievements and trophies!</p>
                        </CardContent>
                    </Card>
                </div>
            ),
            dsa: (
                <div className="space-y-6">
                    {/* 1️⃣ Topic-wise Progress + Accuracy (CORE) */}
                    <Card className="bg-[#111111] border-border/40 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Code2 className="w-5 h-5 text-blue-400" />
                                        Topic-wise DSA Mastery
                                    </CardTitle>
                                    <CardDescription>Track your progress across all DSA topics</CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-400">{totalAccepted}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Problems Solved</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {dsaMasteryLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                                </div>
                            ) : topicProgress.length > 0 ? (
                                <div className="space-y-6 pt-8">
                                    {/* Bar Graph */}
                                    <div className="relative h-64 flex items-end justify-between gap-2 px-4 pb-12 pt-4 bg-gradient-to-b from-blue-500/5 to-transparent rounded-xl">
                                        {/* Y-axis labels */}
                                        <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-[10px] font-bold text-blue-400/60">
                                            <span>100</span>
                                            <span>75</span>
                                            <span>50</span>
                                            <span>25</span>
                                            <span>0</span>
                                        </div>

                                        {/* Grid lines */}
                                        <div className="absolute left-8 right-0 top-0 bottom-12 flex flex-col justify-between pointer-events-none">
                                            {[0, 1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-full h-px bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-transparent" />
                                            ))}
                                        </div>

                                        {/* Bars */}
                                        {topicProgress.slice(0, 10).map((item, i) => {
                                            const progress = item.total > 0 ? (item.solved / item.total) * 100 : 0;
                                            const maxHeight = 200;
                                            const barHeight = (progress / 100) * maxHeight;
                                            const isWeak = weakAreas.some(wa => wa.topic === item.topic) || item.accuracy < 50;

                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center group relative min-w-0">
                                                    {/* Tooltip */}
                                                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 scale-95 group-hover:scale-100">
                                                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400/30 rounded-xl px-4 py-3 text-xs whitespace-nowrap shadow-2xl shadow-blue-500/20">
                                                            <div className="font-bold text-white mb-2 text-sm">{item.topic}</div>
                                                            <div className="text-blue-100 space-y-1">
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-blue-200">Solved:</span>
                                                                    <span className="font-bold text-white">{item.solved}/{item.total}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-blue-200">Accuracy:</span>
                                                                    <span className="font-bold text-white">{item.accuracy}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Accuracy badge */}
                                                    <div className="absolute -top-6 text-[10px] font-black px-2 py-1 rounded-full shadow-lg text-blue-400 bg-blue-500/20 border border-blue-400/30 shadow-blue-500/20">
                                                        {item.accuracy}%
                                                    </div>

                                                    {/* Bar */}
                                                    <div
                                                        className="w-[40%] rounded-t-xl transition-all duration-1000 ease-out relative overflow-hidden group-hover:scale-105 shadow-lg bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-blue-500/50"
                                                        style={{
                                                            height: `${barHeight}px`,
                                                            transitionDelay: `${i * 50}ms`,
                                                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)'
                                                        }}
                                                    >
                                                        {/* Animated glow effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                        {/* Shimmer effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                                        {/* Solved count inside bar */}
                                                        {barHeight > 30 && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-white font-black text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                                                    {item.solved}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Bottom glow */}
                                                        <div className={cn(
                                                            "absolute bottom-0 left-0 right-0 h-1",
                                                            isWeak ? "bg-amber-300" : "bg-cyan-300"
                                                        )} />
                                                    </div>

                                                    {/* Topic label */}
                                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full">
                                                        <div className="text-[9px] text-center text-blue-300/60 font-bold truncate px-1 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                                                            {item.topic}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center justify-center gap-8 pt-4 border-t border-blue-500/10">
                                        <div className="flex items-center gap-2 group cursor-pointer">
                                            <div className="w-4 h-4 rounded-md bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow" />
                                            <span className="text-xs font-semibold text-blue-300 group-hover:text-blue-200 transition-colors">DSA Topics Progress</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-sm">No topic data available yet</p>
                                    <p className="text-xs mt-1">Start solving problems to see your progress!</p>
                                </div>
                            )}
                        </CardContent>

                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 2️⃣ Weak Areas Detector (VERY IMPRESSIVE) */}
                        <div className="relative h-[480px] w-full [perspective:1000px] group/flip">
                            <div className={cn(
                                "relative w-full h-full transition-all duration-700 [transform-style:preserve-3d]",
                                isWeakFlipped && "[transform:rotateY(180deg)]"
                            )}>
                                {/* FRONT SIDE */}
                                <Card className="absolute inset-0 backface-hidden bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20 overflow-hidden [backface-visibility:hidden]">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-2xl rounded-full -mr-12 -mt-12" />
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <AlertTriangle className="w-5 h-5 text-orange-400" />
                                                <span className="text-orange-400">Weak Areas Detector</span>
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-orange-400 hover:bg-orange-400/10"
                                                onClick={() => setIsWeakFlipped(true)}
                                            >
                                                <Info className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <CardDescription>AI-identified topics that need attention</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {dsaMasteryLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                                            </div>
                                        ) : weakAreas.length > 0 ? (
                                            <>
                                                <div className="space-y-3 h-[280px] overflow-hidden pr-1">
                                                    {weakAreas.slice(weakPage * itemsPerWeakPage, (weakPage + 1) * itemsPerWeakPage).map((item, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-orange-500/10 hover:border-orange-500/30 transition-colors animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h5 className="font-bold text-sm text-white">{item.topic}</h5>
                                                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                                                    <span className="text-xs text-orange-400">{item.subtopic}</span>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    {item.reason}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Pagination Controls */}
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                        Page {weakPage + 1} of {Math.ceil(weakAreas.length / itemsPerWeakPage)}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30"
                                                            onClick={() => setWeakPage(prev => Math.max(0, prev - 1))}
                                                            disabled={weakPage === 0}
                                                        >
                                                            <ChevronLeft className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30"
                                                            onClick={() => setWeakPage(prev => Math.min(Math.ceil(weakAreas.length / itemsPerWeakPage) - 1, prev + 1))}
                                                            disabled={weakPage >= Math.ceil(weakAreas.length / itemsPerWeakPage) - 1}
                                                        >
                                                            <ChevronRight className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p className="text-sm">No weak areas detected! 🎉</p>
                                                <p className="text-xs mt-1">Keep up the great work!</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* BACK SIDE (INFO) */}
                                <Card className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/20 overflow-hidden">
                                    <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full -ml-12 -mt-12" />
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Info className="w-5 h-5 text-blue-400" />
                                                <span className="text-blue-400">Detection Logic</span>
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-blue-400 hover:bg-blue-400/10"
                                                onClick={() => setIsWeakFlipped(false)}
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <CardDescription>How we identify your weaknesses</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-4">
                                        <div className="space-y-4">
                                            <div className="p-3 rounded-lg bg-black/20 border border-blue-400/10">
                                                <h5 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-blue-400" />
                                                    Accuracy Threshold
                                                </h5>
                                                <p className="text-xs text-muted-foreground">
                                                    Topics with less than <span className="text-blue-400 font-bold">50% accuracy</span> are automatically flagged as weak areas.
                                                </p>
                                            </div>

                                            <div className="p-3 rounded-lg bg-black/20 border border-purple-400/10">
                                                <h5 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-purple-400" />
                                                    Attempt Frequency
                                                </h5>
                                                <p className="text-xs text-muted-foreground">
                                                    High failure rates (WAs, TLEs) in the last 10 submissions for a specific topic.
                                                </p>
                                            </div>

                                            <div className="p-3 rounded-lg bg-black/20 border border-orange-400/10">
                                                <h5 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                                                    Consistency Gaps
                                                </h5>
                                                <p className="text-xs text-muted-foreground">
                                                    Topics you haven't practiced in over 15 days despite having low initial scores.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-[10px] text-center text-muted-foreground italic">
                                                "Practice makes perfect. Focus on these to improve your overall rating."
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* 3️⃣ Difficulty Balance (Interview Oriented) */}
                        <Card className="bg-[#111111] border-border/40 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full -mr-12 -mt-12" />
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <BarChart3 className="w-5 h-5 text-purple-400" />
                                    Difficulty Balance
                                </CardTitle>
                                <CardDescription>Interview-ready difficulty distribution</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Difficulty Breakdown */}
                                <div className="space-y-4">
                                    {[
                                        { level: "Easy", count: difficultyBreakdown.Easy, color: "text-green-400", bg: "bg-green-400", percentage: 45, target: 40 },
                                        { level: "Medium", count: difficultyBreakdown.Medium, color: "text-amber-400", bg: "bg-amber-400", percentage: 40, target: 45 },
                                        { level: "Hard", count: difficultyBreakdown.Hard, color: "text-red-400", bg: "bg-red-400", percentage: 15, target: 15 },
                                    ].map((item, i) => {
                                        const total = difficultyBreakdown.Easy + difficultyBreakdown.Medium + difficultyBreakdown.Hard;
                                        const actualPercentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

                                        return (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", item.bg)} />
                                                        <span className="text-sm font-medium text-white">{item.level}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn("text-sm font-bold", item.color)}>
                                                            {actualPercentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className={cn("h-full transition-all duration-1000", item.bg)}
                                                        style={{ width: `${actualPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Status Message */}
                                <div className={cn(
                                    "p-4 rounded-xl border text-center",
                                    difficultyBreakdown.Hard >= 10 ? "bg-green-500/10 border-green-500/20" : "bg-orange-500/10 border-orange-500/20"
                                )}>
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        {difficultyBreakdown.Hard >= 10 ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                                        )}
                                        <span className={cn(
                                            "text-sm font-bold",
                                            difficultyBreakdown.Hard >= 10 ? "text-green-400" : "text-orange-400"
                                        )}>
                                            {difficultyBreakdown.Hard >= 10 ? "✅ Interview-ready difficulty mix" : "⚠️ Hard problems under-practiced"}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {difficultyBreakdown.Hard >= 10
                                            ? "Your difficulty distribution matches interview patterns"
                                            : "Focus on solving more Hard problems to match interview standards"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 4️⃣ Company-aligned DSA Readiness (🔥 GAME CHANGER) */}
                    <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full -mr-20 -mt-20" />
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                                            Company-Aligned DSA Readiness
                                        </span>
                                    </CardTitle>
                                    <CardDescription>See how ready you are for top tech companies</CardDescription>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">🔥 Game Changer</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="min-h-[200px] flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                                <Briefcase className="w-8 h-8 text-primary/20" />
                            </div>
                            <h5 className="text-white font-bold mb-1">Coming Soon</h5>
                            <p className="text-xs text-muted-foreground max-w-[250px]">
                                We are currently calibrating readiness metrics for top tech companies. Check back soon for your personalized roadmaps!
                            </p>
                        </CardContent>
                    </Card>
                </div>
            ),
            company: (
                <UserMockOAList />
            ),
            interviews: (
                <Card className="bg-[#111111] border-border/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-pink-400" />
                            Mock Interviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-4">Practice with AI-powered mock interviews</p>
                            {[
                                { type: "Technical Round", duration: "45 min", difficulty: "Medium" },
                                { type: "System Design", duration: "60 min", difficulty: "Hard" },
                                { type: "Behavioral", duration: "30 min", difficulty: "Easy" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-pink-400/30 transition-colors">
                                    <div>
                                        <p className="font-medium">{item.type}</p>
                                        <p className="text-xs text-muted-foreground">{item.duration}</p>
                                    </div>
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded-full",
                                        item.difficulty === "Easy" ? "bg-green-500/10 text-green-500" :
                                            item.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" :
                                                "bg-red-500/10 text-red-500"
                                    )}>{item.difficulty}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ),
            placement: (
                <Card className="bg-[#111111] border-border/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-orange-400" />
                            Placement Ready
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-primary/10 border border-orange-500/20">
                                <h4 className="font-bold text-lg mb-2">Overall Readiness</h4>
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl font-bold text-orange-400">72%</div>
                                    <p className="text-sm text-muted-foreground">You're on the right track! Keep practicing to improve your placement readiness.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "DSA Skills", score: 85 },
                                    { label: "System Design", score: 60 },
                                    { label: "Communication", score: 75 },
                                    { label: "Projects", score: 70 },
                                ].map((item, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-black/20 border border-white/5">
                                        <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                                        <p className="text-xl font-bold text-orange-400">{item.score}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ),
        };

        return contentMap[activeNavItem] || null;
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: Profile Section (3 columns wide on large screens) */}
                    <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-20 lg:self-start">
                        <Card className="bg-[#111111] border-border/40 h-full">
                            <CardHeader className="flex flex-col items-center text-center pb-2">
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-50"></div>
                                    <div className="relative w-full h-full rounded-full border-4 border-[#111111] overflow-hidden bg-secondary">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-muted-foreground m-auto mt-8" />
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#111111]" title="Online"></div>
                                </div>
                                <CardTitle className="text-2xl font-bold">{user?.displayName || "Coding Enthusiast"}</CardTitle>
                                <CardDescription className="text-muted-foreground">Full Stack Developer</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span>{user?.email || "user@example.com"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>San Francisco, CA</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Joined January 2024</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h4 className="text-sm font-semibold text-foreground/80">Bio</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Passionate about solving complex problems and building scalable web applications. Currently focusing on Mastering DSA and System Design.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex gap-2 justify-center">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/10">
                                        <Github className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/10">
                                        <Linkedin className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/10">
                                        <Globe className="w-5 h-5" />
                                    </Button>
                                </div>

                                <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 mt-4">
                                    View Profile
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Stats & Nav (9 columns wide) */}
                    <div className="lg:col-span-9 space-y-6 flex flex-col h-full">

                        {/* TOP SECTION: Stats & Contribution Chart */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Stats Cards */}
                            {stats.map((stat, i) => (
                                <Card key={i} className="bg-[#111111] border-border/40 overflow-hidden relative group">
                                    <CardContent className="p-6 flex items-center justify-between z-10 relative">
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                                                <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                                                    {stat.weeklyChange}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cn("p-3 rounded-xl", stat.bg)}>
                                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                                        </div>
                                    </CardContent>
                                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500", stat.color.replace("text-", "bg-"))} />
                                </Card>
                            ))}
                        </div>

                        {/* Yearly Consistency Chart (Green Chart) */}
                        <Card className="bg-[#111111] border-border/40 flex-1 min-h-[300px]">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">Yearly Consistency</CardTitle>
                                        <CardDescription>{totalSubmissions.toLocaleString()} submissions in the last year</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="flex w-3 h-3 bg-[#1f1f1f] rounded-sm"></span> Less
                                        <span className="flex w-3 h-3 bg-blue-500 rounded-sm"></span> More
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-nowrap justify-between gap-2 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {contributionData.map((month, mIndex) => (
                                        <div key={mIndex} className="space-y-1.5">
                                            <span className="text-[10px] font-semibold text-muted-foreground pl-0.5 block mb-1">{month.name}</span>
                                            <div className="grid grid-rows-7 grid-flow-col gap-0.5">
                                                {month.days.map((level, dIndex) => (
                                                    <div
                                                        key={dIndex}
                                                        className={cn("w-2.5 h-2.5 rounded-[2px] transition-colors hover:border hover:border-white/50", getContributionColor(level))}
                                                        title={`${month.name} ${dIndex + 1}: ${level === 0 ? 'No' : 'Multiple'} submissions`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent & Accepted Submissions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recent Submissions */}
                            <Card className="bg-[#111111] border-border/40 flex flex-col">
                                <CardHeader className="pb-3 border-b border-white/5">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Terminal className="w-5 h-5 text-blue-500" />
                                        Recent Submissions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 flex-1">
                                    <div className="space-y-4 min-h-[220px]">
                                        {recentSubmissions.slice(recentPage * itemsPerPage, (recentPage + 1) * itemsPerPage).map((sub, i) => (
                                            <div key={i} className="flex items-center justify-between group">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-sm group-hover:text-primary transition-colors cursor-pointer">{sub.problem}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{sub.language}</span>
                                                        <span>•</span>
                                                        <span>{sub.time}</span>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                                    (sub.status === "Accepted" || sub.status === "AC")
                                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}>
                                                    {sub.status === "AC" ? "Accepted" : sub.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 bg-transparent border-white/10 hover:bg-white/5 disabled:opacity-30"
                                                onClick={() => setRecentPage(p => Math.max(0, p - 1))}
                                                disabled={recentPage === 0}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 bg-transparent border-white/10 hover:bg-white/5 disabled:opacity-30"
                                                onClick={() => setRecentPage(p => Math.min(Math.ceil(recentSubmissions.length / itemsPerPage) - 1, p + 1))}
                                                disabled={recentPage >= Math.ceil(recentSubmissions.length / itemsPerPage) - 1}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="text-xs text-muted-foreground min-w-[70px] text-right">
                                            Page {recentPage + 1} of {Math.ceil(recentSubmissions.length / itemsPerPage) || 1}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Latest Accepted */}
                            <Card className="bg-[#111111] border-border/40 flex flex-col">
                                <CardHeader className="pb-3 border-b border-white/5">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Latest Accepted
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 flex-1">
                                    <div className="space-y-4 min-h-[220px]">
                                        {acceptedSubmissions.slice(acceptedPage * itemsPerPage, (acceptedPage + 1) * itemsPerPage).map((sub, i) => (
                                            <div key={i} className="flex items-center justify-between group">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-sm group-hover:text-primary transition-colors cursor-pointer">{sub.problem}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className={cn(
                                                            sub.difficulty === "Easy" ? "text-green-500" :
                                                                sub.difficulty === "Medium" ? "text-amber-500" : "text-red-500"
                                                        )}>{sub.difficulty}</span>
                                                        <span>•</span>
                                                        <span>{sub.time}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                                        Accepted
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 bg-transparent border-white/10 hover:bg-white/5 disabled:opacity-30"
                                                onClick={() => setAcceptedPage(p => Math.max(0, p - 1))}
                                                disabled={acceptedPage === 0}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 bg-transparent border-white/10 hover:bg-white/5 disabled:opacity-30"
                                                onClick={() => setAcceptedPage(p => Math.min(Math.ceil(acceptedSubmissions.length / itemsPerPage) - 1, p + 1))}
                                                disabled={acceptedPage >= Math.ceil(acceptedSubmissions.length / itemsPerPage) - 1}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="text-xs text-muted-foreground min-w-[70px] text-right">
                                            Page {acceptedPage + 1} of {Math.ceil(acceptedSubmissions.length / itemsPerPage) || 1}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* BOTTOM SECTION: Navigation Bar */}
                        <nav className="bg-[#111111] border border-border/40 rounded-xl p-2 mt-auto">
                            <div className="flex items-center justify-around gap-2">
                                {navItems.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleNavClick(item.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all group flex-1",
                                            activeNavItem === item.id ? "bg-[#1a1a1a] border border-primary/30" : "hover:bg-[#1a1a1a]"
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-full bg-black/40 border border-white/5 group-hover:scale-110 transition-transform duration-300", item.color)}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className={cn(
                                            "font-medium text-xs transition-colors",
                                            activeNavItem === item.id ? "text-primary" : "group-hover:text-primary"
                                        )}>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </nav>

                        {/* Expandable Content Section */}
                        {activeNavItem && (
                            <div className="animate-in slide-in-from-top-4 duration-300">
                                {renderNavContent()}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;


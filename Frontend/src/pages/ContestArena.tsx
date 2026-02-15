import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Trophy,
    Clock,
    ChevronRight,
    BookOpen,
    ShieldAlert,
    Timer,
    CheckCircle2,
    Lock,
    ArrowLeft,
    Gamepad2,
    RefreshCcw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ContestArena = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [contest, setContest] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [progress, setProgress] = useState(0);

    const fetchData = async () => {
        if (!contestId || !user) return;

        try {
            const token = await user.getIdToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Contest
            const contestRes = await fetch(`http://localhost:5001/api/contests/${contestId}`, { headers });
            const contestData = await contestRes.json();

            if (contestData.success) {
                setContest(contestData.data);
            }

            // Fetch Leaderboard
            const lbRes = await fetch(`http://localhost:5001/api/contests/${contestId}/leaderboard`, { headers });
            const lbData = await lbRes.json();

            if (lbData.success) {
                setLeaderboard(lbData.data);
            }
        } catch (error) {
            console.error("Error fetching arena data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [contestId, user]);

    useEffect(() => {
        if (!contest) return;

        const updateTimer = () => {
            const now = new Date();
            const start = new Date(contest.startTime);
            const end = new Date(start.getTime() + (contest.duration || 0) * 60000);

            if (now < start) {
                setTimeLeft("Not Started");
                setProgress(0);
            } else if (now > end) {
                setTimeLeft("Ended");
                setProgress(100);
            } else {
                const diff = end.getTime() - now.getTime();
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes}m ${seconds}s`);

                const total = (contest.duration || 1) * 60000;
                const elapsed = now.getTime() - start.getTime();
                setProgress(Math.min(100, (elapsed / total) * 100));
            }
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(timer);
    }, [contest]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4 opacity-50" />
                <h1 className="text-2xl font-bold mb-2">Contest Not Found</h1>
                <p className="text-muted-foreground mb-6">This contest may have been deleted or is not accessible.</p>
                <Button onClick={() => navigate('/contest')}>Back to Contests</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col">
            {/* Header / Top Bar */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 py-3 px-6">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-white/5"
                            onClick={() => navigate('/contest')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-white">{contest.title}</h1>
                                <Badge className="bg-primary/20 text-primary border-0 text-[10px] uppercase font-black">
                                    {contest.status}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Contest Arena</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-primary">
                                <Timer className="w-4 h-4 animate-pulse" />
                                <span className="text-lg font-black font-mono">{timeLeft}</span>
                            </div>
                            <Progress value={progress} className="w-32 h-1 bg-white/5" indicatorClassName="bg-primary" />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                            onClick={fetchData}
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 p-6 md:p-8">
                <div className="container mx-auto max-w-7xl">
                    <Tabs defaultValue="questions" className="space-y-8">
                        <div className="flex items-center justify-center">
                            <TabsList className="bg-[#111111] border border-white/5 p-1 h-12 rounded-2xl w-full max-w-md">
                                <TabsTrigger value="questions" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all h-full">
                                    <BookOpen className="w-3.5 h-3.5 mr-2" />
                                    Problems
                                </TabsTrigger>
                                <TabsTrigger value="leaderboard" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all h-full">
                                    <Trophy className="w-3.5 h-3.5 mr-2" />
                                    Rankings
                                </TabsTrigger>
                                <TabsTrigger value="rules" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all h-full">
                                    <Lock className="w-3.5 h-3.5 mr-2" />
                                    Rules
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Questions Tab */}
                        <TabsContent value="questions" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    {contest.problems?.map((prob: any, idx: number) => {
                                        const userStats = leaderboard.find(entry => entry.uid === user?.uid);
                                        const solvedProblemIds = userStats ? userStats.solvedProblems : [];
                                        const isSolved = solvedProblemIds.includes(prob.problemId);

                                        return (
                                            <Card
                                                key={prob.problemId}
                                                className={cn(
                                                    "bg-[#111111] border-white/5 hover:border-primary/40 transition-all group cursor-pointer overflow-hidden rounded-3xl",
                                                    isSolved && "border-green-500/20 bg-green-500/[0.02]"
                                                )}
                                                onClick={() => navigate(`/contest/${contestId}/problem/${prob.problemId}`)}
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black transition-all",
                                                                isSolved ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "text-white/50 group-hover:bg-primary group-hover:text-black"
                                                            )}>
                                                                {isSolved ? <CheckCircle2 className="w-6 h-6" /> : String.fromCharCode(65 + idx)}
                                                            </div>
                                                            <div>
                                                                <h3 className={cn(
                                                                    "text-xl font-bold transition-colors",
                                                                    isSolved ? "text-green-400" : "text-white group-hover:text-primary"
                                                                )}>
                                                                    {prob.title}
                                                                </h3>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <Badge variant="secondary" className="bg-white/5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-0">
                                                                        Max Score: {prob.score}
                                                                    </Badge>
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                                        <Clock className="w-3 h-3" />
                                                                        {prob.timeLimit}s {prob.memoryLimit}MB
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant={isSolved ? "secondary" : "ghost"}
                                                            className={cn(
                                                                "rounded-full transition-all",
                                                                isSolved ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20" : "group-hover:bg-primary group-hover:text-black"
                                                            )}
                                                        >
                                                            {isSolved ? "Solved" : "Solve"} <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    <Card className="bg-[#111111] border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl border-dashed">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary">Your Status</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Solved</p>
                                                        <p className="text-xl font-black text-white">
                                                            {leaderboard.find(e => e.uid === user?.uid)?.solvedCount || 0} / {contest.problems?.length}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                        <Gamepad2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Rank</p>
                                                        <p className="text-xl font-black text-white">
                                                            {(() => {
                                                                const rank = leaderboard.findIndex(e => e.uid === user?.uid);
                                                                return rank !== -1 ? `#${rank + 1}` : "#--";
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-primary/5 border-primary/20 rounded-3xl overflow-hidden">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                                <Timer className="w-4 h-4" /> Live Support
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Encountering issues? Reach out to the administrators via the discord channel. Plagiarism will lead to immediate disqualification.
                                            </p>
                                            <Button variant="link" className="text-primary text-xs p-0 mt-2 font-bold uppercase tracking-widest h-auto">
                                                Join Community
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Leaderboard Tab */}
                        <TabsContent value="leaderboard">
                            <Card className="bg-[#111111] border-white/5 rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-8 border-b border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-white">Live Rankings</CardTitle>
                                            <CardDescription>Updated in real-time based on submission accuracy and speed.</CardDescription>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-500 border-0 flex items-center gap-1.5 px-3 py-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Live Update
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank</th>
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</th>
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Solved</th>
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Score</th>
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Penalty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboard.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-20 text-center text-muted-foreground italic">
                                                            No submissions yet. Be the first to solve!
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    leaderboard.map((entry, i) => (
                                                        <tr key={entry.uid} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-8 py-6">
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm",
                                                                    i === 0 ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" :
                                                                        i === 1 ? "bg-zinc-300 text-black" :
                                                                            i === 2 ? "bg-orange-400 text-black" : "bg-white/5 text-muted-foreground"
                                                                )}>
                                                                    {i + 1}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary overflow-hidden border-2 border-white/5">
                                                                        {entry.userAvatar ? <img src={entry.userAvatar} alt="" /> : entry.userName[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{entry.userName}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-medium">{entry.uid.slice(0, 8)}...</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-center">
                                                                <div className="flex justify-center gap-1">
                                                                    {contest.problems.map((p: any) => (
                                                                        <div
                                                                            key={p.problemId}
                                                                            className={cn(
                                                                                "w-2 h-2 rounded-full",
                                                                                entry.solvedProblems.includes(p.problemId) ? "bg-green-500 shadow-lg shadow-green-500/40" : "bg-white/10"
                                                                            )}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-xs font-bold text-white/50 mt-2 block">{entry.solvedCount} / {contest.problems.length}</span>
                                                            </td>
                                                            <td className="px-8 py-6 text-center font-black text-white text-lg">
                                                                {entry.totalScore}
                                                            </td>
                                                            <td className="px-8 py-6 text-right font-mono text-sm text-muted-foreground">
                                                                {entry.totalTime}m
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Rules Tab */}
                        <TabsContent value="rules">
                            <Card className="bg-[#111111] border-white/5 rounded-[2.5rem] overflow-hidden max-w-3xl mx-auto">
                                <CardHeader className="p-8 border-b border-white/5 bg-gradient-to-r from-red-500/10 via-transparent to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-2xl font-black text-white">Rules & Guidelines</CardTitle>
                                    </div>
                                    <CardDescription>Please read carefully to maintain a fair competitive environment.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="text-primary font-black">01.</div>
                                            <div>
                                                <h4 className="font-bold text-white mb-1">Time Limit</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">Each submission must be completed within the time limit of {timeLeft}. Late submissions will not be counted.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="text-primary font-black">02.</div>
                                            <div>
                                                <h4 className="font-bold text-white mb-1">Anti-Plagiarism</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">All code will be scanned for similarities. Copying from other participants or online resources will result in a permanent ban.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="text-primary font-black">03.</div>
                                            <div>
                                                <h4 className="font-bold text-white mb-1">Scoring System</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">Score is based on correct test cases. In case of a tie, the participant with the lower penalty time (calculated from contest start) wins.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="text-primary font-black">04.</div>
                                            <div>
                                                <h4 className="font-bold text-white mb-1">Technical Issues</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">CodePrep is not responsible for internet connection issues. We recommend saving your code locally if you have an unstable connection.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black flex items-center justify-center gap-2">
                                            <ShieldAlert className="w-3 h-3 text-red-500" />
                                            Violating rules may lead to disqualification
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default ContestArena;

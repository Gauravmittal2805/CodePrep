import { useState } from "react";
import {
    CheckCircle2,
    Clock,
    Code2,
    Trophy,
    User,
    Zap,
    TrendingUp,
    Target,
    BrainCircuit,
    Settings,
    BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const UserDashboard = () => {
    const { user } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const stats = [
        { label: "Problems Solved", value: "0", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Current Streak", value: "0 Days", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Global Rank", value: "#0", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
        { label: "Interviews Pref", value: "0%", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
    ];

    const upcomingInterviews: any[] = [];
    const recommendedProblems: any[] = [];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col">
            <Navbar
                isLoginOpen={isLoginOpen}
                setIsLoginOpen={setIsLoginOpen}
                isRegisterOpen={isRegisterOpen}
                setIsRegisterOpen={setIsRegisterOpen}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8 mt-16 pb-20">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/20">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative w-20 h-20 rounded-full border-2 border-background overflow-hidden bg-secondary">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName || ""} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-muted-foreground m-5" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || "Developer"}!</h1>
                            <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                Ready for today's coding challenges?
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-border/40 hover:bg-secondary/30 gap-2">
                            <Settings className="w-4 h-4" />
                            Profile Settings
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 gap-2">
                            <Code2 className="w-4 h-4" />
                            Continue Practice
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <Card key={i} className="bg-[#111111] border-border/40 hover:border-primary/50 transition-all group relative overflow-hidden">
                            <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150 opacity-20", stat.bg)} />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    </div>
                                    <div className={cn("p-3 rounded-xl border border-white/5", stat.bg)}>
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-500">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+12% from last month</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity & Recommendations */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Weekly Activity */}
                        <Card className="bg-[#111111] border-border/40">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-6">
                                <div>
                                    <CardTitle>Skill Progress</CardTitle>
                                    <CardDescription>Your technical proficiency across categories.</CardDescription>
                                </div>
                                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {[
                                    { label: "Algorithms", progress: 75, color: "bg-blue-500" },
                                    { label: "Data Structures", progress: 90, color: "bg-purple-500" },
                                    { label: "System Design", progress: 45, color: "bg-amber-500" },
                                    { label: "Database Management", progress: 60, color: "bg-green-500" },
                                ].map((skill, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{skill.label}</span>
                                            <span className="text-muted-foreground">{skill.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <div className={cn("h-full transition-all duration-1000", skill.color)} style={{ width: `${skill.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-primary" />
                                    Daily Recommendations
                                </h2>
                                <Button variant="ghost" size="sm" className="text-xs text-primary">View All</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendedProblems.map((prob, i) => (
                                    <Card key={i} className="bg-[#111111] border-border/40 hover:bg-secondary/20 cursor-pointer transition-all border-l-4 border-l-primary group">
                                        <CardContent className="p-4 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{prob.title}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                    <span className={cn(
                                                        prob.difficulty === "Easy" ? "text-green-500" : "text-amber-500"
                                                    )}>{prob.difficulty}</span>
                                                    <span>•</span>
                                                    <span>{prob.category}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-black/40 px-2 py-1 rounded-full border border-border/20">
                                                <Clock className="w-3 h-3" />
                                                {prob.time}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Upcoming & Trophies */}
                    <div className="space-y-8">
                        {/* Upcoming Events */}
                        <Card className="bg-[#111111] border-border/40 h-fit">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {upcomingInterviews.map((job, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-black/40 border border-border/10 space-y-3 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-bold">{job.company}</h5>
                                                <p className="text-xs text-muted-foreground">{job.role}</p>
                                            </div>
                                            <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px]">{job.status}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                                <Clock className="w-3 h-3" />
                                                {job.date}
                                            </div>
                                            <span className="text-[10px] font-bold text-primary/80 px-2 py-0.5 rounded-full bg-primary/5 uppercase">
                                                {job.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full border-primary/20 text-xs font-bold uppercase tracking-widest bg-primary/5 hover:bg-primary/10">
                                    Join Interview Room
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card className="bg-gradient-to-br from-[#111111] to-primary/5 border-border/40">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Recent Trophies
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="aspect-square rounded-xl bg-black/40 flex items-center justify-center border border-border/10 hover:border-amber-500/50 transition-colors group cursor-help">
                                            <Trophy className="w-6 h-6 text-amber-500/20 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                    <p className="text-[10px] text-amber-500/80 font-bold leading-tight">
                                        Congratulations! You're in the top 5% of users this week. Stay consistent!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;

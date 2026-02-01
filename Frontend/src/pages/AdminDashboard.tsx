import { useState } from "react";
import {
    PlusCircle,
    Users,
    Settings,
    Bell,
    Search,
    MoreVertical,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    Database,
    LayoutDashboard,
    Code2,
    Building2,
    Trophy,
    ClipboardList,
    MonitorSpeaker,
    Send,
    ShieldAlert,
    ChevronDown,
    Menu,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout: authLogout } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(["Problems", "Interview Lobby"]);
    const [activeItem, setActiveItem] = useState("Overview");

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const sidebarItems = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            subItems: ["Overview", "Key Stats"]
        },
        {
            title: "Users Management",
            icon: Users,
            subItems: ["All Users", "Admins / Moderators", "Blocked Users"]
        },
        {
            title: "Problems",
            icon: Code2,
            subItems: ["All Problems", "Add New Problem", "Bulk Upload", "Problem Tags", "Editorials"]
        },
        {
            title: "Companies",
            icon: Building2,
            subItems: ["All Companies", "Add Company", "Company OA Patterns", "Company Problem Mapping"]
        },
        {
            title: "Contests",
            icon: Trophy,
            subItems: ["Create Contest", "All Contests", "Invite-only Contests", "Contest Submissions", "Contest Leaderboard"]
        },
        {
            title: "Mock OA",
            icon: ClipboardList,
            subItems: ["Create Mock OA", "OA Templates", "User Attempts", "OA Analytics"]
        },
        {
            title: "Interview Lobby",
            icon: MonitorSpeaker,
            subItems: ["Create Interview Rooms", "Interview Schedules", "Interviewers Management", "Interview Feedback", "Interview Leaderboard"],
            tag: "PRO"
        },
        {
            title: "Submissions",
            icon: Send,
            subItems: ["All Submissions", "Failed Submissions", "Runtime Errors"]
        },
        {
            title: "Plagiarism Detection",
            icon: ShieldAlert,
            subItems: ["Plagiarism Reports", "Similarity Scores", "Flagged Users"]
        },
    ];

    const stats = [
        { label: "Total Users", value: "0", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Problems Solved", value: "0", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Active Contests", value: "0", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Interviews Today", value: "0", icon: MonitorSpeaker, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    const recentProblems: any[] = [];

    const handleLogout = async () => {
        try {
            await authLogout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col overflow-hidden">
            {/* Top Navbar Integration */}
            <header className="h-14 border-b border-border/40 bg-[#111111]/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Code2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">CODEPREP <span className="text-primary/80 text-[10px] ml-1 px-1.5 py-0.5 bg-primary/10 rounded-full">ADMIN</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input placeholder="Search admin panel..." className="h-8 w-64 bg-black/40 border-border/40 text-xs pl-9" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                        <Bell className="w-4 h-4" />
                    </Button>
                    <div className="h-6 w-px bg-border/40 mx-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="text-xs hidden md:inline">Logout</span>
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "bg-[#111111] border-r border-border/40 transition-all duration-300 flex flex-col z-40 overflow-hidden",
                        isSidebarCollapsed ? "w-16" : "w-64"
                    )}
                >
                    <div className="flex-1 py-4 overflow-hidden">
                        <nav className="px-3 space-y-1">
                            {sidebarItems.map((section, idx) => (
                                <div key={idx} className="space-y-1">
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-2 rounded-lg transition-all group",
                                            expandedSections.includes(section.title) ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <section.icon className={cn(
                                                "w-4 h-4 transition-colors",
                                                expandedSections.includes(section.title) ? "text-primary" : "group-hover:text-primary"
                                            )} />
                                            {!isSidebarCollapsed && (
                                                <span className="text-sm font-medium">{section.title}</span>
                                            )}
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <div className="flex items-center gap-2">
                                                {section.tag && (
                                                    <span className="text-[8px] font-bold bg-primary/20 text-primary px-1 rounded-sm tracking-tighter">
                                                        {section.tag}
                                                    </span>
                                                )}
                                                <ChevronDown className={cn(
                                                    "w-3 h-3 transition-transform duration-300",
                                                    expandedSections.includes(section.title) ? "rotate-0" : "-rotate-90"
                                                )} />
                                            </div>
                                        )}
                                    </button>

                                    {!isSidebarCollapsed && expandedSections.includes(section.title) && (
                                        <div className="ml-7 space-y-1 mt-1 border-l border-border/20 pl-2">
                                            {section.subItems.map((sub, sIdx) => (
                                                <button
                                                    key={sIdx}
                                                    onClick={() => setActiveItem(sub)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-1.5 rounded-md text-xs transition-all",
                                                        activeItem === sub ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
                                                    )}
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-border/40 flex-shrink-0">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg text-muted-foreground hover:bg-white/[0.03] hover:text-foreground transition-all"
                        >
                            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : (
                                <>
                                    <Menu className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Collapse Menu</span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 lg:p-8 scrollbar-thin scrollbar-thumb-border/20">
                    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Current Location / Breadcrumb */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/10 pb-4">
                            <span>Admin</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-primary">{activeItem}</span>
                        </div>

                        {/* Stats Section (only on overview) */}
                        {activeItem === "Overview" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {stats.map((stat, i) => (
                                        <Card key={i} className="bg-[#111111] border-border/40 hover:border-primary/50 transition-all group overflow-hidden relative">
                                            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150`} />
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${stat.bg} border border-white/5 shadow-xl`}>
                                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Main Content: Problem Management */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card className="bg-[#111111] border-border/40 shadow-2xl">
                                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-6">
                                                <div>
                                                    <CardTitle className="text-xl">Recent Content Updates</CardTitle>
                                                    <CardDescription>Review and manage lately added coding challenges.</CardDescription>
                                                </div>
                                                <Button size="sm" className="h-9 gap-2">
                                                    <PlusCircle className="w-4 h-4" />
                                                    Add Problem
                                                </Button>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <div className="space-y-1">
                                                    {recentProblems.map((problem, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all group border border-transparent hover:border-border/40">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-lg bg-black/60 flex items-center justify-center font-mono text-xs text-muted-foreground border border-border/20 shadow-inner group-hover:border-primary/30 group-hover:text-primary transition-all">
                                                                    #{problem.id}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{problem.title}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/60">{problem.category}</span>
                                                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                                                        <span className={cn(
                                                                            "text-[10px] font-bold",
                                                                            problem.difficulty === "Easy" ? "text-green-500" :
                                                                                problem.difficulty === "Medium" ? "text-amber-500" : "text-red-500"
                                                                        )}>{problem.difficulty}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <Badge variant="outline" className={cn(
                                                                    "text-[10px] h-6 px-3 rounded-full border-0",
                                                                    problem.status === "Published" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                                                )}>
                                                                    <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", problem.status === "Published" ? "bg-green-500" : "bg-amber-500")} />
                                                                    {problem.status}
                                                                </Badge>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <div className="p-4 border-t border-border/10 text-center bg-black/20">
                                                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10">
                                                    View Full Problem Library
                                                    <ChevronRight className="w-3 h-3 ml-2" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Sidebar: Activity Logs */}
                                    <div className="space-y-6">
                                        <Card className="bg-[#111111] border-border/40 shadow-2xl h-fit">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-lg">Platform Activity</CardTitle>
                                                <CardDescription>Real-time updates from users</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {[
                                                    { user: "Sarah L.", action: "solved Hard problem #823", time: "2 mins ago", icon: CheckCircle, color: "text-green-500" },
                                                    { user: "Admin", action: "updated server config", time: "45 mins ago", icon: Settings, color: "text-amber-500" },
                                                    { user: "Kevin M.", action: "reported a bug in #94", time: "2 hours ago", icon: AlertCircle, color: "text-red-500" },
                                                    { user: "New User", action: "signed up from New York", time: "4 hours ago", icon: Users, color: "text-blue-500" },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex gap-4 group">
                                                        <div className={`mt-0.5 p-2.5 rounded-xl bg-black/40 h-fit border border-border/10 shadow-lg group-hover:border-primary/20 transition-all`}>
                                                            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-medium leading-tight">
                                                                <span className="text-white group-hover:text-primary transition-colors cursor-pointer">{item.user}</span>
                                                            </p>
                                                            <p className="text-xs text-muted-foreground/80">{item.action}</p>
                                                            <p className="text-[10px] text-muted-foreground/50 mt-1 flex items-center gap-1 font-mono">
                                                                <Clock className="w-2.5 h-2.5" />
                                                                {item.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-primary/5 border-primary/20 overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Database className="w-24 h-24" />
                                            </div>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base text-primary/80">System Analytics</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        <span>Server Load</span>
                                                        <span className="text-primary tracking-normal">98% UP</span>
                                                    </div>
                                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                        <div className="h-full bg-primary w-[98%] transition-all duration-1000 group-hover:w-[94%]" />
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest border-primary/30 hover:bg-primary/10 transition-all">
                                                    System Diagnostics
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeItem !== "Overview" && (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border-2 border-dashed border-border/20 bg-black/20">
                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                    <Database className="w-12 h-12 text-primary/40" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{activeItem} Dashboard</h2>
                                    <p className="text-muted-foreground max-w-md mx-auto mt-2">
                                        This module is currently being integrated with the backend API. Check back soon for management controls.
                                    </p>
                                </div>
                                <Button onClick={() => setActiveItem("Overview")} variant="secondary" size="sm">
                                    Return to Overview
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;

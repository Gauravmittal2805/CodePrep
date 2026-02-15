import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Globe, EyeOff } from "lucide-react";
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
    LogOut,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    UserCircle,
    History,
    ShieldCheck,
    Ban,
    ScanFace,
    Flag,
    RefreshCcw,
    Download,
    Edit,
    Trash2,
    Play,
    Tag,
    Layers,
    Info,
    Activity,
    Cpu,
    Zap,
    Server,
    HardDrive,
    XCircle,
    Map
} from "lucide-react";
import AddProblemForm from "@/components/admin/AddProblemForm";
import MockOADesigner from "@/components/admin/MockOADesigner";
import CompanyOAPatterns from "@/components/admin/CompanyOAPatterns";
import UserOAAttempts from "@/components/admin/UserOAAttempts";
import OAAnalytics from "@/components/admin/OAAnalytics";
import CreateContestForm from "@/components/admin/CreateContestForm";
import ManageContests from "@/components/admin/ManageContests";
import AdminInterviewPanel from "@/components/admin/AdminInterviewPanel";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Legend
} from 'recharts';
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
    const [expandedSections, setExpandedSections] = useState<string[]>(["Problems"]);
    const [activeItem, setActiveItem] = useState("Overview");
    const [statsData, setStatsData] = useState<any>(null);
    const [usersData, setUsersData] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [blockedUsersData, setBlockedUsersData] = useState<any[]>([]);
    const [isLoadingBlockedUsers, setIsLoadingBlockedUsers] = useState(false);
    const [problemsData, setProblemsData] = useState<any[]>([]);
    const [isLoadingProblems, setIsLoadingProblems] = useState(false);
    const [adminsData, setAdminsData] = useState<any[]>([]);
    const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
    const [editingProblem, setEditingProblem] = useState<any>(null);
    const [isCleaningUp, setIsCleaningUp] = useState(false);
    const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
    const [systemHealthData, setSystemHealthData] = useState<any>(null);
    const [isLoadingHealth, setIsLoadingHealth] = useState(false);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [diagnosisResults, setDiagnosisResults] = useState<any[]>([]);
    const [companiesData, setCompaniesData] = useState<any[]>([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const [addCompanyForm, setAddCompanyForm] = useState({
        name: "",
        companyId: "",
        logo: "",
        website: "",
        color: "#2563eb",
        oaDifficulty: "Medium",
        avgQuestions: "2-3",
        focusAreas: [] as string[],
        pattern: [{ topic: "", percentage: 0 }],
        oaSimulation: { duration: "60 mins", coding: 2, debug: 0, mcq: 0 },
        roadmap: [{ stage: "OA", description: "" }]
    });
    const [isAddingCompany, setIsAddingCompany] = useState(false);
    const [mockOAsData, setMockOAsData] = useState<any[]>([]);
    const [isLoadingMockOAs, setIsLoadingMockOAs] = useState(false);

    const { user } = useAuth();

    const fetchSystemHealth = async () => {
        if (!user) return;
        setIsLoadingHealth(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/system/health', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setSystemHealthData(result.data);
            }
        } catch (error) {
            console.error("Health fetch error:", error);
        } finally {
            setIsLoadingHealth(false);
        }
    };

    const runDiagnostics = async () => {
        if (!user) return;
        setIsDiagnosing(true);
        const toastId = toast.loading("Running deep system diagnostics...");
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/system/diagnostics', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                setDiagnosisResults(result.results);
                toast.success("Diagnostics completed successfully", { id: toastId });
            } else {
                toast.error("Diagnostics failed", { id: toastId });
            }
        } catch (error: any) {
            console.error("Diagnostics error:", error);
            toast.error(error.message || "Connection error during diagnostics", { id: toastId });
        } finally {
            setIsDiagnosing(false);
        }
    };

    useEffect(() => {
        if (activeItem === "Overview") {
            fetchSystemHealth();
            const interval = setInterval(fetchSystemHealth, 30000); // refresh every 30s
            return () => clearInterval(interval);
        }
    }, [activeItem]);

    const handleRunJudgeCleanup = async () => {
        if (!user) return;
        setIsCleaningUp(true);
        const toastId = toast.loading("Running Judge Cleanup...");

        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/judge/cleanup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const result = await response.json();

            if (result.success) {
                toast.success("Judge Cleanup Successful!", {
                    id: toastId,
                    description: `Cleared temp files and removed ${result.summary.staleSubmissionsRemoved} stale submissions.`
                });
                // Optionally refresh stats
                fetchStats();
            } else {
                toast.error(result.error || "Cleanup failed", { id: toastId });
            }
        } catch (error: any) {
            console.error("Cleanup error:", error);
            toast.error(error.message || "An error occurred during cleanup", { id: toastId });
        } finally {
            setIsCleaningUp(false);
        }
    };

    const fetchStats = async () => {
        if (!user) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setStatsData(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            // Stats loading done
        }
    };

    const fetchCompanies = async () => {
        if (!user) return;
        setIsLoadingCompanies(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/companies', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setCompaniesData(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setIsLoadingCompanies(false);
        }
    };

    const fetchUsers = async () => {
        if (!user) return;
        setIsLoadingUsers(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setUsersData(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch admin users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleForceLogout = async (targetUid: string) => {
        if (!user) return;
        if (!confirm("Are you sure you want to force logout this user? They will be instantly disconnected from all devices.")) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/admin/users/${encodeURIComponent(targetUid)}/force-logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert("User has been forced to logout successfully.");
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to force logout'}`);
            }
        } catch (error) {
            console.error('Force logout request failed:', error);
            alert("An error occurred while attempting to force logout.");
        }
    };

    const fetchBlockedUsers = async () => {
        if (!user) return;
        setIsLoadingBlockedUsers(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/users/blocked', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setBlockedUsersData(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch admin blocked users:', error);
        } finally {
            setIsLoadingBlockedUsers(false);
        }
    };

    const handleBlockUser = async (targetUid: string) => {
        if (!user) return;
        const reason = prompt("Enter reason for blocking this user:");
        if (reason === null) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/admin/users/${encodeURIComponent(targetUid)}/block`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                alert("User has been blocked.");
                fetchUsers(); // Refresh active list
            } else {
                const errorData = await response.json();
                alert(`Failed to block user: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Block user request failed:', error);
        }
    };

    const handleUnblockUser = async (targetUid: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/admin/users/${encodeURIComponent(targetUid)}/unblock`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert("User unblocked successfully.");
                fetchBlockedUsers(); // Refresh blocked list
            } else {
                alert("Failed to unblock user.");
            }
        } catch (error) {
            console.error('Unblock user request failed:', error);
        }
    };

    const handleUpdateProblemStatus = async (problemId: string, newStatus: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/problems/${problemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success(`Problem ${newStatus === 'Published' ? 'published' : 'unpublished'} successfully`);
                fetchProblems(); // Refresh list to show new status
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.error || "Failed to update status");
            }
        } catch (error: any) {
            console.error('Update status failed:', error);
            toast.error(error.message || "An error occurred");
        }
    };

    const fetchProblems = async () => {
        if (!user) return;
        setIsLoadingProblems(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/problems?limit=100&status=all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setProblemsData(result.data.problems || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch admin problems:', error);
        } finally {
            setIsLoadingProblems(false);
        }
    };

    const fetchMockOAs = async () => {
        if (!user) return;
        setIsLoadingMockOAs(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/mockoa/admin/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setMockOAsData(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch mock OAs:', error);
        } finally {
            setIsLoadingMockOAs(false);
        }
    };

    const fetchAdmins = async () => {
        if (!user) return;
        setIsLoadingAdmins(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/admins', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAdminsData(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch admin list:', error);
        } finally {
            setIsLoadingAdmins(false);
        }
    };

    const handleAddCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsAddingCompany(true);
        const toastId = toast.loading("Adding company...");

        try {
            // Filter out empty patterns and roadmap items to prevent validation errors
            const cleanedForm = {
                ...addCompanyForm,
                pattern: addCompanyForm.pattern.filter(p => p.topic.trim() !== ""),
                roadmap: addCompanyForm.roadmap.filter(r => r.stage.trim() !== "" && r.description.trim() !== "")
            };

            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/companies', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedForm)
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Company added successfully!", { id: toastId });
                setAddCompanyForm({
                    name: "",
                    companyId: "",
                    logo: "",
                    website: "",
                    color: "#2563eb",
                    oaDifficulty: "Medium",
                    avgQuestions: "2-3",
                    focusAreas: [],
                    pattern: [{ topic: "", percentage: 0 }],
                    oaSimulation: { duration: "60 mins", coding: 2, debug: 0, mcq: 0 },
                    roadmap: [{ stage: "OA", description: "" }]
                });
                setActiveItem("All Companies");
                fetchCompanies();
            } else {
                toast.error(result.error || "Failed to add company", { id: toastId });
            }
        } catch (error) {
            console.error("Add company error:", error);
            toast.error("An error occurred during addition", { id: toastId });
        } finally {
            setIsAddingCompany(false);
        }
    };

    const handleChangeRole = async (targetUid: string, newRole: string) => {
        if (!user) return;
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/admin/users/${encodeURIComponent(targetUid)}/role`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                alert(`User role updated to ${newRole} successfully.`);
                fetchAdmins(); // Refresh admin list
            } else {
                const errorData = await response.json();
                alert(`Failed to update role: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Update role request failed:', error);
            alert("An error occurred while updating the role.");
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    useEffect(() => {
        if (activeItem === "All Users") {
            fetchUsers();
        } else if (activeItem === "Blocked Users") {
            fetchBlockedUsers();
        } else if (activeItem === "All Problems" || activeItem === "Problem Tags") {
            fetchProblems();
        } else if (activeItem === "Admins / Moderators") {
            fetchAdmins();
        } else if (activeItem === "All Companies" || activeItem === "Create Mock OA") {
            fetchCompanies();
        } else if (activeItem === "OA Templates") {
            fetchMockOAs();
        }
    }, [activeItem, user]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? [] : [section]
        );
    };

    const sidebarItems = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            subItems: ["Overview", "Analytics"]
        },
        {
            title: "Users Management",
            icon: Users,
            subItems: ["All Users", "Admins / Moderators", "Blocked Users"]
        },
        {
            title: "Problems",
            icon: Code2,
            subItems: ["All Problems", "Add New Problem", "Problem Tags", "Editorials"]
        },
        {
            title: "Companies",
            icon: Building2,
            subItems: ["All Companies", "Add Company", "Company OA Patterns"]
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



    const recentProblems: any[] = [];

    const userAnalyticsDummy = [
        { label: "Daily Active Users (DAU)", value: "1,240", growth: "+12.5%", trend: "up" },
        { label: "Weekly Active Users (WAU)", value: "5,680", growth: "+8.2%", trend: "up" },
        { label: "Monthly Active Users (MAU)", value: "18,400", growth: "+15.3%", trend: "up" },
    ];

    const chartData = Array.from({ length: 30 }, (_, i) => ({
        name: `Day ${i + 1}`,
        users: Math.floor(Math.random() * 500) + 800,
    }));

    const difficultyData = [
        { difficulty: 'Easy', solved: 450, total: 600, rate: 75 },
        { difficulty: 'Medium', solved: 280, total: 800, rate: 35 },
        { difficulty: 'Hard', solved: 85, total: 400, rate: 21 },
    ];

    const problemHealthData = [
        { id: 1, title: "Two Sum", submissions: 1200, acceptance: 85, avgTime: "12min", failure: "WA", health: "Good" },
        { id: 2, title: "Median of Two Sorted Arrays", submissions: 850, acceptance: 12, avgTime: "45min", failure: "TLE", health: "Critical" },
        { id: 3, title: "Longest Palindromic Substring", submissions: 920, acceptance: 45, avgTime: "25min", failure: "WA", health: "Stable" },
        { id: 4, title: "String to Integer (atoi)", submissions: 700, acceptance: 18, avgTime: "20min", failure: "WA", health: "Good" },
        { id: 5, title: "Regular Expression Matching", submissions: 600, acceptance: 8, avgTime: "55min", failure: "TLE", health: "Critical" },
        { id: 6, title: "Wildcard Matching", submissions: 400, acceptance: 42, avgTime: "18min", failure: "TLE", health: "Warning" },
    ];

    const topProblems = [
        { title: "Two Sum", attempts: 1540 },
        { title: "Reverse Integer", attempts: 1230 },
        { title: "Add Two Numbers", attempts: 1100 },
        { title: "LRU Cache", attempts: 980 },
        { title: "Valid Parentheses", attempts: 850 },
    ];

    const [analyticsSubTab, setAnalyticsSubTab] = useState("users");

    const handleLogout = async () => {
        try {
            await authLogout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="h-screen bg-[#0a0a0a] text-foreground flex flex-col overflow-hidden">
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
                        "bg-[#111111] border-r border-border/40 transition-all duration-300 flex flex-col z-40 overflow-hidden select-none",
                        isSidebarCollapsed ? "w-16" : "w-64"
                    )}
                >
                    <div className="flex-1 py-4 overflow-y-auto scrollbar-none">
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
                            <div className="space-y-8">
                                {/* Row 1: Users & Problems */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Category 1: Users */}
                                    <Card
                                        className="bg-[#111111] border-border/40 hover:border-blue-500/50 transition-all group cursor-pointer"
                                        onClick={() => setActiveItem("All Users")}
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-bold text-blue-400 uppercase tracking-wider">Platform Users</CardTitle>
                                                <CardDescription className="text-xs">Manage and monitor user growth</CardDescription>
                                            </div>
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                <Users className="w-5 h-5" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Total Users</p>
                                                    <p className="text-2xl font-bold tracking-tight">{statsData?.users?.total || '0'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Active Today</p>
                                                    <p className="text-2xl font-bold tracking-tight text-green-500">{statsData?.users?.activeToday || '0'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">New (24h)</p>
                                                    <p className="text-2xl font-bold tracking-tight text-blue-400">+{statsData?.users?.newSignups || '0'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex items-center justify-between text-[11px] text-muted-foreground/60 group-hover:text-blue-400 transition-colors">
                                                <span className="font-medium uppercase tracking-widest">Go to Users Management</span>
                                                <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Category 2: Problems */}
                                    <Card className="bg-[#111111] border-border/40 hover:border-purple-500/50 transition-all group">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-bold text-purple-400 uppercase tracking-wider">Problem Bank</CardTitle>
                                                <CardDescription className="text-xs">Content library statistics</CardDescription>
                                            </div>
                                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                <Code2 className="w-5 h-5" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Total</p>
                                                    <p className="text-xl font-bold">{statsData?.problems?.total || '0'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Live</p>
                                                    <p className="text-xl font-bold text-green-500">{statsData?.problems?.published || '0'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Drafts</p>
                                                    <p className="text-xl font-bold text-amber-500">{statsData?.problems?.drafts || '0'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-red-400 font-bold flex items-center gap-1">
                                                        Reported <AlertCircle className="w-2.5 h-2.5" />
                                                    </p>
                                                    <p className="text-xl font-bold text-red-500">{statsData?.problems?.reported || '0'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Row 2: Submissions & Contests */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Category 3: Submissions */}
                                    <Card className="bg-[#111111] border-border/40 hover:border-orange-500/50 transition-all group">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-bold text-orange-400 uppercase tracking-wider">Submission Health</CardTitle>
                                                <CardDescription className="text-xs">Judge status and performance</CardDescription>
                                            </div>
                                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                                <Send className="w-5 h-5" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Total</p>
                                                    <p className="text-xl font-bold">{statsData?.submissions?.total || '0'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">AC %</p>
                                                    <p className="text-xl font-bold text-green-500">{statsData?.submissions?.acceptedRate || '0'}%</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">WA %</p>
                                                    <p className="text-xl font-bold text-red-400">{statsData?.submissions?.failedRate || '0'}%</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">TLE %</p>
                                                    <p className="text-xl font-bold text-amber-500">{statsData?.submissions?.tleRate || '0'}%</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 p-2 bg-orange-500/5 rounded border border-orange-500/10 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                                <span className="text-[10px] text-orange-500/80 font-medium">Judge is processing at normal latency: 240ms</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Category 4: Contests */}
                                    <Card className="bg-[#111111] border-border/40 hover:border-amber-500/50 transition-all group">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-bold text-amber-400 uppercase tracking-wider">Competitive Activity</CardTitle>
                                                <CardDescription className="text-xs">Active and upcoming contests</CardDescription>
                                            </div>
                                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                <Trophy className="w-5 h-5" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Active</p>
                                                    <p className="text-xl font-bold text-green-500">{statsData?.contests?.active || '0'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Upcoming</p>
                                                    <p className="text-xl font-bold text-blue-400">{statsData?.contests?.upcoming || '0'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Finished (7d)</p>
                                                    <p className="text-xl font-bold">{statsData?.contests?.finished || '0'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Row 3: Interviews & AI Stats */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                                    {/* Category 5: Interviews */}
                                    <Card className="lg:col-span-2 bg-[#111111] border-border/40 hover:border-pink-500/50 transition-all group">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-bold text-pink-400 uppercase tracking-wider">Interviews Management</CardTitle>
                                                <CardDescription className="text-xs text-pink-400/60 font-medium">Lobby feature performance</CardDescription>
                                            </div>
                                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
                                                <MonitorSpeaker className="w-5 h-5" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="py-2 border-r border-border/10">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Today</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold text-white">{statsData?.interviews?.today || '0'}</span>
                                                        <span className="text-[10px] text-green-500 font-bold">+12%</span>
                                                    </div>
                                                </div>
                                                <div className="py-2 border-r border-border/10">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Feedback Pending</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold text-amber-500">{statsData?.interviews?.pendingFeedback || '0'}</span>
                                                    </div>
                                                </div>
                                                <div className="py-2">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Avg Score</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold text-blue-400">{statsData?.interviews?.avgScore || '0'}/10</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* System Quick Actions */}
                                    <div className="space-y-4">
                                        <Button
                                            onClick={() => setActiveItem("Add New Problem")}
                                            className="w-full h-12 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-xs gap-2"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            Compose Problem
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            <AlertDialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 h-12 border-border/40 hover:bg-white/5 font-bold uppercase tracking-widest text-xs gap-2"
                                                        disabled={isCleaningUp}
                                                    >
                                                        {isCleaningUp ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                                                        Run Judge Cleanup
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent
                                                    className="bg-[#111111] border-border/40 text-white"
                                                >
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="flex items-center gap-2">
                                                            <AlertCircle className="w-5 h-5 text-amber-500" />
                                                            ⚠️ Run Judge Cleanup?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-muted-foreground">
                                                            This will perform the following actions:
                                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                                <li>Clear temporary execution data & buffers</li>
                                                                <li>Clean stuck or zombie judge jobs</li>
                                                                <li>Optimize judge performance</li>
                                                                <li>Remove internal system error logs</li>
                                                            </ul>
                                                            <p className="mt-4 font-semibold text-white/90">This action is safe but will briefly interrupt any currently running judge jobs.</p>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-white/5 border-border/40 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleRunJudgeCleanup}
                                                            className="bg-primary hover:bg-primary/90 text-black font-bold"
                                                        >
                                                            Run Cleanup
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-lg border border-border/40 hover:bg-primary/10 hover:text-primary shrink-0">
                                                        <Info className="w-5 h-5" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 bg-[#111111] border-border/40 text-white shadow-2xl z-50">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                                                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                                <Database className="w-4 h-4" />
                                                            </div>
                                                            <span className="font-bold text-sm tracking-tight text-primary">Judge Maintenance Tool</span>
                                                        </div>
                                                        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                                                            <p>Maintain the system's "Judge Health" to ensure reliable user submissions.</p>
                                                            <div className="space-y-1.5">
                                                                <div className="flex gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                                                                    <p><span className="text-white font-medium text-[10px] uppercase">Temp Cleanup:</span> Deletes Docker leftovers and /tmp buffers to save disk space.</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                                                                    <p><span className="text-white font-medium text-[10px] uppercase">Stuck Jobs:</span> Forces termination of submissions in 'Running' state for too long.</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                                                                    <p><span className="text-white font-medium text-[10px] uppercase">Error Logs:</span> Clears internal judge crash entries to keep stats clean.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
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

                                        <Card className="bg-[#050505] border-primary/20 overflow-hidden relative group shadow-2xl">
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                                                <Activity className="w-48 h-48 -mr-12 -mt-12" />
                                            </div>
                                            <CardHeader className="pb-4 border-b border-white/[0.05]">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm font-bold tracking-tighter text-primary uppercase">Platform Health Monitor</CardTitle>
                                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] h-5 animate-pulse">Live</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-6">
                                                {/* 1. Server Load (CPU, Mem, Disk) */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Server className="w-3.5 h-3.5 text-primary/60" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Server Load</span>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-primary font-bold">{systemHealthData?.server?.cpu || '0'}% CPU</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="space-y-1">
                                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${systemHealthData?.server?.cpu || 0}%` }} />
                                                            </div>
                                                            <p className="text-[8px] text-muted-foreground uppercase font-bold text-center">CPU</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${systemHealthData?.server?.memory || 0}%` }} />
                                                            </div>
                                                            <p className="text-[8px] text-muted-foreground uppercase font-bold text-center">MEM</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${systemHealthData?.server?.disk || 48}%` }} />
                                                            </div>
                                                            <p className="text-[8px] text-muted-foreground uppercase font-bold text-center">DISK</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2 & 3. Judge & Pipeline */}
                                                <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/[0.05]">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Zap className="w-3 h-3 text-amber-500" />
                                                            <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Judge Health</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-white">{systemHealthData?.judge?.activeWorkers || '6'}/6 Active</span>
                                                            <span className="text-[8px] text-muted-foreground">RT: {systemHealthData?.judge?.avgRuntime || '240ms'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Layers className="w-3 h-3 text-blue-500" />
                                                            <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Pipeline</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-white">{systemHealthData?.pipeline?.running || '0'} Running</span>
                                                            <span className="text-[8px] text-muted-foreground">Queued: {systemHealthData?.pipeline?.queued || '0'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 4 & 5. Uptime & DB */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                                                            <Clock className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-bold text-muted-foreground uppercase">Uptime</span>
                                                            <span className="text-[10px] font-mono font-bold text-white">{systemHealthData?.uptime?.system || '99.98%'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                            <Database className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-bold text-muted-foreground uppercase">DB Latency</span>
                                                            <span className="text-[10px] font-mono font-bold text-white">{systemHealthData?.database?.latency || '18ms'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            onClick={runDiagnostics}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-[10px] font-bold uppercase tracking-widest border-primary/30 bg-primary/5 hover:bg-primary/20 transition-all gap-2 h-9"
                                                            disabled={isDiagnosing}
                                                        >
                                                            {isDiagnosing ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                                                            Run Full Diagnostics
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-[#0a0a0a] border-border/40 text-white max-w-md">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="flex items-center gap-2">
                                                                <ShieldCheck className="w-5 h-5 text-primary" />
                                                                System Diagnostics Report
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-muted-foreground">
                                                                Deep check completed at {new Date().toLocaleTimeString()}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="space-y-3 py-4">
                                                            {diagnosisResults.map((res, i) => (
                                                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                                                    <div className="flex items-center gap-3">
                                                                        {res.status === 'PASS' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-bold">{res.check}</span>
                                                                            <span className="text-[10px] text-muted-foreground">{res.details}</span>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className={cn(
                                                                        "text-[9px] h-5",
                                                                        res.status === 'PASS' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                                                    )}>{res.status}</Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <AlertDialogFooter>
                                                            <AlertDialogAction className="bg-primary text-black font-bold text-xs uppercase cursor-pointer">Done</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(activeItem === "Create Interview Rooms" ||
                            activeItem === "Interview Schedules" ||
                            activeItem === "Interviewers Management" ||
                            activeItem === "Interview Feedback" ||
                            activeItem === "Interview Leaderboard") && (
                                <AdminInterviewPanel activeView={activeItem} />
                            )}

                        {/* Analytics Tab Content */}
                        {activeItem === "Analytics" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight">Platform Analytics</h2>
                                        <p className="text-muted-foreground mt-1">Data-driven insights for users and content</p>
                                    </div>
                                    <div className="flex bg-[#111111] p-1 rounded-xl border border-border/40">
                                        <button
                                            onClick={() => setAnalyticsSubTab("users")}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                                analyticsSubTab === "users" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            User Insights
                                        </button>
                                        <button
                                            onClick={() => setAnalyticsSubTab("problems")}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                                analyticsSubTab === "problems" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            Problem Health
                                        </button>
                                    </div>
                                </div>

                                {analyticsSubTab === "users" ? (
                                    <>
                                        {/* Analytics Top Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {userAnalyticsDummy.map((stat, idx) => (
                                                <Card key={idx} className="bg-[#111111] border-border/40 hover:border-primary/40 transition-all group">
                                                    <CardContent className="pt-6">
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                                                <h3 className="text-3xl font-bold tracking-tighter">{stat.value}</h3>
                                                            </div>
                                                            <Badge variant="outline" className={cn(
                                                                "text-[10px] font-bold border-0 bg-opacity-10",
                                                                stat.trend === "up" ? "bg-green-500 text-green-500" : "bg-red-500 text-red-500"
                                                            )}>
                                                                {stat.trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                                                {stat.growth}
                                                            </Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Line Chart Section */}
                                        <Card className="bg-[#111111] border-border/40 shadow-2xl overflow-hidden">
                                            <CardHeader className="border-b border-border/10 pb-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle>User Activity Trend</CardTitle>
                                                        <CardDescription>Daily active users over the last 30 days</CardDescription>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2">
                                                        <Database className="w-3 h-3" />
                                                        Export CSV
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-10">
                                                <div className="h-[400px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={chartData}>
                                                            <defs>
                                                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                                            <XAxis
                                                                dataKey="name"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: '#666', fontSize: 10 }}
                                                                dy={10}
                                                            />
                                                            <YAxis
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: '#666', fontSize: 10 }}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                                                itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="users"
                                                                stroke="#2563eb"
                                                                strokeWidth={3}
                                                                fillOpacity={1}
                                                                fill="url(#colorUsers)"
                                                                animationDuration={2000}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Difficulty Distribution */}
                                            <Card className="bg-[#111111] border-border/40">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Problem Solve Distribution</CardTitle>
                                                    <CardDescription>Solved vs Total problems by difficulty</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-[300px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={difficultyData}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                                                <XAxis dataKey="difficulty" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                                                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                                                                <Legend verticalAlign="top" height={36} />
                                                                <Bar dataKey="solved" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
                                                                <Bar dataKey="total" stackId="a" fill="#1e293b" radius={[4, 4, 0, 0]} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Top Problems Trends */}
                                            <Card className="bg-[#111111] border-border/40">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Most Attempted Problems</CardTitle>
                                                    <CardDescription>Top problems by submission volume</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {topProblems.map((prob, i) => (
                                                            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-bold text-primary w-4">{i + 1}.</span>
                                                                    <span className="text-sm font-medium">{prob.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-muted-foreground">{prob.attempts} attempts</span>
                                                                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Problem Health Table */}
                                        <Card className="bg-[#111111] border-border/40 overflow-hidden">
                                            <CardHeader className="bg-primary/[0.02] border-b border-border/10">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                                    <div>
                                                        <CardTitle>Problem Health Metrics</CardTitle>
                                                        <CardDescription>Identifying critical issues in content delivery</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/[0.02]">
                                                            <tr>
                                                                <th className="px-6 py-4">Problem Name</th>
                                                                <th className="px-6 py-4 text-center">Submissions</th>
                                                                <th className="px-6 py-4 text-center">Acceptance %</th>
                                                                <th className="px-6 py-4 text-center">Avg Time</th>
                                                                <th className="px-6 py-4 text-center">Failure Mode</th>
                                                                <th className="px-6 py-4 text-right">Health</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/[0.05]">
                                                            {problemHealthData.map((row) => (
                                                                <tr key={row.id} className="hover:bg-white/[0.01] transition-colors group">
                                                                    <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">{row.title}</td>
                                                                    <td className="px-6 py-4 text-center font-mono text-xs">{row.submissions}</td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <span className={cn(
                                                                                "font-bold",
                                                                                row.acceptance < 15 ? "text-red-500" : "text-green-500"
                                                                            )}>{row.acceptance}%</span>
                                                                            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={cn(
                                                                                        "h-full rounded-full",
                                                                                        row.acceptance < 15 ? "bg-red-500" : "bg-green-500"
                                                                                    )}
                                                                                    style={{ width: `${row.acceptance}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center text-muted-foreground">{row.avgTime}</td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <Badge variant="outline" className={cn(
                                                                            "text-[10px] border-0 capitalize font-bold",
                                                                            row.failure === "TLE" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                                                                        )}>
                                                                            {row.failure}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <span className={cn(
                                                                            "text-[10px] font-bold px-2 py-1 rounded-md",
                                                                            row.health === "Critical" ? "bg-red-500/20 text-red-500 animate-pulse" :
                                                                                row.health === "Warning" ? "bg-amber-500/20 text-amber-500" : "bg-green-500/20 text-green-500"
                                                                        )}>
                                                                            {row.health}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* All Users Section */}
                        {activeItem === "All Users" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight">Platform Users</h2>
                                        <p className="text-muted-foreground mt-1">Manage and monitor all registered users</p>
                                    </div>
                                    <Button onClick={fetchUsers} variant="outline" size="sm" className="gap-2">
                                        <Clock className={cn("w-4 h-4", isLoadingUsers && "animate-spin")} />
                                        Refresh List
                                    </Button>
                                </div>

                                <Card className="bg-[#111111] border-border/40 overflow-hidden shadow-2xl">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/[0.02] border-b border-border/10">
                                                    <tr>
                                                        <th className="px-6 py-4">User Details</th>
                                                        <th className="px-6 py-4">Firebase UID</th>
                                                        <th className="px-6 py-4">Joined Date</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.05]">
                                                    {isLoadingUsers ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                    <span>Fetching users from database...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : usersData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                No users found in the database.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        usersData.map((usr) => (
                                                            <tr key={usr._id} className="hover:bg-white/[0.01] transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                                            {usr.photoURL ? (
                                                                                <img src={usr.photoURL} alt={usr.fullName} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                usr.fullName?.charAt(0) || 'U'
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-white group-hover:text-primary transition-colors">{usr.fullName}</span>
                                                                            <span className="text-xs text-muted-foreground">{usr.email}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground/60">{usr.uid}</td>
                                                                <td className="px-6 py-4 text-muted-foreground">
                                                                    {new Date(usr.createdAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                                                                <MoreVertical className="w-4 h-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent className="w-56 bg-[#111111] border-border/40 text-foreground max-h-[350px] overflow-y-auto scrollbar-none" align="end">
                                                                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">MVP Actions</DropdownMenuLabel>
                                                                            <DropdownMenuGroup>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors">
                                                                                    <UserCircle className="w-4 h-4 text-primary" />
                                                                                    <span>View Full Profile</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors">
                                                                                    <History className="w-4 h-4 text-primary" />
                                                                                    <span>View Submissions</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors">
                                                                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                                                                    <span>Assign Role</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onClick={() => handleBlockUser(usr.uid)}
                                                                                    className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors text-red-500"
                                                                                >
                                                                                    <Ban className="w-4 h-4" />
                                                                                    <span>Block User</span>
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuGroup>

                                                                            <DropdownMenuSeparator className="bg-white/5" />
                                                                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Security & Integrity</DropdownMenuLabel>
                                                                            <DropdownMenuGroup>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors cursor-pointer">
                                                                                    <ScanFace className="w-4 h-4 text-amber-500" />
                                                                                    <span>View Plagiarism Report</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors cursor-pointer">
                                                                                    <Flag className="w-4 h-4 text-amber-500" />
                                                                                    <span>Flag for Review</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onClick={() => handleForceLogout(usr.uid)}
                                                                                    className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors cursor-pointer text-red-500"
                                                                                >
                                                                                    <LogOut className="w-4 h-4" />
                                                                                    <span>Force Logout</span>
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuGroup>

                                                                            <DropdownMenuSeparator className="bg-white/5" />
                                                                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Career & Interview</DropdownMenuLabel>
                                                                            <DropdownMenuGroup>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors cursor-pointer">
                                                                                    <MonitorSpeaker className="w-4 h-4 text-blue-500" />
                                                                                    <span>Interview History</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors cursor-pointer">
                                                                                    <Building2 className="w-4 h-4 text-blue-500" />
                                                                                    <span>Company Readiness</span>
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuGroup>

                                                                            <DropdownMenuSeparator className="bg-white/5" />
                                                                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Advanced Controls</DropdownMenuLabel>
                                                                            <DropdownMenuGroup>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors cursor-pointer text-amber-500">
                                                                                    <RefreshCcw className="w-4 h-4" />
                                                                                    <span>Reset User Stats</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors cursor-pointer">
                                                                                    <Download className="w-4 h-4 text-muted-foreground" />
                                                                                    <span>Export User Data</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors cursor-pointer">
                                                                                    <Bell className="w-4 h-4 text-muted-foreground" />
                                                                                    <span>Send Warning Message</span>
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuGroup>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Admins / Moderators Section */}
                        {activeItem === "Admins / Moderators" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-primary">Admins & Moderators</h2>
                                        <p className="text-muted-foreground mt-1">Personnel with elevated platform privileges</p>
                                    </div>
                                    <Button onClick={fetchAdmins} variant="outline" size="sm" className="gap-2">
                                        <RefreshCcw className={cn("w-4 h-4", isLoadingAdmins && "animate-spin")} />
                                        Refresh
                                    </Button>
                                </div>

                                <Card className="bg-[#111111] border-primary/20 overflow-hidden shadow-2xl">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-primary/[0.02] border-b border-border/10">
                                                    <tr>
                                                        <th className="px-6 py-4">Admin Details</th>
                                                        <th className="px-6 py-4">Role</th>
                                                        <th className="px-6 py-4">Firebase UID</th>
                                                        <th className="px-6 py-4 text-right">Access Level</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.05]">
                                                    {isLoadingAdmins ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                    <span>Fetching authorized personnel...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : adminsData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                No administrators found in the database.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        adminsData.map((usr) => (
                                                            <tr key={usr._id} className="hover:bg-primary/[0.01] transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shadow-inner">
                                                                            {usr.photoURL ? (
                                                                                <img src={usr.photoURL} alt={usr.fullName} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <ShieldCheck className="w-5 h-5" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-white group-hover:text-primary transition-colors">{usr.fullName}</span>
                                                                            <span className="text-xs text-muted-foreground">{usr.email}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge className={cn(
                                                                        "uppercase text-[10px] font-bold px-2 py-0.5 rounded-md border-0",
                                                                        usr.role === 'admin' ? "bg-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-amber-500/20 text-amber-500"
                                                                    )}>
                                                                        {usr.role}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground/60">{usr.uid}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" size="sm" className="h-6 text-[10px] border-primary/30 text-primary/70 hover:bg-primary/10 gap-1">
                                                                                Change Access
                                                                                <ChevronDown className="w-3 h-3" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-40 bg-[#111111] border-border/40">
                                                                            <DropdownMenuLabel>Set Role</DropdownMenuLabel>
                                                                            <DropdownMenuSeparator className="bg-white/5" />
                                                                            <DropdownMenuItem onClick={() => handleChangeRole(usr.uid, 'admin')} className="cursor-pointer gap-2">
                                                                                <ShieldCheck className="w-3 h-3 text-red-500" />
                                                                                <span>Admin</span>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleChangeRole(usr.uid, 'moderator')} className="cursor-pointer gap-2">
                                                                                <ShieldAlert className="w-3 h-3 text-amber-500" />
                                                                                <span>Moderator</span>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleChangeRole(usr.uid, 'user')} className="cursor-pointer gap-2">
                                                                                <UserCircle className="w-3 h-3 text-blue-500" />
                                                                                <span>User</span>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* All Companies Section */}
                        {activeItem === "All Companies" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-primary">Platform Companies</h2>
                                        <p className="text-muted-foreground mt-1">Manage partner companies and track target-specific problems</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="sm" onClick={() => setActiveItem("Add Company")} className="gap-2 border-primary/30 text-primary hover:bg-primary/10 transition-all">
                                            <PlusCircle className="w-4 h-4" />
                                            Add Company
                                        </Button>
                                        <Button onClick={fetchCompanies} variant="outline" size="sm" className="gap-2">
                                            <RefreshCcw className={cn("w-4 h-4", isLoadingCompanies && "animate-spin")} />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                <Card className="bg-[#111111] border-primary/20 overflow-hidden shadow-2xl">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-primary/[0.02] border-b border-border/10">
                                                    <tr>
                                                        <th className="px-6 py-4">Company Name</th>
                                                        <th className="px-6 py-4">OA Difficulty</th>
                                                        <th className="px-6 py-4">Focus Areas</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.05]">
                                                    {isLoadingCompanies ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                    <span>Fetching company data...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : companiesData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                No companies found. Start by adding one.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        companiesData.map((company) => (
                                                            <tr key={company._id} className="hover:bg-white/[0.01] transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                                            {company.logo ? (
                                                                                <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-1" />
                                                                            ) : (
                                                                                <Building2 className="w-5 h-5" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-white group-hover:text-primary transition-colors">{company.name}</span>
                                                                            <span className="text-xs text-muted-foreground">{company.companyId}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge variant="outline" className={cn(
                                                                        "text-[10px] uppercase font-bold border-0",
                                                                        company.oaDifficulty?.toLowerCase() === 'hard' ? "bg-red-500/10 text-red-500" :
                                                                            company.oaDifficulty?.toLowerCase() === 'medium' ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
                                                                    )}>
                                                                        {company.oaDifficulty || 'Medium'}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {company.focusAreas?.slice(0, 2).map((area: string, i: number) => (
                                                                            <Badge key={i} variant="outline" className="text-[9px] bg-white/5 border-white/10 text-muted-foreground">
                                                                                {area}
                                                                            </Badge>
                                                                        ))}
                                                                        {company.focusAreas?.length > 2 && (
                                                                            <span className="text-[9px] text-muted-foreground">+{company.focusAreas.length - 2}</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 hover:text-primary">
                                                                            <Edit className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Add Company Section */}
                        {activeItem === "Add Company" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                                <PlusCircle className="w-6 h-6 text-primary" />
                                            </div>
                                            Add New Company
                                        </h2>
                                        <p className="text-muted-foreground mt-1 text-sm">Register a new partner company to track Online Assessments</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setActiveItem("All Companies")} className="gap-2">
                                        <ArrowUpRight className="w-4 h-4 rotate-[225deg]" />
                                        Back to List
                                    </Button>
                                </div>

                                <Card className="bg-[#111111] border-border/40 overflow-hidden shadow-2xl w-full">
                                    <CardHeader className="bg-white/[0.01] border-b border-border/10">
                                        <CardTitle className="text-lg">Company Details</CardTitle>
                                        <CardDescription>Enter the primary information for the new company entry</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-8">
                                        <form onSubmit={handleAddCompany} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Company Name</label>
                                                    <Input
                                                        placeholder="e.g. Amazon"
                                                        value={addCompanyForm.name}
                                                        onChange={(e) => {
                                                            const name = e.target.value;
                                                            setAddCompanyForm(prev => ({
                                                                ...prev,
                                                                name,
                                                                companyId: name.toLowerCase().replace(/\s+/g, '-')
                                                            }));
                                                        }}
                                                        className="h-12 bg-black/40 border-border/40 focus:border-primary/50 transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Unique ID / Slug</label>
                                                    <Input
                                                        placeholder="e.g. amazon"
                                                        value={addCompanyForm.companyId}
                                                        onChange={(e) => setAddCompanyForm(prev => ({ ...prev, companyId: e.target.value }))}
                                                        className="h-12 bg-black/40 border-border/40 focus:border-primary/50 transition-all font-mono text-sm"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Logo URL</label>
                                                    <div className="flex gap-3">
                                                        <Input
                                                            placeholder="https://example.com/logo.png"
                                                            value={addCompanyForm.logo}
                                                            onChange={(e) => setAddCompanyForm(prev => ({ ...prev, logo: e.target.value }))}
                                                            className="h-12 flex-1 bg-black/40 border-border/40 focus:border-primary/50 transition-all"
                                                            required
                                                        />
                                                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-border/40 flex items-center justify-center overflow-hidden">
                                                            {addCompanyForm.logo ? (
                                                                <img src={addCompanyForm.logo} alt="Preview" className="w-full h-full object-contain p-1" />
                                                            ) : (
                                                                <Building2 className="w-5 h-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Company Website (Optional)</label>
                                                    <Input
                                                        placeholder="https://careers.company.com"
                                                        value={addCompanyForm.website}
                                                        onChange={(e) => setAddCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                                                        className="h-12 bg-black/40 border-border/40 focus:border-primary/50 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">OA Difficulty</label>
                                                <Select
                                                    value={addCompanyForm.oaDifficulty}
                                                    onValueChange={(value) => setAddCompanyForm(prev => ({ ...prev, oaDifficulty: value }))}
                                                >
                                                    <SelectTrigger className="h-12 bg-black/40 border-border/40 focus:border-primary/50 transition-all text-sm font-medium">
                                                        <SelectValue placeholder="Select Difficulty" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-border/40 text-foreground">
                                                        <SelectItem value="Easy" className="focus:bg-green-500/20 focus:text-green-500 cursor-pointer">Easy</SelectItem>
                                                        <SelectItem value="Medium" className="focus:bg-amber-500/20 focus:text-amber-500 cursor-pointer">Medium</SelectItem>
                                                        <SelectItem value="Hard" className="focus:bg-red-500/20 focus:text-red-500 cursor-pointer">Hard</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Focus Areas (Comma separated)</label>
                                                <Input
                                                    placeholder="e.g. Arrays, Trees, Dynamic Programming"
                                                    value={addCompanyForm.focusAreas.join(", ")}
                                                    onChange={(e) => setAddCompanyForm(prev => ({
                                                        ...prev,
                                                        focusAreas: e.target.value.split(',').map(s => s.trim())
                                                    }))}
                                                    className="h-12 bg-black/40 border-border/40 focus:border-primary/50 transition-all"
                                                />
                                            </div>

                                            {/* OA Simulation Details */}
                                            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-5 relative overflow-hidden group hover:border-primary/20 transition-all">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    <MonitorSpeaker className="w-4 h-4 text-primary" />
                                                    OA Simulation Details
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration</label>
                                                        <div className="relative">
                                                            <Input
                                                                value={addCompanyForm.oaSimulation.duration}
                                                                onChange={(e) => setAddCompanyForm(prev => ({
                                                                    ...prev,
                                                                    oaSimulation: { ...prev.oaSimulation, duration: e.target.value }
                                                                }))}
                                                                className="bg-black/40 pl-8 focus:border-primary/50 transition-all text-center"
                                                                placeholder="e.g 60 mins"
                                                            />
                                                            <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Coding Qs</label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                value={addCompanyForm.oaSimulation.coding}
                                                                onChange={(e) => setAddCompanyForm(prev => ({
                                                                    ...prev,
                                                                    oaSimulation: { ...prev.oaSimulation, coding: parseInt(e.target.value) || 0 }
                                                                }))}
                                                                className="bg-black/40 pl-8 focus:border-primary/50 transition-all"
                                                            />
                                                            <Code2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Debug Qs</label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                value={addCompanyForm.oaSimulation.debug}
                                                                onChange={(e) => setAddCompanyForm(prev => ({
                                                                    ...prev,
                                                                    oaSimulation: { ...prev.oaSimulation, debug: parseInt(e.target.value) || 0 }
                                                                }))}
                                                                className="bg-black/40 pl-8 focus:border-primary/50 transition-all"
                                                            />
                                                            <Cpu className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">MCQ Qs</label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                value={addCompanyForm.oaSimulation.mcq}
                                                                onChange={(e) => setAddCompanyForm(prev => ({
                                                                    ...prev,
                                                                    oaSimulation: { ...prev.oaSimulation, mcq: parseInt(e.target.value) || 0 }
                                                                }))}
                                                                className="bg-black/40 pl-8 focus:border-primary/50 transition-all"
                                                            />
                                                            <ClipboardList className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pattern Breakdown */}
                                            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-colors" />
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-amber-500" />
                                                        Pattern Breakdown
                                                    </h3>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setAddCompanyForm(prev => ({
                                                            ...prev,
                                                            pattern: [...prev.pattern, { topic: "", percentage: 0 }]
                                                        }))}
                                                        className="h-8 text-[10px] font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                                    >
                                                        + Add Topic
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {addCompanyForm.pattern.length === 0 && (
                                                        <div className="text-center py-6 text-muted-foreground text-xs italic border border-dashed border-white/10 rounded-lg">
                                                            No patterns added yet. Click "+ Add Topic" to start.
                                                        </div>
                                                    )}
                                                    {addCompanyForm.pattern.map((item, idx) => (
                                                        <div key={idx} className="flex gap-3 items-center p-2 rounded-lg bg-black/20 border border-white/5 hover:border-amber-500/20 transition-all">
                                                            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px] font-bold text-amber-500 border border-amber-500/20">
                                                                {idx + 1}
                                                            </div>
                                                            <Input
                                                                placeholder="Topic Name (e.g. Graph)"
                                                                value={item.topic}
                                                                onChange={(e) => {
                                                                    const newPattern = [...addCompanyForm.pattern];
                                                                    newPattern[idx].topic = e.target.value;
                                                                    setAddCompanyForm(prev => ({ ...prev, pattern: newPattern }));
                                                                }}
                                                                className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 h-8 text-sm"
                                                            />
                                                            <div className="flex items-center gap-2 bg-black/40 rounded-md px-2 border border-white/5">
                                                                <span className="text-xs text-muted-foreground font-bold">%</span>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={item.percentage}
                                                                    onChange={(e) => {
                                                                        const newPattern = [...addCompanyForm.pattern];
                                                                        newPattern[idx].percentage = parseInt(e.target.value) || 0;
                                                                        setAddCompanyForm(prev => ({ ...prev, pattern: newPattern }));
                                                                    }}
                                                                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-12 h-8 text-right text-sm"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const newPattern = addCompanyForm.pattern.filter((_, i) => i !== idx);
                                                                    setAddCompanyForm(prev => ({ ...prev, pattern: newPattern }));
                                                                }}
                                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Interview Roadmap */}
                                            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                        <Map className="w-4 h-4 text-blue-500" />
                                                        Interview Roadmap
                                                    </h3>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setAddCompanyForm(prev => ({
                                                            ...prev,
                                                            roadmap: [...prev.roadmap, { stage: "", description: "" }]
                                                        }))}
                                                        className="h-8 text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                                                    >
                                                        + Add Stage
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {addCompanyForm.roadmap.length === 0 && (
                                                        <div className="text-center py-6 text-muted-foreground text-xs italic border border-dashed border-white/10 rounded-lg">
                                                            No interview stages defined. Click "+ Add Stage".
                                                        </div>
                                                    )}
                                                    {addCompanyForm.roadmap.map((item, idx) => (
                                                        <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-black/20 border border-white/5 hover:border-blue-500/20 transition-all group/item">
                                                            <div className="w-6 h-6 mt-1.5 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-500 border border-blue-500/20">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <Input
                                                                    placeholder="Stage Name (e.g. Online Assessment)"
                                                                    value={item.stage}
                                                                    onChange={(e) => {
                                                                        const newRoadmap = [...addCompanyForm.roadmap];
                                                                        newRoadmap[idx].stage = e.target.value;
                                                                        setAddCompanyForm(prev => ({ ...prev, roadmap: newRoadmap }));
                                                                    }}
                                                                    className="bg-black/40 border-border/40 focus:border-blue-500/50 h-9 text-sm font-medium"
                                                                />
                                                                <textarea
                                                                    placeholder="Description of the interview stage..."
                                                                    value={item.description}
                                                                    onChange={(e) => {
                                                                        const newRoadmap = [...addCompanyForm.roadmap];
                                                                        newRoadmap[idx].description = e.target.value;
                                                                        setAddCompanyForm(prev => ({ ...prev, roadmap: newRoadmap }));
                                                                    }}
                                                                    className="w-full min-h-[60px] bg-black/40 border-border/40 focus:border-blue-500/50 rounded-md p-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const newRoadmap = addCompanyForm.roadmap.filter((_, i) => i !== idx);
                                                                    setAddCompanyForm(prev => ({ ...prev, roadmap: newRoadmap }));
                                                                }}
                                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 mt-1"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isAddingCompany}
                                                className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-widest"
                                            >
                                                {isAddingCompany ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                                                Save Company to Database
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeItem === "Company OA Patterns" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <CompanyOAPatterns />
                            </div>
                        )}

                        {activeItem === "Create Mock OA" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                            <ClipboardList className="w-6 h-6 text-primary" />
                                        </div>
                                        Mock Assessment Designer
                                    </h2>
                                    <p className="text-muted-foreground mt-1 text-sm">Design and configure company-specific online assessments</p>
                                </div>
                                <MockOADesigner
                                    companies={companiesData}
                                    onComplete={() => {
                                        setActiveItem("OA Templates");
                                        fetchMockOAs();
                                    }}
                                />
                            </div>
                        )}

                        {activeItem === "User Attempts" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <UserOAAttempts />
                            </div>
                        )}

                        {activeItem === "OA Templates" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                                <Layers className="w-6 h-6 text-primary" />
                                            </div>
                                            Assessment Templates
                                        </h2>
                                        <p className="text-muted-foreground mt-1 text-sm">Library of configured company online assessments</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setActiveItem("Create Mock OA")}
                                            className="gap-2 border-primary/50 text-primary hover:bg-primary/10 transition-all font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            Create New Template
                                        </Button>
                                        <Button
                                            onClick={fetchMockOAs}
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            <RefreshCcw className={cn("w-4 h-4", isLoadingMockOAs && "animate-spin")} />
                                            Refresh Templates
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {isLoadingMockOAs ? (
                                        [1, 2, 3].map(i => (
                                            <Card key={i} className="bg-[#111111] border-border/40 animate-pulse">
                                                <CardContent className="p-6 h-48 flex items-center justify-center">
                                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : mockOAsData.length === 0 ? (
                                        <div className="col-span-full py-20 text-center text-muted-foreground bg-[#111111] rounded-3xl border-2 border-dashed border-border/20">
                                            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-medium">No OA templates found.</p>
                                            <p className="text-sm mt-1">Start by creating a new template from the designer.</p>
                                            <Button
                                                onClick={() => setActiveItem("Create Mock OA")}
                                                variant="outline"
                                                className="mt-6 border-primary/30 text-primary hover:bg-primary/10"
                                            >
                                                Open OA Designer
                                            </Button>
                                        </div>
                                    ) : (
                                        mockOAsData.map((oa) => (
                                            <Card key={oa._id} className="bg-[#111111] border-border/40 hover:border-primary/40 transition-all group overflow-hidden relative">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px] uppercase font-black tracking-tighter border-0",
                                                        oa.status === 'ACTIVE' ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                                                    )}>
                                                        {oa.status}
                                                    </Badge>
                                                </div>
                                                <CardHeader className="pb-3 border-b border-white/[0.03] bg-white/[0.01]">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold overflow-hidden">
                                                                {oa.companyLogo ? (
                                                                    <img src={oa.companyLogo} alt={oa.company} className="w-4 h-4 object-contain" />
                                                                ) : (
                                                                    oa.company.charAt(0)
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{oa.company}</span>
                                                        </div>
                                                        <CardTitle className="text-xl font-black text-white group-hover:text-primary transition-colors truncate pr-16">{oa.title}</CardTitle>
                                                        <CardDescription className="text-muted-foreground/60 text-xs font-medium uppercase tracking-wider">{oa.role}</CardDescription>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-5 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Questions</span>
                                                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                                                <Code2 className="w-3.5 h-3.5 text-primary" />
                                                                {oa.questions?.length || 0} Problems
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Duration</span>
                                                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5 text-primary" />
                                                                {oa.duration} Mins
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5">
                                                        {oa.questions?.slice(0, 3).map((q: any, i: number) => (
                                                            <Badge key={i} variant="secondary" className="bg-white/5 text-[9px] font-bold border-0 text-muted-foreground/80">
                                                                {q.title?.split(' ').slice(0, 2).join(' ')}...
                                                            </Badge>
                                                        ))}
                                                        {oa.questions?.length > 3 && (
                                                            <span className="text-[9px] text-muted-foreground font-bold ml-1">+{oa.questions.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </CardContent>
                                                <div className="p-3 bg-black/40 border-t border-white/[0.03] flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/5 hover:text-primary">
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-red-500/10 hover:text-red-500">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 h-8"
                                                        onClick={() => {
                                                            alert(`Previewing OA: ${oa.title}`);
                                                        }}
                                                    >
                                                        Test Template
                                                        <ArrowUpRight className="w-3 h-3 ml-1.5" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeItem === "Problem Tags" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight">Problem Tags</h2>
                                        <p className="text-muted-foreground mt-1">Problems grouped by their categories/topics</p>
                                    </div>
                                    <Button onClick={fetchProblems} variant="outline" size="sm" className="gap-2">
                                        <RefreshCcw className={cn("w-4 h-4", isLoadingProblems && "animate-spin")} />
                                        Refresh
                                    </Button>
                                </div>

                                {isLoadingProblems ? (
                                    <div className="h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border/20 rounded-3xl">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="text-muted-foreground">Categorizing problems...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Object.entries(
                                            problemsData.reduce((acc: any, prob: any) => {
                                                const topics = Array.isArray(prob.topic) && prob.topic.length > 0 ? prob.topic : ["Uncategorized"];
                                                topics.forEach((t: string) => {
                                                    if (!acc[t]) acc[t] = [];
                                                    acc[t].push(prob);
                                                });
                                                return acc;
                                            }, {})
                                        ).sort((a: any, b: any) => b[1].length - a[1].length).map(([tag, problems]: [string, any]) => (
                                            <Card key={tag} className="bg-[#111111] border-border/40 hover:border-primary/40 transition-all group overflow-hidden">
                                                <CardHeader className="pb-3 border-b border-border/10 bg-white/[0.01]">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                                <Tag className="w-4 h-4" />
                                                            </div>
                                                            <CardTitle className="text-base">{tag}</CardTitle>
                                                        </div>
                                                        <Badge variant="secondary" className="bg-primary/20 text-primary border-0 font-bold">
                                                            {problems.length}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-4 px-0">
                                                    <div className="max-h-[300px] overflow-y-auto px-4 space-y-2 scrollbar-thin scrollbar-thumb-border/20">
                                                        {problems.map((p: any) => (
                                                            <div
                                                                key={p._id}
                                                                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group/item"
                                                                onClick={() => navigate(`/editor/${p.id || p.slug}`)}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold text-white/80 group-hover/item:text-primary transition-colors truncate max-w-[150px]">
                                                                        {p.title}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground font-mono">#{p.id || p.slug?.slice(0, 8)}</span>
                                                                </div>
                                                                <Badge variant="outline" className={cn(
                                                                    "text-[8px] h-5 px-1.5 border-0 font-bold",
                                                                    p.difficulty === "Easy" ? "bg-green-500/10 text-green-500" :
                                                                        p.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                                                                )}>
                                                                    {p.difficulty}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                                <div className="p-3 border-t border-border/10 bg-black/20 text-center">
                                                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors h-7">
                                                        Manage Group
                                                        <ChevronRight className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}

                                        {problemsData.length === 0 && (
                                            <div className="col-span-full py-20 text-center text-muted-foreground bg-[#111111] rounded-3xl border-2 border-dashed border-border/20">
                                                <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                <p>No problems found to categorize.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Add New Problem / Edit Problem Section */}
                        {(activeItem === "Add New Problem" || activeItem === "Edit Problem") && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight text-primary">
                                        {activeItem === "Edit Problem" ? `Edit: ${editingProblem?.title}` : "Add New Problem (Admin)"}
                                    </h2>
                                    <p className="text-muted-foreground mt-1">
                                        {activeItem === "Edit Problem" ? "Update problem details, test cases, and metadata." : "Add a new coding challenge to the platform."}
                                    </p>
                                </div>
                                <AddProblemForm
                                    onCancel={() => setActiveItem("All Problems")}
                                    onSuccess={() => {
                                        fetchProblems();
                                        setActiveItem("All Problems");
                                        setEditingProblem(null);
                                    }}
                                    initialData={editingProblem}
                                />
                            </div>
                        )}

                        {/* Editorials / Admin Edit Section */}
                        {activeItem === "Editorials" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight">Editorials & Data Management</h2>
                                        <p className="text-muted-foreground mt-1">Manage problem content, solutions, and metadata.</p>
                                    </div>
                                    <Button onClick={fetchProblems} variant="outline" size="sm" className="gap-2">
                                        <RefreshCcw className={cn("w-4 h-4", isLoadingProblems && "animate-spin")} />
                                        Refresh
                                    </Button>
                                </div>

                                <Card className="bg-[#111111] border-border/40 overflow-hidden shadow-2xl">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/[0.02] border-b border-border/10">
                                                    <tr>
                                                        <th className="px-6 py-4">Problem Name</th>
                                                        <th className="px-6 py-4">ID / Slug</th>
                                                        <th className="px-6 py-4">Topic</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.05]">
                                                    {isLoadingProblems ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                    <span>Loading problems...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : problemsData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                No problems found.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        problemsData.map((prob) => (
                                                            <tr key={prob.id} className="hover:bg-white/[0.01] transition-colors group">
                                                                <td className="px-6 py-4 font-medium text-white">
                                                                    {prob.title}
                                                                </td>
                                                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground/60">
                                                                    {prob.id || prob.slug}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {(prob.topic || []).slice(0, 2).map((t: string) => (
                                                                        <Badge key={t} variant="outline" className="mr-1 text-[10px] border-white/10">{t}</Badge>
                                                                    ))}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                                                                        onClick={() => {
                                                                            setEditingProblem(prob);
                                                                            setActiveItem("Edit Problem");
                                                                        }}
                                                                    >
                                                                        <Edit className="w-3 h-3 mr-2" />
                                                                        Edit Data
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeItem === "All Problems" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight">All Problems</h2>
                                        <p className="text-muted-foreground mt-1">Manage all coding challenges in the database</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={() => setActiveItem("Add New Problem")} size="sm" className="gap-2">
                                            <PlusCircle className="w-4 h-4" />
                                            New Problem
                                        </Button>
                                        <Button onClick={fetchProblems} variant="outline" size="sm" className="gap-2">
                                            <RefreshCcw className={cn("w-4 h-4", isLoadingProblems && "animate-spin")} />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                <Card className="bg-[#111111] border-border/40 overflow-hidden shadow-2xl">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/[0.02] border-b border-border/10">
                                                    <tr>
                                                        <th className="px-6 py-4">Problem Name</th>
                                                        <th className="px-6 py-4">ID / Slug</th>
                                                        <th className="px-6 py-4">Difficulty</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.05]">
                                                    {isLoadingProblems ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                    <span>Fetching problems from MongoDB...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : problemsData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                                No problems found in the database.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        problemsData.map((prob) => (
                                                            <tr key={prob._id} className="hover:bg-white/[0.01] transition-colors group">
                                                                <td className="px-6 py-4 font-bold text-white group-hover:text-primary transition-colors">
                                                                    {prob.title}
                                                                </td>
                                                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground/60">
                                                                    {prob.slug || prob.id}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge variant="outline" className={cn(
                                                                        "text-[10px] font-bold border-0 h-6",
                                                                        prob.difficulty === "Easy" ? "bg-green-500/10 text-green-500" :
                                                                            prob.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                                                                    )}>
                                                                        {prob.difficulty}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge variant="outline" className={cn(
                                                                        "text-[10px] h-6 px-3 rounded-full border-0",
                                                                        prob.status === "Published" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                                                    )}>
                                                                        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", prob.status === "Published" ? "bg-green-500" : "bg-amber-500")} />
                                                                        {prob.status || 'Published'}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => navigate(`/editor/${prob.id || prob.slug}`)}>
                                                                            <ArrowUpRight className="w-4 h-4 text-primary" />
                                                                        </Button>
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                                                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent className="w-40 bg-[#111111] border-border/40 text-foreground" align="end">
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors" onClick={() => navigate(`/editor/${prob.id || prob.slug}`)}>
                                                                                    <Edit className="w-4 h-4 text-primary" />
                                                                                    <span>Edit Problem</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors" onClick={() => navigate(`/editor/${prob.id || prob.slug}`)}>
                                                                                    <Play className="w-4 h-4 text-green-500" />
                                                                                    <span>Test Problem</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    className="gap-2 cursor-pointer focus:bg-primary/10 transition-colors"
                                                                                    onClick={() => handleUpdateProblemStatus(prob.id || prob.slug, prob.status === 'Published' ? 'Draft' : 'Published')}
                                                                                >
                                                                                    {prob.status === 'Published' ? (
                                                                                        <>
                                                                                            <EyeOff className="w-4 h-4 text-amber-500" />
                                                                                            <span>Unpublish</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Globe className="w-4 h-4 text-blue-500" />
                                                                                            <span>Publish</span>
                                                                                        </>
                                                                                    )}
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuSeparator className="bg-white/5" />
                                                                                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-red-500/10 transition-colors text-red-500">
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                    <span>Delete</span>
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeItem === "Blocked Users" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-red-500">Blocked Users</h2>
                                        <p className="text-muted-foreground mt-1">Users who are currently prohibited from accessing the platform</p>
                                    </div>
                                    <Button onClick={fetchBlockedUsers} variant="outline" size="sm" className="gap-2">
                                        <Clock className={cn("w-4 h-4", isLoadingBlockedUsers && "animate-spin")} />
                                        Refresh List
                                    </Button>
                                </div>

                                <Card className="bg-[#111111] border-red-500/20 overflow-hidden shadow-2xl">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-red-500/[0.02] border-b border-border/10">
                                                    <tr>
                                                        <th className="px-6 py-4">User Details</th>
                                                        <th className="px-6 py-4">Reason</th>
                                                        <th className="px-6 py-4">Blocked On</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.05]">
                                                    {isLoadingBlockedUsers ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                                    <span>Fetching blocked users...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : blockedUsersData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                No blocked users found.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        blockedUsersData.map((usr) => (
                                                            <tr key={usr._id} className="hover:bg-red-500/[0.01] transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold overflow-hidden">
                                                                            {usr.photoURL ? (
                                                                                <img src={usr.photoURL} alt={usr.fullName} className="w-full h-full object-cover grayscale" />
                                                                            ) : (
                                                                                usr.fullName?.charAt(0) || 'U'
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-white/70">{usr.fullName}</span>
                                                                            <span className="text-xs text-muted-foreground/60">{usr.email}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge variant="outline" className="text-red-400 bg-red-500/5 border-red-500/20 text-[10px]">
                                                                        {usr.blockReason || "N/A"}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4 text-muted-foreground">
                                                                    {new Date(usr.updatedAt || usr.createdAt).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <Button
                                                                        onClick={() => handleUnblockUser(usr.uid)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-[10px] font-bold uppercase border-green-500/50 text-green-500 hover:bg-green-500/10"
                                                                    >
                                                                        Unblock User
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeItem === "OA Analytics" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <OAAnalytics />
                            </div>
                        )}

                        {activeItem === "Create Contest" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <CreateContestForm />
                            </div>
                        )}

                        {activeItem === "All Contests" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <ManageContests />
                            </div>
                        )}
                    </div>
                </main>
            </div >
        </div >
    );
};

export default AdminDashboard;

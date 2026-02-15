import { useState } from "react";
import {
    Trophy,
    Settings,
    ListChecks,
    Target,
    ShieldAlert,
    BarChart3,
    Building2,
    Sparkles,
    Save,
    ChevronRight,
    Plus,
    Trash2,
    Search,
    Lock as LockIcon,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";

const CreateContestForm = () => {
    const [activeTab, setActiveTab] = useState("basic");
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [customMode, setCustomMode] = useState<"visual" | "json">("visual");
    const [jsonInput, setJsonInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();

    const [customProblemData, setCustomProblemData] = useState({
        title: "",
        difficulty: "Medium" as "Easy" | "Medium" | "Hard",
        pattern: "Coding",
        topic: ["Dynamic Programming"],
        companies: [] as string[],
        statement: "",
        input_format: "",
        output_format: "",
        constraints: ["1 <= N <= 10^5"],
        sample_input: "",
        sample_output: "",
        explanation: "",
        approach: [] as string[],
        time_complexity: "O(N)",
        space_complexity: "O(1)",
        tags: [] as string[],
        test_cases: [{ input: "", output: "", isHidden: false }],
        hidden_test_cases: [{ input: "", output: "", description: "Hidden test case", points: 10 }],
        notes: "",
        source: "Internal",
        score: 100,
        timeLimit: 1,
        memoryLimit: 256
    });

    // Fetch Problems for selection
    const { data: allProblems, isLoading: isLoadingProblems } = useQuery({
        queryKey: ["admin-problems-list"],
        queryFn: async () => {
            if (!user) return [];
            const token = await user.getIdToken();
            const res = await fetch("http://localhost:5001/api/problems", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            return data.success ? data.data.problems : [];
        }
    });

    // Fetch Companies for mapping
    const { data: companies } = useQuery({
        queryKey: ["admin-companies-list"],
        queryFn: async () => {
            if (!user) return [];
            const token = await user.getIdToken();
            const res = await fetch("http://localhost:5001/api/companies", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            return data.success ? data.data : [];
        }
    });

    // Form State
    const [formData, setFormData] = useState({
        // 1. Basic Info
        title: "",
        description: "",
        type: "OPEN", // OPEN, COMPANY, PRIVATE
        difficulty: "BEGINNER", // BEGINNER, INTERMEDIATE, ADVANCED, COMPANY_OA
        duration: 120,
        startTime: "",
        endTime: "",

        // 2. Settings
        maxParticipants: 0, // 0 for unlimited
        allowedLanguages: {
            cpp: true,
            java: true,
            python: true
        },
        visibility: "PUBLIC", // PUBLIC, INVITE_ONLY
        autoStart: false,
        enableLeaderboard: true,
        showLiveRank: true,
        showTestcaseResults: "PUBLIC_ONLY", // PUBLIC_ONLY, ALL, NONE

        // 3. Problem Assignment
        problems: [] as any[], // { id, title, score, timeLimit, memoryLimit, difficulty }

        // 4. Scoring System
        scoringMode: "FULL_SCORE", // FULL_SCORE, PARTIAL, ICPC, CUSTOM

        // 5. Security
        strictMode: false,
        strictOptions: {
            tabSwitchDetection: true,
            fullscreenEnforcement: true,
            copyPasteDisable: true,
            multiDeviceBlock: true,
            ipLogging: true,
            randomProblemOrder: false
        },

        // 6. Leaderboard
        rankingBasedOn: "SCORE_TIME", // SCORE, SCORE_TIME, SCORE_PENALTY
        freezeLeaderboard: false,
        revealAfterContest: true,
        participants: [] as string[],

        // 7. Company Mapping
        companyDetails: {
            name: "",
            role: "", // SDE-1, Intern, etc.
            oaPatternType: "",
            readinessWeight: 0
        },

        // 8. Advanced
        aiAnalysis: {
            weakTopicReport: true,
            companyReadiness: true,
            skillRadar: true
        },
        performanceTagging: {
            enabled: true,
            tags: ["Graph", "DP", "Fast Solver"]
        }
    });

    const tabs = [
        { id: "basic", label: "Basic Information", icon: Trophy },
        { id: "settings", label: "Contest Settings", icon: Settings },
        { id: "problems", label: "Problem Assignment", icon: ListChecks },
        { id: "scoring", label: "Scoring System", icon: Target },
        { id: "security", label: "Security Settings", icon: ShieldAlert },
        { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
        { id: "company", label: "Company Mapping", icon: Building2, hidden: formData.type !== "COMPANY" },
        { id: "advanced", label: "Advanced Features", icon: Sparkles },
    ];

    const handleInputChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => {
            if (section === "root") {
                return { ...prev, [field]: value };
            }
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            };
        });
    };

    const addProblem = (problem: any) => {
        if (formData.problems.find(p => p.id === problem.id)) {
            toast.error("Problem already added!");
            return;
        }
        setFormData(prev => ({
            ...prev,
            problems: [...prev.problems, {
                id: problem.id || problem._id,
                title: problem.title,
                difficulty: problem.difficulty,
                score: 100,
                timeLimit: problem.timeLimit || 1,
                memoryLimit: problem.memoryLimit || 256
            }]
        }));
        toast.success("Problem added to contest");
    };

    const removeProblem = (id: string) => {
        setFormData(prev => ({
            ...prev,
            problems: prev.problems.filter(p => p.id !== id)
        }));
    };

    const updateProblemSettings = (id: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            problems: prev.problems.map(p => p.id === id ? { ...p, [field]: value } : p)
        }));
    };

    const filteredProblems = allProblems?.filter((p: any) => {
        if (!p || !p.title) return false;
        const searchMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const alreadyAdded = formData.problems.some(sp => sp.id === (p.id || p._id));
        return searchMatch && !alreadyAdded;
    });

    const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon;

    const handleSaveContest = async (status: string = "DRAFT") => {
        try {
            if (!user) {
                toast.error("You must be logged in to save a contest");
                return;
            }

            // Validation for publishing
            if (status === "UPCOMING") {
                if (!formData.title || !formData.description) {
                    toast.error("Title and Description are required");
                    return;
                }
                if (formData.problems.length === 0) {
                    toast.error("Add at least one problem to the contest");
                    return;
                }
                if (!formData.startTime || !formData.endTime) {
                    toast.error("Start and End times are required to publish");
                    return;
                }
            }

            setIsSaving(true);
            const token = await user.getIdToken();
            const response = await fetch("http://localhost:5001/api/contests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    status: status,
                    allowedLanguages: Object.entries(formData.allowedLanguages)
                        .filter(([_, enabled]) => enabled)
                        .map(([lang]) => lang),
                    startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
                    endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
                })
            });

            const result = await response.json();
            if (result.success) {
                toast.success(status === "DRAFT" ? "Draft saved successfully!" : "Contest published successfully!");
                if (status === "UPCOMING") {
                    setActiveTab("basic");
                    // Optionally redirect
                }
            } else {
                toast.error(result.error || "Failed to save contest");
            }
        } catch (error) {
            console.error("Save Contest Error:", error);
            toast.error("Failed to save contest");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCustomProblem = () => {
        const slug = customProblemData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const customId = `prob-${Date.now()}`;

        const newProblem = {
            ...customProblemData,
            id: customId,
            slug: slug,
            isCustom: true,
            status: "ContestOnly",
            judge_type: "Standard"
        };

        setFormData(prev => ({
            ...prev,
            problems: [...prev.problems, newProblem]
        }));

        setIsAddingCustom(false);
        setCustomProblemData({
            title: "",
            difficulty: "Medium",
            pattern: "Coding",
            topic: ["Dynamic Programming"],
            companies: [],
            statement: "",
            input_format: "",
            output_format: "",
            constraints: ["1 <= N <= 10^5"],
            sample_input: "",
            sample_output: "",
            explanation: "",
            approach: [],
            time_complexity: "O(N)",
            space_complexity: "O(1)",
            tags: [],
            test_cases: [{ input: "", output: "", isHidden: false }],
            hidden_test_cases: [{ input: "", output: "", description: "Hidden test case", points: 10 }],
            notes: "",
            source: "Internal",
            score: 100,
            timeLimit: 1,
            memoryLimit: 256
        });
        toast.success("Custom problem added to contest");
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            {/* Left Sidebar Navigation */}
            <div className="w-64 shrink-0 space-y-2">
                <Card className="bg-[#111111] border-border/40 h-full">
                    <CardContent className="p-3">
                        <ScrollArea className="h-full pr-3">
                            <div className="space-y-1">
                                {tabs.filter(t => !t.hidden).map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                                            activeTab === tab.id
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        )}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                        {activeTab === tab.id && (
                                            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
                <Card className="bg-[#111111] border-border/40 h-full flex flex-col">
                    <div className="p-6 border-b border-border/10 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                {ActiveIcon && (
                                    <span className="p-1.5 rounded-md bg-primary/10 text-primary">
                                        <ActiveIcon className="w-4 h-4" />
                                    </span>
                                )}
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">Configure the contest details and parameters.</p>
                        </div>
                        <Button onClick={() => handleSaveContest("DRAFT")} className="gap-2 font-bold uppercase tracking-wide text-xs">
                            <Save className="w-4 h-4" />
                            Save Draft
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="max-w-3xl space-y-8 pb-10">

                            {/* 1. Basic Information */}
                            {activeTab === "basic" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>Contest Title <span className="text-red-500">*</span></Label>
                                            <Input
                                                placeholder="e.g. Amazon SDE-1 Hiring Challenge 2026"
                                                value={formData.title}
                                                onChange={(e) => handleInputChange("root", "title", e.target.value)}
                                                className="bg-black/20 border-border/40 focus:border-primary/50"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Description <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                placeholder="Describe the contest rules, prizes, and details..."
                                                value={formData.description}
                                                onChange={(e) => handleInputChange("root", "description", e.target.value)}
                                                className="min-h-[120px] bg-black/20 border-border/40 focus:border-primary/50 resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <Label>Contest Type</Label>
                                                <Select
                                                    value={formData.type}
                                                    onValueChange={(val) => handleInputChange("root", "type", val)}
                                                >
                                                    <SelectTrigger className="bg-black/20 border-border/40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-border/40">
                                                        <SelectItem value="OPEN">Open For All</SelectItem>
                                                        <SelectItem value="COMPANY">Company Specific</SelectItem>
                                                        <SelectItem value="PRIVATE">Private (Invite Only)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Difficulty Level</Label>
                                                <Select
                                                    value={formData.difficulty}
                                                    onValueChange={(val) => handleInputChange("root", "difficulty", val)}
                                                >
                                                    <SelectTrigger className="bg-black/20 border-border/40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-border/40">
                                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                        <SelectItem value="COMPANY_OA">Company OA Standard</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="grid gap-2">
                                                <Label>Duration (Minutes)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.duration}
                                                    onChange={(e) => handleInputChange("root", "duration", parseInt(e.target.value))}
                                                    className="bg-black/20 border-border/40"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Start Date & Time</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={formData.startTime}
                                                    onChange={(e) => handleInputChange("root", "startTime", e.target.value)}
                                                    className="bg-black/20 border-border/40"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>End Date & Time</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={formData.endTime}
                                                    onChange={(e) => handleInputChange("root", "endTime", e.target.value)}
                                                    className="bg-black/20 border-border/40"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. Contest Settings */}
                            {activeTab === "settings" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label>Max Participants (Optional limit)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0 for unlimited"
                                                value={formData.maxParticipants}
                                                onChange={(e) => handleInputChange("root", "maxParticipants", parseInt(e.target.value))}
                                                className="bg-black/20 border-border/40 w-1/3"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Allowed Languages</Label>
                                            <div className="flex gap-6 p-4 bg-black/20 border border-border/40 rounded-lg">
                                                {Object.entries(formData.allowedLanguages).map(([lang, allowed]) => (
                                                    <div key={lang} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`lang-${lang}`}
                                                            checked={allowed}
                                                            onCheckedChange={(checked) =>
                                                                handleInputChange("allowedLanguages", lang, checked)
                                                            }
                                                        />
                                                        <label
                                                            htmlFor={`lang-${lang}`}
                                                            className="text-sm font-medium uppercase text-muted-foreground peer-data-[state=checked]:text-foreground"
                                                        >
                                                            {lang}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator className="bg-border/20" />

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Visibility</Label>
                                                        <p className="text-xs text-muted-foreground">Who can see this contest?</p>
                                                    </div>
                                                    <Select
                                                        value={formData.visibility}
                                                        onValueChange={(val) => handleInputChange("root", "visibility", val)}
                                                    >
                                                        <SelectTrigger className="w-[140px] bg-black/20 border-border/40">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#1a1a1a] border-border/40">
                                                            <SelectItem value="PUBLIC">Public</SelectItem>
                                                            <SelectItem value="INVITE_ONLY">Invite Only</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {formData.visibility === "INVITE_ONLY" && (
                                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-purple-400">Invited User UIDs (Comma separated)</Label>
                                                        <Textarea
                                                            placeholder="Paste Firebase UIDs here... user1, user2, user3"
                                                            value={formData.participants?.join(", ")}
                                                            onChange={(e) => handleInputChange("root", "participants", e.target.value.split(",").map(id => id.trim()).filter(id => id))}
                                                            className="bg-black/20 border-purple-500/20 focus:border-purple-500/50 min-h-[80px] text-[10px] font-mono"
                                                        />
                                                        <p className="text-[10px] text-muted-foreground italic">Only these users will see and be able to join this contest.</p>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Auto Start</Label>
                                                        <p className="text-xs text-muted-foreground">Start immediately at scheduled time</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.autoStart}
                                                        onCheckedChange={(checked) => handleInputChange("root", "autoStart", checked)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Enable Leaderboard</Label>
                                                        <p className="text-xs text-muted-foreground">Show live rankings</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.enableLeaderboard}
                                                        onCheckedChange={(checked) => handleInputChange("root", "enableLeaderboard", checked)}
                                                    />
                                                </div>

                                                {formData.enableLeaderboard && (
                                                    <div className="flex items-center justify-between pl-4 border-l-2 border-primary/20">
                                                        <div className="space-y-0.5">
                                                            <Label>Show Live Rank</Label>
                                                            <p className="text-xs text-muted-foreground">Real-time updates</p>
                                                        </div>
                                                        <Switch
                                                            checked={formData.showLiveRank}
                                                            onCheckedChange={(checked) => handleInputChange("root", "showLiveRank", checked)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Show Testcase Results</Label>
                                            <p className="text-xs text-muted-foreground mb-2">When user submits, what should they see?</p>
                                            <div className="flex gap-4">
                                                {["PUBLIC_ONLY", "ALL", "NONE"].map((mode) => (
                                                    <div
                                                        key={mode}
                                                        onClick={() => handleInputChange("root", "showTestcaseResults", mode)}
                                                        className={cn(
                                                            "flex-1 p-3 rounded-lg border cursor-pointer transition-all text-center text-sm font-medium",
                                                            formData.showTestcaseResults === mode
                                                                ? "bg-primary/10 border-primary text-primary"
                                                                : "bg-black/20 border-border/40 hover:bg-white/5"
                                                        )}
                                                    >
                                                        {mode.replace("_", " ")}
                                                        {mode === "PUBLIC_ONLY" && <span className="block text-[10px] text-muted-foreground font-normal mt-1">Default (Safe)</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Problem Assignment */}
                            {activeTab === "problems" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search existing problems..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 bg-black/20 border-border/40"
                                            />

                                            {/* Search Results Dropdown */}
                                            {searchQuery.length > 0 && (
                                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-border/40 rounded-xl overflow-hidden shadow-2xl z-50">
                                                    <ScrollArea className="max-h-[300px]">
                                                        {isLoadingProblems ? (
                                                            <div className="p-4 text-center text-muted-foreground">
                                                                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                                                                Loading problems...
                                                            </div>
                                                        ) : filteredProblems?.length === 0 ? (
                                                            <div className="p-4 text-center text-muted-foreground">No matching problems found</div>
                                                        ) : (
                                                            <div className="divide-y divide-white/5">
                                                                {filteredProblems?.map((p: any) => (
                                                                    <div
                                                                        key={p.id || p._id}
                                                                        onClick={() => {
                                                                            addProblem(p);
                                                                            setSearchQuery("");
                                                                        }}
                                                                        className="p-3 hover:bg-white/5 cursor-pointer flex items-center justify-between group"
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{p.title}</span>
                                                                            <span className="text-[10px] text-muted-foreground uppercase">{p.difficulty} • {p.topic?.[0] || 'Uncategorized'}</span>
                                                                        </div>
                                                                        <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </ScrollArea>
                                                </div>
                                            )}
                                        </div>
                                        <Dialog open={isAddingCustom} onOpenChange={setIsAddingCustom}>
                                            <DialogTrigger asChild>
                                                <Button className="gap-2 bg-primary text-black hover:bg-primary/90">
                                                    <Plus className="w-4 h-4" /> Add Custom Problem
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-[#111111] border-border/40 text-white max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0">
                                                <DialogHeader className="p-6 pb-0">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <DialogTitle className="flex items-center gap-2 text-primary text-xl">
                                                                <Sparkles className="w-5 h-5" /> New Custom Contest Problem
                                                            </DialogTitle>
                                                            <DialogDescription className="text-muted-foreground italic mt-1">
                                                                Define the complete problem structure or paste JSON.
                                                            </DialogDescription>
                                                        </div>
                                                        <div className="flex bg-black/40 p-1 rounded-lg border border-border/20">
                                                            <button
                                                                onClick={() => setCustomMode('visual')}
                                                                className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", customMode === 'visual' ? "bg-primary text-black" : "text-muted-foreground hover:text-white")}
                                                            >
                                                                Visual Editor
                                                            </button>
                                                            <button
                                                                onClick={() => setCustomMode('json')}
                                                                className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", customMode === 'json' ? "bg-primary text-black" : "text-muted-foreground hover:text-white")}
                                                            >
                                                                JSON Paste
                                                            </button>
                                                        </div>
                                                    </div>
                                                </DialogHeader>

                                                <ScrollArea className="flex-1 p-6">
                                                    {customMode === "json" ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paste Problem JSON</Label>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
                                                                    onClick={() => {
                                                                        setJsonInput(JSON.stringify(customProblemData, null, 2));
                                                                    }}
                                                                >
                                                                    Export Current to JSON
                                                                </Button>
                                                            </div>
                                                            <Textarea
                                                                placeholder='{ "title": "Example", "statement": "...", ... }'
                                                                value={jsonInput}
                                                                onChange={e => setJsonInput(e.target.value)}
                                                                className="min-h-[400px] font-mono text-xs bg-black/40 border-border/40 focus:ring-primary/30"
                                                            />
                                                            <Button
                                                                onClick={() => {
                                                                    try {
                                                                        const parsed = JSON.parse(jsonInput);
                                                                        setCustomProblemData(prev => ({ ...prev, ...parsed }));
                                                                        setCustomMode("visual");
                                                                        toast.success("JSON parsed successfully! Review in Visual Editor.");
                                                                    } catch (e) {
                                                                        toast.error("Invalid JSON format");
                                                                    }
                                                                }}
                                                                className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
                                                            >
                                                                Apply JSON & Switch to Visual
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="grid gap-6">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
                                                                    <Input
                                                                        placeholder="e.g. Spiral Matrix Transformation"
                                                                        value={customProblemData.title}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, title: e.target.value })}
                                                                        className="bg-black/40 border-border/40 focus:ring-primary/50"
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</Label>
                                                                    <Select
                                                                        value={customProblemData.difficulty}
                                                                        onValueChange={val => setCustomProblemData({ ...customProblemData, difficulty: val as "Easy" | "Medium" | "Hard" })}
                                                                    >
                                                                        <SelectTrigger className="bg-black/40 border-border/40">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-[#1a1a1a] border-border/40">
                                                                            <SelectItem value="Easy">Easy</SelectItem>
                                                                            <SelectItem value="Medium">Medium</SelectItem>
                                                                            <SelectItem value="Hard">Hard</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Problem Statement (HTML/Markdown)</Label>
                                                                <Textarea
                                                                    placeholder="Given a matrix of m x n elements..."
                                                                    value={customProblemData.statement}
                                                                    onChange={e => setCustomProblemData({ ...customProblemData, statement: e.target.value })}
                                                                    className="bg-black/40 border-border/40 min-h-[120px] font-mono text-sm"
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Input Format</Label>
                                                                    <Textarea
                                                                        placeholder="Lines of integers..."
                                                                        value={customProblemData.input_format}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, input_format: e.target.value })}
                                                                        className="bg-black/40 border-border/40 h-24 text-sm"
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Output Format</Label>
                                                                    <Textarea
                                                                        placeholder="A single integer..."
                                                                        value={customProblemData.output_format}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, output_format: e.target.value })}
                                                                        className="bg-black/40 border-border/40 h-24 text-sm"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sample Input</Label>
                                                                    <Textarea
                                                                        placeholder="[[1,2],[3,4]]"
                                                                        value={customProblemData.sample_input}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, sample_input: e.target.value })}
                                                                        className="bg-black/40 border-border/40 h-24 font-mono text-xs"
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sample Output</Label>
                                                                    <Textarea
                                                                        placeholder="[1,2,3,4]"
                                                                        value={customProblemData.sample_output}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, sample_output: e.target.value })}
                                                                        className="bg-black/40 border-border/40 h-24 font-mono text-xs"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explanation / Approach</Label>
                                                                <Textarea
                                                                    placeholder="Describe why the sample output is correct..."
                                                                    value={customProblemData.explanation}
                                                                    onChange={e => setCustomProblemData({ ...customProblemData, explanation: e.target.value })}
                                                                    className="bg-black/40 border-border/40 h-20 text-sm"
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Complexity Analysis</Label>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <Input
                                                                            placeholder="Time: O(N log N)"
                                                                            value={customProblemData.time_complexity}
                                                                            onChange={e => setCustomProblemData({ ...customProblemData, time_complexity: e.target.value })}
                                                                            className="bg-black/40 border-border/40 text-xs"
                                                                        />
                                                                        <Input
                                                                            placeholder="Space: O(N)"
                                                                            value={customProblemData.space_complexity}
                                                                            onChange={e => setCustomProblemData({ ...customProblemData, space_complexity: e.target.value })}
                                                                            className="bg-black/40 border-border/40 text-xs"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pattern / Topic</Label>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <Input
                                                                            placeholder="e.g. Sliders"
                                                                            value={customProblemData.pattern}
                                                                            onChange={e => setCustomProblemData({ ...customProblemData, pattern: e.target.value })}
                                                                            className="bg-black/40 border-border/40 text-xs"
                                                                        />
                                                                        <Input
                                                                            placeholder="e.g. Dynamic Programming"
                                                                            value={customProblemData.topic[0]}
                                                                            onChange={e => setCustomProblemData({ ...customProblemData, topic: [e.target.value] })}
                                                                            className="bg-black/40 border-border/40 text-xs"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Source</Label>
                                                                    <Input
                                                                        placeholder="Internal, LeetCode, etc."
                                                                        value={customProblemData.source}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, source: e.target.value })}
                                                                        className="bg-black/40 border-border/40 text-xs"
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Internal Notes</Label>
                                                                    <Input
                                                                        placeholder="Any internal reminders..."
                                                                        value={customProblemData.notes}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, notes: e.target.value })}
                                                                        className="bg-black/40 border-border/40 text-xs"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Companies (Comma separated)</Label>
                                                                    <Input
                                                                        placeholder="Google, Microsoft, Amazon"
                                                                        value={customProblemData.companies.join(", ")}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, companies: e.target.value.split(",").map(c => c.trim()).filter(c => c) })}
                                                                        className="bg-black/40 border-border/40 text-xs"
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags (Comma separated)</Label>
                                                                    <Input
                                                                        placeholder="Array, Two Pointers, Math"
                                                                        value={customProblemData.tags.join(", ")}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) })}
                                                                        className="bg-black/40 border-border/40 text-xs"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Constraints (One per line)</Label>
                                                                <Textarea
                                                                    placeholder="1 <= N <= 10^5&#10;Constraints help users optimize..."
                                                                    value={customProblemData.constraints.join("\n")}
                                                                    onChange={e => setCustomProblemData({ ...customProblemData, constraints: e.target.value.split("\n").filter(c => c) })}
                                                                    className="bg-black/40 border-border/40 h-20 text-xs font-mono"
                                                                />
                                                            </div>

                                                            <Separator className="bg-border/20" />

                                                            {/* Public Test Cases */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-sm font-bold text-white uppercase tracking-wider">Public Test Cases</Label>
                                                                        <p className="text-[10px] text-muted-foreground uppercase">Visible to users during solve</p>
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-[10px] border-primary/20 text-primary hover:bg-primary/10"
                                                                        onClick={() => setCustomProblemData(prev => ({
                                                                            ...prev,
                                                                            test_cases: [...prev.test_cases, { input: "", output: "", isHidden: false }]
                                                                        }))}
                                                                        type="button"
                                                                    >
                                                                        <Plus className="w-3 h-3 mr-1" /> Add Public Case
                                                                    </Button>
                                                                </div>
                                                                <div className="grid gap-3">
                                                                    {customProblemData.test_cases.map((tc, idx) => (
                                                                        <div key={idx} className="flex gap-2 p-3 bg-black/20 border border-border/10 rounded-lg group animate-in fade-in slide-in-from-right-2 duration-200">
                                                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-[9px] text-muted-foreground uppercase">Input</Label>
                                                                                    <Textarea
                                                                                        value={tc.input}
                                                                                        onChange={e => {
                                                                                            const newTCs = [...customProblemData.test_cases];
                                                                                            newTCs[idx].input = e.target.value;
                                                                                            setCustomProblemData({ ...customProblemData, test_cases: newTCs });
                                                                                        }}
                                                                                        className="h-16 text-[10px] font-mono bg-black/40"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-[9px] text-muted-foreground uppercase">Output</Label>
                                                                                    <Textarea
                                                                                        value={tc.output}
                                                                                        onChange={e => {
                                                                                            const newTCs = [...customProblemData.test_cases];
                                                                                            newTCs[idx].output = e.target.value;
                                                                                            setCustomProblemData({ ...customProblemData, test_cases: newTCs });
                                                                                        }}
                                                                                        className="h-16 text-[10px] font-mono bg-black/40"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 self-center"
                                                                                onClick={() => {
                                                                                    setCustomProblemData(prev => ({
                                                                                        ...prev,
                                                                                        test_cases: prev.test_cases.filter((_, i) => i !== idx)
                                                                                    }));
                                                                                }}
                                                                                type="button"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <Separator className="bg-border/20" />

                                                            {/* Hidden Test Cases */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-sm font-bold text-white uppercase tracking-wider">Hidden Test Cases (Judge)</Label>
                                                                        <p className="text-[10px] text-muted-foreground uppercase">Used for scoring • Recommend at least 5-10</p>
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-[10px] border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                                                                        onClick={() => setCustomProblemData(prev => ({
                                                                            ...prev,
                                                                            hidden_test_cases: [...prev.hidden_test_cases, { input: "", output: "", description: "Secret case", points: 10 }]
                                                                        }))}
                                                                        type="button"
                                                                    >
                                                                        <LockIcon className="w-3 h-3 mr-1" /> Add Secret Case
                                                                    </Button>
                                                                </div>
                                                                <div className="grid gap-3">
                                                                    {customProblemData.hidden_test_cases.map((tc, idx) => (
                                                                        <div key={idx} className="flex gap-2 p-3 bg-black/20 border border-border/10 rounded-lg group animate-in fade-in slide-in-from-right-2 duration-300">
                                                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-[9px] text-muted-foreground uppercase">Input</Label>
                                                                                    <Textarea
                                                                                        value={tc.input}
                                                                                        onChange={e => {
                                                                                            const newTCs = [...customProblemData.hidden_test_cases];
                                                                                            newTCs[idx].input = e.target.value;
                                                                                            setCustomProblemData({ ...customProblemData, hidden_test_cases: newTCs });
                                                                                        }}
                                                                                        className="h-16 text-[10px] font-mono bg-black/40"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-[9px] text-muted-foreground uppercase">Output</Label>
                                                                                    <Textarea
                                                                                        value={tc.output}
                                                                                        onChange={e => {
                                                                                            const newTCs = [...customProblemData.hidden_test_cases];
                                                                                            newTCs[idx].output = e.target.value;
                                                                                            setCustomProblemData({ ...customProblemData, hidden_test_cases: newTCs });
                                                                                        }}
                                                                                        className="h-16 text-[10px] font-mono bg-black/40"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col gap-2 justify-center italic text-xs text-muted-foreground px-2 border-l border-border/5">
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="text-[10px] font-bold">PTS:</span>
                                                                                    <Input
                                                                                        type="number"
                                                                                        className="h-6 w-12 text-[10px] bg-black/40 border-border/10 p-1"
                                                                                        value={tc.points}
                                                                                        onChange={e => {
                                                                                            const newTCs = [...customProblemData.hidden_test_cases];
                                                                                            newTCs[idx].points = parseInt(e.target.value);
                                                                                            setCustomProblemData({ ...customProblemData, hidden_test_cases: newTCs });
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 self-center"
                                                                                onClick={() => {
                                                                                    setCustomProblemData(prev => ({
                                                                                        ...prev,
                                                                                        hidden_test_cases: prev.hidden_test_cases.filter((_, i) => i !== idx)
                                                                                    }));
                                                                                }}
                                                                                type="button"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <Separator className="bg-border/20" />

                                                            <div className="grid grid-cols-3 gap-4 pb-12">
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Score</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={customProblemData.score}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, score: parseInt(e.target.value) })}
                                                                        className="bg-black/40 border-border/40"
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Limit (s)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={customProblemData.timeLimit}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, timeLimit: parseFloat(e.target.value) })}
                                                                        className="bg-black/40 border-border/40"
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Memory (MB)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={customProblemData.memoryLimit}
                                                                        onChange={e => setCustomProblemData({ ...customProblemData, memoryLimit: parseInt(e.target.value) })}
                                                                        className="bg-black/40 border-border/40"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </ScrollArea>

                                                <DialogFooter className="sticky bottom-0 bg-[#111111] pt-4 border-t border-border/20 mt-4">
                                                    <Button variant="outline" onClick={() => setIsAddingCustom(false)} className="border-border/40 hover:bg-white/5">Cancel</Button>
                                                    <Button onClick={handleAddCustomProblem} className="bg-primary text-black hover:bg-primary/90 font-bold px-8">Save Custom Problem</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Assigned Problems List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Selected Problems ({formData.problems.length})</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase">Drag to reorder (Coming Soon)</p>
                                        </div>

                                        {formData.problems.length === 0 ? (
                                            <div className="p-12 text-center border-2 border-dashed border-border/20 rounded-xl bg-black/20">
                                                <div className="w-12 h-12 rounded-full bg-border/20 flex items-center justify-center mx-auto mb-4">
                                                    <ListChecks className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-sm font-bold text-muted-foreground">No problems assigned yet</h3>
                                                <p className="text-xs text-muted-foreground/60 mt-1">Search and select problems or create a custom one.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {formData.problems.map((prob, index) => (
                                                    <Card key={prob.id} className="bg-black/40 border-border/40 overflow-hidden">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex gap-4 flex-1">
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-border/20 flex items-center justify-center text-xs font-bold shrink-0">
                                                                        {index + 1}
                                                                    </div>
                                                                    <div className="flex-1 space-y-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <h4 className="font-bold text-sm text-white">{prob.title}</h4>
                                                                                    {prob.isCustom && (
                                                                                        <Badge className="bg-primary/20 text-primary border-primary/20 text-[8px] h-3.5 px-1 font-black">
                                                                                            CUSTOM
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <Badge variant="outline" className="mt-1 text-[9px] h-4 uppercase border-white/10 opacity-60">
                                                                                    {prob.difficulty}
                                                                                </Badge>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeProblem(prob.id)}
                                                                                className="h-8 w-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>

                                                                        <div className="grid grid-cols-3 gap-6">
                                                                            <div className="space-y-1.5">
                                                                                <Label className="text-[10px] text-muted-foreground uppercase">Points</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={prob.score}
                                                                                    onChange={(e) => updateProblemSettings(prob.id, "score", parseInt(e.target.value))}
                                                                                    className="h-8 text-xs bg-black/20"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <Label className="text-[10px] text-muted-foreground uppercase">Time Limit (Sec)</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={prob.timeLimit}
                                                                                    onChange={(e) => updateProblemSettings(prob.id, "timeLimit", parseFloat(e.target.value))}
                                                                                    className="h-8 text-xs bg-black/20"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <Label className="text-[10px] text-muted-foreground uppercase">Memory (MB)</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={prob.memoryLimit}
                                                                                    onChange={(e) => updateProblemSettings(prob.id, "memoryLimit", parseInt(e.target.value))}
                                                                                    className="h-8 text-xs bg-black/20"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 4. Scoring System */}
                            {activeTab === "scoring" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-4">
                                        <Label>Scoring Mode</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: "FULL_SCORE", label: "Full Score Only", desc: "Points only if all testcases pass" },
                                                { id: "PARTIAL", label: "Partial Scoring", desc: "Points per testcase passed" },
                                                { id: "ICPC", label: "ICPC Style", desc: "Time based penalty for incorrect submissions" },
                                                { id: "CUSTOM", label: "Custom Weighted", desc: "Define per-problem weights" },
                                            ].map((option) => (
                                                <div
                                                    key={option.id}
                                                    onClick={() => handleInputChange("root", "scoringMode", option.id)}
                                                    className={cn(
                                                        "p-4 rounded-xl border cursor-pointer transition-all",
                                                        formData.scoringMode === option.id
                                                            ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                                                            : "bg-black/20 border-border/40 hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={cn("font-bold text-sm", formData.scoringMode === option.id ? "text-primary" : "text-white")}>
                                                            {option.label}
                                                        </span>
                                                        {formData.scoringMode === option.id && <Target className="w-4 h-4 text-primary" />}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 5. Security Settings */}
                            {activeTab === "security" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-primary flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4" /> Strict Proctoring Mode
                                            </h3>
                                            <p className="text-xs text-muted-foreground">Enable comprehensive anti-cheat measures</p>
                                        </div>
                                        <Switch
                                            checked={formData.strictMode}
                                            onCheckedChange={(checked) => handleInputChange("root", "strictMode", checked)}
                                        />
                                    </div>

                                    {formData.strictMode && (
                                        <div className="grid gap-4 pl-4 border-l-2 border-border/20">
                                            {Object.entries(formData.strictOptions).map(([key, enabled]) => (
                                                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-border/40">
                                                    <span className="text-sm font-medium capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <Switch
                                                        checked={enabled as boolean}
                                                        onCheckedChange={(val) => handleInputChange("strictOptions", key, val)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 6. Leaderboard Settings */}
                            {activeTab === "leaderboard" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label>Ranking Logic</Label>
                                            <Select
                                                value={formData.rankingBasedOn}
                                                onValueChange={(val) => handleInputChange("root", "rankingBasedOn", val)}
                                            >
                                                <SelectTrigger className="bg-black/20 border-border/40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-border/40">
                                                    <SelectItem value="SCORE">Score Only</SelectItem>
                                                    <SelectItem value="SCORE_TIME">Score + Time (Standard)</SelectItem>
                                                    <SelectItem value="SCORE_PENALTY">Score + Penalty (ICPC)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Freeze Leaderboard</Label>
                                                <p className="text-xs text-muted-foreground">Stop updates near the end to keep suspense</p>
                                            </div>
                                            <Switch
                                                checked={formData.freezeLeaderboard}
                                                onCheckedChange={(checked) => handleInputChange("root", "freezeLeaderboard", checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Reveal After Contest</Label>
                                                <p className="text-xs text-muted-foreground">Make ranks public when finished</p>
                                            </div>
                                            <Switch
                                                checked={formData.revealAfterContest}
                                                onCheckedChange={(checked) => handleInputChange("root", "revealAfterContest", checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 7. Company Mapping */}
                            {activeTab === "company" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid gap-6">
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-blue-400">
                                            <Building2 className="w-5 h-5 shrink-0" />
                                            <p className="text-sm">This section is only active because you selected <b>Company Specific</b> type.</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Select Company</Label>
                                            <Select
                                                value={formData.companyDetails.name}
                                                onValueChange={(val) => handleInputChange("companyDetails", "name", val)}
                                            >
                                                <SelectTrigger className="bg-black/20 border-border/40">
                                                    <SelectValue placeholder="Select target company" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-border/40">
                                                    {companies?.map((company: any) => (
                                                        <SelectItem key={company.id || company._id} value={company.name}>
                                                            <div className="flex items-center gap-2">
                                                                {company.logo && <img src={company.logo} className="w-4 h-4 object-contain grayscale" />}
                                                                {company.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Target Role</Label>
                                            <Input
                                                placeholder="e.g. SDE-1, Intern, Data Scientist"
                                                value={formData.companyDetails.role}
                                                onChange={(e) => handleInputChange("companyDetails", "role", e.target.value)}
                                                className="bg-black/20 border-border/40"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Company Readiness Weight %</Label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="number"
                                                    placeholder="100"
                                                    value={formData.companyDetails.readinessWeight}
                                                    onChange={(e) => handleInputChange("companyDetails", "readinessWeight", parseInt(e.target.value))}
                                                    className="w-24 bg-black/20 border-border/40"
                                                />
                                                <span className="text-xs text-muted-foreground">Impact on readiness score</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 8. Advanced */}
                            {activeTab === "advanced" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-purple-400" /> AI Analysis Features
                                            </h3>
                                            <div className="grid gap-4">
                                                {Object.entries(formData.aiAnalysis).map(([key, enabled]) => (
                                                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-border/40">
                                                        <span className="text-sm font-medium capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <Switch
                                                            checked={enabled as boolean}
                                                            onCheckedChange={(val) => handleInputChange("aiAnalysis", key, val)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator className="bg-border/20" />

                                        <div>
                                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                                <Badge className="bg-green-500/20 text-green-500 border-0">TAGS</Badge> Performance Tagging
                                            </h3>
                                            <p className="text-xs text-muted-foreground mb-4">Auto-assign tags to users based on performance in this contest.</p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.performanceTagging.tags.map(tag => (
                                                    <Badge key={tag} variant="outline" className="gap-1 border-primary/30 text-primary">
                                                        {tag} <Trash2 className="w-3 h-3 opacity-50 cursor-pointer" />
                                                    </Badge>
                                                ))}
                                                <Badge variant="outline" className="gap-1 border-dashed cursor-pointer hover:bg-white/5">
                                                    <Plus className="w-3 h-3" /> Add Tag
                                                </Badge>
                                            </div>
                                        </div>

                                        <Separator className="bg-border/20" />

                                        <div className="pt-4 pb-8">
                                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col items-center text-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Save className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold text-white">Ready to Publish?</h3>
                                                    <p className="text-sm text-muted-foreground max-w-xs">Confirm all settings and problems. Once created, the contest will be visible to students.</p>
                                                </div>
                                                <Button
                                                    onClick={() => handleSaveContest("UPCOMING")}
                                                    disabled={isSaving}
                                                    className="w-full max-w-sm h-12 bg-primary text-black hover:bg-primary/90 font-black text-base transition-all active:scale-[0.98]"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                            Creating Contest...
                                                        </>
                                                    ) : (
                                                        "CREATE CONTEST NOW"
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
};

export default CreateContestForm;

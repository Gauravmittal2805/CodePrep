
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    PlusCircle, Search, Settings, ShieldAlert, BarChart3, Users, FileText, CheckCircle,
    Code, Mic, Play
} from "lucide-react";

import QuestionGeneratorPanel from "./QuestionGeneratorPanel";

interface AdminInterviewPanelProps {
    activeView: string;
}

export default function AdminInterviewPanel({ activeView }: AdminInterviewPanelProps) {
    // Default to "questions" tab if view is not "Create Interview Rooms"
    const isCreateMode = activeView === "Create Interview Rooms";
    const [scheduleType, setScheduleType] = useState("instant");
    const [interviewType, setInterviewType] = useState("coding");
    const [questionSource, setQuestionSource] = useState("auto");
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Manual curation state
    const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);

    // Company Tag State
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [customCompany, setCustomCompany] = useState("");

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5001/api/companies", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setCompanies(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch companies", err);
            }
        };
        fetchCompanies();
    }, []);

    const handleLaunch = async () => {
        if (!title) {
            alert("Please enter an interview title");
            return;
        }

        // Determine final company tag
        const finalCompany = selectedCompany === 'custom' ? customCompany : selectedCompany;
        if (!finalCompany) {
            alert("Please select or enter a company tag");
            return;
        }

        // Validation for manual curation
        if (questionSource === 'manual_curated' && selectedQuestions.length === 0) {
            alert("Please generate and select at least one question for the curated list.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                title,
                companyTag: finalCompany,
                type: interviewType,
                scheduleType,
                questions: questionSource === 'manual_curated' ? selectedQuestions : undefined,
                config: {
                    questionSource: questionSource === 'manual_curated' ? 'manual' : questionSource, // Map curated to manual for backend logic compatibility if needed, or keep distinct
                    difficulty: "adaptive" // Default
                }
            };

            const res = await fetch("http://localhost:5001/api/interviews/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                alert(`Interview Room Created Successfully!\nID: ${data.interview._id}`);
            } else {
                alert("Failed to create room: " + (data.message || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/10 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isCreateMode ? "Create Interview Room" : "Interview Lobby Control"}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        {isCreateMode
                            ? "Configure a new AI-driven interview session with specific parameters."
                            : "Manage question banks, AI behavior, and analytics."}
                    </p>
                </div>
                {!isCreateMode && (
                    <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        <PlusCircle className="w-4 h-4" />
                        New Room
                    </Button>
                )}
            </div>

            {isCreateMode ? (
                <div className="space-y-8">
                    {/* 1. Basic Information */}
                    <Card className="bg-[#111111] border-border/40">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Define the core details of the interview session.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Interview Title</Label>
                                <Input
                                    placeholder="e.g. Microsoft Technical Round – Feb Batch"
                                    className="bg-black/20"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Company Tag</Label>
                                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue placeholder="Select Company Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map((c) => (
                                            <SelectItem key={c._id || c.name} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                                {selectedCompany === 'custom' && (
                                    <div className="pt-2 animate-in fade-in">
                                        <Input
                                            placeholder="Enter Custom Company Name"
                                            className="bg-black/20"
                                            value={customCompany}
                                            onChange={(e) => setCustomCompany(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Interview Type</Label>
                                <Select value={interviewType} onValueChange={setInterviewType}>
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="coding">Coding Screening</SelectItem>
                                        <SelectItem value="technical">Technical Round</SelectItem>
                                        <SelectItem value="system">System Design</SelectItem>
                                        <SelectItem value="hr">HR Round</SelectItem>
                                        <SelectItem value="behavioral">Behavioral Round</SelectItem>
                                        <SelectItem value="communication">Communication Test</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Schedule</Label>
                                <Select defaultValue="instant" onValueChange={setScheduleType}>
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instant">Instant (Open Now)</SelectItem>
                                        <SelectItem value="scheduled">Scheduled Date & Time</SelectItem>
                                    </SelectContent>
                                </Select>
                                {scheduleType === 'scheduled' && (
                                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                        <Label className="text-xs text-muted-foreground mb-1.5 block">Start Date & Time</Label>
                                        <Input type="datetime-local" className="bg-black/20" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Duration</Label>
                                <Select defaultValue="60">
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">30 Minutes</SelectItem>
                                        <SelectItem value="45">45 Minutes</SelectItem>
                                        <SelectItem value="60">60 Minutes</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Candidate Access Control */}
                    <Card className="bg-[#111111] border-border/40">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle>Candidate Access Control</CardTitle>
                                    <CardDescription>Manage who can enter the interview room.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Access Type</Label>
                                <Select defaultValue="private">
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public Room (Anyone can join)</SelectItem>
                                        <SelectItem value="private">Private Room (Invite Link Only)</SelectItem>
                                        <SelectItem value="batch">Batch Restricted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Max Participants Limit</Label>
                                <Input type="number" placeholder="Enter limit (e.g. 100)" className="bg-black/20" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Question Configuration */}
                    <Card className="bg-[#111111] border-border/40">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <Code className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle>Question Configuration</CardTitle>
                                    <CardDescription>Set up the question bank and difficulty.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Question Source</Label>
                                    <Select value={questionSource} onValueChange={setQuestionSource}>
                                        <SelectTrigger className="bg-black/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto Generate by AI</SelectItem>
                                            <SelectItem value="manual_curated">AI Assisted (Curated)</SelectItem>
                                            <SelectItem value="manual_upload">Manual Question Bank Upload</SelectItem>
                                            <SelectItem value="resume">Resume-Based Questioning</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {questionSource === 'manual_upload' && (
                                        <div className="pt-2 animate-in fade-in">
                                            <Label className="text-xs text-muted-foreground mb-1.5 block">Upload Question Bank (PDF)</Label>
                                            <Input type="file" accept=".pdf" className="bg-black/20 cursor-pointer text-sm file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2 file:py-1 hover:file:bg-primary/90" />
                                        </div>
                                    )}
                                    {questionSource === 'auto' && (
                                        <div className="pt-2 animate-in fade-in">
                                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-blue-400">
                                                AI will automatically generate <strong>{interviewType}</strong> questions when the interview starts based on the candidate profile.
                                            </div>
                                        </div>
                                    )}
                                    {questionSource === 'manual_curated' && (
                                        <div className="pt-2 animate-in fade-in space-y-4">
                                            <QuestionGeneratorPanel
                                                // @ts-ignore
                                                onConfirm={(qs) => setSelectedQuestions(qs)}
                                                baseConfig={{ type: interviewType, company: selectedCompany === 'custom' ? customCompany : selectedCompany }}
                                                triggerLabel={selectedQuestions.length > 0 ? "Generate More / Edit Selection" : "Open Question Generator Panel"}
                                            />

                                            {selectedQuestions.length > 0 && (
                                                <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-green-500 uppercase tracking-wider">
                                                            {selectedQuestions.length} Questions Selected
                                                        </span>
                                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-red-500" onClick={() => setSelectedQuestions([])}>
                                                            Clear
                                                        </Button>
                                                    </div>
                                                    <ul className="space-y-1 max-h-32 overflow-y-auto text-xs text-muted-foreground custom-scrollbar pr-2">
                                                        {selectedQuestions.map((q: any, i) => (
                                                            <li key={i} className="flex gap-2">
                                                                <span className="text-green-500">•</span>
                                                                <span className="truncate">{q.text}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty Control</Label>
                                    <Select defaultValue="adaptive">
                                        <SelectTrigger className="bg-black/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="hard">Hard</SelectItem>
                                            <SelectItem value="adaptive">Adaptive Mode (Dynamic)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-black/20 border border-border/10">
                                <Label className="mb-4 block text-sm font-semibold text-muted-foreground uppercase tracking-wider">Follow-Up Mode</Label>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">AI Follow-up Questions</Label>
                                            <p className="text-xs text-muted-foreground">Automatically ask follow-ups based on answer</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Cross-questioning</Label>
                                            <p className="text-xs text-muted-foreground">Challenge the candidate's assumptions</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Deep Probing</Label>
                                            <p className="text-xs text-muted-foreground">Ask for deep technical explanations</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Evaluation Settings */}
                    <Card className="bg-[#111111] border-border/40">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle>Evaluation Settings</CardTitle>
                                    <CardDescription>Configure how the candidate is scored.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Communication Evaluation */}
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Mic className="w-4 h-4 text-blue-400" /> Communication
                                </h4>
                                <div className="bg-black/20 p-4 rounded-lg space-y-3">
                                    {["Pronunciation Analysis", "Vocabulary Score", "Filler Word Detection", "Confidence Score"].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox id={item} defaultChecked />
                                            <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{item}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Technical Evaluation */}
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Code className="w-4 h-4 text-amber-400" /> Technical
                                </h4>
                                <div className="bg-black/20 p-4 rounded-lg space-y-3">
                                    {["Code Quality Check", "Optimization Check", "Time Complexity Detection", "Plagiarism Check"].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox id={item} defaultChecked />
                                            <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{item}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Integrity Rules */}
                            <div className="md:col-span-2 space-y-4 mt-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-500" /> Integrity Rules
                                </h4>
                                <div className="bg-black/20 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Camera Mandatory</Label>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Mic Mandatory</Label>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tab Switch Allowed</Label>
                                            <Select defaultValue="3">
                                                <SelectTrigger className="bg-black/40 h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">0 (Strict)</SelectItem>
                                                    <SelectItem value="1">1</SelectItem>
                                                    <SelectItem value="2">2</SelectItem>
                                                    <SelectItem value="3">3</SelectItem>
                                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Multiple Face Detection</Label>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Background Noise Alert</Label>
                                            <Switch />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-red-400">Auto Disqualify on Violation</Label>
                                            <Switch />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Violation Message Customization</Label>
                                        <Textarea placeholder="Switching tabs is not allowed during the interview." className="bg-black/40" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. AI Behavior Settings */}
                    <Card className="bg-[#111111] border-border/40">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle>AI Behavior Settings</CardTitle>
                                    <CardDescription>Determine the personality and tone of the interviewer.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Interviewer Mode</Label>
                                <Select defaultValue="corporate">
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="strict">Strict Mode</SelectItem>
                                        <SelectItem value="friendly">Friendly Mode</SelectItem>
                                        <SelectItem value="corporate">Corporate Mode</SelectItem>
                                        <SelectItem value="rapid">Rapid Fire Mode</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Custom Greeting</Label>
                                <Input placeholder="Welcome to your technical interview. Please introduce yourself." className="bg-black/20" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 6. Feedback Report Configuration */}
                    <Card className="bg-[#111111] border-border/40">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle>Feedback Report Configuration</CardTitle>
                                    <CardDescription>Select what the candidate sees after the interview.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {["Overall Score", "Round-wise Score", "Strength Areas", "Weak Areas", "Suggested Topics", "Recording Download", "AI Transcript View"].map((item) => (
                                    <div key={item} className="flex items-center space-x-2 bg-black/20 p-3 rounded-lg border border-border/10">
                                        <Switch id={`report-${item}`} defaultChecked />
                                        <Label htmlFor={`report-${item}`} className="cursor-pointer">{item}</Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bonus Features */}
                    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle>Advanced Features</CardTitle>
                                    <CardDescription>Enable premium readiness checks.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Resume Upload Required</Label>
                                    <p className="text-xs text-muted-foreground">AI will generate questions from resume</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Interview Readiness Index</Label>
                                    <p className="text-xs text-muted-foreground">Award badge if score &gt; threshold</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input type="number" defaultValue="70" className="w-16 h-8 text-center" />
                                    <span className="text-sm">%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline" className="h-12 w-32">Cancel</Button>
                        <Button
                            onClick={handleLaunch}
                            disabled={isLoading}
                            className="h-12 w-48 bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2"
                        >
                            {isLoading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : (
                                <Play className="w-4 h-4 fill-current" />
                            )}
                            {isLoading ? "creating..." : "Launch Room"}
                        </Button>
                    </div>
                </div>
            ) : (
                <Tabs defaultValue="questions" className="space-y-6">
                    <TabsList className="bg-black/40 p-1 border border-border/40 rounded-lg">
                        <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-foreground">
                            <FileText className="w-4 h-4 mr-2" />
                            Question Bank
                        </TabsTrigger>
                        <TabsTrigger value="config" className="data-[state=active]:bg-primary data-[state=active]:text-foreground">
                            <Settings className="w-4 h-4 mr-2" />
                            AI Configuration
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-foreground">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Interview Analytics
                        </TabsTrigger>
                    </TabsList>

                    {/* Question Bank Tab */}
                    <TabsContent value="questions" className="space-y-6">
                        <Card className="bg-[#111111] border-border/40">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Question Repository</CardTitle>
                                    <CardDescription>Add and manage interview questions by category.</CardDescription>
                                </div>
                                <Button className="gap-2">
                                    <PlusCircle className="w-4 h-4" />
                                    Add Question
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="Search questions..." className="pl-9 bg-black/20" />
                                    </div>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="coding">Coding</SelectItem>
                                            <SelectItem value="behavioral">Behavioral</SelectItem>
                                            <SelectItem value="system">System Design</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { q: "Design a scalable URL shortener like TinyURL.", type: "System Design", level: "Hard", company: "Google" },
                                        { q: "Explain the Virtual DOM in React.", type: "Technical", level: "Medium", company: "Meta" },
                                        { q: "Tell me about a time you failed.", type: "Behavioral", level: "Easy", company: "Amazon" },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-black/20 p-4 rounded-lg border border-white/5 flex justify-between items-start hover:border-border/40 transition-colors">
                                            <div>
                                                <h4 className="font-medium text-foreground mb-1">{item.q}</h4>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                                                    <Badge variant="outline" className="text-[10px]">{item.company}</Badge>
                                                </div>
                                            </div>
                                            <Badge className={item.level === "Hard" ? "bg-red-500/10 text-red-500" : item.level === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}>
                                                {item.level}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Configuration Tab (Simplified for view) */}
                    <TabsContent value="config" className="space-y-6">
                        <Card className="bg-[#111111] border-border/40">
                            <CardHeader><CardTitle>Global AI Configuration</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">Manage global presets for AI behavior here.</p></CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Total Interviews", value: "1,248", icon: Users, color: "text-blue-500" },
                                { label: "Avg. Pass Rate", value: "68%", icon: CheckCircle, color: "text-green-500" },
                                { label: "Flagged Sessions", value: "12", icon: ShieldAlert, color: "text-red-500" },
                            ].map((stat, i) => (
                                <Card key={i} className="bg-[#111111] border-border/40">
                                    <CardContent className="pt-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                        </div>
                                        <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

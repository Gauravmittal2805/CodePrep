import React, { useState, useEffect } from "react";
import {
    Briefcase,
    Clock,
    Shield,
    ChevronRight,
    Play,
    AlertCircle,
    Building2,
    Calendar,
    Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MockOA {
    _id: string;
    title: string;
    company: string;
    role: string;
    duration: number;
    questions: any[];
    difficulty: string;
    companyLogo?: string;
}

const UserMockOAList: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mockOAs, setMockOAs] = useState<MockOA[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMockOAs = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await fetch('http://localhost:5001/api/mockoa/list', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setMockOAs(result.data);
                }
            } catch (error) {
                console.error("Error fetching Mock OAs:", error);
                toast.error("Failed to load assessments");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchMockOAs();
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const token = await user?.getIdToken();
            const response = await fetch('http://localhost:5001/api/mockoa/user/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setHistory(result.data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const handleStartOA = (oaId: string) => {
        navigate(`/mockoa/attempt/${oaId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Briefcase className="w-6 h-6 text-purple-400" />
                        </div>
                        Company Mock Assessments
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">Simulate real company hiring assessments with timed coding tests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{mockOAs.length} Available</span>
                    </div>
                </div>
            </div>

            {mockOAs.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border-2 border-dashed border-border/20 bg-black/20">
                    <AlertCircle className="w-12 h-12 text-muted-foreground/20" />
                    <p className="text-muted-foreground">No active Mock OAs available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockOAs.map((oa) => (
                        <Card key={oa._id} className="bg-[#111111] border-white/5 hover:border-purple-500/30 transition-all group overflow-hidden relative">
                            {/* Decorative Background Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />

                            <CardHeader className="pb-4 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                                            {oa.companyLogo ? (
                                                <img src={oa.companyLogo} alt={oa.company} className="w-6 h-6 object-contain" />
                                            ) : (
                                                <Building2 className="w-5 h-5 text-purple-400" />
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold group-hover:text-purple-400 transition-colors">{oa.company}</CardTitle>
                                            <CardDescription className="text-xs">{oa.role}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-0 font-bold text-[10px]">
                                        {oa.difficulty || "Medium"}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between text-sm py-3 px-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground font-medium">Duration:</span>
                                    </div>
                                    <span className="text-white font-bold">{oa.duration} Minutes</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Questions</p>
                                        <p className="text-lg font-bold text-white">{oa.questions.length}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Avg. Time</p>
                                        <p className="text-lg font-bold text-white">{Math.floor(oa.duration / oa.questions.length)}m / Q</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <Shield className="w-3.5 h-3.5" />
                                        Assessment Security
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-[9px] bg-green-500/5 text-green-500/70 border-green-500/10">Full Screen</Badge>
                                        <Badge variant="outline" className="text-[9px] bg-blue-500/5 text-blue-500/70 border-blue-500/10">Anti-Cheat</Badge>
                                        <Badge variant="outline" className="text-[9px] bg-purple-500/5 text-purple-400/70 border-purple-500/10">Timed</Badge>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleStartOA(oa._id)}
                                    className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl gap-2 group/btn"
                                >
                                    <Play className="w-4 h-4 fill-white group-hover/btn:scale-110 transition-transform" />
                                    Start Assessment
                                    <ChevronRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Assessment History Section */}
            <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        Past Attempts
                    </h3>
                    {history.length > 0 && (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{history.length} Attempts recorded</span>
                    )}
                </div>

                {history.length === 0 ? (
                    <Card className="bg-[#111111] border-white/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Trophy className="w-12 h-12 opacity-10 mb-4" />
                                <p className="text-sm">You haven't attempted any mock assessments yet.</p>
                                <Button variant="link" className="text-purple-400 text-xs">View Mock OA Guide</Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {history.map((attempt) => {
                            const solvedCount = attempt.submissions.filter((s: any) => s.status === 'AC').length;
                            const totalQuestions = attempt.submissions.length;

                            return (
                                <div key={attempt._id} className="group relative bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-purple-500/20 transition-all overflow-hidden">
                                            {attempt.companyLogo ? (
                                                <img src={attempt.companyLogo} alt={attempt.mockOAId?.company} className="w-7 h-7 object-contain" />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{attempt.mockOAId?.company || 'Unknown Company'}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <span>{attempt.mockOAId?.title}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Solved</div>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-lg font-black text-white">{solvedCount}</span>
                                                <span className="text-xs text-muted-foreground">/ {totalQuestions}</span>
                                            </div>
                                        </div>

                                        <div className="text-right min-w-[80px]">
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Score</div>
                                            <div className={cn(
                                                "text-lg font-black",
                                                attempt.score >= 80 ? "text-green-400" : attempt.score >= 50 ? "text-yellow-400" : "text-rose-400"
                                            )}>
                                                {attempt.score}%
                                            </div>
                                        </div>

                                        <div className="h-10 w-[1px] bg-white/5 hidden md:block" />

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-purple-500/10 hover:text-purple-400 group-hover:border-purple-500/20"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserMockOAList;

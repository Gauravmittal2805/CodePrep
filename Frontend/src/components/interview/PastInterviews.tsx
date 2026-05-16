import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Clock, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

const PastInterviews = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await axios.get("http://localhost:5001/api/ai/history", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setSessions(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
                setError("Could not load your interview history.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchHistory();
    }, [user]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Syncing your results...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <AlertCircle className="w-10 h-10 text-red-500/50" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="bg-secondary/10 border-border/50 overflow-hidden">
                <CardHeader className="border-b border-border/30 bg-secondary/5">
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>Review your performance and detailed AI feedback</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/30">
                        {sessions.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center gap-4">
                                <BarChart3 className="w-12 h-12 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground font-medium">No interviews recorded yet.</p>
                                <Button variant="link" onClick={() => window.location.reload()}>Refresh List</Button>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div key={session._id} className="flex items-center justify-between p-6 hover:bg-secondary/10 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors border border-primary/5">
                                            <BarChart3 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-lg">{session.interviewType}</h4>
                                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter py-0 h-4 border-primary/20 text-primary">
                                                    {session.companyTag || 'General'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDate(session.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-lg font-black text-white">{session.aiReport?.overallScore || 0}%</div>
                                            <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Score</div>
                                        </div>
                                        <Badge 
                                            className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none ${
                                                (session.aiReport?.overallScore || 0) > 80 
                                                    ? "bg-green-500/10 text-green-500" 
                                                    : "bg-blue-500/10 text-blue-500"
                                            }`}
                                        >
                                            {session.aiReport?.overallScore > 80 ? "Excellent" : "Completed"}
                                        </Badge>
                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            onClick={() => navigate(`/interview/report/${session._id}`)}
                                            className="font-bold hover:bg-primary hover:text-black transition-all px-5 rounded-xl h-10"
                                        >
                                            View Report
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PastInterviews;

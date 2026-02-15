
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Clock, Play } from "lucide-react";

const PastInterviews = () => {
    const mockHistory = [
        { id: 1, type: "Coding Screening", date: "Today, 10:00 AM", score: 85, status: "Completed" },
        { id: 2, type: "System Design", date: "Yesterday, 2:00 PM", score: 72, status: "Analyzed" },
        { id: 3, type: "Behavioral", date: "Feb 10, 2024", score: 90, status: "Excellent" },
    ];

    return (
        <div className="space-y-6">
            <Card className="bg-secondary/20 border-border/50">
                <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>Review your performance and feedback</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockHistory.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{session.type}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {session.date}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-foreground">{session.score}%</div>
                                        <div className="text-xs text-muted-foreground">Score</div>
                                    </div>
                                    <Badge variant={session.score > 80 ? "default" : "secondary"}>
                                        {session.status}
                                    </Badge>
                                    <Button size="sm" variant="ghost">View Report</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PastInterviews;

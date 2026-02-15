
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const InterviewAnalytics = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-secondary/20 border-border/50">
                <CardHeader>
                    <CardTitle>Skill Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <label>Data Structures</label>
                            <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <label>System Design</label>
                            <span>60%</span>
                        </div>
                        <Progress value={60} className="h-2 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <label>Behavioral</label>
                            <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-secondary/20 border-border/50">
                <CardHeader>
                    <CardTitle>Weak Areas Identified</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="destructive">Dynamic Programming</Badge>
                        <Badge variant="destructive">Graph Traversals</Badge>
                        <Badge variant="outline">Scalability Principles</Badge>
                    </div>

                    <div className="mt-8 text-sm text-muted-foreground p-4 bg-background/50 rounded-lg">
                        <p>Based on your last 3 interviews, focus on optimizing recursive solutions and handling edge cases in array problems.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InterviewAnalytics;

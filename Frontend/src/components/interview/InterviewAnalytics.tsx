import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, BrainCircuit, Users, Layout, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const InterviewAnalytics = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await axios.get("https://codeprep-4-k73y.onrender.com/api/ai/history", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setSessions(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchHistory();
    }, [user]);

    const getRoundData = (type: string) => {
        return sessions
            .filter(s => {
                const sessionType = (s.interviewType || '').toLowerCase();
                const targetType = type.toLowerCase();
                return sessionType.includes(targetType) || targetType.includes(sessionType);
            })
            .reverse() // Oldest to newest for the graph
            .map((s, index) => ({
                name: `Session ${index + 1}`,
                score: s.aiReport?.overallScore || 0,
                date: new Date(s.createdAt).toLocaleDateString()
            }));
    };

    const categories = [
        { id: 'Technical', icon: BrainCircuit, color: '#22d3ee' },
        { id: 'Behavioral', icon: Users, color: '#818cf8' },
        { id: 'System Design', icon: Layout, color: '#f472b6' }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Crunching your performance data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Global Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Technical', val: Math.round(sessions.reduce((acc, s) => acc + (s.aiReport?.technicalScore || 0), 0) / (sessions.length || 1)), color: 'text-cyan-400' },
                    { label: 'Avg Communication', val: Math.round(sessions.reduce((acc, s) => acc + (s.aiReport?.communicationScore || 0), 0) / (sessions.length || 1)), color: 'text-indigo-400' },
                    { label: 'Avg Confidence', val: Math.round(sessions.reduce((acc, s) => acc + (s.aiReport?.confidenceScore || 0), 0) / (sessions.length || 1)), color: 'text-pink-400' },
                    { label: 'Total Rounds', val: sessions.length, color: 'text-white' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-white/5 border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.val}{stat.label !== 'Total Rounds' ? '%' : ''}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest opacity-40">{stat.label}</div>
                    </Card>
                ))}
            </div>

            {/* Round-wise Detailed Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {categories.map((cat) => {
                    const data = getRoundData(cat.id);
                    const avgScore = data.length > 0 
                        ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length)
                        : 0;

                    return (
                        <Card key={cat.id} className="bg-secondary/10 border-white/5 overflow-hidden group hover:border-white/10 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-black uppercase tracking-widest">{cat.id}</CardTitle>
                                            <CardDescription className="text-[10px]">Performance Trend</CardDescription>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black" style={{ color: cat.color }}>{avgScore}%</div>
                                        <div className="text-[8px] uppercase font-bold opacity-40">Avg Score</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-40 w-full mt-4">
                                    {data.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data}>
                                                <defs>
                                                    <linearGradient id={`color${cat.id}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={cat.color} stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor={cat.color} stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="name" hide />
                                                <YAxis domain={[0, 100]} hide />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                    itemStyle={{ color: cat.color, fontWeight: 'bold' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="score" 
                                                    stroke={cat.color} 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill={`url(#color${cat.id})`} 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 grayscale">
                                            <TrendingUp className="w-8 h-8 mb-2" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">No Data Yet</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Bottom Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-secondary/10 border-white/5 rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <Target className="w-4 h-4 text-cyan-400" /> Focus Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {sessions.some(s => s.aiReport?.overallScore < 70) ? (
                                <>
                                    <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-none px-4 py-1.5 text-[10px] font-bold">Deep Dive Algorithms</Badge>
                                    <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-none px-4 py-1.5 text-[10px] font-bold">System Optimization</Badge>
                                    <Badge variant="outline" className="border-white/10 px-4 py-1.5 text-[10px] font-bold">Behavioral STAR Framing</Badge>
                                </>
                            ) : (
                                <>
                                    <Badge className="bg-green-500/10 text-green-400 border-none px-4 py-1.5 text-[10px] font-bold">Excellent Consistency</Badge>
                                    <Badge variant="outline" className="border-white/10 px-4 py-1.5 text-[10px] font-bold">Mock Competition</Badge>
                                </>
                            )}
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                "Based on your recent trends, you are showing strong progress in **Behavioral** rounds. We recommend focusing on **System Design** patterns for your next session to balance your profile."
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-white/5 rounded-3xl overflow-hidden relative">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <TrendingUp className="w-4 h-4 text-cyan-400" /> Growth Trajectory
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center h-48 py-8">
                        <div className="text-6xl font-black text-cyan-400 mb-2">+{sessions.length > 1 ? Math.max(0, sessions[0].aiReport.overallScore - (sessions[sessions.length-1].aiReport.overallScore)) : 0}%</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Net Improvement</div>
                        <div className="mt-8 w-full max-w-[200px]">
                             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-cyan-400 animate-in slide-in-from-left duration-1000" style={{ width: '65%' }} />
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InterviewAnalytics;

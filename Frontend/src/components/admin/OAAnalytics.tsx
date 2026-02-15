import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Loader2, Users, CheckCircle2, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AnalyticsData {
    overview: {
        totalAttempts: number;
        avgScore: number;
        passRate: number;
        activeUsers: number;
    };
    timeSeriesData: { date: string; count: number }[];
    companyPerformance: { company: string; avgScore: number; attempts: number }[];
    weakTopics: { topic: string; count: number }[];
}

const OAAnalytics: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch('http://localhost:5001/api/mockoa/admin/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    toast.error('Failed to load analytics');
                }
            } catch (error) {
                console.error('Analytics fetch error:', error);
                toast.error('Failed to load analytics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">OA Analytics</h2>
                <p className="text-sm text-muted-foreground mt-1">Deep insights into user performance and assessment difficulty</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#111111] border-white/10 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Attempts</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{data.overview.totalAttempts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across {data.overview.activeUsers} unique users
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#111111] border-white/10 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Score</CardTitle>
                        <Target className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{data.overview.avgScore}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Average user performance
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#111111] border-white/10 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pass Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{data.overview.passRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Users scoring above 60%
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#111111] border-white/10 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weak Areas</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{data.weakTopics.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Common struggle topics identified
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                {/* Main Chart: Attempts Over Time */}
                <Card className="lg:col-span-4 bg-[#111111] border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-white uppercase tracking-wider">Activity Trends</CardTitle>
                        <CardDescription>Daily assessment attempts (Last 14 Days)</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.timeSeriesData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)' }}
                                        labelStyle={{ color: '#888888' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Side Chart: Company Performance */}
                <Card className="lg:col-span-3 bg-[#111111] border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-white uppercase tracking-wider">Performance by Company</CardTitle>
                        <CardDescription>Average scores across different assessments</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={data.companyPerformance} margin={{ left: 20 }}>
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis
                                        type="category"
                                        dataKey="company"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                    <Bar dataKey="avgScore" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weak Topics Analysis */}
            <Card className="bg-[#111111] border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-white uppercase tracking-wider">Common Struggle Areas</CardTitle>
                    <CardDescription>Topics where students most frequently lose marks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.weakTopics.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div>
                                    <div className="font-bold text-white text-sm">{item.topic}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Identified in {item.count} attempts</div>
                                </div>
                                <div className="text-xl font-black text-rose-500/50 group-hover:text-rose-500 transition-colors">
                                    #{idx + 1}
                                </div>
                            </div>
                        ))}
                        {data.weakTopics.length === 0 && (
                            <div className="col-span-4 text-center py-8 text-muted-foreground">
                                Not enough data to determine weak areas yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OAAnalytics;

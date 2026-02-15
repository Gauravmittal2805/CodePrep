import React, { useState, useEffect } from 'react';
import { Search, Loader2, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface OAAttempt {
    _id: string;
    user: {
        uid: string;
        fullName: string;
        email: string;
        photoURL?: string;
    };
    mockOA: {
        _id: string;
        title: string;
        company: string;
        role: string;
        logo?: string;
        color?: string;
    } | null;
    score: number;
    status: 'STARTED' | 'COMPLETED';
    startedAt: string;
    completedAt?: string;
    analysis?: {
        weakTopics: string[];
        strongTopics: string[];
    };
}

const UserOAAttempts: React.FC = () => {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<OAAttempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAttempts = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/mockoa/admin/attempts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAttempts(data.data);
            } else {
                toast.error(data.error || 'Failed to fetch attempts');
            }
        } catch (error) {
            console.error('Failed to fetch attempts:', error);
            toast.error('Failed to load user attempts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttempts();
    }, [user]);

    const filteredAttempts = attempts.filter(attempt =>
        attempt.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (attempt.mockOA?.company || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-500 bg-green-500/10 border-green-500/20';
        if (score >= 70) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        if (score >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">User Attempts</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track comprehensive user performance in Mock OAs</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search user or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64 bg-black/40 border-white/10"
                    />
                </div>
            </div>

            <Card className="bg-[#111111] border-white/10 overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/[0.02] border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Assessment</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {filteredAttempts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No formatted attempts found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttempts.map((attempt) => (
                                        <tr key={attempt._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                        {attempt.user.photoURL ? (
                                                            <img src={attempt.user.photoURL} alt={attempt.user.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{attempt.user.fullName}</div>
                                                        <div className="text-xs text-muted-foreground">{attempt.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {attempt.mockOA ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center p-1.5",
                                                            attempt.mockOA.logo ? "bg-white" : `bg-gradient-to-br ${attempt.mockOA.color || 'from-gray-700 to-gray-900'}`
                                                        )}>
                                                            {attempt.mockOA.logo ? (
                                                                <img src={attempt.mockOA.logo} alt={attempt.mockOA.company} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-white">{attempt.mockOA.company.substring(0, 2)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{attempt.mockOA.title}</div>
                                                            <div className="text-xs text-muted-foreground">{attempt.mockOA.company} • {attempt.mockOA.role}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground italic">Deleted Assessment</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={cn("font-bold", getScoreColor(attempt.score))}>
                                                    {attempt.score}%
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-xs text-muted-foreground">
                                                    <span className="text-white">{attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'N/A'}</span>
                                                    <span>{attempt.completedAt ? formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true }) : ''}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase font-bold">
                                                    Completed
                                                </Badge>
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
    );
};

export default UserOAAttempts;

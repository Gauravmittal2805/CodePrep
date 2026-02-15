import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Calendar, TrendingUp, Eye, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Company {
    _id: string;
    companyId: string;
    name: string;
    logo: string;
    color: string;
    aiGeneratedPattern?: any;
    patternLastGenerated?: Date;
}

const CompanyOAPatterns: React.FC = () => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [generatingFor, setGeneratingFor] = useState<string | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const fetchCompanies = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/companies', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCompanies(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            toast.error('Failed to load companies');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [user]);

    const generatePattern = async (companyId: string, forceRegenerate: boolean = false) => {
        if (!user) return;

        setGeneratingFor(companyId);
        try {
            const token = await user.getIdToken();
            const response = await fetch(
                `http://localhost:5001/api/company-patterns/${companyId}/generate-pattern`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ forceRegenerate })
                }
            );

            const data = await response.json();
            if (data.success) {
                toast.success(data.cached ? 'Loaded cached pattern' : 'Pattern generated successfully!');
                fetchCompanies(); // Refresh list
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error('Pattern generation error:', error);
            toast.error(error.message || 'Failed to generate pattern');
        } finally {
            setGeneratingFor(null);
        }
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Company OA Patterns</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage AI-generated assessment patterns for all companies</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                        {companies.length} Companies
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                        {companies.filter(c => c.aiGeneratedPattern).length} Generated
                    </Badge>
                </div>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => {
                    const hasPattern = !!company.aiGeneratedPattern;
                    const isGenerating = generatingFor === company.companyId;
                    const generatedAt = company.patternLastGenerated
                        ? new Date(company.patternLastGenerated)
                        : null;

                    return (
                        <Card key={company._id} className="bg-[#111111] border-white/10 overflow-hidden relative group hover:border-primary/20 transition-all">
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 opacity-20",
                                company.color
                            )} />

                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0",
                                        company.logo && company.logo.startsWith('http')
                                            ? "bg-white p-2"
                                            : `bg-gradient-to-br ${company.color}`
                                    )}>
                                        {company.logo && company.logo.startsWith('http') ? (
                                            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-white">{company.logo}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg font-bold text-white truncate">{company.name}</CardTitle>
                                        <CardDescription className="text-xs">
                                            {hasPattern ? (
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Pattern Generated
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <AlertCircle className="w-3 h-3" />
                                                    No Pattern
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {generatedAt && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-3 py-2 rounded-lg">
                                        <Calendar className="w-3 h-3" />
                                        Last: {generatedAt.toLocaleDateString()}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => generatePattern(company.companyId, false)}
                                        disabled={isGenerating}
                                        size="sm"
                                        className="flex-1 h-9 gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 font-bold text-xs shadow-lg shadow-blue-500/20"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3.5 h-3.5" />
                                                {hasPattern ? 'Regenerate' : 'Generate'}
                                            </>
                                        )}
                                    </Button>

                                    {hasPattern && (
                                        <Button
                                            onClick={() => setSelectedCompany(company)}
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-3 border-white/10"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Pattern Viewer Dialog */}
            {selectedCompany && selectedCompany.aiGeneratedPattern && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                                    selectedCompany.logo && selectedCompany.logo.startsWith('http')
                                        ? "bg-white p-2"
                                        : `bg-gradient-to-br ${selectedCompany.color}`
                                )}>
                                    {selectedCompany.logo && selectedCompany.logo.startsWith('http') ? (
                                        <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-white">{selectedCompany.logo}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedCompany.name} OA Pattern</h3>
                                    <p className="text-xs text-muted-foreground">AI-Generated Insights</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setSelectedCompany(null)}
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-white"
                            >
                                ✕
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Question Distribution */}
                            {selectedCompany.aiGeneratedPattern.questionDistribution && (
                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Question Distribution
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Total Questions</p>
                                            <p className="text-sm font-bold text-white">{selectedCompany.aiGeneratedPattern.questionDistribution.totalQuestions}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                                            <p className="text-xs font-semibold text-white">{selectedCompany.aiGeneratedPattern.questionDistribution.difficulty}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Time</p>
                                            <p className="text-xs font-semibold text-white">{selectedCompany.aiGeneratedPattern.questionDistribution.timeAllocation}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Topic Focus */}
                            {selectedCompany.aiGeneratedPattern.topicFocus && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-green-400">Topic Focus</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedCompany.aiGeneratedPattern.topicFocus.map((topic: any, idx: number) => (
                                            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-sm text-white">{topic.topic}</span>
                                                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                                                        {topic.percentage}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{topic.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Common Patterns */}
                            {selectedCompany.aiGeneratedPattern.commonPatterns && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-orange-400">Common Patterns</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCompany.aiGeneratedPattern.commonPatterns.map((pattern: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="bg-orange-500/5 border-orange-500/20 text-orange-400">
                                                {pattern}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Success Tips */}
                            {selectedCompany.aiGeneratedPattern.successTips && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-cyan-400">Success Tips</h4>
                                    <ul className="space-y-2">
                                        {selectedCompany.aiGeneratedPattern.successTips.map((tip: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 text-sm text-muted-foreground">
                                                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs mt-0.5">
                                                    {idx + 1}
                                                </Badge>
                                                <span className="flex-1">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyOAPatterns;

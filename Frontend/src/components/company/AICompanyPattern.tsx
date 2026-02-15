import React, { useState } from 'react';
import { Sparkles, RefreshCw, Calendar, TrendingUp, Clock, Target, Lightbulb, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface OAPattern {
    questionDistribution: {
        totalQuestions: string;
        difficulty: string;
        timeAllocation: string;
    };
    topicFocus: Array<{
        topic: string;
        percentage: string;
        description: string;
    }>;
    commonPatterns: string[];
    assessmentStructure: {
        duration: string;
        navigation: string;
        partialCredit: string;
        environment: string;
    };
    recentTrends: string[];
    successTips: string[];
}

interface Props {
    companyId: string;
    companyName: string;
}

const AICompanyPattern: React.FC<Props> = ({ companyId, companyName }) => {
    const { user } = useAuth();
    const [pattern, setPattern] = useState<OAPattern | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
    const [isCached, setIsCached] = useState(false);

    const generatePattern = async (forceRegenerate: boolean = false) => {
        if (!user) return;

        setIsGenerating(true);
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
                setPattern(data.data);
                setGeneratedAt(new Date(data.generatedAt));
                setIsCached(data.cached || false);
                toast.success(data.cached ? 'Loaded cached pattern' : 'Pattern generated successfully!');
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error('Pattern generation error:', error);
            toast.error(error.message || 'Failed to generate pattern');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Generate Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter">AI-Powered OA Insights</h3>
                        <p className="text-xs text-muted-foreground">Latest patterns from {companyName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {generatedAt && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-white/5 px-3 py-1.5 rounded-lg">
                            <Calendar className="w-3 h-3" />
                            {isCached && <Badge variant="outline" className="text-[8px] px-1.5 py-0">CACHED</Badge>}
                            {new Date(generatedAt).toLocaleDateString()}
                        </div>
                    )}
                    <Button
                        onClick={() => generatePattern(false)}
                        disabled={isGenerating}
                        size="sm"
                        className="h-9 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-xs uppercase tracking-wider"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5" />
                                {pattern ? 'Refresh' : 'Generate'} Pattern
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Pattern Display */}
            {pattern && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Question Distribution */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-4 h-4 text-blue-400" />
                            <h4 className="text-sm font-black uppercase tracking-wider">Question Distribution</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Questions</p>
                                <p className="text-lg font-bold text-blue-400">{pattern.questionDistribution.totalQuestions}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Difficulty</p>
                                <p className="text-sm font-semibold">{pattern.questionDistribution.difficulty}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Time Allocation</p>
                                <p className="text-sm font-semibold">{pattern.questionDistribution.timeAllocation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Topic Focus */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <h4 className="text-sm font-black uppercase tracking-wider">Topic Focus Areas</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pattern.topicFocus.map((topic, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-sm">{topic.topic}</span>
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">
                                            {topic.percentage}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{topic.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Common Patterns */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/5 to-yellow-500/5 border border-orange-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-4 h-4 text-orange-400" />
                            <h4 className="text-sm font-black uppercase tracking-wider">Common Patterns</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {pattern.commonPatterns.map((p, idx) => (
                                <Badge key={idx} variant="outline" className="bg-orange-500/5 border-orange-500/20 text-orange-400 text-xs">
                                    {p}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Assessment Structure */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <h4 className="text-sm font-black uppercase tracking-wider">Assessment Structure</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Duration</p>
                                <p className="text-sm font-semibold">{pattern.assessmentStructure.duration}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Navigation</p>
                                <p className="text-sm font-semibold">{pattern.assessmentStructure.navigation}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Partial Credit</p>
                                <p className="text-sm font-semibold">{pattern.assessmentStructure.partialCredit}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Environment</p>
                                <p className="text-sm font-semibold">{pattern.assessmentStructure.environment}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Trends */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500/5 to-red-500/5 border border-rose-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-rose-400" />
                            <h4 className="text-sm font-black uppercase tracking-wider">Recent Trends (2024-2026)</h4>
                        </div>
                        <ul className="space-y-2">
                            {pattern.recentTrends.map((trend, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2" />
                                    <span className="text-muted-foreground">{trend}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Success Tips */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-4 h-4 text-cyan-400" />
                            <h4 className="text-sm font-black uppercase tracking-wider">Success Tips</h4>
                        </div>
                        <ul className="space-y-3">
                            {pattern.successTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] mt-0.5">
                                        {idx + 1}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground flex-1">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!pattern && !isGenerating && (
                <div className="p-12 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black uppercase tracking-tighter">Generate AI Pattern Insights</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Click the button above to generate the latest OA pattern analysis powered by AI.
                            Get insights on question types, difficulty distribution, and success strategies.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AICompanyPattern;

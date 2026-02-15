import React from "react";
import { Company } from "@/services/companiesApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Layers, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyOAPatternsProps {
    companies: Company[];
    className?: string;
}

const CompanyOAPatterns: React.FC<CompanyOAPatternsProps> = ({ companies, className }) => {
    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <Layers className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Hiring Patterns Breakdown</h3>
                        <p className="text-xs text-muted-foreground">Topic-wise distribution based on recent Online Assessments</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-purple-500/5 text-purple-400 border-purple-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3 mr-1.5" />
                    Live Data
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company, idx) => (
                    <Card key={company._id} className="bg-[#111111] border-white/5 hover:border-purple-500/30 transition-all group overflow-hidden relative">
                        {/* Decorative Background Glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-purple-500/10 transition-colors" />

                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.03]">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                    {company.logo ? (
                                        <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{company.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{company.oaDifficulty || 'Medium'} OA</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {company.pattern && company.pattern.length > 0 ? (
                                    company.pattern.map((p, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between items-center px-0.5">
                                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter">{p.topic}</span>
                                                <span className="text-[10px] font-black text-purple-400">{p.percentage}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 ease-out group-hover:brightness-125"
                                                    style={{ width: `${p.percentage}%`, transitionDelay: `${i * 100}ms` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-20 flex items-center justify-center text-[10px] text-muted-foreground italic bg-white/[0.01] rounded-lg border border-dashed border-white/5">
                                        No pattern data available
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {company.focusAreas?.slice(0, 3).map((area, i) => (
                                    <Badge key={i} variant="secondary" className="bg-white/5 text-[8px] font-bold border-0 text-muted-foreground">
                                        {area}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {companies.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border/20 rounded-3xl">
                        Loading company patterns...
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyOAPatterns;

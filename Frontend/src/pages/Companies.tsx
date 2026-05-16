import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Target, Building2, Zap, Star, Loader2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { companiesApi, type Company } from "@/services/companiesApi";

const Companies = () => {
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setIsLoading(true);
                const data = await companiesApi.getAll();
                setCompanies(data);
            } catch (error) {
                console.error("Failed to fetch companies:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper to get readiness (initially 0 for all users)
    const getReadiness = (_companyId: string) => {
        return 0;
    };

    const getReadinessColor = (score: number) => {
        if (score > 80) return "bg-green-500";
        if (score > 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground">
            <Navbar
                isLoginOpen={isLoginOpen}
                setIsLoginOpen={setIsLoginOpen}
                isRegisterOpen={isRegisterOpen}
                setIsRegisterOpen={setIsRegisterOpen}
            />

            <main className="container mx-auto px-4 pt-32 pb-24">
                {/* Header Section */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
                        <Target className="w-4 h-4" />
                        Targeted Placement Prep
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Level Up for Your <span className="gradient-text">Dream Company</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Prepare with precision. Get real OA patterns, company-specific mock tests, and track your readiness in real-time.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by company name (e.g. Amazon, Google)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 bg-secondary/30 border border-border/50 rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
                        />
                    </div>
                </div>



                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground animate-pulse">Loading amazing companies...</p>
                    </div>
                ) : (
                    <>
                        {/* Companies Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCompanies.map((company, index) => {
                                const readiness = getReadiness(company.companyId);
                                const readinessColor = getReadinessColor(readiness);

                                return (
                                    <div
                                        key={company._id}
                                        onClick={() => navigate(`/companies/${company.companyId}`)}
                                        className="group relative bg-[#0d0d0d] rounded-[2rem] overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(45,212,191,0.1)] hover:-translate-y-1 cursor-pointer"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Card Header */}
                                        <div className="relative h-28 p-6 flex items-start justify-between">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                                            
                                            <div className="relative z-10 w-16 h-16 rounded-2xl bg-white p-3 shadow-xl group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                                {company.logo && company.logo.startsWith('http') ? (
                                                    <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-2xl font-black text-black">{company.logo}</span>
                                                )}
                                            </div>

                                            <div className="relative z-10 text-right">
                                                <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-primary transition-colors">{company.name}</h3>
                                                <div className="flex items-center justify-end gap-1.5 mt-1">
                                                    <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                                                    <span className="text-[10px] font-black text-primary/80 uppercase tracking-[0.2em]">OA PREP</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="px-7 pb-7 pt-2 space-y-7">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">OA Difficulty</p>
                                                    <p className="text-sm font-bold text-white/90">{company.oaDifficulty}</p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Avg Questions</p>
                                                    <p className="text-sm font-bold text-white/90">{company.avgQuestions}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Focus Areas</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {company.focusAreas.slice(0, 3).map((area) => (
                                                        <span key={area} className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/60 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                                            {area}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-primary fill-primary/20" />
                                                        <span className="text-xs font-bold text-white/80">Your Readiness</span>
                                                    </div>
                                                    <span className="text-xs font-black text-primary">{readiness}%</span>
                                                </div>
                                                
                                                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]", readinessColor)}
                                                        style={{ width: `${readiness}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", readiness === 0 ? "bg-rose-500" : readinessColor)} />
                                                    <span className="text-[10px] font-bold text-muted-foreground italic">
                                                        {readiness > 80 ? "Highly competitive" : readiness > 50 ? "Needs more practice" : "Significant gap"}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button className="w-full h-12 bg-gradient-to-r from-[#2dd4bf] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#2dd4bf] text-black font-black uppercase tracking-widest text-[11px] rounded-xl shadow-[0_10px_30px_rgba(45,212,191,0.3)] border-0 transition-all duration-300 group-hover:scale-[1.02] active:scale-95 gap-2">
                                                Analyze & Start
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {filteredCompanies.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Building2 className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">No companies found</h3>
                                <p className="text-muted-foreground">Try searching for a different name or category.</p>
                                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-4 text-primary p-0 h-auto">
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Companies;

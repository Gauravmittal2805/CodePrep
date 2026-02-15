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

                {/* Categories / Filter Chips */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {["All", "MAANG", "Service Based", "Startups", "FinTech"].map((cat) => (
                        <button
                            key={cat}
                            className={cn(
                                "px-6 py-2 rounded-full border border-border/50 text-sm font-medium transition-all hover:bg-secondary/50",
                                cat === "All" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/20 text-muted-foreground"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
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
                                        className="group glass-card p-0 overflow-hidden hover-lift cursor-pointer border border-white/5 hover:border-primary/30 transition-all duration-500"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Card Header with Logo */}
                                        <div className="relative h-24 overflow-hidden">
                                            <div className={cn("absolute inset-0 bg-gradient-to-r opacity-20", company.color)} />
                                            <div className="absolute inset-0 flex items-center justify-between px-6 pt-6">
                                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-black shadow-2xl group-hover:scale-110 transition-transform duration-500 bg-white p-3">
                                                    {company.logo && company.logo.startsWith('http') ? (
                                                        <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        company.logo
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{company.name}</h3>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center justify-end gap-1">
                                                        <Zap className="w-3 h-3 text-yellow-400" />
                                                        OA PREP
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 pt-8 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">OA Difficulty</p>
                                                    <p className="text-sm font-semibold text-white">{company.oaDifficulty}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Avg Questions</p>
                                                    <p className="text-sm font-semibold text-white">{company.avgQuestions}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Focus Areas</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {company.focusAreas.map((area) => (
                                                        <span key={area} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                                            {area}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-primary" />
                                                        Your Readiness
                                                    </p>
                                                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full text-white", readinessColor.replace('bg-', 'text-'))}>
                                                        {readiness}%
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className={cn("h-full transition-all duration-1000 ease-out rounded-full", readinessColor)}
                                                        style={{ width: `${readiness}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-2 italic">
                                                    {readiness > 80 ? "🔥 Highly competitive" : readiness > 50 ? "🟡 Needs more practice" : "🔴 Significant gap"}
                                                </p>
                                            </div>

                                            <Button className="w-full h-11 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 gap-2 font-bold uppercase tracking-tight text-xs">
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

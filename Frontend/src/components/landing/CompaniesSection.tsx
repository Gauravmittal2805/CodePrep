import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { companiesApi, type Company } from "@/services/companiesApi";

const CompaniesSection = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companiesApi.getAll();
        // Only show first 5 on landing page
        setCompanies(data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch companies for landing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <section id="companies" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-medium mb-6">
            <Target className="w-4 h-4 text-primary" />
            Company-wise Prep
          </div>
          <h2 className="section-title">
            Prepare Exactly What{" "}
            <span className="gradient-text">Top Companies</span> Ask
          </h2>
          <p className="section-subtitle">
            Curated problems and mock tests based on real interview experiences
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {companies.map((company, index) => (
              <div
                key={company._id}
                className="glass-card p-6 hover-lift group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center text-2xl font-bold text-white mb-4 group-hover:scale-110 transition-transform overflow-hidden`}
                >
                  {company.logo.startsWith('http') ? (
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to company initial if image fails to load
                        e.currentTarget.src = '';
                        e.currentTarget.textContent = company.name.charAt(0);
                        e.currentTarget.className = 'flex items-center justify-center w-full h-full';
                      }}
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full">
                      {company.logo || company.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{company.name}</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">
                      OA Pattern
                    </p>
                    <p className="text-sm text-white/90">{company.avgQuestions}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">
                      Focus Areas
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {company.focusAreas.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 text-[10px] rounded bg-secondary text-muted-foreground"
                        >
                          {topic}
                        </span>
                      ))}
                      {company.focusAreas.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] rounded bg-secondary text-muted-foreground">
                          +{company.focusAreas.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 border-primary/20"
                  onClick={() => navigate(`/companies/${company.companyId}`)}
                >
                  Start Prep
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate('/companies')}
            variant="ghost"
            className="text-primary hover:text-primary hover:bg-primary/10 font-bold"
          >
            View All Companies
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;

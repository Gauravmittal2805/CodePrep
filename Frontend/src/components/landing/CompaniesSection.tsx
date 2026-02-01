import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";

const CompaniesSection = () => {
  const companies = [
    {
      name: "Google",
      logo: "G",
      color: "from-blue-500 to-green-500",
      oaPattern: "2 Coding + 1 System Design",
      topics: ["Arrays", "Trees", "DP", "Graphs"],
    },
    {
      name: "Amazon",
      logo: "A",
      color: "from-orange-500 to-yellow-500",
      oaPattern: "2 Coding + Leadership Principles",
      topics: ["OOP", "Trees", "BFS/DFS", "Strings"],
    },
    {
      name: "Microsoft",
      logo: "M",
      color: "from-cyan-500 to-blue-600",
      oaPattern: "3 Coding Problems",
      topics: ["Arrays", "Linked Lists", "Trees", "DP"],
    },
    {
      name: "TCS",
      logo: "T",
      color: "from-purple-500 to-indigo-600",
      oaPattern: "MCQ + 2 Coding",
      topics: ["Basic DSA", "SQL", "Aptitude", "Verbal"],
    },
    {
      name: "Infosys",
      logo: "I",
      color: "from-blue-600 to-indigo-700",
      oaPattern: "3 Coding + MCQ",
      topics: ["Patterns", "Strings", "Math", "Logic"],
    },
  ];

  return (
    <section id="companies" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-medium mb-6">
            <Building2 className="w-4 h-4 text-primary" />
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="glass-card p-6 hover-lift group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center text-2xl font-bold text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                {company.logo}
              </div>
              <h3 className="text-xl font-bold mb-2">{company.name}</h3>
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    OA Pattern
                  </p>
                  <p className="text-sm">{company.oaPattern}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Key Topics
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {company.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 text-xs rounded bg-secondary text-muted-foreground"
                      >
                        {topic}
                      </span>
                    ))}
                    {company.topics.length > 3 && (
                      <span className="px-2 py-0.5 text-xs rounded bg-secondary text-muted-foreground">
                        +{company.topics.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Start Prep
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;

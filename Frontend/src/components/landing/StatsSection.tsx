import { BookOpen, FileCheck, Shield, Users } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: BookOpen,
      value: "10K+",
      label: "Problems Attempted",
    },
    {
      icon: FileCheck,
      value: "500+",
      label: "Mock OAs",
    },
    {
      icon: Users,
      value: "200+",
      label: "Interviews Conducted",
    },
    {
      icon: Shield,
      value: "100%",
      label: "Secure & Proctored",
    },
  ];

  return (
    <section className="py-16 border-y border-border/50 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card hover-lift"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold font-mono gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

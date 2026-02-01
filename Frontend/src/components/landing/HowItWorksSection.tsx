import { Building2, ClipboardCheck, MessageSquareText, UserCircle } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserCircle,
      title: "Create Profile",
      description: "Set up your profile with target companies and goals",
    },
    {
      icon: Building2,
      title: "Choose Company",
      description: "Select from 50+ companies with curated prep paths",
    },
    {
      icon: ClipboardCheck,
      title: "Practice & Mock OA",
      description: "Solve problems and take timed assessments",
    },
    {
      icon: MessageSquareText,
      title: "Interview & Feedback",
      description: "Join live interviews and receive expert feedback",
    },
  ];

  return (
    <section className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="section-subtitle">
            Your journey from preparation to placement in four simple steps
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Timeline line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="grid md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {/* Timeline dot */}
                <div className="hidden md:flex absolute top-[88px] left-1/2 -translate-x-1/2 z-10">
                  <div className="timeline-dot" />
                </div>
                
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-card border border-border flex items-center justify-center mb-4 group hover:border-primary/50 transition-colors">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-sm font-mono text-primary mb-2">
                    Step {index + 1}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

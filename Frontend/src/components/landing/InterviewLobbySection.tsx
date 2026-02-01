import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Code2, MessageSquare, Star, Users } from "lucide-react";

const InterviewLobbySection = () => {
  const steps = [
    {
      number: "01",
      icon: Users,
      title: "Join Interview Lobby",
      description: "Connect with peers and mentors in real-time",
    },
    {
      number: "02",
      icon: Code2,
      title: "Solve Live Coding",
      description: "Work on problems with shared editor",
    },
    {
      number: "03",
      icon: MessageSquare,
      title: "Get Structured Feedback",
      description: "Receive detailed performance review",
    },
    {
      number: "04",
      icon: Star,
      title: "Improve Your Score",
      description: "Track progress and level up",
    },
  ];

  return (
    <section id="interview" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" />
            Featured Experience
          </div>
          <h2 className="section-title">
            Practice Interviews{" "}
            <span className="gradient-text">Before the Real One</span>
          </h2>
          <p className="section-subtitle">
            Join live interview sessions with peers, solve problems together, 
            and receive constructive feedback to improve your skills
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}
              
              <div className="glass-card p-6 hover-lift h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl font-mono font-bold text-primary/30">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-12 glow-border text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-float">
              <Users className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to ace your next interview?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join our interview lobby today and practice with real developers. 
              Get feedback that matters and build confidence.
            </p>
            <Button variant="hero" size="xl">
              Join Interview Lobby
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterviewLobbySection;

import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Eye, FileWarning, Maximize, Shield, Timer } from "lucide-react";

const MockOASection = () => {
  const securityFeatures = [
    {
      icon: Maximize,
      title: "Full Screen Mode",
      description: "Enforced full-screen environment",
    },
    {
      icon: Eye,
      title: "Tab Switch Detection",
      description: "Tracks and logs tab changes",
    },
    {
      icon: AlertTriangle,
      title: "Plagiarism Check",
      description: "AI-powered code similarity detection",
    },
    {
      icon: FileWarning,
      title: "Webcam Proctoring",
      description: "Optional visual monitoring",
    },
  ];

  return (
    <section id="mock-oa" className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-medium mb-6">
            <Timer className="w-4 h-4 text-primary" />
            Mock Assessments
          </div>
          <h2 className="section-title">
            Real OA Experience,{" "}
            <span className="gradient-text">Zero Pressure</span>
          </h2>
          <p className="section-subtitle">
            Practice with timed assessments that simulate the real exam environment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Mock OA Features */}
          <div className="space-y-8">
            <div className="glass-card p-8 glow-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mock OA Generator</h3>
                  <p className="text-muted-foreground">Company-specific assessments</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Select company and difficulty level</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Real exam-like timer and interface</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Detailed evaluation and feedback</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Performance analytics and trends</span>
                </div>
              </div>
              
              {/* Timer Mockup */}
              <div className="mt-6 p-4 rounded-xl bg-background/50 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Time Remaining</span>
                  <span className="font-mono text-2xl font-bold text-primary">01:45:30</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Security Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Secure Contest Mode</h3>
                <p className="text-muted-foreground">Enterprise-grade proctoring</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {securityFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card p-5 hover-lift"
                >
                  <feature.icon className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <Button variant="hero" size="lg" className="w-full sm:w-auto mt-4">
              Take a Mock OA
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockOASection;

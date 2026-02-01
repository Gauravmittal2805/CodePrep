import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface FinalCTASectionProps {
  onGetStarted?: () => void;
}

const FinalCTASection = ({ onGetStarted }: FinalCTASectionProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Start Your Journey Today
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Start Preparing{" "}
            <span className="gradient-text">Smarter</span>,{" "}
            <br className="hidden sm:block" />
            Not Harder
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of developers who have cracked their dream company interviews
            with our structured preparation platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" onClick={onGetStarted}>
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="hero-outline" size="xl">
              Try Mock OA
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            No credit card required. Start practicing in under 2 minutes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;

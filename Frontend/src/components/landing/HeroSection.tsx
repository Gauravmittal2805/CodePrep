import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Terminal, Trophy, Users } from "lucide-react";

interface HeroSectionProps {
  onGetStarted?: () => void;
  onExploreCompanies?: () => void;
}

const HeroSection = ({ onGetStarted, onExploreCompanies }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Now with AI-Powered Feedback
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-up animation-delay-200">
              Crack Company OAs &{" "}
              <span className="gradient-text">Interviews</span>{" "}
              with Real Practice
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl animate-fade-up animation-delay-400">
              Practice coding problems, take mock online assessments, participate
              in secure contests, and attend live interview lobbies with real feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-600">
              <Button variant="hero" size="xl" onClick={onGetStarted}>
                Start Practicing Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="hero-outline" size="xl" onClick={onExploreCompanies}>
                <Play className="w-5 h-5" />
                Explore Companies
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4 animate-fade-up animation-delay-600">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">2,500+</span> developers
                practicing daily
              </div>
            </div>
          </div>

          {/* Right Content - Illustrations */}
          <div className="relative lg:h-[600px] animate-slide-in-right">
            {/* Code Editor Mockup */}
            <div className="glass-card p-4 glow-border absolute top-0 right-0 w-full max-w-md animate-float">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-destructive/60" />
                  <span className="w-3 h-3 rounded-full bg-primary/60" />
                  <span className="w-3 h-3 rounded-full bg-accent/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">solution.py</span>
              </div>
              <div className="code-block p-4 text-sm">
                <pre className="text-muted-foreground">
                  <code>
                    <span className="text-primary">def</span>{" "}
                    <span className="text-accent">twoSum</span>(nums, target):
                    {"\n"}{"    "}hashmap = {"{"}{"}"}{"\n"}
                    {"    "}<span className="text-primary">for</span> i, num{" "}
                    <span className="text-primary">in</span> enumerate(nums):
                    {"\n"}{"        "}complement = target - num{"\n"}
                    {"        "}<span className="text-primary">if</span> complement{" "}
                    <span className="text-primary">in</span> hashmap:
                    {"\n"}{"            "}<span className="text-primary">return</span>{" "}
                    [hashmap[complement], i]
                  </code>
                </pre>
              </div>
            </div>

            {/* Contest Leaderboard Preview */}
            <div className="glass-card p-4 absolute bottom-20 left-0 w-72 animate-float animation-delay-200">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Live Contest</span>
              </div>
              <div className="space-y-2">
                {[
                  { rank: 1, name: "alice_dev", score: 450 },
                  { rank: 2, name: "bob_coder", score: 420 },
                  { rank: 3, name: "charlie_01", score: 380 },
                ].map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${user.rank === 1 ? "text-primary" :
                        user.rank === 2 ? "text-gray-400" :
                          "text-orange-400"
                        }`}>
                        #{user.rank}
                      </span>
                      <span className="text-sm font-mono">{user.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{user.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Lobby Preview */}
            <div className="glass-card p-4 absolute bottom-0 right-8 w-64 animate-float animation-delay-400">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Interview Lobby</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Live Session</p>
                  <p className="text-xs text-muted-foreground">3 developers online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

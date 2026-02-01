import { Button } from "@/components/ui/button";
import { ArrowRight, Medal, Trophy } from "lucide-react";

const LeaderboardSection = () => {
  const leaderboardData = [
    { rank: 1, name: "priya_codes", company: "Google", score: 2450, badge: "gold" },
    { rank: 2, name: "arjun_dev", company: "Amazon", score: 2380, badge: "silver" },
    { rank: 3, name: "sneha_123", company: "Microsoft", score: 2290, badge: "bronze" },
    { rank: 4, name: "rahul_dsa", company: "Meta", score: 2180, badge: null },
    { rank: 5, name: "anita_tech", company: "Google", score: 2050, badge: null },
  ];

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case "gold":
        return "text-primary";
      case "silver":
        return "text-muted-foreground";
      case "bronze":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <section id="leaderboard" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-medium mb-6">
            <Trophy className="w-4 h-4 text-primary" />
            Global Rankings
          </div>
          <h2 className="section-title">
            Top <span className="gradient-text">Performers</span> This Week
          </h2>
          <p className="section-subtitle">
            See how you stack up against other developers preparing for placements
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/50 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-4">Developer</div>
              <div className="col-span-3">Target Company</div>
              <div className="col-span-3 text-right">Score</div>
            </div>
            
            {/* Rows */}
            <div className="divide-y divide-border/50">
              {leaderboardData.map((user) => (
                <div
                  key={user.rank}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/20 transition-colors"
                >
                  <div className="col-span-2 flex justify-center">
                    {user.badge ? (
                      <Medal className={`w-6 h-6 ${getBadgeColor(user.badge)}`} />
                    ) : (
                      <span className="font-mono font-bold text-muted-foreground">
                        #{user.rank}
                      </span>
                    )}
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-mono text-sm font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-mono text-sm">{user.name}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                      {user.company}
                    </span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-mono font-bold text-primary">{user.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Button variant="hero-outline" size="lg">
              View Full Leaderboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;

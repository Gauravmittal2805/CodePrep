import { Button } from "@/components/ui/button";
import { ArrowRight, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  rank: number;
  fullName: string;
  photoURL?: string;
  score: number;
  problemsSolved: number;
  accuracy: number;
  streak: number;
}

const LeaderboardSection = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log('[LeaderboardSection] Fetching public leaderboard data...');

        // Use public endpoint - no authentication required
        const response = await fetch('http://localhost:5001/api/dashboard/public/leaderboard');

        console.log('[LeaderboardSection] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[LeaderboardSection] Received data:', data);
          // Take only top 5
          setLeaderboardData(data.slice(0, 5));
        } else {
          console.error('[LeaderboardSection] Failed to fetch:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[LeaderboardSection] Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []); // Remove user dependency since we're using public endpoint

  const getBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-primary";
      case 2:
        return "text-muted-foreground";
      case 3:
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  const handleViewLeaderboard = () => {
    if (user) {
      navigate('/leaderboard');
    } else {
      // Could open login modal here if needed
      navigate('/leaderboard');
    }
  };

  // Show placeholder data if not logged in or loading
  const displayData = leaderboardData.length > 0 ? leaderboardData : [
    { rank: 1, fullName: "priya_codes", score: 2450, problemsSolved: 45, accuracy: 85, streak: 7 },
    { rank: 2, fullName: "arjun_dev", score: 2380, problemsSolved: 42, accuracy: 82, streak: 5 },
    { rank: 3, fullName: "sneha_123", score: 2290, problemsSolved: 38, accuracy: 80, streak: 3 },
    { rank: 4, fullName: "rahul_dsa", score: 2180, problemsSolved: 35, accuracy: 78, streak: 2 },
    { rank: 5, fullName: "anita_tech", score: 2050, problemsSolved: 32, accuracy: 75, streak: 1 },
  ];

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
              <div className="col-span-3">Problems Solved</div>
              <div className="col-span-3 text-right">Score</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/50">
              {loading ? (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  Loading leaderboard...
                </div>
              ) : (
                displayData.map((entry) => (
                  <div
                    key={entry.rank}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/20 transition-colors"
                  >
                    <div className="col-span-2 flex justify-center">
                      {entry.rank <= 3 ? (
                        <Medal className={`w-6 h-6 ${getBadgeColor(entry.rank)}`} />
                      ) : (
                        <span className="font-mono font-bold text-muted-foreground">
                          #{entry.rank}
                        </span>
                      )}
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-mono text-sm font-bold text-primary">
                        {entry.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-mono text-sm">{entry.fullName}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                        {entry.problemsSolved} solved
                      </span>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="font-mono font-bold text-primary">{entry.score}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <Button variant="hero-outline" size="lg" onClick={handleViewLeaderboard}>
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


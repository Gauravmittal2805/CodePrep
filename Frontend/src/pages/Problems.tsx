import { useState, useEffect } from "react";
import { Search, ArrowRight, Flame } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import ProblemsTable from "@/components/problems/ProblemsTable";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";


// Streak dates will be fetched from API


const Problems = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityDays, setActivityDays] = useState<Date[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Fetch problems from API
  useEffect(() => {
    const fetchProblems = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await user.getIdToken();

        if (!token) {
          throw new Error('Missing Firebase ID token');
        }

        console.log('[Problems] Firebase user:', user.uid);
        console.log('[Problems] Token length:', token.length);

        // Build query params
        const params = new URLSearchParams();
        if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);
        if (companyFilter !== 'all') params.append('company', companyFilter);
        if (searchTerm) params.append('search', searchTerm);

        // Add a high limit to get all problems
        params.append('limit', '100');
        console.log('Fetching problems with params:', params.toString());
        const response = await fetch(`http://localhost:5001/api/problems?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status, response.statusText);

        if (!response.ok) {
          let details = '';
          try {
            const body = await response.json();
            console.error('Error response body:', body);
            details = body?.error || body?.message || JSON.stringify(body);
          } catch (err) {
            try {
              const text = await response.text();
              console.error('Error response text:', text);
              details = text;
            } catch (textErr) {
              console.error('Could not parse error response:', textErr);
              details = 'Could not parse error response';
            }
          }
          throw new Error(`Failed to fetch problems (HTTP ${response.status})${details ? `: ${details}` : ''}`);
        }

        const data = await response.json();
        console.log('Raw API response:', JSON.stringify(data, null, 2));

        // Check if data.data exists and has a problems array
        if (!data || !data.data || !Array.isArray(data.data.problems)) {
          console.error('Unexpected API response structure:', data);
          throw new Error('Invalid API response: problems array not found');
        }

        console.log(`Found ${data.data.problems.length} problems in response`);

        // Log the raw API response
        console.log('Raw problems data from API:', JSON.stringify(data.data.problems, null, 2));

        // Transform API data to match ProblemsTable format
        const transformedProblems = data.data.problems.map((p: any) => {
          console.log('Processing problem:', {
            id: p.id || p._id,
            title: p.title,
            hasUserStatus: !!p.userStatus,
            userStatus: p.userStatus
          });

          // Ensure all problems are shown regardless of status
          const userStatus = p.userStatus || { status: 'todo' };
          const problem = {
            id: p.id || p._id,
            userStatus,
            title: p.title,
            difficulty: p.difficulty,
            acceptance: p.acceptance || "N/A",
            isPremium: false,
            isCompleted: userStatus.status === 'solved',
            attempts: 0,
            lastVerdict: "",
            bestRuntime: "",
            slug: p.slug,
            companies: Array.isArray(p.companies) ? p.companies : []
          };

          console.log('Transformed problem:', problem);
          return problem;
        });

        console.log('Transformed problems:', transformedProblems);
        setProblems(transformedProblems);
        setError(null);
      } catch (err) {
        console.error('Error fetching problems:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch problems');
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserStats = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await fetch('http://localhost:5001/api/code/user-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setActivityDays(result.data.activityDates.map((d: string) => new Date(d)));
            setCurrentStreak(result.data.currentStreak);
          }
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
      }
    };

    fetchProblems();
    fetchUserStats();
  }, [user, difficultyFilter, companyFilter, searchTerm]);

  const filteredProblems = problems;

  // Debug: Log the problems data
  useEffect(() => {
    console.log('Current problems:', problems);
    console.log('Filtered problems:', filteredProblems);
  }, [problems, filteredProblems]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <Navbar
        isLoginOpen={isLoginOpen}
        setIsLoginOpen={setIsLoginOpen}
        isRegisterOpen={isRegisterOpen}
        setIsRegisterOpen={setIsRegisterOpen}
      />

      <main className="max-w-[1400px] mx-auto px-4 pt-24 pb-12 w-full">
        {/* Page Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-50"></div>
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs font-semibold text-blue-400">PREMIUM CONTENT</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 whitespace-nowrap overflow-visible">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Company-Aligned Problem Sets
            </span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto relative">
            <span className="relative z-10 px-2 bg-[#0a0a0a]">
              Practice exactly what top companies ask in OAs and interviews
            </span>
            <span className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent -z-0"></span>
          </p>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            {/* Advanced Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-1">
              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                <div className="relative w-full md:w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/20 border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none text-sm transition-all"
                  />
                </div>

                <Select onValueChange={setDifficultyFilter} defaultValue="all">
                  <SelectTrigger className="w-[120px] h-10 rounded-xl bg-secondary/20 border-border/40">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Difficulty</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[120px] h-10 rounded-xl bg-secondary/20 border-border/40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status</SelectItem>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="Solved">Solved</SelectItem>
                    <SelectItem value="Attempted">Attempted</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setCompanyFilter} defaultValue="all">
                  <SelectTrigger className="w-[120px] h-10 rounded-xl bg-secondary/20 border-border/40">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Company</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Amazon">Amazon</SelectItem>
                    <SelectItem value="Microsoft">Microsoft</SelectItem>
                    <SelectItem value="Adobe">Adobe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {(() => {
                    const solvedCount = problems.filter(p => p.userStatus?.status === 'solved').length;
                    const totalCount = problems.length || 0;
                    const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
                    return (
                      <>
                        <div className="w-32 h-2 rounded-full bg-secondary/30 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{solvedCount}/{totalCount} Solved</span>
                      </>
                    );
                  })()}
                </div>
                <button className="p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Problems Table */}
            <div className="rounded-2xl border border-border/40 overflow-hidden bg-secondary/5 backdrop-blur-md shadow-2xl">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-muted-foreground">Loading problems...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-red-500">Error: {error}</div>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-muted-foreground">No problems found</div>
                </div>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground mb-2 p-2 bg-secondary/20 rounded-lg">
                    Showing {filteredProblems.length} of {problems.length} problems
                  </div>
                  <ProblemsTable problems={filteredProblems} />
                </>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-border/40 bg-secondary/10 backdrop-blur-xl overflow-hidden shadow-xl rounded-2xl">
              <CardHeader className="pb-4 px-5 pt-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <CardTitle className="text-base font-bold">Daily Streak</CardTitle>
                </div>
                <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                  {currentStreak} Days
                </div>
              </CardHeader>

              <CardContent className="px-3 py-0">
                <div className="flex justify-center mb-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-xl border-0 bg-transparent w-full"
                    modifiers={{
                      streak: activityDays,
                    }}
                    modifiersClassNames={{
                      streak: "bg-orange-500/20 text-orange-500 font-bold rounded-full border border-orange-500/30",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Problems;

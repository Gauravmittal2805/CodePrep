import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type ProblemDetailData = {
  id: string;
  title: string;
  slug?: string;
  difficulty: string;
  acceptance?: string;
  difficulty_points?: number;
  statement?: string;
  input_format?: string;
  output_format?: string;
  constraints?: string[];
  sample_input?: string;
  sample_output?: string;
  explanation?: string;
  approach?: string[];
  time_complexity?: string;
  space_complexity?: string;
  tags?: string[];
  companies?: string[];
  url?: string;
};

const ProblemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        if (!user) {
          throw new Error('Not authenticated');
        }

        const token = await user.getIdToken();

        const response = await fetch(`http://localhost:5001/api/problems/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setProblem({
            id: data.data.slug || data.data.id || id,
            title: data.data.title || data.data.slug || data.data.id || id,
            difficulty: data.data.difficulty || 'Easy',
            difficulty_points: 0,
            acceptance: 'N/A',
            url: `https://open.kattis.com/problems/${data.data.slug || data.data.id || id}`,
            ...data.data
          });
        } else {
          throw new Error(data.error || 'Failed to load problem');
        }
      } catch (error) {
        console.error('Error fetching problem details:', error);
        setProblem(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProblem();
    } else {
      setProblem(null);
      setIsLoading(false);
    }
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary/20 rounded w-1/4"></div>
          <div className="flex items-center gap-4">
            <div className="h-6 bg-secondary/20 rounded w-24"></div>
            <div className="h-6 bg-secondary/20 rounded w-16"></div>
            <div className="h-6 bg-secondary/20 rounded w-20"></div>
          </div>
          <div className="h-4 bg-secondary/20 rounded w-full"></div>
          <div className="h-4 bg-secondary/20 rounded w-5/6"></div>
          <div className="h-4 bg-secondary/20 rounded w-2/3"></div>

          <div className="mt-8 space-y-6">
            <div>
              <div className="h-5 bg-secondary/20 rounded w-24 mb-2"></div>
              <div className="h-4 bg-secondary/20 rounded w-1/2 mb-2"></div>
              <div className="h-32 bg-secondary/20 rounded-md"></div>
            </div>
            <div>
              <div className="h-5 bg-secondary/20 rounded w-24 mb-2"></div>
              <div className="h-4 bg-secondary/20 rounded w-1/2 mb-2"></div>
              <div className="h-16 bg-secondary/20 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container mx-auto p-6 max-w-5xl text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-6">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Problem Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The problem with ID "<span className="font-mono font-medium">{id}</span>" could not be found.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/problems')}
              variant="outline"
              className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              View All Problems
            </Button>
          </div>
        </div>

        <div className="mt-8 text-left max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Check if the problem ID is spelled correctly in the URL
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              The problem might have been moved or deleted
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Try refreshing the page or check your internet connection
            </li>
          </ul>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-muted-foreground mb-3">Need help? Try these options:</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://open.kattis.com/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md transition-colors inline-flex items-center"
              >
                <span>Kattis Help Center</span>
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </a>
              <a
                href="https://open.kattis.com/problems"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors inline-flex items-center"
              >
                <span>Browse All Problems</span>
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="-ml-2 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Problems
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Problem ID: <span className="font-mono font-medium">{problem.id}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              // You might want to add a toast notification here
            }}
          >
            <Link2 className="h-3.5 w-3.5 mr-1.5" />
            Copy Link
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm flex flex-col h-full overflow-hidden">
        {/* Fixed Header */}
        <div className="p-6 border-b bg-card">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  problem.difficulty === "Easy"
                    ? "bg-green-500/10 text-green-500"
                    : problem.difficulty === "Medium"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-red-500/10 text-red-500"
                )}>
                  {problem.difficulty}
                </span>
                <span>Acceptance: {problem.acceptance ?? 'N/A'}</span>
                <span>Difficulty: {problem.difficulty_points != null ? problem.difficulty_points.toFixed(1) : 'N/A'}</span>
              </div>
            </div>
            <Button asChild>
              <a
                href={`https://open.kattis.com/problems/${problem.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4"
              >
                Solve on Kattis
              </a>
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50 transition-colors" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            {problem.statement && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
                <div className="text-muted-foreground whitespace-pre-line">
                  {problem.statement}
                </div>
              </div>
            )}

            {problem.input_format && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary/80 mb-3">Input Format</h3>
                <div className="text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg border">
                  {problem.input_format}
                </div>
              </div>
            )}

            {problem.output_format && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary/80 mb-3">Output Format</h3>
                <div className="text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg border">
                  {problem.output_format}
                </div>
              </div>
            )}

            {problem.constraints && problem.constraints.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary/80 mb-3">Constraints</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {problem.constraints.map((constraint, idx) => (
                    <li key={idx}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}

            {(problem.sample_input || problem.sample_output) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {problem.sample_input && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary/80 mb-3">Sample Input</h3>
                    <pre className="bg-black/40 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-white/5">
                      <code>{problem.sample_input}</code>
                    </pre>
                  </div>
                )}
                {problem.sample_output && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary/80 mb-3">Sample Output</h3>
                    <pre className="bg-black/40 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-white/5">
                      <code>{problem.sample_output}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {problem.explanation && (
              <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-3">Explanation</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {problem.explanation}
                </div>
              </div>
            )}

            {problem.approach && problem.approach.length > 0 && (
              <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-3">Approach</h3>
                <ul className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                  {problem.approach.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {(problem.time_complexity || problem.space_complexity) && (
              <div className="flex flex-wrap gap-4 pt-4">
                {problem.time_complexity && (
                  <div className="px-3 py-1.5 bg-secondary/20 rounded-lg border border-border/40 text-xs font-mono">
                    <span className="text-muted-foreground mr-2">Time:</span>
                    <span className="text-foreground">{problem.time_complexity}</span>
                  </div>
                )}
                {problem.space_complexity && (
                  <div className="px-3 py-1.5 bg-secondary/20 rounded-lg border border-border/40 text-xs font-mono">
                    <span className="text-muted-foreground mr-2">Space:</span>
                    <span className="text-foreground">{problem.space_complexity}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t px-6 py-4 bg-muted/5">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Problem ID: {problem.id}
            </div>
            <div className="flex gap-2">
              {/* Buttons removed as requested */}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;

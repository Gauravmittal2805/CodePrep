import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface Problem {
  id: string;
  title: string;
  difficulty: string;
  acceptance: string;
  isPremium: boolean;
  isCompleted: boolean;
  attempts: number;
  lastVerdict: string;
  bestRuntime: string;
}

interface ProblemsTableProps {
  problems: Problem[];
}

const ProblemsTable = ({ problems }: ProblemsTableProps) => {
  // Debug: Log the problems received by the table
  useEffect(() => {
    console.log('ProblemsTable received problems:', problems);
  }, [problems]);
  return (
    <div className="bg-secondary/5">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead className="w-[80px] text-xs font-bold uppercase tracking-wider text-muted-foreground/70 pl-6">Status</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Title</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Difficulty</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Acceptance</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 text-center">Attempts</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Last Verdict</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Best Runtime</TableHead>
            <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider text-muted-foreground/70 pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.length > 0 ? (
            problems.map((problem) => (
              <TableRow key={problem.id} className="border-border/20 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="pl-6">
                  {problem.isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500/80" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border/40" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium text-sm group-hover:text-primary transition-colors cursor-pointer">
                    {problem.title}
                    {problem.isPremium && (
                      <Lock className="h-3 w-3 text-amber-500/80" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-[11px] font-bold",
                      problem.difficulty === "Easy"
                        ? "text-green-500"
                        : problem.difficulty === "Medium"
                          ? "text-amber-500"
                          : "text-red-500"
                    )}
                  >
                    {problem.difficulty}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{problem.acceptance}</TableCell>
                <TableCell className="text-muted-foreground text-xs text-center">
                  {problem.attempts > 0 ? problem.attempts : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {problem.lastVerdict || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {problem.bestRuntime || '-'}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-500">
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                    <Link to={`/editor/${problem.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs font-medium text-primary border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                      >
                        Solve
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm">No problems found matching your criteria.</span>
                  <Button variant="link" size="sm" onClick={() => window.location.reload()} className="text-xs">Reset filters</Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProblemsTable;

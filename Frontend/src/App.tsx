
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Problems from "./pages/Problems";
import ProblemEditor from "./pages/ProblemEditor";
import ProblemDetail from "./pages/ProblemDetail";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import MockOAAttempt from "./pages/MockOAAttempt";
import Contests from "./pages/Contests";
import ContestArena from "./pages/ContestArena";
import InterviewDashboard from "./pages/InterviewDashboard";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewReport from "./pages/InterviewReport";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/editor/:id" element={<ProblemEditor />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/mockoa/attempt/:id" element={<MockOAAttempt />} />
            <Route path="/contest" element={<Contests />} />
            <Route path="/contest/:contestId/arena" element={<ContestArena />} />
            <Route path="/contest/:contestId/problem/:id" element={<ProblemEditor />} />

            {/* Interview Routes */}
            <Route path="/interview" element={<InterviewDashboard />} />
            <Route path="/interview/room/:id" element={<InterviewRoom />} />
            <Route path="/interview/report/:id" element={<InterviewReport />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

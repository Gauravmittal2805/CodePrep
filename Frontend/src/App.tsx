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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

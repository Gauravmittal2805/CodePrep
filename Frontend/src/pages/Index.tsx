import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import CompaniesSection from "@/components/landing/CompaniesSection";
import MockOASection from "@/components/landing/MockOASection";
import InterviewLobbySection from "@/components/landing/InterviewLobbySection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LeaderboardSection from "@/components/landing/LeaderboardSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartPracticing = () => {
    if (user) {
      navigate('/problems');
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleExploreCompanies = () => {
    if (user) {
      navigate('/companies');
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar
        isLoginOpen={isLoginOpen}
        setIsLoginOpen={setIsLoginOpen}
        isRegisterOpen={isRegisterOpen}
        setIsRegisterOpen={setIsRegisterOpen}
      />
      <main>
        <HeroSection
          onGetStarted={handleStartPracticing}
          onExploreCompanies={handleExploreCompanies}
        />
        <StatsSection />
        <CompaniesSection />
        <MockOASection />
        <InterviewLobbySection />
        <HowItWorksSection />
        <LeaderboardSection />
        <FinalCTASection onGetStarted={() => setIsRegisterOpen(true)} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

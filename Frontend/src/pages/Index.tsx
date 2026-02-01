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

const Index = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);


  return (
    <div className="min-h-screen bg-background dark">
      <Navbar
        isLoginOpen={isLoginOpen}
        setIsLoginOpen={setIsLoginOpen}
        isRegisterOpen={isRegisterOpen}
        setIsRegisterOpen={setIsRegisterOpen}
      />
      <main>
        <HeroSection onGetStarted={() => setIsRegisterOpen(true)} />
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

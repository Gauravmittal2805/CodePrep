
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, BarChart2, BookOpen, Clock, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import InterviewLobby from "@/components/interview/InterviewLobby";
import PastInterviews from "@/components/interview/PastInterviews";
import InterviewAnalytics from "@/components/interview/InterviewAnalytics";

const InterviewDashboard = () => {
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                isLoginOpen={isLoginOpen}
                setIsLoginOpen={setIsLoginOpen}
                isRegisterOpen={isRegisterOpen}
                setIsRegisterOpen={setIsRegisterOpen}
            />
            <div className="container py-8 max-w-7xl mx-auto pt-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-2"
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">AI Interview Prep Center</h1>
                        <p className="text-muted-foreground mt-1">Master your technical and behavioral interviews with real-time AI feedback.</p>
                    </div>
                    {/* <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Configure AI
                        </Button>
                    </div> */}
                </div>

                <Tabs defaultValue="lobby" className="w-full space-y-8">
                    <TabsList className="bg-secondary/50 p-1 rounded-full border border-border/50 inline-flex h-auto w-full md:w-auto overflow-x-auto justify-start md:justify-center">
                        <TabsTrigger value="lobby" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <Play className="w-4 h-4 mr-2" />
                            Start New Session
                        </TabsTrigger>
                        <TabsTrigger value="past" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <Clock className="w-4 h-4 mr-2" />
                            Past Interviews
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Detailed Analytics
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Resume Insights
                        </TabsTrigger>
                        <TabsTrigger value="plan" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <User className="w-4 h-4 mr-2" />
                            Improvement Plan
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="lobby" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                        <InterviewLobby />
                    </TabsContent>

                    <TabsContent value="past" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                        <PastInterviews />
                    </TabsContent>

                    <TabsContent value="analytics" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                        <InterviewAnalytics />
                    </TabsContent>

                    <TabsContent value="insights">
                        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/50 rounded-xl bg-secondary/10">
                            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-medium">Resume Analysis Coming Soon</h3>
                            <p className="text-muted-foreground max-w-md mt-2">Our AI is learning to create personalized question banks based on your resume keywords.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="plan">
                        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/50 rounded-xl bg-secondary/10">
                            <User className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-medium">Personalized Plan Coming Soon</h3>
                            <p className="text-muted-foreground max-w-md mt-2">Get a custom roadmap to crack your dream company based on your interview performance.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default InterviewDashboard;

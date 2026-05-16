
import { useState, useEffect } from "react";
import { 
    User as UserIcon, 
    Github, 
    Linkedin, 
    LayoutDashboard,
    UserCircle,
    Key,
    LogOut,
    Save,
    Loader2,
    Bell,
    Briefcase,
    Shield,
    Camera,
    Plus,
    X,
    Zap,
    Circle,
    Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("edit");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        college: "",
        company: "",
        location: "",
        github: "",
        linkedin: "",
        portfolio: "",
        codingRole: ""
    });

    useEffect(() => {
        if (user?.uid) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/profile/${user?.uid}`);
            const data = response.data;
            setFormData({
                fullName: data.fullName || "",
                bio: data.bio || "",
                college: data.college || "",
                company: data.company || "",
                location: data.location || "",
                github: data.github || "",
                linkedin: data.linkedin || "",
                portfolio: data.portfolio || "",
                codingRole: data.codingRole || ""
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.patch(`${API_BASE_URL}/auth/profile/${user?.uid}`, formData);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const sidebarItems = [
        { id: "edit", label: "Edit Details", icon: UserCircle },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "password", label: "Change Password", icon: Key },
        { id: "experience", label: "Experience", icon: Briefcase },
        { id: "permissions", label: "Permissions", icon: Shield },
    ];

    const calculateCompletion = () => {
        const fields = Object.values(formData);
        const filled = fields.filter(f => f && f.length > 0).length;
        return Math.round((filled / fields.length) * 100);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col font-sans">
            <Navbar 
                isLoginOpen={isLoginOpen} 
                setIsLoginOpen={setIsLoginOpen}
                isRegisterOpen={isRegisterOpen} 
                setIsRegisterOpen={setIsRegisterOpen}
            />

            {/* TOP BANNER */}
            <div className="relative h-64 md:h-72 w-full overflow-hidden mt-14 group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/20 to-[#0a0a0a] z-10" />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-0 animate-pulse" />
                <img 
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    alt="Cover"
                />
                <div className="absolute bottom-6 right-6 md:right-12 z-20">
                    <Button variant="secondary" size="sm" className="bg-black/40 backdrop-blur-xl border-white/10 text-white hover:bg-black/60 transition-all font-bold">
                        <Camera className="w-4 h-4 mr-2" /> Change Cover
                    </Button>
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pb-20 relative z-30">
                
                {/* PROFILE HEADER OVERLAP */}
                <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 mb-12">
                    <div className="relative group ml-4 md:ml-0">
                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary to-cyan-400 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500 shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)]" />
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-[#0a0a0a] overflow-hidden bg-[#111111] shadow-2xl">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                    <UserIcon className="w-16 h-16 text-primary/40" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 pb-2 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{formData.fullName || "Gaurav Mittal"}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                                <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Available for collaboration</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2 italic">
                            <Zap className="w-4 h-4 text-primary fill-primary/20" />
                            {formData.codingRole || "Professional Coder"}
                        </p>
                    </div>

                    <div className="hidden lg:block w-72 mb-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                            <span className="text-muted-foreground">Profile Completion</span>
                            <span className="text-primary">{calculateCompletion()}%</span>
                        </div>
                        <Progress value={calculateCompletion()} className="h-2 bg-white/5" />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* SIDEBAR NAVIGATION */}
                    <div className="w-full lg:w-72 shrink-0">
                        <Card className="bg-[#111111]/80 backdrop-blur-xl border-white/5 overflow-hidden shadow-2xl sticky top-24">
                            <CardContent className="p-2">
                                <div className="space-y-1">
                                    {sidebarItems.map((item) => {
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all rounded-xl",
                                                    isActive 
                                                        ? "bg-primary text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]" 
                                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground")} />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                    <div className="pt-4 mt-4 border-t border-white/5">
                                        <button
                                            onClick={() => navigate("/dashboard")}
                                            className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-muted-foreground hover:bg-white/5 hover:text-white transition-all rounded-xl"
                                        >
                                            <LayoutDashboard className="w-5 h-5" />
                                            Back to Dashboard
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all rounded-xl"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 min-w-0">
                        <Card className="bg-[#111111]/40 border-white/5 shadow-2xl backdrop-blur-sm min-h-[600px]">
                            <CardContent className="p-8 md:p-12">
                                
                                {activeTab === "edit" && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-black text-white uppercase italic">
                                                <span className="text-primary mr-2">//</span> Edit Details
                                            </h2>
                                            <Button 
                                                onClick={handleSave} 
                                                disabled={isSaving || isLoading}
                                                className="bg-primary hover:bg-primary/90 text-white font-black px-8 shadow-lg shadow-primary/20"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                Save Changes
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Full Name</Label>
                                                <Input 
                                                    id="fullName" 
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    className="bg-black/40 border-white/10 h-14 focus:border-primary/50 text-white font-bold text-lg px-6 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Email address</Label>
                                                <Input 
                                                    value={user?.email || ""} 
                                                    readOnly
                                                    className="bg-black/20 border-white/5 h-14 text-white/40 font-medium px-6 rounded-xl cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">About You</Label>
                                            <Textarea 
                                                id="bio" 
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                placeholder="Tell the world your story..."
                                                className="bg-black/40 border-white/10 min-h-[120px] focus:border-primary/50 text-white font-medium p-6 rounded-xl resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <Label htmlFor="codingRole" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Primary Role</Label>
                                                <Input 
                                                    id="codingRole" 
                                                    value={formData.codingRole}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Frontend Wizard"
                                                    className="bg-black/40 border-white/10 h-14 focus:border-primary/50 text-white font-bold px-6 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="location" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Location</Label>
                                                <Input 
                                                    id="location" 
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Mumbai, India"
                                                    className="bg-black/40 border-white/10 h-14 focus:border-primary/50 text-white font-bold px-6 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-6 border-t border-white/5">
                                            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6">Social Connections</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="relative group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                                        <Linkedin className="w-5 h-5 text-[#0077b5]" />
                                                    </div>
                                                    <Input 
                                                        id="linkedin" 
                                                        value={formData.linkedin}
                                                        onChange={handleInputChange}
                                                        placeholder="LinkedIn URL"
                                                        className="bg-black/40 border-white/10 h-14 pl-14 focus:border-primary/50 text-white font-bold rounded-xl"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                                        <Github className="w-5 h-5 text-white" />
                                                    </div>
                                                    <Input 
                                                        id="github" 
                                                        value={formData.github}
                                                        onChange={handleInputChange}
                                                        placeholder="GitHub URL"
                                                        className="bg-black/40 border-white/10 h-14 pl-14 focus:border-primary/50 text-white font-bold rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "notifications" && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h2 className="text-2xl font-black text-white uppercase italic">
                                            <span className="text-primary mr-2">//</span> Notifications
                                        </h2>
                                        
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-white">Email Notifications</h3>
                                                    <p className="text-xs text-muted-foreground font-medium">Receive weekly progress reports and contest alerts.</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-white">Streak Alerts</h3>
                                                    <p className="text-xs text-muted-foreground font-medium">Get notified when you're about to lose your daily streak.</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-white">New Discussion Replies</h3>
                                                    <p className="text-xs text-muted-foreground font-medium">When someone replies to your posted question.</p>
                                                </div>
                                                <Switch />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "password" && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h2 className="text-2xl font-black text-white uppercase italic">
                                            <span className="text-primary mr-2">//</span> Change Password
                                        </h2>
                                        
                                        <div className="max-w-md space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Password</Label>
                                                <Input type="password" placeholder="••••••••" className="bg-black/40 border-white/10 h-14 px-6 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Password</Label>
                                                <Input type="password" placeholder="••••••••" className="bg-black/40 border-white/10 h-14 px-6 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Confirm New Password</Label>
                                                <Input type="password" placeholder="••••••••" className="bg-black/40 border-white/10 h-14 px-6 rounded-xl" />
                                            </div>
                                            <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black px-10 h-14 shadow-lg shadow-primary/20 mt-4">
                                                Update Password
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "experience" && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-black text-white uppercase italic">
                                                <span className="text-primary mr-2">//</span> Professional Experience
                                            </h2>
                                            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold">
                                                <Plus className="w-4 h-4 mr-2" /> Add Entry
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-8">
                                            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 relative group">
                                                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-4 h-4 text-muted-foreground hover:text-red-400 cursor-pointer" />
                                                </div>
                                                <div className="flex items-start gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Briefcase className="w-7 h-7 text-primary" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <h3 className="text-xl font-bold text-white">Full Stack Developer Intern</h3>
                                                            <p className="text-primary font-bold text-sm">Google • Remote</p>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Jan 2024 - Present</span>
                                                            <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded italic">Ongoing</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            Working on scaling the search infrastructure using Go and Kubernetes. 
                                                            Improved latency by 15% through optimized caching strategies.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 relative group">
                                                <div className="flex items-start gap-6 opacity-40">
                                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                                        <Briefcase className="w-7 h-7 text-muted-foreground" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <h3 className="text-xl font-bold text-white">Junior Web Developer</h3>
                                                            <p className="text-muted-foreground font-bold text-sm">Startup Hub</p>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> June 2023 - Dec 2023</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "permissions" && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h2 className="text-2xl font-black text-white uppercase italic">
                                            <span className="text-primary mr-2">//</span> Visibility & Permissions
                                        </h2>
                                        
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-white">Public Profile</h3>
                                                    <p className="text-xs text-muted-foreground font-medium">Allow everyone to view your dashboard and progress.</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-white">Anonymous Submissions</h3>
                                                    <p className="text-xs text-muted-foreground font-medium">Hide your name on the global leaderboards.</p>
                                                </div>
                                                <Switch />
                                            </div>
                                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-white">Direct Messaging</h3>
                                                    <p className="text-xs text-muted-foreground font-medium">Allow other users to message you for collaboration.</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Profile;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Search, Clock, ShieldCheck, Building, PlusCircle, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CreateMockOAForm = ({ onSuccess, companies }: { onSuccess?: () => void, companies: any[] }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        company: "",
        role: "",
        title: "",
        duration: 90,
        questions: [] as string[],
        security: {
            shuffleQuestions: true,
            shuffleTestcases: true,
            disableCopyPaste: true
        }
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const token = await user?.getIdToken();
            const response = await fetch('http://localhost:5001/api/mockoa/questions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) setAvailableQuestions(result.data);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleQuestion = (id: string) => {
        const newQuestions = formData.questions.includes(id)
            ? formData.questions.filter(q => q !== id)
            : [...formData.questions, id];
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async () => {
        if (!user) return;
        if (!formData.company || !formData.title || formData.questions.length === 0) {
            return toast.error("Please fill all required fields and select at least one question");
        }

        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/mockoa/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Mock OA created successfully!");
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to create Mock OA");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredQuestions = availableQuestions.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Side: Mock OA Meta */}
            <div className="md:col-span-1 space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="w-5 h-5 text-primary" />
                            OA Information
                        </CardTitle>
                        <CardDescription>Setup the assessment container.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Company</Label>
                            <Select
                                value={formData.company}
                                onValueChange={(value) => setFormData({ ...formData, company: value })}
                            >
                                <SelectTrigger className="bg-black/40 border-white/10 focus:border-primary/50">
                                    <SelectValue placeholder="Select Company" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-foreground">
                                    {companies.map((company) => (
                                        <SelectItem key={company._id} value={company.name} className="focus:bg-primary/20 focus:text-primary cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                {company.logo && <img src={company.logo} alt={company.name} className="w-4 h-4 object-contain" />}
                                                {company.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>OA Name</Label>
                            <Input
                                placeholder="Amazon SDE Mock Pack"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input
                                placeholder="SDE-1"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Duration (Minutes)
                            </Label>
                            <Input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            Security Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                            <Checkbox
                                id="shuffleQuestions"
                                checked={formData.security.shuffleQuestions}
                                onCheckedChange={(checked) => setFormData({ ...formData, security: { ...formData.security, shuffleQuestions: !!checked } })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="shuffleTestcases">Shuffle Testcases</Label>
                            <Checkbox
                                id="shuffleTestcases"
                                checked={formData.security.shuffleTestcases}
                                onCheckedChange={(checked) => setFormData({ ...formData, security: { ...formData.security, shuffleTestcases: !!checked } })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="disableCopy">Disable Copy-Paste</Label>
                            <Checkbox
                                id="disableCopy"
                                checked={formData.security.disableCopyPaste}
                                onCheckedChange={(checked) => setFormData({ ...formData, security: { ...formData.security, disableCopyPaste: !!checked } })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button className="w-full gap-2 h-12 shadow-xl shadow-primary/20" onClick={handleSubmit} disabled={isLoading}>
                    <Save className="w-4 h-4" />
                    {isLoading ? "Saving..." : "Deploy Mock OA"}
                </Button>
            </div>

            {/* Right Side: Question Selection */}
            <div className="md:col-span-2 flex flex-col h-[650px] bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-md sticky top-0 z-20">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search company-specific questions..."
                            className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary/20 h-10 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                    {filteredQuestions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredQuestions.map((q) => (
                                <Card
                                    key={q._id}
                                    className={`cursor-pointer transition-all border-white/5 duration-300 relative group overflow-hidden ${formData.questions.includes(q._id)
                                        ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/40 shadow-lg shadow-primary/5'
                                        : 'bg-white/[0.02] hover:bg-white/[0.05]'
                                        }`}
                                    onClick={() => toggleQuestion(q._id)}
                                >
                                    <div className="p-5 flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-white tracking-tight">{q.title}</h4>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                                    q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                    <Building className="w-3.5 h-3.5" /> {q.company}
                                                </span>
                                                <span className="flex items-center gap-1.5 opacity-70">
                                                    <Briefcase className="w-3.5 h-3.5" /> {q.role || "General"}
                                                </span>
                                            </div>
                                        </div>

                                        {formData.questions.includes(q._id) ? (
                                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-in zoom-in duration-300">
                                                <Check className="w-5 h-5 text-primary" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Selection Glow Effect */}
                                    {formData.questions.includes(q._id) && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Search className="w-8 h-8 text-muted-foreground/20" />
                            </div>
                            <div>
                                <p className="text-white font-bold tracking-tight">No questions found</p>
                                <p className="text-sm text-muted-foreground">Try adjusting your search or add new questions first.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateMockOAForm;

const Briefcase = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);

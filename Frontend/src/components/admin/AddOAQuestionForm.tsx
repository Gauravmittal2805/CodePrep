import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Copy, FileJson, Save, Database } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SAMPLE_OA_TEMPLATE = {
    "company": "Amazon",
    "role": "SDE-1",
    "oaType": "Online Assessment",
    "title": "Optimize Delivery Routes",
    "description": "Given a list of delivery locations and distances, find the most efficient path...",
    "inputFormat": "First line contains N, the number of locations...",
    "outputFormat": "Return the minimum distance as an integer.",
    "constraints": "1 <= N <= 10^5",
    "topic": ["Array", "Greedy", "Graphs"],
    "difficulty": "Medium",
    "timeLimit": 2,
    "memoryLimit": 256,
    "sampleTestcases": [
        { "input": "3\n1 2 3", "output": "6" }
    ],
    "hiddenTestcases": [
        { "input": "5\n10 20 30 40 50", "output": "150" }
    ],
    "starterCode": {
        "java": "public class Solution {\n    public String solve(String input) {\n        // Your code here\n        return \"\";\n    }\n}",
        "python": "def solve(input):\n    # Your code here\n    return \"\"",
        "cpp": "class Solution {\npublic:\n    string solve(string input) {\n        // Your code here\n        return \"\";\n    }\n};"
    },
    "status": "ACTIVE"
};

interface AddOAQuestionFormProps {
    onSuccess?: () => void;
    initialData?: any;
}

const AddOAQuestionForm = ({ onSuccess, initialData }: AddOAQuestionFormProps) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            const { _id, createdAt, updatedAt, __v, createdBy, ...cleanData } = initialData;
            setJsonInput(JSON.stringify(cleanData, null, 4));
        }
    }, [initialData]);

    const handleCopyTemplate = () => {
        setJsonInput(JSON.stringify(SAMPLE_OA_TEMPLATE, null, 4));
        toast.success("OA Template loaded");
    };

    const validateJson = (jsonStr: string) => {
        try {
            const data = JSON.parse(jsonStr);
            const requiredFields = ['company', 'role', 'title', 'description', 'inputFormat', 'outputFormat', 'constraints', 'difficulty'];
            const missing = requiredFields.filter(f => !data[f]);
            if (missing.length > 0) {
                return `Missing required fields: ${missing.join(', ')}`;
            }
            if (!['Easy', 'Medium', 'Hard'].includes(data.difficulty)) {
                return "Difficulty must be 'Easy', 'Medium', or 'Hard'";
            }
            return null;
        } catch (e) {
            return "Invalid JSON syntax";
        }
    };

    const handleSubmit = async () => {
        if (!user) return toast.error("Please login first");

        setError(null);
        const validationError = validateJson(jsonInput);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const formData = JSON.parse(jsonInput);

            const response = await fetch('http://localhost:5001/api/mockoa/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                toast.success("OA Question added successfully!");
                setJsonInput("");
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to add question");
                setError(result.error);
            }
        } catch (error) {
            toast.error("An error occurred");
            setError("Failed to connect to the server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <Database className="w-5 h-5 text-primary" />
                        </div>
                        Add OA Question (JSON Mode)
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">Paste the company-specific question data in JSON format.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleCopyTemplate} className="gap-2 border-white/5 bg-white/5 hover:bg-white/10">
                        <FileJson className="w-4 h-4" />
                        Load Template
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !jsonInput} className="gap-2 shadow-lg shadow-primary/20">
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Question
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[650px]">
                {/* JSON Editor */}
                <Card className="bg-[#111111] border-white/5 flex flex-col h-full overflow-hidden shadow-2xl">
                    <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
                            <Copy className="w-3.5 h-3.5" />
                            JSON Editor
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 p-0 relative">
                        <Textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full h-full resize-none rounded-none border-0 bg-[#0c0c0c] font-mono text-sm leading-6 p-6 focus-visible:ring-0 scrollbar-thin scrollbar-thumb-white/10"
                            placeholder="// Paste your company OA question JSON here..."
                            spellCheck={false}
                        />
                    </div>
                </Card>

                {/* Schema Guide */}
                <Card className="bg-[#111111] border-white/5 flex flex-col h-full overflow-hidden shadow-2xl">
                    <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Required Schema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-6 space-y-6 font-mono text-[11px] scrollbar-thin scrollbar-thumb-white/10">
                        <div className="space-y-2">
                            <p className="text-primary font-black uppercase tracking-tighter text-xs">Essential Fields</p>
                            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                <div className="p-2 rounded bg-white/[0.03] border border-white/5">company <span className="text-primary/50">(string)</span></div>
                                <div className="p-2 rounded bg-white/[0.03] border border-white/5">role <span className="text-primary/50">(string)</span></div>
                                <div className="p-2 rounded bg-white/[0.03] border border-white/5">title <span className="text-primary/50">(string)</span></div>
                                <div className="p-2 rounded bg-white/[0.03] border border-white/5">difficulty <span className="text-primary/50">(Easy|Med|Hard)</span></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-primary font-black uppercase tracking-tighter text-xs">Full Template Reference</p>
                            <div className="relative group">
                                <pre className="bg-black/60 p-4 rounded-xl text-green-400 overflow-x-auto border border-white/5 group-hover:border-green-400/30 transition-colors">
                                    {JSON.stringify(SAMPLE_OA_TEMPLATE, null, 2)}
                                </pre>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(SAMPLE_OA_TEMPLATE, null, 4));
                                        toast.success("Copied to clipboard");
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 hover:bg-black"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <p className="text-blue-400 font-bold mb-1">💡 Tip</p>
                            <p className="text-muted-foreground leading-relaxed">
                                You can include markdown in the <code className="text-white">description</code> field.
                                Make sure <code className="text-white">timeLimit</code> is in seconds and <code className="text-white">memoryLimit</code> is in MB.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddOAQuestionForm;

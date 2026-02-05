import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Copy, FileJson, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AddProblemFormProps {
    onCancel?: () => void;
    onSuccess?: () => void;
    initialData?: any;
}

const SAMPLE_TEMPLATE = {
    // ... (rest of template)
    "id": "two-sum",
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "Easy",
    "pattern": "Two Pointers",
    "topic": ["Array", "HashTable"],
    "companies": ["Google", "Amazon"],
    "tags": ["NeetCode 150"],
    "statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "input_format": "First line contains an integer N.\nSecond line contains N integers.",
    "output_format": "Return indices of the two numbers.",
    "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    "sample_input": "nums = [2,7,11,15], target = 9",
    "sample_output": "[0,1]",
    "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1].",
    "approach": ["Use a hash map to store the complement."],
    "time_complexity": "O(n)",
    "space_complexity": "O(n)",
    "test_cases": [
        { "input": "2\n3 3", "output": "0 1", "isHidden": false }
    ],
    "hidden_test_cases": [
        { "input": "3\n3 2 4", "output": "1 2", "description": "Three elements", "points": 10 }
    ],
    "judge_type": "standard",
    "notes": "",
    "source": "LeetCode",
    "status": "Draft",
    "starterCode": {
        "java": "// Java starter code",
        "python": "# Python starter code",
        "cpp": "// C++ starter code",
        "javascript": "// JS starter code"
    }
};

import { useEffect } from "react";

const AddProblemForm = ({ onCancel, onSuccess, initialData }: AddProblemFormProps) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            // Filter out internal fields like _id, createdAt, etc.
            const { _id, createdAt, updatedAt, __v, userStatus, ...cleanData } = initialData;
            setJsonInput(JSON.stringify(cleanData, null, 4));
        }
    }, [initialData]);

    const handleCopyTemplate = () => {
        setJsonInput(JSON.stringify(SAMPLE_TEMPLATE, null, 4));
        toast.success("Template copied to editor");
    };

    const validateJson = (jsonStr: string) => {
        try {
            const data = JSON.parse(jsonStr);
            // Basic required fields check
            const requiredFields = ['id', 'title', 'slug', 'difficulty', 'statement'];
            const missing = requiredFields.filter(f => !data[f]);
            if (missing.length > 0) {
                return `Missing required fields: ${missing.join(', ')}`;
            }
            return null;
        } catch (e) {
            return "Invalid JSON syntax";
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!user) {
            setError("You must be logged in.");
            setIsLoading(false);
            return;
        }

        const validationError = validateJson(jsonInput);
        if (validationError) {
            setError(validationError);
            setIsLoading(false);
            return;
        }

        try {
            const token = await user.getIdToken();
            const problemData = JSON.parse(jsonInput);

            // Ensure ID is string
            problemData.id = String(problemData.id);

            const url = initialData
                ? `http://localhost:5001/api/problems/${initialData.id || initialData.slug}`
                : 'http://localhost:5001/api/problems';

            const method = initialData ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(problemData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save problem');
            }

            setSuccessMessage(`Problem ${initialData ? 'updated' : 'created'} successfully!`);
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{initialData ? 'Edit Problem' : 'Add New Problem'} (JSON)</h2>
                    <p className="text-muted-foreground mt-1">{initialData ? 'Modify existing' : 'Paste new'} problem data in standard JSON format.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopyTemplate} className="gap-2">
                        <FileJson className="w-4 h-4" />
                        Load Template
                    </Button>
                    {onCancel && (
                        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    )}
                    <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {initialData ? 'Save Changes' : 'Save Problem'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-500">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
                <Card className="bg-[#111111] border-border/40 flex flex-col h-full overflow-hidden">
                    <CardHeader className="pb-3 border-b border-white/5">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            JSON Editor
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 p-0 relative">
                        <Textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full h-full resize-none rounded-none border-0 bg-[#0c0c0c] font-mono text-sm leading-6 p-4 focus-visible:ring-0"
                            placeholder="// Paste your JSON here..."
                            spellCheck={false}
                        />
                    </div>
                </Card>

                <Card className="bg-[#111111] border-border/40 flex flex-col h-full overflow-hidden">
                    <CardHeader className="pb-3 border-b border-white/5">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                            Preview / Schema Guide
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-6 font-mono text-xs text-muted-foreground space-y-4">
                        <p className="text-primary font-bold">Required Fields:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>id (string)</li>
                            <li>title (string)</li>
                            <li>slug (string)</li>
                            <li>difficulty (Easy | Medium | Hard)</li>
                            <li>statement (markdown string)</li>
                        </ul>
                        <div className="mt-4">
                            <p className="text-primary font-bold mb-2">Structure Reference:</p>
                            <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-green-400">
                                {JSON.stringify(SAMPLE_TEMPLATE, null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddProblemForm;

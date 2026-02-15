import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, Lock } from "lucide-react";

interface Question {
    text: string;
    type: string;
    difficulty: string;
    answer?: string;
}

interface QuestionGeneratorPanelProps {
    onConfirm: (questions: Question[]) => void;
    baseConfig: {
        type: string;
        company: string;
    };
    triggerLabel?: string;
}

export default function QuestionGeneratorPanel({ onConfirm, baseConfig, triggerLabel }: QuestionGeneratorPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [count, setCount] = useState(5);
    const [generatedQuestions, setGeneratedQuestions] = useState<{ q: Question, isOpen: boolean }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Auto-fill topic based on baseConfig.type if standard match
            // User requested "round bhi khud se lelo" - so we use baseConfig.type as the fixed context
            // But we allow refining the "Topic" within that context.
            if (!topic) {
                const defaultTopics: Record<string, string> = {
                    "coding": "Data Structures & Algorithms",
                    "system": "System Design & Architecture",
                    "behavioral": "Leadership Principles",
                    "hr": "General Introduction & Career Goals",
                    "technical": "Core Computer Science Concepts"
                };
                setTopic(defaultTopics[baseConfig.type] || "General");
            }
        }
    }, [isOpen, baseConfig.type]);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5001/api/interviews/generate-questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic,
                    difficulty,
                    count,
                    type: baseConfig.type // Pass the locked interview type
                })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedQuestions(data.questions.map((q: Question) => ({ q, isOpen: false })));
                setSelectedIndices(data.questions.map((_: any, i: number) => i)); // Select all by default
            }
        } catch (error) {
            console.error("Failed to generate", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const toggleAnswer = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent triggering selection
        setGeneratedQuestions(prev => prev.map((item, i) =>
            i === index ? { ...item, isOpen: !item.isOpen } : item
        ));
    };

    const handleConfirm = () => {
        const selected = generatedQuestions.filter((_, i) => selectedIndices.includes(i)).map(i => i.q);
        onConfirm(selected);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-12 border-dashed border-2 bg-black/5 hover:bg-black/10 text-muted-foreground hover:text-foreground">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                    {triggerLabel || "Open Advanced Question Generator"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-border/40">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        AI Question Generator
                    </DialogTitle>
                    <DialogDescription>
                        Generate {baseConfig.type} questions with AI-suggested answers.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 items-end bg-white/[0.02] p-4 rounded-lg border border-white/5">
                    <div className="space-y-2">
                        <Label>Interview Round (Locked)</Label>
                        <div className="flex items-center px-3 h-10 rounded-md bg-white/5 border border-white/10 text-muted-foreground text-sm cursor-not-allowed">
                            <Lock className="w-3 h-3 mr-2 opacity-50" />
                            <span className="capitalize">{baseConfig.type} Round</span>
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-1">
                        <Label>Topic / Focus Area</Label>
                        <Input
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="e.g. React Hooks"
                            className="bg-black/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Count</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={count}
                                onChange={e => setCount(parseInt(e.target.value))}
                                className="bg-black/20"
                            />
                            <Button onClick={handleGenerate} disabled={isLoading} className="flex-1 bg-purple-600 hover:bg-purple-700 font-semibold shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
                                        Thinking...
                                    </span>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {generatedQuestions.length > 0 && (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex justify-between items-center sticky top-0 bg-[#0a0a0a] py-2 z-10 border-b border-white/5 mb-2">
                            <h4 className="font-semibold text-sm text-foreground">Generated Questions ({selectedIndices.length} selected)</h4>
                            <Button variant="ghost" size="sm" onClick={() => {
                                setGeneratedQuestions([]);
                                setSelectedIndices([]);
                            }} className="text-xs h-7 hover:text-red-400">Clear Results</Button>
                        </div>
                        {generatedQuestions.map((item, i) => (
                            <div key={i}
                                className={`rounded-lg border transition-all overflow-hidden ${selectedIndices.includes(i)
                                    ? "bg-purple-500/5 border-purple-500/30"
                                    : "bg-black/20 border-border/20 hover:bg-white/5"
                                    }`}
                            >
                                <div
                                    className="p-4 cursor-pointer flex gap-3 items-start"
                                    onClick={() => toggleSelection(i)}
                                >
                                    <Checkbox checked={selectedIndices.includes(i)} className="mt-1 border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" onCheckedChange={() => toggleSelection(i)} />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <p className="text-sm font-medium leading-relaxed text-foreground/90">{item.q.text}</p>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Badge variant="outline" className={`text-[10px] border-0 h-5 ${item.q.difficulty === "Hard" ? "bg-red-500/10 text-red-500" : item.q.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}`}>
                                                    {item.q.difficulty}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">{item.q.type}</Badge>
                                            {item.q.answer && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-[10px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 p-0 px-2 ml-auto gap-1"
                                                    onClick={(e) => toggleAnswer(i, e)}
                                                >
                                                    {item.isOpen ? "Hide Answer" : "Show Answer"}
                                                    <ChevronDown className={`w-3 h-3 transition-transform ${item.isOpen ? "rotate-180" : ""}`} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {item.isOpen && item.q.answer && (
                                    <div className="px-11 pb-4 pt-0 animate-in slide-in-from-top-2 duration-300">
                                        <div className="p-3 bg-black/40 rounded-md border border-white/5 text-xs text-muted-foreground/80 italic leading-relaxed">
                                            <span className="font-semibold text-purple-400 not-italic mr-1">Expected Answer:</span>
                                            {item.q.answer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {generatedQuestions.length === 0 && !isLoading && (
                    <div className="py-16 text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-purple-500 opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-1">AI Question Generator</h3>
                        <p className="text-sm max-w-sm mx-auto">Set your parameters above and let AI generate tailored interview questions and answers for you.</p>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/20 mt-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={generatedQuestions.length === 0 || selectedIndices.length === 0} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[150px]">
                        Add {selectedIndices.length} Questions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, FilePlus2 } from "lucide-react";
import AddOAQuestionForm from "./AddOAQuestionForm";
import CreateMockOAForm from "./CreateMockOAForm";

const MockOADesigner = ({ onComplete, companies }: { onComplete?: () => void, companies?: any[] }) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                    Mock OA Designer
                </h2>
                <p className="text-muted-foreground">
                    Create company-specific assessments with unique questions and security rules.
                </p>
            </div>

            <Tabs defaultValue="add-question" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-muted/50 backdrop-blur-md p-1">
                    <TabsTrigger value="add-question" className="gap-2">
                        <FilePlus2 className="w-4 h-4" />
                        Add Question
                    </TabsTrigger>
                    <TabsTrigger value="create-oa" className="gap-2">
                        <Layout className="w-4 h-4" />
                        Create Mock OA
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="add-question">
                        <AddOAQuestionForm onSuccess={() => {
                            if (onComplete) onComplete();
                        }} />
                    </TabsContent>

                    <TabsContent value="create-oa">
                        <CreateMockOAForm
                            companies={companies || []}
                            onSuccess={() => {
                                if (onComplete) onComplete();
                            }}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default MockOADesigner;

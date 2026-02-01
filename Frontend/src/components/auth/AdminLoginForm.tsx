import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AdminLoginFormProps {
    onSuccess?: () => void;
}

const AdminLoginForm = ({ onSuccess }: AdminLoginFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simple admin check - in production you'd use a more robust method
            // or verify via a custom claim in Firebase
            if (!email.includes('admin')) {
                throw new Error('This account does not have admin privileges');
            }

            await signInWithEmailAndPassword(auth, email, password);

            toast({
                title: "Admin login successful",
                description: "Welcome back, admin!"
            });

            if (onSuccess) onSuccess();
            navigate("/admin");
        } catch (error: any) {
            console.error("Admin login error:", error);
            toast({
                variant: "destructive",
                title: "Admin login failed",
                description: error.message || "Please check your admin credentials and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="grid gap-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input
                                id="email"
                                placeholder="admin@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                autoComplete="current-password"
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in as Admin
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginForm;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
    onSignUpClick: () => void;
    onSuccess?: () => void;
}

const LoginForm = ({ onSignUpClick, onSuccess }: LoginFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await loginUser(email, password);
    };

    const handleAdminLogin = () => {
        const adminEmail = "admin@gmail.com"; // Replace with actual admin email or get from .env
        const adminPassword = "admin123"; // In production, use environment variables
        loginUser(adminEmail, adminPassword);
    };

    const loginUser = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Sync with backend to check status (e.g. if blocked)
            const syncResponse = await fetch("http://localhost:5001/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    fullName: user.displayName || email.split('@')[0],
                    photoURL: user.photoURL
                })
            });

            if (syncResponse.status === 403) {
                const errorData = await syncResponse.json();
                await auth.signOut(); // Immediately sign out if blocked
                toast({
                    title: "Access Denied",
                    description: errorData.error || "Your account has been blocked.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            toast({
                title: "Welcome back!",
                description: "Successfully signed in.",
            });

            // Check if user is admin based on email (placeholder logic)
            if (email.endsWith('@admin.com') || email.includes('admin')) {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }

            onSuccess?.();
        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 py-4">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold font-mono tracking-tight">Welcome Back</h2>
                <p className="text-muted-foreground text-sm">
                    Enter your credentials to access your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-secondary/30"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button
                            type="button"
                            className="text-xs text-primary hover:underline underline-offset-4"
                            disabled={isLoading}
                        >
                            Forgot password?
                        </button>
                    </div>
                    <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-secondary/30"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-3">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>

                    </div>

                </div>



            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full" disabled={isLoading}>
                    Google
                </Button>
                <Button variant="outline" className="w-full" disabled={isLoading}>
                    GitHub
                </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                    onClick={onSignUpClick}
                    className="text-primary font-medium hover:underline underline-offset-4"
                    disabled={isLoading}
                >
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default LoginForm;

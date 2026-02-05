import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RegisterFormProps {
    onSignInClick: () => void;
    onSuccess?: () => void;
}

const RegisterForm = ({ onSignInClick, onSuccess }: RegisterFormProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            await updateProfile(userCredential.user, {
                displayName: formData.fullName,
            });

            toast({
                title: "Account created successfully!",
                description: `Welcome to CodePrep, ${formData.fullName}!`,
            });

            // Sync with MongoDB
            console.log("Starting backend sync for user:", userCredential.user.uid);
            try {
                const response = await fetch("http://localhost:5001/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid: userCredential.user.uid,
                        email: userCredential.user.email,
                        fullName: formData.fullName,
                        photoURL: userCredential.user.photoURL,
                    }),
                });

                if (response.status === 403) {
                    const errorData = await response.json();
                    await auth.signOut();
                    toast({
                        title: "Access Denied",
                        description: errorData.error || "This account has been blocked.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Backend sync failed with status: ${response.status}`);
                }

                console.log("Backend sync successful");
            } catch (syncError: any) {
                console.error("Failed to sync with backend:", syncError);
                // If it's not a 403 (which we handled above), show general error
                if (isLoading) {
                    toast({
                        title: "Sync Warning",
                        description: "Account created but failed to save in database. Please contact support.",
                        variant: "destructive",
                    });
                }
            }

            onSuccess?.();
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id.replace("register-", "")]: e.target.value });
    };

    return (
        <div className="space-y-6 py-4">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold font-mono tracking-tight">Create an Account</h2>
                <p className="text-muted-foreground text-sm">
                    Join CodePrep to practice and crack your next interview.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="register-fullName">Full Name</Label>
                    <Input
                        id="register-fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="bg-secondary/30"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-email">Email Address</Label>
                    <Input
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-secondary/30"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                            id="register-password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="bg-secondary/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                        <Input
                            id="register-confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="bg-secondary/30"
                        />
                    </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Get Started"
                    )}
                </Button>
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
                Already have an account?{" "}
                <button
                    onClick={onSignInClick}
                    className="text-primary font-medium hover:underline underline-offset-4"
                    disabled={isLoading}
                >
                    Sign In
                </button>
            </p>
        </div>
    );
};

export default RegisterForm;

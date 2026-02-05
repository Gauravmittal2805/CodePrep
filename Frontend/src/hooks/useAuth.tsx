import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    type User,
    signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthUser extends User {
    isAdmin?: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            try {
                if (fbUser) {
                    const idToken = await fbUser.getIdTokenResult();
                    const isAdminUser = !!(idToken.claims.admin === true || fbUser.email?.includes('admin'));

                    const authUser = fbUser as AuthUser;
                    authUser.isAdmin = isAdminUser;
                    setUser(authUser);
                    setIsAdmin(isAdminUser);
                } else {
                    setUser(null);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                setUser(null);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Periodic check for blocked status
    useEffect(() => {
        if (!user || loading) return;

        const checkStatus = async () => {
            try {
                const token = await user.getIdToken(true); // Force refresh to catch revocation
                const response = await fetch("http://localhost:5001/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                    })
                });

                if (response.status === 403) {
                    console.warn("[Auth] User is blocked, signing out...");
                    await logout();
                    window.location.href = "/"; // Redirect to home/login
                }
            } catch (error) {
                console.error("[Auth] Status check failed:", error);
            }
        };

        // Initial check
        checkStatus();

        // Check every 60 seconds
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, [user, loading]);

    return (
        <AuthContext.Provider value={{ user, loading, logout, isAdmin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

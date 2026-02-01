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
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, isAdmin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    userId: string | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(sessionStorage.getItem("user_id"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleAuth = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");
            const storedUserId = sessionStorage.getItem("user_id");

            if (storedUserId) {
                setUserId(storedUserId);
                setLoading(false);
                return;
            }

            if (!token) {
                window.location.href = '/token';
                return;
            }

            try {
                const response = await fetch("https://api.mantracare.com/user/user-info", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const id = data.user_id;

                    if (!id) {
                        window.location.href = '/token';
                        return;
                    }

                    sessionStorage.setItem("user_id", id);
                    setUserId(id);

                    // Remove token from URL
                    const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]+/, '').replace(/^&/, '?');
                    window.history.replaceState({}, '', newUrl);
                } else {
                    window.location.href = '/token';
                }
            } catch (error) {
                console.error("Auth handshake failed:", error);
                window.location.href = '/token';
            } finally {
                setLoading(false);
            }
        };

        handleAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-purple-900/50 font-medium">Verifying session...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ userId, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

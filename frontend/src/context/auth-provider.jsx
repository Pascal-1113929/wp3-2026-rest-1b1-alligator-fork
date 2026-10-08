import { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "@/utils/cookies";
import api from "@/utils/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [userToken, setUserToken] = useState(null);
    const [userObject, setUserObject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const token = getCookie("user-token");

        if (token) {
            (async () => {
                setUserToken(token);
                const response = await api("/user", "GET");
                if (!isMounted) return;

                if (response.ok) {
                    const data = await response.json();
                    setUserObject(data.user_object);
                } else {
                    setCookie("user-token", "", -1);
                    setUserToken(null);
                    setUserObject(null);
                }
                setLoading(false);
            })();
        } else {
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, []);

    const login = (token, user_object) => {
        setCookie("user-token", token, 28);
        setUserToken(token);
        setUserObject(user_object);
    };

    const logout = async () => {
        const response = await api("/auth/logout", "GET");
        if (response.ok) {
            setCookie("user-token", "", -1);
            setUserToken(null);
            setUserObject(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{ userToken, userObject, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

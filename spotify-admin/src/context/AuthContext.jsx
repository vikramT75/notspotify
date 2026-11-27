"use client";
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const isTokenExpired = (jwt) => {
    if (!jwt || typeof jwt !== "string") return true;
    try {
        const parts = jwt.split(".");
        if (parts.length !== 3) return true;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        const payload = JSON.parse(atob(padded));
        return !payload.exp || payload.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const url = process.env.NEXT_PUBLIC_API_URL || "";

    const clearSession = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (storedToken && storedUser && !isTokenExpired(storedToken)) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } else if (storedToken || storedUser) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        } catch (e) {
            // Stale or malformed data in localStorage — wipe and start fresh
            console.warn("AuthContext: clearing corrupted localStorage", e);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } finally {
            // Always clear the loading state, no matter what
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${url}/api/auth/login`, { username, password });
            const { token: newToken, role, email } = response.data;
            
            const userData = { email, username, role };
            if (role !== "ADMIN") {
                return { success: false, message: "Access denied. You do not have ADMIN privileges." };
            }

            setToken(newToken);
            setUser(userData);
            
            localStorage.setItem("token", newToken);
            localStorage.setItem("user", JSON.stringify(userData));
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.response?.data || "Login failed" };
        }
    };

    const signup = async (username, email, password) => {
        try {
            const response = await axios.post(`${url}/api/auth/signup`, { username, email, password });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data || "Signup failed" };
        }
    };

    const logout = () => {
        clearSession();
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, clearSession }}>
            {children}
        </AuthContext.Provider>
    );
};

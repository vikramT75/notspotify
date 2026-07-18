"use client";
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const url = "http://localhost:4000";

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${url}/api/auth/login`, { username, password });
            const { token, role, email } = response.data;
            
            const userData = { email, username, role };
            setToken(token);
            setUser(userData);
            
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            window.location.reload();
            return { success: true };
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
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

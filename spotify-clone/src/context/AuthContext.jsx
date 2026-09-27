"use client";
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const [likedSongs, setLikedSongs] = useState([]);

    const fetchLikedSongs = async (currentToken) => {
        try {
            const response = await axios.get(`${url}/api/user/liked-songs`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            if (response.data.success) {
                setLikedSongs(response.data.likedSongs);
            }
        } catch (error) {
            console.error("Failed to fetch liked songs:", error);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            fetchLikedSongs(storedToken);
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
            await fetchLikedSongs(token);
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
        setLikedSongs([]);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
    };

    const toggleLike = async (song) => {
        if (!token) return { success: false, message: "Please login to like songs" };
        
        const isLiked = likedSongs.some(s => s._id === song._id);
        const endpoint = isLiked ? "unlike-song" : "like-song";
        
        try {
            const response = await axios.post(`${url}/api/user/${endpoint}`, { songId: song._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                if (isLiked) {
                    setLikedSongs(prev => prev.filter(s => s._id !== song._id));
                } else {
                    setLikedSongs(prev => [...prev, song]);
                }
            }
            return response.data;
        } catch (error) {
            console.error("Error toggling like:", error);
            return { success: false, message: "Error" };
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, likedSongs, toggleLike }}>
            {children}
        </AuthContext.Provider>
    );
};

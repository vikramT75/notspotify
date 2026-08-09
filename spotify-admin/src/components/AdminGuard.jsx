"use client";
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AdminGuard = ({ children }) => {
    const { user, login, loading, logout } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const interceptor = axios.interceptors.request.use(config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        return () => axios.interceptors.request.eject(interceptor);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(username, password);
        if (!res.success) {
            setError(res.message.toString());
        } else {
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            if (loggedInUser.role !== 'ADMIN') {
                logout();
                setError("Access denied. You do not have ADMIN privileges.");
            }
        }
    };

    // Loading — show a proper full-screen spinner, not a bare text node
    if (loading) {
        return (
            <div style={{
                position: 'fixed', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#F3FFF7', fontSize: '1.1rem', color: '#555'
            }}>
                Loading...
            </div>
        );
    }

    // Not authenticated or not ADMIN — show login form
    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-[#F3FFF7] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                    <h2 className="text-2xl font-bold text-center mb-6 text-black">Admin Panel Login</h2>
                    {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Admin Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border p-2 rounded text-black"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 rounded text-black"
                            required
                        />
                        <button type="submit" className="bg-green-600 text-white font-bold py-2 rounded mt-2 hover:bg-green-700">
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminGuard;

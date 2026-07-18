import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthModal = ({ onClose, defaultIsLogin = true }) => {
    const { login, signup } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(defaultIsLogin);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!isLogin) {
            // Regex to check if password contains 8 or more consecutive digits (looks like a phone number)
            if (/\d{8,}/.test(password)) {
                setError("Password cannot contain a phone number.");
                return;
            }
        }

        if (isLogin) {
            const res = await login(username, password);
            if (res.success) {
                onClose();
            } else {
                setError(res.message.toString());
            }
        } else {
            const res = await signup(username, email, password);
            if (res.success) {
                setIsLogin(true); // Switch to login after successful signup
                setSuccessMsg('Signup successful! Please log in.');
                setPassword('');
            } else {
                setError(res.message.toString());
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#121212] p-8 rounded-xl w-[90%] max-w-md relative border border-zinc-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xl">
                    &times;
                </button>
                <h2 className="text-3xl font-bold mb-6 text-center text-white">
                    {isLogin ? 'Log in to NotSpotify' : 'Sign up to start listening'}
                </h2>
                
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}
                {successMsg && <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded mb-4 text-sm text-center">{successMsg}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-white">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#121212] border border-zinc-500 rounded p-3 text-white focus:border-white focus:outline-none"
                                required
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-white">Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-[#121212] border border-zinc-500 rounded p-3 text-white focus:border-white focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-white">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-[#121212] border border-zinc-500 rounded p-3 text-white focus:border-white focus:outline-none"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-green-500 text-black font-bold py-3 rounded-full mt-4 hover:scale-105 transition">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-zinc-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                        className="text-white font-bold uppercase tracking-widest hover:text-green-500 mt-2"
                    >
                        {isLogin ? 'Sign up for NotSpotify' : 'Log in here'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;

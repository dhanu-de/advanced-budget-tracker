import React, { useState } from 'react';
import { Mail, Lock, User, Loader } from 'lucide-react';
import { login, register, guest } from '../../services/firebaseService';

const SignInPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
            try {
            let userResult;
            if (isRegister) {
                const userCredential = await register(email, password, name);
                userResult = userCredential.user || userCredential;
            } else {
                const userCredential = await login(email, password);
                userResult = userCredential.user || userCredential;
            }
            onLogin(userResult);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const userCredential = await guest();
            const userResult = userCredential.user || userCredential;
            onLogin(userResult);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-primary">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-500 mt-1">
                        {isRegister ? 'Start planning your future finances.' : 'Sign in to access BudgetFlow Pro.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {isRegister && (
                        <label className="block">
                            <span className="text-sm font-medium flex items-center">
                                <User className="w-4 h-4 mr-1" /> Name
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </label>
                    )}
                    <label className="block">
                        <span className="text-sm font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-1" /> Email
                        </span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium flex items-center">
                            <Lock className="w-4 h-4 mr-1" /> Password
                        </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        {isRegister ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
                    <span className="mx-4 flex-shrink text-sm text-gray-500">or</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
                </div>

                <button
                    onClick={handleGuestLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-gray-100 dark:bg-gray-700"
                >
                    <User className="w-5 h-5 mr-2 text-gray-500" />
                    Continue as Guest
                </button>

                <div className="mt-4 text-center text-sm">
                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        className="text-primary hover:underline font-medium"
                    >
                        {isRegister ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
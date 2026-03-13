"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LOGIN_MUTATION } from '@/lib/graphql/mutations';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff, Loader2, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: LOGIN_MUTATION,
                    variables: { username, password }
                })
            });

            const { data, errors } = await res.json();

            if (errors) {
                setError(errors[0].message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.');
            } else if (data?.login) {
                const { authToken, refreshToken, user } = data.login;
                setAuth(user, authToken, refreshToken);
                router.push('/my-account');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative z-10 p-12 flex-col justify-between">
                <div>
                    <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">L</span>
                        LMC
                    </Link>
                </div>

                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                        Chào mừng trở lại<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">với LMC</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                        Đăng nhập để trải nghiệm công nghệ mới nhất, quản lý đơn hàng và nhận các ưu đãi độc quyền.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br border-2 border-[#0a0a0a] ${i === 1 ? 'from-blue-400' : i === 2 ? 'from-purple-400' : i === 3 ? 'from-pink-400' : 'from-yellow-400'}`}></div>
                        ))}
                    </div>
                    <span>Hơn 10,000+ khách hàng tin tưởng</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Đăng nhập</h2>
                            <p className="text-gray-400">Nhập thông tin để tiếp tục</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Tên đăng nhập hoặc Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="username hoặc email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Mật khẩu</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0" />
                                    <span className="text-gray-400">Ghi nhớ đăng nhập</span>
                                </label>
                                <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    <>
                                        Đăng nhập
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-gray-400">
                                Chưa có tài khoản?{' '}
                                <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

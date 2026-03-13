"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { REGISTER_USER_MUTATION } from '@/lib/graphql/mutations';
import { Eye, EyeOff, Loader2, Lock, Mail, User, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const passwordRequirements = [
        { met: username.length >= 3, text: 'Tên đăng nhập có ít nhất 3 ký tự' },
        { met: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), text: 'Email hợp lệ' },
        { met: password.length >= 6, text: 'Mật khẩu có ít nhất 6 ký tự' },
    ];

    const canSubmit = username.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: REGISTER_USER_MUTATION,
                    variables: { username, email, password }
                })
            });

            const { data, errors } = await res.json();

            if (errors) {
                setError(errors[0].message || 'Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã tồn tại.');
            } else if (data?.registerUser) {
                alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
                router.push('/login');
            }
        } catch (err) {
            console.error('Register error:', err);
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
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
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
                        Tham gia cùng<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">cộng đồng LMC</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                        Tạo tài khoản để nhận các ưu đãi độc quyền, theo dõi đơn hàng và trải nghiệm công nghệ tuyệt vời.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { icon: '🚀', title: 'Giao hàng nhanh', desc: 'Freeship toàn quốc' },
                        { icon: '🛡️', title: 'Bảo hành chính hãng', desc: 'Hỗ trợ kỹ thuật 24/7' },
                        { icon: '💳', title: 'Trả góp 0%', desc: 'Thủ tục đơn giản' },
                        { icon: '🎁', title: 'Nhiều ưu đãi', desc: 'Quà tặng hấp dẫn' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="text-2xl mb-2">{item.icon}</div>
                            <div className="font-semibold text-white text-sm">{item.title}</div>
                            <div className="text-gray-500 text-xs">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Tạo tài khoản</h2>
                            <p className="text-gray-400">Điền thông tin để đăng ký</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Tên đăng nhập</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        placeholder="User123"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        placeholder="your-email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Mật khẩu</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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

                            {/* Password Requirements */}
                            <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                {passwordRequirements.map((req, i) => (
                                    <div key={i} className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-400' : 'text-gray-500'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                                            {req.met && <Check className="w-3 h-3" />}
                                        </div>
                                        {req.text}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-start gap-2 text-sm">
                                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-600 bg-white/5 text-purple-500 focus:ring-purple-500/50 focus:ring-offset-0" />
                                <span className="text-gray-400">
                                    Tôi đồng ý với{' '}
                                    <Link href="/terms" className="text-purple-400 hover:text-purple-300">Điều khoản</Link>
                                    {' '}và{' '}
                                    <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Chính sách bảo mật</Link>
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !canSubmit}
                                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang tạo tài khoản...
                                    </>
                                ) : (
                                    <>
                                        Tạo tài khoản
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-gray-400">
                                Đã có tài khoản?{' '}
                                <Link href="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

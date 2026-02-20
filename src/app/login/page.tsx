"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LOGIN_MUTATION } from '@/lib/graphql/mutations';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
                alert('Đăng nhập thành công!');
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
        <div className="container mx-auto px-4 py-16 max-w-md">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Đăng nhập</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập hoặc Email</label>
                        <Input
                            type="text"
                            required
                            placeholder="username hoặc email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                        <Input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full font-bold h-12 text-lg"
                    >
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-blue-600 font-bold hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

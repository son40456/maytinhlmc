"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { REGISTER_USER_MUTATION } from '@/lib/graphql/mutations';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                setSuccess(true);
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
        <div className="container mx-auto px-4 py-16 max-w-md">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Đăng ký tài khoản</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                        <Input
                            type="text"
                            required
                            placeholder="User123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <Input
                            type="email"
                            required
                            placeholder="your-email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-blue-600 font-bold hover:underline">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

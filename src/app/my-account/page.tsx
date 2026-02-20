"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { GET_CUSTOMER_DETAILS } from '@/lib/graphql/queries';

export default function MyAccountPage() {
    const { user, token, logout, isAuthenticated } = useAuthStore();
    const [customerData, setCustomerData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchCustomerDetails = async () => {
            try {
                const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        query: GET_CUSTOMER_DETAILS
                    })
                });

                const { data } = await res.json();
                if (data?.customer) {
                    setCustomerData(data.customer);
                }
            } catch (err) {
                console.error('Error fetching customer details:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomerDetails();
    }, [isAuthenticated, token, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-gray-600">Đang tải dữ liệu tài khoản...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-1/4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">Trang cá nhân</button>
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">Đơn hàng</button>
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">Địa chỉ</button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md mt-4"
                            >
                                Đăng xuất
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="w-full lg:w-3/4">
                    <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                        <h1 className="text-2xl font-bold text-gray-900 mb-8">Xin chào, {customerData?.displayName || user?.name}!</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-2">Thông tin tài khoản</h3>
                                <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-700">Tên:</span> {customerData?.firstName} {customerData?.lastName}</p>
                                <p className="text-sm text-gray-600 mb-4"><span className="font-medium text-gray-700">Email:</span> {customerData?.email}</p>
                                <Button variant="outline" size="sm">Chỉnh sửa</Button>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-2">Đơn hàng mới nhất</h3>
                                {customerData?.orders?.nodes?.length > 0 ? (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1 font-medium">#{customerData.orders.nodes[0].orderNumber}</p>
                                        <p className="text-sm text-gray-500 mb-4">{new Date(customerData.orders.nodes[0].date).toLocaleDateString('vi-VN')}</p>
                                        <Button variant="outline" size="sm">Xem tất cả đơn hàng</Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mb-4">Bạn chưa đặt đơn hàng nào.</p>
                                )}
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="py-4 px-2">Đơn hàng</th>
                                        <th className="py-4 px-2">Ngày</th>
                                        <th className="py-4 px-2">Trạng thái</th>
                                        <th className="py-4 px-2">Tổng cộng</th>
                                        <th className="py-4 px-2">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerData?.orders?.nodes?.map((order: any) => (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-2 font-bold text-blue-600">#{order.orderNumber}</td>
                                            <td className="py-4 px-2 text-sm text-gray-600">{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                                            <td className="py-4 px-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 font-bold">{order.total}</td>
                                            <td className="py-4 px-2">
                                                <Button variant="outline" size="sm">Xem chi tiết</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!customerData?.orders?.nodes || customerData.orders.nodes.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-500 italic">Trống</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { GET_CUSTOMER_DETAILS } from '@/lib/graphql/queries';
import { User, Package, MapPin, LogOut, Edit, Eye, Clock, ShieldCheck, Mail, Phone, Map, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MyAccountPage() {
    const { user, token, logout, isAuthenticated } = useAuthStore();
    const [customerData, setCustomerData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
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
            <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Đang đồng bộ dữ liệu tài khoản...</p>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: <User className="w-5 h-5" /> },
        { id: 'orders', label: 'Quản lý đơn hàng', icon: <Package className="w-5 h-5" /> },
        { id: 'address', label: 'Sổ địa chỉ', icon: <MapPin className="w-5 h-5" /> },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PROCESSING': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Đã giao hàng';
            case 'PROCESSING': return 'Đang xử lý';
            case 'CANCELLED': return 'Đã huỷ';
            case 'PENDING': return 'Chờ thanh toán';
            default: return status;
        }
    };

    return (
        <div className="pb-24">
            <div className="bg-[#004b91] pt-12 pb-24 border-b border-[#003d7a]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">Tài khoản của tôi</h1>
                    <p className="text-blue-100 mt-2">Quản lý thông tin cá nhân và lịch sử mua hàng</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-[280px] shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-1">
                            {/* User Profile Summary */}
                            <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
                                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-lg shadow-blue-500/30 mb-4 ring-4 ring-blue-50">
                                    {customerData?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                                </div>
                                <h2 className="font-bold text-gray-900 text-lg">{customerData?.displayName || user?.name}</h2>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Thành viên StoreNext
                                </p>
                            </div>

                            {/* Navigation Menu */}
                            <nav className="p-3 space-y-1.5">
                                {menuItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                    >
                                        <span className={`${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`}>{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                                <div className="pt-3 mt-3 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <span className="text-red-400"><LogOut className="w-5 h-5" /></span>
                                        Đăng xuất
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="w-full lg:flex-1">

                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Welcome Banner */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-black text-gray-900 mb-2">Xin chào, {customerData?.firstName || user?.name}! 👋</h2>
                                        <p className="text-gray-600 leading-relaxed max-w-lg">Từ bảng điều khiển tài khoản của bạn, bạn có thể xem các đơn đặt hàng gần đây, quản lý địa chỉ giao hàng và chỉnh sửa mật khẩu cũng như chi tiết tài khoản của mình.</p>
                                    </div>
                                </div>

                                {/* Overview Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Profile Card */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/30 overflow-hidden group">
                                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <User className="w-5 h-5 text-blue-500" /> Thông tin cá nhân
                                            </h3>
                                            <button className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Chỉnh sửa">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                    <Mail className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Địa chỉ Email</p>
                                                    <p className="font-medium text-gray-900">{customerData?.email || user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                    <Phone className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Số điện thoại</p>
                                                    <p className="font-medium text-gray-900">
                                                        {customerData?.billing?.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Default Address Card */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/30 overflow-hidden group">
                                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-rose-500" /> Địa chỉ giao hàng
                                            </h3>
                                            <button className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Chỉnh sửa">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            {customerData?.billing?.address1 ? (
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                                        <Map className="w-5 h-5 text-rose-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 mb-1">{customerData?.firstName} {customerData?.lastName}</p>
                                                        <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                                            {customerData.billing.address1}<br />
                                                            {customerData.billing.city && `${customerData.billing.city}, `}
                                                            {customerData.billing.state}
                                                        </p>
                                                        <p className="text-sm font-medium text-gray-900">{customerData.billing.phone}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-4">
                                                    <MapPin className="w-12 h-12 text-gray-200 mb-3" />
                                                    <p className="text-sm">Bạn chưa thiết lập địa chỉ giao hàng mặc định.</p>
                                                    <button onClick={() => setActiveTab('address')} className="mt-4 text-blue-600 font-bold hover:underline text-sm">Thêm địa chỉ ngay</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(activeTab === 'orders' || activeTab === 'dashboard') && (
                            <div className={`bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden ${activeTab === 'dashboard' ? 'mt-6' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both`}>
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-indigo-500" /> {activeTab === 'dashboard' ? 'Đơn hàng gần đây' : 'Lịch sử mua hàng'}
                                    </h2>
                                    {activeTab === 'dashboard' && customerData?.orders?.nodes?.length > 0 && (
                                        <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                            Xem tất cả &rarr;
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white">
                                                <th className="py-4 px-6">Mã Đơn</th>
                                                <th className="py-4 px-6">Ngày Đặt</th>
                                                <th className="py-4 px-6">Trạng thái</th>
                                                <th className="py-4 px-6 text-right">Tổng Tiền</th>
                                                <th className="py-4 px-6 text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {customerData?.orders?.nodes?.map((order: any) => (
                                                <React.Fragment key={order.id}>
                                                    <tr
                                                        className={`hover:bg-blue-50/30 transition-colors group/row cursor-pointer ${expandedOrder === order.id ? 'bg-blue-50/50' : ''}`}
                                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                    >
                                                        <td className="py-4 px-6">
                                                            <span className="font-bold text-gray-900 group-hover/row:text-blue-600 transition-colors">#{order.orderNumber}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                {new Date(order.date).toLocaleDateString('vi-VN')}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusStyle(order.status)}`}>
                                                                {getStatusLabel(order.status)}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 font-bold text-red-600 text-right">{order.total}</td>
                                                        <td className="py-4 px-6 text-center">
                                                            <button
                                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${expandedOrder === order.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 group-hover/row:bg-blue-100 group-hover/row:text-blue-600'}`}
                                                                title="Xem chi tiết"
                                                            >
                                                                {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedOrder === order.id && (
                                                        <tr className="bg-gray-50/50 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <td colSpan={5} className="p-0">
                                                                <div className="p-6">
                                                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                                        <Package className="w-4 h-4 text-gray-500" /> Chi tiết sản phẩm
                                                                    </h4>
                                                                    <div className="space-y-4">
                                                                        {order.lineItems?.nodes?.map((item: any, index: number) => (
                                                                            <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                                                                                    {item.product?.node?.image?.sourceUrl ? (
                                                                                        <Image
                                                                                            src={item.product.node.image.sourceUrl}
                                                                                            alt={item.product.node.name}
                                                                                            fill
                                                                                            className="object-cover"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                                                            <Package className="w-6 h-6" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <Link href={`/${item.product?.node?.slug || '#'}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm line-clamp-2 leading-snug">
                                                                                        {item.product?.node?.name || 'Sản phẩm không xác định'}
                                                                                    </Link>
                                                                                    <p className="text-sm text-gray-500 mt-1">Số lượng: <span className="font-medium text-gray-900">x{item.quantity}</span></p>
                                                                                </div>
                                                                                <div className="text-right shrink-0">
                                                                                    <p className="font-bold text-gray-900">{item.total}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="mt-6 pt-5 border-t border-gray-200/60 flex flex-col items-end gap-2 text-sm">
                                                                        <div className="flex justify-between w-full max-w-xs text-gray-600">
                                                                            <span>Tạm tính:</span>
                                                                            <span className="font-medium text-gray-900">{order.subtotal}</span>
                                                                        </div>
                                                                        <div className="flex justify-between w-full max-w-xs text-gray-600">
                                                                            <span>Phí vận chuyển ({order.shippingMethod}):</span>
                                                                            <span className="font-medium text-gray-900">{order.shippingTotal}</span>
                                                                        </div>
                                                                        <div className="flex justify-between w-full max-w-xs text-gray-800 pt-2 border-t border-gray-100">
                                                                            <span className="font-bold">Tổng cộng:</span>
                                                                            <span className="font-black text-rose-600 text-lg">{order.total}</span>
                                                                        </div>
                                                                        <div className="flex justify-between w-full max-w-xs text-gray-500 mt-1 text-xs">
                                                                            <span>Phương thức thanh toán:</span>
                                                                            <span>{order.paymentMethodTitle}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            {(!customerData?.orders?.nodes || customerData.orders.nodes.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="py-16 text-center">
                                                        <div className="max-w-xs mx-auto">
                                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <Package className="w-10 h-10 text-gray-300" />
                                                            </div>
                                                            <p className="text-gray-900 font-bold mb-1">Chưa có đơn hàng nào</p>
                                                            <p className="text-sm text-gray-500 mb-6">Bạn chưa thực hiện giao dịch nào trên hệ thống.</p>
                                                            <Link href="/" className="inline-block bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                                                Tiếp tục mua sắm
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-10 h-10 text-gray-300" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Sổ địa chỉ</h2>
                                <p className="text-gray-500 mb-6">Tính năng thêm địa chỉ mới đang được cập nhật.</p>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
}

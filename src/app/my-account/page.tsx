"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { GET_CUSTOMER_DETAILS } from '@/lib/graphql/queries';
import { UPDATE_CUSTOMER_MUTATION, UPDATE_USER_MUTATION } from '@/lib/graphql/mutations';
import {
    User, Package, MapPin, LogOut, Edit, Clock, ShieldCheck, Mail, Phone,
    ChevronDown, ChevronUp, Lock, Save, X, Loader2, CheckCircle, Home, Truck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MyAccountPage() {
    const { user, token, logout, isAuthenticated } = useAuthStore();
    const [customerData, setCustomerData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const router = useRouter();

    // Edit profile state
    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Change password state
    const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showPw, setShowPw] = useState(false);

    // Address state
    const [editAddress, setEditAddress] = useState<'billing' | 'shipping' | null>(null);
    const [billingForm, setBillingForm] = useState<any>({});
    const [shippingForm, setShippingForm] = useState<any>({});
    const [addrSaving, setAddrSaving] = useState(false);
    const [addrMsg, setAddrMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [ready, setReady] = useState(false);

    // Wait for hydration before checking auth
    useEffect(() => {
        // Use a small timeout to ensure hydration completes
        const timer = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!ready) return;
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
                    body: JSON.stringify({ query: GET_CUSTOMER_DETAILS })
                });

                const json = await res.json();
                const { data, errors } = json;

                if (errors) {
                    console.error('GraphQL Errors:', errors);
                }

                if (data?.customer) {
                    const c = data.customer;
                    setCustomerData(c);
                    setProfileForm({ firstName: c.firstName || '', lastName: c.lastName || '', email: c.email || '' });
                    setBillingForm(c.billing || {});
                    setShippingForm(c.shipping || {});
                }
            } catch (err) {
                console.error('Error fetching customer details:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomerDetails();
    }, [ready, isAuthenticated, token, router]);

    const gqlFetch = async (query: string, variables: any) => {
        const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ query, variables })
        });
        return res.json();
    };

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        setProfileMsg(null);
        try {
            const { data, errors } = await gqlFetch(UPDATE_USER_MUTATION, {
                input: { id: user?.id, firstName: profileForm.firstName, lastName: profileForm.lastName }
            });
            if (errors) throw new Error(errors[0].message);
            setCustomerData((prev: any) => ({ ...prev, ...data.updateUser.user }));
            setProfileMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            setEditProfile(false);
        } catch (e: any) {
            setProfileMsg({ type: 'error', text: e.message || 'Cập nhật thất bại.' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwMsg({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự.' });
            return;
        }
        setPwSaving(true);
        setPwMsg(null);
        try {
            const { errors } = await gqlFetch(UPDATE_USER_MUTATION, {
                input: { id: user?.id, password: pwForm.newPassword }
            });
            if (errors) throw new Error(errors[0].message);
            setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPwForm({ newPassword: '', confirmPassword: '' });
        } catch (e: any) {
            setPwMsg({ type: 'error', text: e.message || 'Đổi mật khẩu thất bại.' });
        } finally {
            setPwSaving(false);
        }
    };

    const handleSaveAddress = async (type: 'billing' | 'shipping') => {
        setAddrSaving(true);
        setAddrMsg(null);
        try {
            const input = type === 'billing'
                ? { billing: billingForm }
                : { shipping: shippingForm };
            const { errors } = await gqlFetch(UPDATE_CUSTOMER_MUTATION, { input });
            if (errors) throw new Error(errors[0].message);
            setAddrMsg({ type: 'success', text: 'Cập nhật địa chỉ thành công!' });
            setEditAddress(null);
        } catch (e: any) {
            setAddrMsg({ type: 'error', text: e.message || 'Cập nhật thất bại.' });
        } finally {
            setAddrSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!ready || isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: <User className="w-5 h-5" /> },
        { id: 'orders', label: 'Đơn hàng', icon: <Package className="w-5 h-5" /> },
        { id: 'address', label: 'Địa chỉ', icon: <MapPin className="w-5 h-5" /> },
        { id: 'security', label: 'Bảo mật', icon: <Lock className="w-5 h-5" /> },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'PROCESSING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'PENDING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
        <div className="min-h-screen bg-[#0a0a0a] pb-20">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                    Tài khoản của tôi
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky" style={{ top: '24px' }}>
                            <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-white/10">
                                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-3 ring-4 ring-white/10">
                                    {customerData?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                                </div>
                                <h2 className="font-bold text-white text-lg">{customerData?.displayName || user?.name}</h2>
                                <p className="text-sm text-gray-400 mt-1">Thành viên LMC</p>
                            </div>

                            <nav className="space-y-2">
                                {menuItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === item.id ? 'bg-white/10 text-white border border-white/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-4 border-t border-white/10"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Đăng xuất
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-6">
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Xin chào, {customerData?.firstName || user?.name}! 👋</h2>
                                    <p className="text-gray-400">Quản lý thông tin cá nhân, đơn hàng và địa chỉ giao hàng.</p>
                                </div>

                                <div className="grid gap-6">
                                    {/* Profile Quick View */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Thông tin cá nhân</h3>
                                            <button onClick={() => setEditProfile(!editProfile)} className="text-sm text-blue-400 hover:text-blue-300">{editProfile ? 'Hủy' : 'Chỉnh sửa'}</button>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500 uppercase">Họ & Tên</p>
                                                {editProfile ? (
                                                    <div className="flex gap-2">
                                                        <input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Họ" />
                                                        <input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Tên" />
                                                    </div>
                                                ) : <p className="text-white">{customerData?.firstName} {customerData?.lastName}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500 uppercase">Email</p>
                                                {editProfile ? (
                                                    <input value={profileForm.email} disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed" />
                                                ) : <p className="text-white">{customerData?.email}</p>}
                                            </div>
                                        </div>
                                        {editProfile && (
                                            <div className="mt-4 flex items-center gap-3">
                                                <button onClick={handleSaveProfile} disabled={profileSaving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Lưu thay đổi
                                                </button>
                                                {profileMsg && <span className={`text-sm ${profileMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{profileMsg.text}</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Address */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-rose-400" /> Địa chỉ giao hàng</h3>
                                            <button onClick={() => setActiveTab('address')} className="text-sm text-blue-400 hover:text-blue-300">Quản lý</button>
                                        </div>
                                        <div className="text-gray-300">
                                            {billingForm.address1 ? (
                                                <div>
                                                    <p className="font-bold text-white">{billingForm.firstName} {billingForm.lastName}</p>
                                                    <p>{billingForm.address1}, {billingForm.city}, {billingForm.state}</p>
                                                    <p>{billingForm.phone}</p>
                                                </div>
                                            ) : <p className="text-gray-500 italic">Chưa cập nhật</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-purple-400" /> Lịch sử đơn hàng</h2>
                                </div>

                                {/* Hiển thị thông báo nếu không có đơn hàng */}
                                {(!customerData?.orders?.nodes?.length) && (
                                    <div className="p-12 text-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-10 h-10 text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">Chưa có đơn hàng nào</h3>
                                        <p className="text-gray-400 mb-6 text-sm max-w-md mx-auto">
                                            Bạn chưa có đơn hàng nào trong tài khoản này. Các đơn hàng đặt khi chưa đăng nhập (guest checkout) sẽ không hiển thị ở đây.
                                        </p>
                                        <Link href="/" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                                            Tiếp tục mua sắm
                                        </Link>
                                    </div>
                                )}

                                {customerData?.orders?.nodes?.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {customerData.orders.nodes.map((order: any) => (
                                            <div key={order.id} className="p-6 hover:bg-white/5 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-white">#{order.orderNumber}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusStyle(order.status)}`}>{getStatusLabel(order.status)}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(order.date).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-white">{order.total}</p>
                                                        <p className="text-sm text-gray-400">{order.lineItems?.nodes?.length} sản phẩm</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                        {expandedOrder === order.id ? 'Ẩn' : 'Xem'} chi tiết
                                                        {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {expandedOrder === order.id && (
                                                    <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                        {order.lineItems?.nodes?.map((item: any, i: number) => (
                                                            <div key={i} className="flex gap-4">
                                                                <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden relative shrink-0">
                                                                    {item.product?.node?.image?.sourceUrl ? (
                                                                        <Image src={item.product.node.image.sourceUrl} alt={item.product.node.name} fill className="object-cover" />
                                                                    ) : <div className="w-full h-full flex items-center justify-center text-gray-500"><Package className="w-6 h-6" /></div>}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Link href={`/${item.product?.node?.slug}`} className="text-white hover:text-blue-400 font-medium">{item.product?.node?.name}</Link>
                                                                    <p className="text-sm text-gray-400">x{item.quantity}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-white font-medium">{item.total}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="pt-4 border-t border-white/10 flex justify-between text-sm">
                                                            <span className="text-gray-400">Tạm tính</span>
                                                            <span className="text-white">{order.subtotal}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-400">Phí vận chuyển</span>
                                                            <span className="text-white">{order.shippingTotal}</span>
                                                        </div>
                                                        <div className="flex justify-between font-bold">
                                                            <span className="text-white">Tổng cộng</span>
                                                            <span className="text-white">{order.total}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="space-y-6">
                                {addrMsg && (
                                    <div className={`p-4 rounded-xl border ${addrMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                        {addrMsg.text}
                                    </div>
                                )}
                                {/* Billing Address */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Home className="w-5 h-5 text-rose-400" /> Địa chỉ thanh toán</h3>
                                        <button onClick={() => setEditAddress(editAddress === 'billing' ? null : 'billing')} className="text-sm text-blue-400 hover:text-blue-300">{editAddress === 'billing' ? 'Hủy' : 'Chỉnh sửa'}</button>
                                    </div>
                                    {editAddress === 'billing' ? (
                                        <div className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <input value={billingForm.firstName || ''} onChange={e => setBillingForm({...billingForm, firstName: e.target.value})} placeholder="Họ" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                                <input value={billingForm.lastName || ''} onChange={e => setBillingForm({...billingForm, lastName: e.target.value})} placeholder="Tên" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                                <input value={billingForm.phone || ''} onChange={e => setBillingForm({...billingForm, phone: e.target.value})} placeholder="Điện thoại" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                                <input value={billingForm.email || ''} onChange={e => setBillingForm({...billingForm, email: e.target.value})} placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                            </div>
                                            <input value={billingForm.address1 || ''} onChange={e => setBillingForm({...billingForm, address1: e.target.value})} placeholder="Địa chỉ" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <input value={billingForm.city || ''} onChange={e => setBillingForm({...billingForm, city: e.target.value})} placeholder="Thành phố" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                                <input value={billingForm.state || ''} onChange={e => setBillingForm({...billingForm, state: e.target.value})} placeholder="Quận/Huyện" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                                <input value={billingForm.postcode || ''} onChange={e => setBillingForm({...billingForm, postcode: e.target.value})} placeholder="Mã bưu điện" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                            </div>
                                            <button onClick={() => handleSaveAddress('billing')} disabled={addrSaving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                                                {addrSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu địa chỉ
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-gray-300">
                                            {billingForm.address1 ? (
                                                <div>
                                                    <p className="font-bold text-white">{billingForm.firstName} {billingForm.lastName}</p>
                                                    <p>{billingForm.address1}</p>
                                                    <p>{billingForm.city}, {billingForm.state} {billingForm.postcode}</p>
                                                    <p>{billingForm.phone}</p>
                                                </div>
                                            ) : <p className="text-gray-500 italic">Chưa cập nhật</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Truck className="w-5 h-5 text-emerald-400" /> Địa chỉ giao hàng</h3>
                                        <button onClick={() => setEditAddress(editAddress === 'shipping' ? null : 'shipping')} className="text-sm text-blue-400 hover:text-blue-300">{editAddress === 'shipping' ? 'Hủy' : 'Chỉnh sửa'}</button>
                                    </div>
                                    {editAddress === 'shipping' ? (
                                        <div className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <input value={shippingForm.firstName || ''} onChange={e => setShippingForm({...shippingForm, firstName: e.target.value})} placeholder="Họ" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                                <input value={shippingForm.lastName || ''} onChange={e => setShippingForm({...shippingForm, lastName: e.target.value})} placeholder="Tên" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                            </div>
                                            <input value={shippingForm.address1 || ''} onChange={e => setShippingForm({...shippingForm, address1: e.target.value})} placeholder="Địa chỉ" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <input value={shippingForm.city || ''} onChange={e => setShippingForm({...shippingForm, city: e.target.value})} placeholder="Thành phố" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                                <input value={shippingForm.state || ''} onChange={e => setShippingForm({...shippingForm, state: e.target.value})} placeholder="Quận/Huyện" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                                <input value={shippingForm.postcode || ''} onChange={e => setShippingForm({...shippingForm, postcode: e.target.value})} placeholder="Mã bưu điện" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                                            </div>
                                            <button onClick={() => handleSaveAddress('shipping')} disabled={addrSaving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                                                {addrSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu địa chỉ
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-gray-300">
                                            {shippingForm.address1 ? (
                                                <div>
                                                    <p className="font-bold text-white">{shippingForm.firstName} {shippingForm.lastName}</p>
                                                    <p>{shippingForm.address1}</p>
                                                    <p>{shippingForm.city}, {shippingForm.state} {shippingForm.postcode}</p>
                                                </div>
                                            ) : <p className="text-gray-500 italic">Chưa cập nhật</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-yellow-400" /> Đổi mật khẩu</h2>
                                {pwMsg && (
                                    <div className={`mb-6 p-4 rounded-xl border ${pwMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                        {pwMsg.text}
                                    </div>
                                )}
                                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Mật khẩu mới</label>
                                        <div className="relative">
                                            <input
                                                type={showPw ? "text" : "password"}
                                                value={pwForm.newPassword}
                                                onChange={e => setPwForm({...pwForm, newPassword: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white pr-10"
                                                placeholder="Nhập mật khẩu mới"
                                            />
                                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                {showPw ? <X className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Xác nhận mật khẩu</label>
                                        <input
                                            type="password"
                                            value={pwForm.confirmPassword}
                                            onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="Nhập lại mật khẩu"
                                        />
                                    </div>
                                    <button type="submit" disabled={pwSaving || !pwForm.newPassword} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50">
                                        {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Cập nhật mật khẩu
                                    </button>
                                </form>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

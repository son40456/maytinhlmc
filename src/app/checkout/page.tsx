"use client";

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ADD_TO_CART, CHECKOUT_MUTATION } from '@/lib/graphql/mutations';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldCheck, Truck, CreditCard, CheckCircle2, ShoppingBag, MapPin, Package, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { items, getRawTotal, clearCart } = useCartStore();
    const { user, token, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const total = getRawTotal();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (items.length === 0) return;
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const fullName = (formData.get('fullName') as string || '').trim();
        const lastSpaceIndex = fullName.lastIndexOf(' ');
        const firstName = lastSpaceIndex !== -1 ? fullName.substring(lastSpaceIndex + 1).trim() : fullName;
        const lastName = lastSpaceIndex !== -1 ? fullName.substring(0, lastSpaceIndex).trim() : '';

        const billingInfo = {
            firstName,
            lastName,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            address1: formData.get('address') as string,
            city: formData.get('city') as string || 'Hà Nội',
            country: 'VN', // Định dạng enum theo mẫu của WPGraphQL
        };
        const paymentMethod = formData.get('paymentMethod') as string;
        const note = formData.get('note') as string;

        try {
            // Bước 1: Gọi AddToCart cho sản phẩm đầu tiên để lấy woocommerce-session
            const firstItem = items[0];
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res1 = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    query: ADD_TO_CART,
                    variables: {
                        productId: firstItem.databaseId,
                        quantity: firstItem.quantity
                    }
                })
            });

            const sessionToken = res1.headers.get('woocommerce-session');

            // Bước 2: Thêm các sản phẩm còn lại (nếu có) cùng Session
            if (items.length > 1) {
                const addPromises = items.slice(1).map(item =>
                    fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'woocommerce-session': sessionToken ? `Session ${sessionToken}` : '',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({
                            query: ADD_TO_CART,
                            variables: {
                                productId: item.databaseId,
                                quantity: item.quantity
                            }
                        })
                    })
                );
                await Promise.all(addPromises);
            }

            // Bước 3: Gửi mutation Checkout
            const checkoutInput = {
                clientMutationId: `checkout-${Date.now()}`,
                billing: billingInfo,
                shipping: {
                    firstName: billingInfo.firstName,
                    lastName: billingInfo.lastName,
                    address1: billingInfo.address1,
                    city: billingInfo.city,
                    country: billingInfo.country,
                },
                paymentMethod,
                customerNote: note,
                isPaid: false
            };

            const checkoutRes = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'woocommerce-session': sessionToken ? `Session ${sessionToken}` : '',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    query: CHECKOUT_MUTATION,
                    variables: { input: checkoutInput }
                })
            });

            const checkoutData = await checkoutRes.json();

            if (checkoutData.errors) {
                console.error("Checkout errors:", checkoutData.errors);
                // Hiển thị lỗi chi tiết từ server để debug
                const errorMessage = checkoutData.errors[0]?.message || 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại!';
                alert(`Lỗi: ${errorMessage}`);
                setIsSubmitting(false);
                return;
            }

            const result = checkoutData?.data?.checkout;

            if (result?.result === 'success') {
                clearCart();
                router.push(`/checkout/success?orderNumber=${result.order.orderNumber || result.order.id || result.order.orderKey}`);
            } else {
                alert("Không thể đặt hàng. Vui lòng thử lại!");
            }

        } catch (error) {
            console.error("Lỗi quá trình checkout:", error);
            alert("Lỗi kết nối máy chủ. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return <div className="container mx-auto px-4 py-12 min-h-[50vh]">Đang tải...</div>;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 min-h-[60vh] flex flex-col items-center justify-center text-center bg-gray-50/50">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h1>
                <p className="text-gray-500 mb-8 max-w-md">Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.</p>
                <Link href="/category/all">
                    <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-blue-500/20 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 min-h-screen pb-16">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/cart" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Thanh toán an toàn</h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Thông tin của bạn được bảo mật tuyệt đối
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Form Thanh Toán */}
                    <div className="w-full lg:w-[60%] xl:w-[65%] order-2 lg:order-1">
                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6 lg:space-y-8">

                            {/* Khối 1: Thông tin liên hệ */}
                            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-100 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">1</div>
                                    Thông tin liên hệ
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                        <Input name="fullName" required placeholder="Nhập đầy đủ họ và tên" className="w-full rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" defaultValue={user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                                        <Input name="phone" required type="tel" placeholder="Ví dụ: 0912345678" className="rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-5 lg:mt-6">
                                    <label className="text-sm font-bold text-gray-700">Email <span className="text-red-500">*</span></label>
                                    <Input name="email" required type="email" placeholder="Địa chỉ email để nhận thông báo đơn hàng" className="rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" defaultValue={user?.email || ''} />
                                </div>
                            </div>

                            {/* Khối 2: Địa chỉ giao hàng */}
                            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-100 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">2</div>
                                    Địa chỉ nhận hàng
                                </h2>

                                <div className="space-y-5 lg:space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <Input name="address" required placeholder="Số nhà, tên đường, phường/xã..." className="pl-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                                        <Input name="city" required placeholder="Ví dụ: Hà Nội" className="rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                            Ghi chú đơn hàng <span className="text-gray-400 font-normal text-xs">(tuỳ chọn)</span>
                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                        </label>
                                        <textarea
                                            name="note"
                                            className="flex w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 focus:bg-white transition-all min-h-[100px] resize-y"
                                            placeholder="Giao hàng vào giờ hành chính, gọi trước khi giao..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Khối 3: Phương thức thanh toán */}
                            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-100 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">3</div>
                                    Phương thức thanh toán
                                </h2>

                                <div className="space-y-3">
                                    <label className="relative flex items-center p-4 lg:p-5 border-2 border-blue-600 rounded-xl bg-blue-50/30 cursor-pointer shadow-sm">
                                        <input type="radio" name="paymentMethod" value="cod" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0 peer" defaultChecked />
                                        <div className="ml-3 sm:ml-4 flex-1">
                                            <span className="block font-bold text-blue-900">Thanh toán khi nhận hàng (COD)</span>
                                            <span className="block text-sm text-blue-600/80 mt-0.5">Thanh toán bằng tiền mặt cho nhân viên giao hàng</span>
                                        </div>
                                        <Truck className="w-6 h-6 text-blue-500 opacity-50 absolute right-5 top-1/2 -translate-y-1/2 hidden sm:block" />
                                    </label>

                                    <label className="relative flex items-center p-4 lg:p-5 border border-gray-200 rounded-xl cursor-not-allowed bg-gray-50 opacity-60">
                                        <input type="radio" name="paymentMethod" value="bacs" className="w-5 h-5 text-blue-600 border-gray-300" disabled />
                                        <div className="ml-3 sm:ml-4 flex-1">
                                            <span className="block font-bold text-gray-700">Chuyển khoản / Thẻ tín dụng</span>
                                            <span className="block text-sm text-gray-500 mt-0.5">Tính năng đang được nâng cấp chờ ra mắt</span>
                                        </div>
                                        <CreditCard className="w-6 h-6 text-gray-400 absolute right-5 top-1/2 -translate-y-1/2 hidden sm:block" />
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary (Sidebar) */}
                    <div className="w-full lg:w-[40%] xl:w-[35%] order-1 lg:order-2">
                        <div className="bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 sticky top-24 overflow-hidden flex flex-col">
                            {/* Summary Header */}
                            <div className="bg-gradient-to-r from-[#004b91] to-blue-600 text-white p-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                                    <Package className="w-6 h-6 text-yellow-400" />
                                    Tổng quan đơn hàng
                                </h2>
                                <p className="text-blue-100 text-sm font-medium">{items.length} sản phẩm trong giỏ</p>
                            </div>

                            {/* Selected Products List */}
                            <div className="p-6 max-h-[35vh] overflow-y-auto border-b border-gray-100 custom-scrollbar space-y-4 bg-gray-50/30">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-16 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-6 h-6 text-gray-300" />
                                            )}
                                            <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1" title={item.name}>{item.name}</p>
                                            <p className="text-sm font-bold text-rose-600">{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Calculations & Total */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Tạm tính</span>
                                        <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Chiết khấu</span>
                                        <span className="font-bold text-gray-900">0đ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium flex items-center gap-1">
                                            Phí vận chuyển <Info className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">Miễn phí</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 mb-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="block text-sm text-gray-500 font-medium mb-1">Tổng tiền thanh toán</span>
                                            <span className="block text-[10px] text-gray-400 italic">Đã bao gồm VAT (nếu có)</span>
                                        </div>
                                        <span className="text-2xl lg:text-3xl font-black text-rose-600 leading-none">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    form="checkout-form"
                                    size="lg"
                                    className="w-full h-14 rounded-xl text-base font-black uppercase text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Đặt hàng ngay <CheckCircle2 className="w-5 h-5 -mt-0.5" />
                                        </span>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-gray-400 mt-4">
                                    <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 text-gray-400 align-text-bottom" />
                                    Nhấn &quot;Đặt hàng ngay&quot; đồng nghĩa với việc bạn đồng ý tuân theo <Link href="#" className="text-blue-500 hover:underline flex-inline">Điều khoản</Link> của chúng tôi
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

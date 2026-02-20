"use client";

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ADD_TO_CART, CHECKOUT_MUTATION } from '@/lib/graphql/mutations';
import { useAuthStore } from '@/store/useAuthStore';

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
        const billingInfo = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
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
                alert("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại!");
                setIsSubmitting(false);
                return;
            }

            const result = checkoutData?.data?.checkout;

            if (result?.result === 'success') {
                alert(`Đặt hàng thành công! Mã đơn: ${result.order.orderKey}`);
                clearCart();
                router.push('/');
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
            <div className="container mx-auto px-4 py-12 min-h-[50vh] flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
                <p className="text-gray-600 mb-8">Bạn cần có sản phẩm trong giỏ hàng để tiến hành thanh toán.</p>
                <Button onClick={() => router.push('/')}>Quay lại trang chủ</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Form Thanh Toán */}
                <div className="w-full lg:w-2/3">
                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Thông tin giao hàng</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
                                <Input name="lastName" required placeholder="Họ" className="mb-2" defaultValue={user?.lastName || ''} />
                                <Input name="firstName" required placeholder="Tên" defaultValue={user?.firstName || ''} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
                                <Input name="phone" required type="tel" placeholder="Nhập số điện thoại" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email *</label>
                            <Input name="email" required type="email" placeholder="Nhập email" defaultValue={user?.email || ''} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Địa chỉ chi tiết *</label>
                            <Input name="address" required placeholder="Nhập địa chỉ nhà, tên đường..." />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
                            <Input name="city" required placeholder="Ví dụ: Hà Nội" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Ghi chú đơn hàng (tuỳ chọn)</label>
                            <textarea
                                name="note"
                                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px]"
                                placeholder="Ghi chú thêm về đơn hàng"
                            />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 pt-6">Phương thức thanh toán</h2>
                        <div className="space-y-4">
                            <label className="flex items-center space-x-3 p-4 border border-blue-600 rounded-md bg-blue-50 cursor-pointer">
                                <input type="radio" name="paymentMethod" value="cod" className="w-5 h-5 text-blue-600" defaultChecked />
                                <span className="font-medium text-blue-900">Thanh toán khi nhận hàng (COD)</span>
                            </label>
                            <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 opacity-70">
                                <input type="radio" name="paymentMethod" value="bacs" className="w-5 h-5" disabled />
                                <span className="font-medium text-gray-600">Chuyển khoản ngân hàng (Sắp ra mắt)</span>
                            </label>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Đơn hàng của bạn</h2>

                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex-1 pr-4">
                                        <span className="text-gray-900 font-medium">{item.name}</span>
                                        <span className="text-gray-500 ml-2">x {item.quantity}</span>
                                    </div>
                                    <span className="text-gray-900 font-semibold">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 flex justify-between mb-4 text-gray-600">
                            <span>Tạm tính</span>
                            <span className="font-medium text-gray-900">{formatPrice(total)}</span>
                        </div>

                        <div className="flex justify-between mb-6 text-gray-600 border-b border-gray-200 pb-4">
                            <span>Phí vận chuyển</span>
                            <span>Miễn phí</span>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                            <span className="text-2xl font-bold text-red-600">{formatPrice(total)}</span>
                        </div>

                        <Button
                            type="submit"
                            form="checkout-form"
                            size="lg"
                            className="w-full text-base font-bold uppercase tracking-wider py-4 h-14 bg-blue-600 hover:bg-blue-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

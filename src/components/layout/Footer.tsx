import React from 'react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="bg-gray-900 pt-16 pb-8 text-sm text-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Info */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <span className="text-2xl font-bold tracking-tight text-white">Store<span className="text-blue-500">Next</span></span>
                        </Link>
                        <p className="mb-4 text-gray-400">
                            Hệ thống bán lẻ thiết bị điện tử, giải pháp tối ưu cho trải nghiệm mua sắm của bạn.
                        </p>
                        <p className="font-semibold text-white">Hotline: 1900 xxxx</p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Sản Phẩm</h3>
                        <ul className="space-y-3">
                            <li><Link href="/category/laptop" className="hover:text-white transition-colors">Laptop</Link></li>
                            <li><Link href="/category/pc" className="hover:text-white transition-colors">PC Gimmick</Link></li>
                            <li><Link href="/category/phu-kien" className="hover:text-white transition-colors">Phụ kiện</Link></li>
                            <li><Link href="/sale" className="hover:text-white transition-colors">Khuyến mãi</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Hỗ Trợ</h3>
                        <ul className="space-y-3">
                            <li><Link href="/chinh-sach-bao-hanh" className="hover:text-white transition-colors">Chính sách bảo hành</Link></li>
                            <li><Link href="/chinh-sach-doi-tra" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
                            <li><Link href="/huong-dan-mua-hang" className="hover:text-white transition-colors">Hướng dẫn mua hàng</Link></li>
                            <li><Link href="/lien-he" className="hover:text-white transition-colors">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter / Social */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Đăng ký nhận tin</h3>
                        <p className="mb-4 text-gray-400">Nhận thông tin ưu đãi mới nhất từ chúng tôi.</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="w-full min-w-0 appearance-none rounded-l-md border border-gray-600 bg-gray-800 px-4 py-2 text-base text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                required
                            />
                            <button
                                type="submit"
                                className="flex-shrink-0 rounded-r-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                            >
                                Gửi
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs text-center md:text-left">
                    <p>&copy; {new Date().getFullYear()} StoreNext. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

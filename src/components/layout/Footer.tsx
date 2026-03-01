import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Cpu, Building2, Mail, Phone, Building, Smartphone, ChevronRight, ShieldCheck, Facebook, Youtube, MessageCircle } from 'lucide-react';

export const Footer = ({ logoUrl }: { logoUrl?: string | null }) => {
    return (
        <footer className="w-full bg-[#101828] pt-16 lg:pt-20 pb-10 border-t border-yellow-500/20 text-slate-100 font-sans">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16 items-start">

                    {/* TRỤ SỞ CHÍNH */}
                    <div className="lg:col-span-4 flex flex-col gap-6 bg-white/5 p-6 lg:p-8 rounded-2xl border border-white/5">
                        <Link href="/" className="flex items-center gap-4 mb-2">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt="LMC"
                                    width={200}
                                    height={60}
                                    className="h-12 w-auto object-contain"
                                    priority
                                />
                            ) : (
                                <>
                                    <Cpu className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" strokeWidth={1.5} />
                                    <h2 className="text-4xl font-black tracking-tighter text-white">LMC</h2>
                                </>
                            )}
                        </Link>
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 text-yellow-500 font-bold text-base uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                                <Building2 className="w-6 h-6" />
                                <h3>Trụ sở chính</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-white font-black text-base leading-tight uppercase">Công ty cổ phần thiết bị công nghệ LMC</p>
                                <div className="space-y-4 text-[#B5B5B5] text-sm">
                                    <p className="leading-relaxed text-slate-200">Số 472 Đại Lộ Lê Thanh Nghị, P. Lê Thanh Nghị, TP. Hải Dương, Hải Phòng</p>
                                    <p className="text-xs italic opacity-70 border-l-2 border-yellow-500/30 pl-3">GPĐKKD số 0801262705 do Sở KH&ĐT Tỉnh Hải Dương cấp ngày 22/10/2018</p>
                                    <div className="pt-2 space-y-3">
                                        <p className="flex items-center gap-4 group">
                                            <Mail className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] group-hover:scale-110 transition-transform" />
                                            <a href="mailto:maytinhlmc@gmail.com" className="hover:text-yellow-500 transition-colors text-slate-200 font-medium">maytinhlmc@gmail.com</a>
                                        </p>
                                        <p className="flex items-center gap-4 group">
                                            <Phone className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] group-hover:scale-110 transition-transform" />
                                            <span className="text-slate-100 font-bold tracking-wider text-base lg:text-lg">0220.660.6666 | 0907.655.777</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CHI NHÁNH LIÊN KẾT */}
                    <div className="lg:col-span-3 flex flex-col gap-6 lg:pt-[104px]">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm uppercase tracking-widest drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                                <Building className="w-6 h-6" />
                                <h3>Chi nhánh liên kết</h3>
                            </div>
                            <div className="space-y-3">
                                <p className="text-white font-bold text-[13px] leading-snug uppercase">Công ty cổ phần thiết bị máy tính VDC</p>
                                <div className="space-y-3 text-[#B5B5B5] text-[13px]">
                                    <p className="leading-relaxed">SN 333 đường Hùng Vương, Phường Vĩnh Yên, Tỉnh Phú Thọ, Việt Nam</p>
                                    <div className="pt-1">
                                        <p className="flex items-center gap-3">
                                            <Smartphone className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                                            <span className="text-slate-200 font-semibold tracking-wide">0799.08.6666 - 0828.06.3333</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SẢN PHẨM */}
                    <div className="lg:col-span-2 flex flex-col gap-8 lg:pt-[104px] lg:pl-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-yellow-500"></span>
                            Sản phẩm
                        </h3>
                        <ul className="flex flex-col gap-5 text-[#B5B5B5] text-sm">
                            <li>
                                <Link href="/category/workstation" className="hover:text-yellow-500 transition-all flex items-center gap-3 group">
                                    <ChevronRight className="w-3 h-3 text-yellow-500 opacity-60 group-hover:opacity-100" />
                                    <span className="group-hover:translate-x-1 transition-transform font-medium">Workstation</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/pc-gaming" className="hover:text-yellow-500 transition-all flex items-center gap-3 group">
                                    <ChevronRight className="w-3 h-3 text-yellow-500 opacity-60 group-hover:opacity-100" />
                                    <span className="group-hover:translate-x-1 transition-transform font-medium">PC Đồ họa - Gaming</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/ai-deep-learning" className="hover:text-yellow-500 transition-all flex items-center gap-3 group">
                                    <ChevronRight className="w-3 h-3 text-yellow-500 opacity-60 group-hover:opacity-100" />
                                    <span className="group-hover:translate-x-1 transition-transform font-medium">AI - Deep Learning</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/laptop" className="hover:text-yellow-500 transition-all flex items-center gap-3 group">
                                    <ChevronRight className="w-3 h-3 text-yellow-500 opacity-60 group-hover:opacity-100" />
                                    <span className="group-hover:translate-x-1 transition-transform font-medium">Laptop Doanh nghiệp</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* DỊCH VỤ & GIẢI PHÁP */}
                    <div className="lg:col-span-3 flex flex-col gap-8 lg:pt-[104px] lg:pl-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-yellow-500"></span>
                            Dịch vụ & Giải pháp
                        </h3>
                        <ul className="flex flex-col gap-5 text-[#B5B5B5] text-sm">
                            <li>
                                <Link href="#" className="hover:text-yellow-500 transition-all flex items-center gap-3 group">
                                    <ChevronRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                                    <span className="group-hover:translate-x-1 transition-transform font-medium">Tư vấn dự án CNTT</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/pc-builder" className="hover:text-yellow-500 transition-all flex items-center gap-3 group">
                                    <ChevronRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                                    <span className="group-hover:translate-x-1 transition-transform font-medium">Build PC theo yêu cầu</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-yellow-500 transition-all flex items-center gap-3 group">
                                    <ChevronRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                                    <span className="group-hover:translate-x-1 transition-transform font-medium">Báo giá doanh nghiệp</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-yellow-500 transition-all flex items-center gap-3 group">
                                    <ChevronRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                                    <span className="group-hover:translate-x-1 transition-transform font-medium">Hỗ trợ xuất hóa đơn VAT</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent mb-8"></div>

                {/* Footer Bottom */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="text-slate-400 text-xs text-center lg:text-left space-y-2">
                        <p className="font-medium">© {new Date().getFullYear()} CÔNG TY CỔ PHẦN THIẾT BỊ CÔNG NGHỆ LMC. All rights reserved.</p>
                        <p className="uppercase tracking-[0.3em] text-[9px] opacity-50 font-bold">Thiết kế & Vận hành bởi LMC Digital Solution</p>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-10">
                        {/* Payment Methods */}
                        <div className="flex items-center gap-6 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 w-auto object-contain" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 w-auto object-contain" />
                            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" className="h-6 w-auto object-contain bg-white/20 p-1 rounded" />
                        </div>

                        <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

                        {/* Trust Badge & BCT */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 border border-yellow-500/40 rounded-full bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] group cursor-default h-10">
                                <ShieldCheck className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                                <span className="text-[10px] sm:text-[11px] text-yellow-500 font-black uppercase tracking-[0.15em] whitespace-nowrap">Doanh Nghiệp Uy Tín</span>
                            </div>
                            <a
                                href="http://online.gov.vn/Home/WebDetails/108841"
                                rel="nofollow noopener"
                                target="_blank"
                                className="transition-opacity hover:opacity-90"
                            >
                                <img
                                    src="https://maytinhlmc.vn/wp-content/uploads/dadangkybocongthuong.png"
                                    alt="Đã thông báo Bộ Công Thương"
                                    className="h-[52px] w-auto object-contain drop-shadow-md -ml-2"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-4">
                        <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-yellow-500 hover:text-[#101828] text-slate-400 border border-white/5 transition-all duration-300 transform hover:-translate-y-1">
                            <Facebook className="w-5 h-5 fill-current" />
                        </a>
                        <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-yellow-500 hover:text-[#101828] text-slate-400 border border-white/5 transition-all duration-300 transform hover:-translate-y-1">
                            <Youtube className="w-5 h-5 fill-current" />
                        </a>
                        <a href="https://zalo.me" aria-label="Zalo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-yellow-500 hover:text-[#101828] text-slate-400 border border-white/5 transition-all duration-300 transform hover:-translate-y-1">
                            <MessageCircle className="w-5 h-5 fill-current" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

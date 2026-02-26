import Image from "next/image";
import Link from "next/link";

import { HardwareGridConfig } from "@/app/actions/configActions";

interface Props {
    config: HardwareGridConfig;
}

export function HardwareCategoryGrid({ config }: Props) {
    if (!config.isEnabled || !config.categories || config.categories.length === 0) {
        return null;
    }

    return (
        <div className="font-body text-zinc-700 w-full mb-12">
            <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-left border-l-8 border-blue-600 pl-8">
                    <h2 className="text-4xl md:text-5xl font-black font-display text-zinc-900 uppercase tracking-tight">
                        DANH MỤC <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">NỔI BẬT</span>
                    </h2>
                    <p className="text-zinc-500 mt-2 font-semibold tracking-[0.25em] uppercase text-xs">High Performance Hardware Hub</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {config.categories.map((cat, idx) => {
                        const CardContent = (
                            <div className="relative overflow-hidden transition-all duration-300 border border-zinc-200 bg-white shadow-sm hover:border-blue-600 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,102,255,0.08)] group hover:after:h-full after:content-[''] after:absolute after:top-0 after:left-0 after:w-1 after:h-0 after:bg-blue-600 after:transition-all after:duration-300 [clip-path:polygon(20px_0%,100%_0%,100%_calc(100%-20px),calc(100%-20px)_100%,0%_100%,0%_20px)] h-full">
                                <div className="h-full flex flex-col p-8 cursor-pointer">
                                    <div className="relative z-10 mb-6">
                                        <div className="text-sm font-bold tracking-wider text-blue-600 mb-2 font-mono flex items-center gap-2">
                                            <span className="w-8 h-px bg-blue-600/50"></span>
                                            0{idx + 1}
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-900 group-hover:text-blue-600 transition-colors uppercase italic leading-tight">
                                            {cat.title}
                                        </h3>
                                        <p className="text-zinc-500 mt-2 font-medium text-sm">
                                            {cat.subtitle}
                                        </p>
                                    </div>

                                    <div className="relative h-48 mt-auto mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent rounded-full blur-2xl group-hover:from-blue-600/20 transition-colors duration-500"></div>
                                        <div className="relative h-full w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
                                            <Image
                                                src={cat.image || "/placeholder.png"}
                                                alt={cat.title}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
                                            {cat.level}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                Khám phá
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tech Decals */}
                                    <div className="absolute top-4 right-4 text-zinc-200">
                                        <svg className="w-12 h-12 opacity-50" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                                            <rect x="10" y="10" width="80" height="80" />
                                            <rect x="30" y="30" width="40" height="40" />
                                            <circle cx="50" cy="50" r="10" />
                                        </svg>
                                    </div>
                                    <div className="absolute bottom-4 left-4 flex gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={`w-1 h-1 rounded-full ${cat.pulse && i === 0 ? 'bg-blue-500 animate-ping' : 'bg-zinc-300'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );

                        return cat.link ? (
                            <Link key={cat.id || idx} href={cat.link} className="block h-full">
                                {CardContent}
                            </Link>
                        ) : (
                            <div key={cat.id || idx} className="block h-full">
                                {CardContent}
                            </div>
                        );
                    })}
                </div>


            </div>
        </div>
    );
}

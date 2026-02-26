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
                    {config.categories.map((cat, idx) => (
                        <div key={idx} className="relative overflow-hidden transition-all duration-300 border border-zinc-200 bg-white shadow-sm hover:border-blue-600 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,102,255,0.08)] group hover:after:h-full after:content-[''] after:absolute after:top-0 after:left-0 after:w-1 after:h-0 after:bg-blue-600 after:transition-all after:duration-300 [clip-path:polygon(20px_0%,100%_0%,100%_calc(100%-20px),calc(100%-20px)_100%,0%_100%,0%_20px)]">
                            <div className="h-full flex flex-col p-8 cursor-pointer">
                                <div className="relative z-10 mb-6">
                                    <h3 className="font-display font-bold text-xl text-zinc-900 group-hover:text-blue-600 transition-colors">{cat.title}</h3>
                                    <p className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mt-1">{cat.subtitle}</p>
                                </div>

                                <div className="flex-grow flex items-center justify-center relative py-6 before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle,rgba(0,102,255,0.05)_0%,transparent_70%)] before:z-0">
                                    <img
                                        alt={cat.title}
                                        className="max-h-48 w-full object-contain relative z-10 transform group-hover:scale-110 transition-transform duration-500"
                                        src={cat.image}
                                    />
                                </div>

                                <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center relative z-10">
                                    <span className="text-[10px] text-zinc-400 font-display font-bold uppercase tracking-widest">{cat.level}</span>
                                    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${cat.pulse ? 'bg-blue-600/20' : ''}`}>
                                        <div className={`w-1.5 h-1.5 bg-blue-600 ${cat.pulse ? 'rounded-full group-hover:animate-ping' : ''}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </div>
    );
}

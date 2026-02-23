"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import { ProductCard } from '@/components/ui/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductSliderProps {
    products: any[];
}

export const ProductSlider: React.FC<ProductSliderProps> = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="relative group">
            <Swiper
                modules={[Navigation, Pagination, Mousewheel, Keyboard]}
                spaceBetween={16}
                slidesPerView={2.2}
                navigation={true}
                mousewheel={true}
                keyboard={true}
                breakpoints={{
                    480: {
                        slidesPerView: 2.5,
                        spaceBetween: 16,
                    },
                    768: {
                        slidesPerView: 3.5,
                        spaceBetween: 20,
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                    },
                    1280: {
                        slidesPerView: 5,
                        spaceBetween: 24,
                    },
                }}
                className="product-swiper !pb-12"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id} className="h-auto">
                        <ProductCard {...product} />
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                .product-swiper .swiper-button-next,
                .product-swiper .swiper-button-prev {
                    background-color: white;
                    color: #4b5563; /* text-gray-600 */
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: all 0.2s;
                    opacity: 0;
                    margin-top: -30px;
                }
                
                .group:hover .product-swiper .swiper-button-next,
                .group:hover .product-swiper .swiper-button-prev {
                    opacity: 1;
                }

                .product-swiper .swiper-button-next:hover,
                .product-swiper .swiper-button-prev:hover {
                    color: #2563eb; /* text-blue-600 */
                    transform: scale(1.1);
                }

                .product-swiper .swiper-button-next::after,
                .product-swiper .swiper-button-prev::after {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .product-swiper .swiper-button-prev {
                    left: -10px;
                }
                
                .product-swiper .swiper-button-next {
                    right: -10px;
                }

                /* Show buttons natively on mobile */
                @media (max-width: 768px) {
                    .product-swiper .swiper-button-next,
                    .product-swiper .swiper-button-prev {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

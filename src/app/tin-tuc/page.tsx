import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_POST_CATEGORIES, GET_POSTS_PAGE } from "@/lib/graphql/queries";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const revalidate = 3600;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const category = typeof params.category === 'string' ? params.category : '';
    const title = category ? `Tin tức - ${category} | LMC` : 'Tin tức Công Nghệ | LMC';
    return {
        title,
        description: 'Cập nhật tin tức công nghệ, kiến thức phần cứng PC, laptop, và các hướng dẫn build PC mới nhất từ LMC.',
    };
}

export default async function TinTucPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const categoryName = typeof params.category === 'string' ? params.category : '';
    const after = typeof params.after === 'string' ? params.after : '';

    // Lấy danh mục
    const { data: catData } = await wpgraphqlFetch<any>(GET_POST_CATEGORIES);
    const categories = catData?.categories?.nodes || [];

    // Lấy bài viết
    const { data: postsData } = await wpgraphqlFetch<any>(GET_POSTS_PAGE, {
        first: 24,
        after: after || null,
        categoryName: categoryName || null,
    });

    const posts = postsData?.posts?.nodes || [];
    const pageInfo = postsData?.posts?.pageInfo || {};

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-[#f8fafc] dark:bg-gray-900 min-h-screen pb-16">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 md:py-16 px-4 mb-8">
                <div className="container mx-auto max-w-6xl text-center">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Tin tức Công Nghệ</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto text-sm md:text-base">
                        Cập nhật những thông tin mới nhất về phần cứng PC, laptop, thiết bị văn phòng và các bài viết hướng dẫn hữu ích từ đội ngũ LMC.
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4">
                {/* Categories Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-10">
                    <Link
                        href="/tin-tuc"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                            !categoryName
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        Tất cả
                    </Link>
                    {categories.map((cat: any) => (
                        <Link
                            key={cat.id}
                            href={`/tin-tuc?category=${cat.slug}`}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                categoryName === cat.slug
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>

                {/* Posts Grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {posts.map((post: any) => (
                            <Link key={post.id} href={`/${post.slug}`} className="group block h-full">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-slate-100 dark:border-slate-700 hover:-translate-y-1">
                                    <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-slate-100 dark:bg-slate-700">
                                        {post.featuredImage?.node?.sourceUrl ? (
                                            <Image
                                                src={post.featuredImage.node.sourceUrl}
                                                alt={post.featuredImage.node.altText || post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                            </div>
                                        )}
                                        {post.categories?.nodes?.[0] && (
                                            <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">
                                                {post.categories.nodes[0].name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-3">
                                            <span>{formatDate(post.date)}</span>
                                            {post.author?.node?.name && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                    <span>{post.author.node.name}</span>
                                                </>
                                            )}
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>
                                        <div 
                                            className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mt-auto"
                                            dangerouslySetInnerHTML={{ __html: post.excerpt || '' }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-slate-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7M4 10h16v10H4V10z"/></svg>
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 dark:text-white">Không tìm thấy bài viết nào</h3>
                        <p className="text-slate-500 mt-2">Hiện tại chưa có bài viết nào trong danh mục này.</p>
                    </div>
                )}

                {/* Pagination */}
                {pageInfo.hasNextPage && (
                    <div className="mt-12 flex justify-center">
                        <Link
                            href={`/tin-tuc?${categoryName ? `category=${categoryName}&` : ''}after=${pageInfo.endCursor}`}
                            className="bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium py-3 px-8 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md flex items-center gap-2"
                        >
                            Trang tiếp theo
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

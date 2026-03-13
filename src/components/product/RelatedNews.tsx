import Link from "next/link";
import Image from "next/image";
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_RECENT_POSTS } from "@/lib/graphql/queries";

// Fallback image in case the src fails to load or is invalid
const FALLBACK_IMG = "https://placehold.co/600x400/eee/999?text=LMC+News";

export async function RelatedNews() {
    let posts: any[] = [];
    try {
        const { data } = await wpgraphqlFetch<any>(GET_RECENT_POSTS, { first: 3 });
        if (data?.posts?.nodes) {
            posts = data.posts.nodes;
        }
    } catch (e) {
        console.error("Failed to fetch related news:", e);
    }

    if (!posts || posts.length === 0) {
        return null;
    }
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900 m-0">
                    Bài viết liên quan
                </h3>
            </div>

            <div className="p-4 space-y-4">
                {posts.map((news) => {
                    const date = new Date(news.date).toLocaleDateString('vi-VN');
                    const imgUrl = news.featuredImage?.node?.sourceUrl || FALLBACK_IMG;

                    return (
                        <Link href={`/${news.slug}`} key={news.id} className="group block">
                            <div className="flex flex-col gap-3">
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                                    <Image
                                        src={imgUrl}
                                        alt={news.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                                        {news.title}
                                    </h4>
                                    <span className="text-xs text-slate-400 mt-1 block mb-2">{date}</span>
                                    {news.excerpt && (
                                        <div
                                            className="text-xs text-slate-500 line-clamp-2 prose prose-p:m-0 prose-sm"
                                            dangerouslySetInnerHTML={{ __html: news.excerpt }}
                                        />
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}

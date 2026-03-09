import { MetadataRoute } from 'next';
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";

const GET_ALL_URLS = `
  query GetAllUrls($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
      }
    }
    productCategories(first: $first) {
      nodes {
        slug
      }
    }
    posts(first: $first) {
      nodes {
        slug
      }
    }
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vercel.app';
  const sitemapUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    let hasNextPage = true;
    let afterCursor = null;
    let maxPages = 50; // Giới hạn lấy 5000 sản phẩm (50 trang x 100) để tránh timeout

    while (hasNextPage && maxPages > 0) {
      const { data }: any = await wpgraphqlFetch(GET_ALL_URLS, {
        first: 100,
        after: afterCursor,
      });

      // Thêm URL Sản phẩm
      const products = data?.products?.nodes || [];
      products.forEach((product: any) => {
        if (product.slug) {
          sitemapUrls.push({
            url: `${baseUrl}/${product.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });

      // Chỉ lấy Category và Post ở trang đầu tiên (vì số lượng ít hơn và query dùng chung phân trang cho products)
      if (!afterCursor) {
        const categories = data?.productCategories?.nodes || [];
        categories.forEach((category: any) => {
          if (category.slug) {
            sitemapUrls.push({
              url: `${baseUrl}/${category.slug}`,
              lastModified: new Date(),
              changeFrequency: 'daily',
              priority: 0.9,
            });
          }
        });

        const posts = data?.posts?.nodes || [];
        posts.forEach((post: any) => {
          if (post.slug) {
            sitemapUrls.push({
              url: `${baseUrl}/tin-tuc/${post.slug}`,
              lastModified: new Date(),
              changeFrequency: 'monthly',
              priority: 0.7,
            });
          }
        });
      }

      hasNextPage = data?.products?.pageInfo?.hasNextPage;
      afterCursor = data?.products?.pageInfo?.endCursor;
      maxPages--;
    }
  } catch (error) {
    console.error("Lỗi khi tạo sitemap:", error);
  }

  return sitemapUrls;
}

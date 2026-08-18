import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import BlogPagination, { BLOG_PER_PAGE, blogPageCount } from "@/components/BlogPagination";
import { getAllPosts, getPostFeaturedImage, stripHtml } from "@/lib/content";
import { pageMetadata, rssAlternateTypes, siteUrl } from "@/lib/seo";

/** Revalidate hourly so scheduled posts appear after their publish time without a redeploy. */
export const revalidate = 3600;

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const posts = getAllPosts();
  const totalPages = blogPageCount(posts.length);
  const page = Math.min(Math.max(1, parseInt(pageParam ?? "1", 10) || 1), totalPages);

  const base = pageMetadata({
    title: page > 1 ? `Blog — Page ${page}` : "Blog",
    description:
      "Stories, news, and insights on children's education, volunteering, and community impact from the Lata Agrawal Foundation in Wardha, India.",
    path: page > 1 ? `/blog?page=${page}` : "/blog",
  });

  return {
    ...base,
    alternates: {
      canonical: siteUrl(page > 1 ? `/blog?page=${page}` : "/blog"),
      types: rssAlternateTypes(),
    },
    robots: page > 1 ? { index: true, follow: true } : base.robots,
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const posts = getAllPosts();
  const totalPages = blogPageCount(posts.length);
  const page = Math.min(
    Math.max(1, parseInt(pageParam ?? "1", 10) || 1),
    totalPages
  );
  const slice = posts.slice((page - 1) * BLOG_PER_PAGE, page * BLOG_PER_PAGE);

  return (
    <>
      <PageHeader title="Blog" />
      <PageContainer className="py-12">
        <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {slice.map((post) => {
            const image = getPostFeaturedImage(post);
            return (
              <li
                key={post.id}
                className="rounded-2xl border border-laf-border bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] bg-laf-cream">
                  <Image
                    src={image}
                    alt={post.title}
                    fill
                    quality={75}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    loading="lazy"
                  />
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <time className="text-xs text-laf-muted uppercase tracking-wide">
                    {new Date(post.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="mt-3 text-lg font-semibold text-laf-navy leading-snug">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-laf-gold transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="mt-3 text-sm text-laf-muted line-clamp-3 flex-1 leading-relaxed">
                      {stripHtml(post.excerpt)}
                    </p>
                  )}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-block mt-4 text-sm font-medium text-laf-gold hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        <BlogPagination page={page} totalPages={totalPages} />
      </PageContainer>
    </>
  );
}

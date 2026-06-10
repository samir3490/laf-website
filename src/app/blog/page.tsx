import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import BlogPagination, { BLOG_PER_PAGE, blogPageCount } from "@/components/BlogPagination";
import { getAllPosts, getPostFeaturedImage, stripHtml } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Stories, news, and insights on education, volunteering, and community impact from the Lata Agrawal Foundation.",
  path: "/blog",
});

type Props = { searchParams: Promise<{ page?: string }> };

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
      <PageHeader title="Blog" subtitle="Stories of impact and community" />
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
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
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

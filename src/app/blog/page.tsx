import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import { getAllPosts, stripHtml } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Stories, news, and insights on education, volunteering, and community impact from the Lata Agrawal Foundation.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <PageHeader title="Blog" subtitle="Stories of impact and community" />
      <PageContainer className="py-12">
        <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-2xl border border-laf-border bg-white p-6 flex flex-col hover:shadow-md transition-shadow"
            >
              <time className="text-xs text-laf-muted uppercase tracking-wide">
                {new Date(post.date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-3 text-lg font-semibold text-laf-navy leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-laf-gold transition-colors">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-3 text-sm text-laf-muted line-clamp-4 flex-1 leading-relaxed">
                  {stripHtml(post.excerpt)}
                </p>
              )}
              <Link
                href={`/blog/${post.slug}`}
                className="inline-block mt-4 text-sm font-medium text-laf-gold hover:underline"
              >
                Read more →
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </>
  );
}

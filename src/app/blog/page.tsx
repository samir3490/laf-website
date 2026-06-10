import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and stories from the Lata Agrawal Foundation.",
};

export default function BlogPage() {
  const posts = getAllPosts().slice(0, 30);

  return (
    <>
      <PageHeader title="Blog" subtitle="Stories of impact and community" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-laf-border pb-8 last:border-0">
              <time className="text-sm text-laf-muted">
                {new Date(post.date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 text-xl font-semibold text-laf-navy">
                <Link href={`/blog/${post.slug}`} className="hover:text-laf-gold transition-colors">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm text-laf-muted line-clamp-3">{post.excerpt}</p>
              )}
              <Link
                href={`/blog/${post.slug}`}
                className="inline-block mt-3 text-sm font-medium text-laf-gold hover:underline"
              >
                Read more →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

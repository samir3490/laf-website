import Link from "next/link";
import { getAllPosts, stripHtml } from "@/lib/content";

type RelatedPostsProps = {
  currentSlug: string;
  limit?: number;
};

export default function RelatedPosts({ currentSlug, limit = 3 }: RelatedPostsProps) {
  const related = getAllPosts().filter((p) => p.slug !== currentSlug).slice(0, limit);

  if (related.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-laf-border">
      <h2 className="text-lg font-semibold text-laf-navy mb-4">More from the LAF blog</h2>
      <ul className="space-y-4">
        {related.map((post) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <p className="font-medium text-laf-navy group-hover:text-laf-gold transition-colors">{post.title}</p>
              {post.excerpt && (
                <p className="mt-1 text-sm text-laf-muted line-clamp-2">{stripHtml(post.excerpt)}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/blog" className="inline-block mt-4 text-sm font-medium text-laf-gold hover:underline">
        Browse all posts →
      </Link>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { getAllPosts, getPostFeaturedImage, stripHtml } from "@/lib/content";

export default function HomeLatestStories() {
  const posts = getAllPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-laf-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-laf-navy">Latest impact stories</h2>
            <p className="mt-2 text-sm text-laf-muted max-w-xl">
              News on children&apos;s education, volunteering, and community programmes from Wardha and across India.
            </p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-laf-gold hover:underline">
            View all posts →
          </Link>
        </div>
        <ul className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => {
            const image = getPostFeaturedImage(post);
            return (
              <li key={post.id} className="rounded-2xl border border-laf-border overflow-hidden bg-white hover:shadow-md transition-shadow">
                <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] bg-laf-cream">
                  <Image
                    src={image}
                    alt={post.title}
                    fill
                    quality={75}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                </Link>
                <div className="p-5">
                  <time className="text-xs text-laf-muted uppercase tracking-wide">
                    {new Date(post.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 font-semibold text-laf-navy leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:text-laf-gold transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-laf-muted line-clamp-2">{stripHtml(post.excerpt)}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

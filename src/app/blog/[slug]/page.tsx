import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import WpContent from "@/components/WpContent";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { getAllPosts, getPost, stripHtml } from "@/lib/content";
import { articleJsonLd, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post Not Found" };
  const description = stripHtml(post.excerpt).slice(0, 160);
  return pageMetadata({
    title: post.title,
    description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <PageHeader title={post.title} />
      <PageContainer narrow className="py-12">
        <div className="flex flex-wrap items-center gap-3 text-sm text-laf-muted mb-8">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span aria-hidden>·</span>
          <Link href="/blog" className="text-laf-gold hover:underline">
            ← All posts
          </Link>
        </div>
        <article>
          <WpContent html={post.html} blog className="mt-2" />
        </article>
        <aside className="mt-14 rounded-2xl bg-laf-navy text-white p-8 text-center">
          <h2 className="text-xl font-bold">Support Our Mission</h2>
          <p className="mt-2 text-white/85 text-sm max-w-lg mx-auto">
            Help us provide education and resources to children across India.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/donate"
              className="px-6 py-2.5 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright"
            >
              Donate Now
            </Link>
            <Link
              href="/volunteer"
              className="px-6 py-2.5 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10"
            >
              Volunteer
            </Link>
          </div>
        </aside>
      </PageContainer>
    </>
  );
}

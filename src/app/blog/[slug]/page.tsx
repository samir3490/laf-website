import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import WpContent from "@/components/WpContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { getAllPosts, getPost, getPostBodyHtml, getPostFeaturedImage } from "@/lib/content";
import { articleJsonLd, postMetadata } from "@/lib/seo";

/** Revalidate hourly so scheduled posts appear after their publish time without a redeploy. */
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return postMetadata(post);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const featuredImage = getPostFeaturedImage(post);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          ...post,
          featuredImage,
        })}
      />
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
        <div className="relative aspect-[2/1] max-h-80 rounded-2xl overflow-hidden mb-8 border border-laf-border">
          <Image
            src={featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
        <article>
          <WpContent html={getPostBodyHtml(post)} blog className="mt-2" />
        </article>
        <RelatedPosts currentSlug={post.slug} />
        <aside className="mt-14 rounded-2xl bg-laf-navy text-white p-8 text-center">
          <h2 className="text-xl font-bold">Support Our Mission</h2>
          <p className="mt-2 text-white/85 text-sm max-w-lg mx-auto">
            Help us provide education and resources to children across India — from Wardha to communities nationwide.
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
            <Link
              href="/library"
              className="px-6 py-2.5 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10"
            >
              Learning Library
            </Link>
          </div>
        </aside>
      </PageContainer>
    </>
  );
}

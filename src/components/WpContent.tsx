import { sanitizeBlogHtml, sanitizeHtml } from "@/lib/content";

type WpContentProps = {
  html: string;
  className?: string;
  blog?: boolean;
};

export default function WpContent({ html, className = "", blog = false }: WpContentProps) {
  const clean = blog ? sanitizeBlogHtml(html) : sanitizeHtml(html);
  return (
    <div
      className={`laf-prose max-w-none ${blog ? "laf-blog-prose" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

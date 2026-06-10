import { sanitizeHtml } from "@/lib/content";

type WpContentProps = {
  html: string;
  className?: string;
};

export default function WpContent({ html, className = "" }: WpContentProps) {
  return (
    <div
      className={`laf-prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

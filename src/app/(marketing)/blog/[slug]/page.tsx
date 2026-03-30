import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBlogPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    alternates: { canonical: `https://titlecomply.com/blog/${slug}` },
  };
}

function formatPostDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: post.author },
    datePublished: post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "TitleComply",
      url: "https://titlecomply.com",
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link
          href="/blog"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Blog
        </Link>

        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-[#2563EB]"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-[#0F172A] md:text-4xl">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              {authorInitials(post.author)}
            </span>
            <span>{post.author}</span>
          </div>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </div>

        <div className="my-8 border-t border-gray-100" />

        <div
          className="max-w-none text-lg leading-relaxed text-gray-700 [&_a]:font-medium [&_a]:text-[#2563EB] [&_a]:underline [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#0F172A] [&_h2]:first:mt-0 [&_li]:mt-2 [&_p]:mt-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 rounded-xl bg-gray-50 p-8">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Automate your FinCEN compliance
          </h2>
          <p className="mt-2 text-gray-600">
            TitleComply handles screening, data collection, AI extraction, and
            filing generation in 15 minutes.
          </p>
          <Link
            href="/sign-up"
            className="mt-6 inline-flex rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </>
  );
}

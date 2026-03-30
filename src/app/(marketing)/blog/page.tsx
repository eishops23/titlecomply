import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "FinCEN compliance insights, guides, and updates for title companies and settlement agents.",
  alternates: { canonical: "https://titlecomply.com/blog" },
};

function formatPostDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <h1 className="text-4xl font-bold text-[#0F172A]">Blog</h1>
      <p className="mt-4 text-lg text-gray-500">
        FinCEN compliance insights for title professionals
      </p>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="h-1 bg-[#2563EB]" aria-hidden />
            <div className="p-8">
              <div className="mb-3 flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-[#2563EB]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="text-xl font-semibold text-[#0F172A] transition-colors hover:text-[#2563EB]"
              >
                {post.title}
              </Link>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">
                {post.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400">
                  {post.author} · {formatPostDate(post.publishedAt)}
                </span>
                <span className="text-xs text-gray-400">
                  {post.readingTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

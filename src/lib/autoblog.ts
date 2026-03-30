import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";

export interface GeneratedBlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  authorTitle: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
  seoKeywords: string[];
  heroImage: {
    url: string;
    alt: string;
    credit: string;
  };
  inlineImages: Array<{
    url: string;
    alt: string;
    credit: string;
    placement: string;
  }>;
  status: "draft" | "published";
  generatedAt: string;
}

const TOPIC_CATEGORIES = [
  {
    category: "FinCEN Compliance",
    topics: [
      "FinCEN Real Estate Report requirements for [year]",
      "Common mistakes title companies make with FinCEN filings",
      "How to identify beneficial owners under 31 CFR Part 1031",
      "FinCEN compliance checklist for small title companies",
      "Understanding FinCEN penalties and enforcement trends",
      "FinCEN Real Estate Report vs BOI Report: key differences",
      "How the FinCEN rule affects land trusts and irrevocable trusts",
      "Multi-entity transactions: when multiple FinCEN filings are required",
    ],
  },
  {
    category: "Title Industry",
    topics: [
      "How AI is transforming title company operations",
      "The top compliance challenges facing title companies in [year]",
      "Why small title companies need compliance automation",
      "Best practices for document management at title companies",
      "How to build a compliance culture at your title company",
      "The cost of manual compliance vs automation for title companies",
      "Title company cybersecurity: protecting sensitive client data",
      "Remote closings and FinCEN compliance: what you need to know",
    ],
  },
  {
    category: "Beneficial Ownership",
    topics: [
      "What is beneficial ownership and why does FinCEN require it?",
      "How to collect beneficial ownership information efficiently",
      "Beneficial ownership verification: best practices for title companies",
      "When LLC members don't want to provide SSNs: handling pushback",
      "Foreign entity buyers: additional FinCEN requirements",
      "Trusts as real estate buyers: navigating FinCEN reporting",
    ],
  },
  {
    category: "Industry News & Updates",
    topics: [
      "Latest FinCEN guidance updates for real estate professionals",
      "How other countries handle real estate AML compliance",
      "The future of real estate compliance technology",
      "What title companies can learn from banking AML programs",
    ],
  },
];

async function searchUnsplashImage(
  query: string,
): Promise<{ url: string; alt: string; credit: string } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return {
      url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=630&fit=crop",
      alt: query,
      credit: "Unsplash",
    };
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as {
      results: Array<{
        urls: { regular: string };
        alt_description: string | null;
        user: { name: string };
      }>;
    };

    const photo = data.results[0];
    if (!photo) return null;

    return {
      url: photo.urls.regular,
      alt: photo.alt_description || query,
      credit: `Photo by ${photo.user.name} on Unsplash`,
    };
  } catch {
    return null;
  }
}

const BLOG_SYSTEM_PROMPT = `You are a content writer for TitleComply, an AI-powered FinCEN compliance automation platform for title companies and escrow agents. You write authoritative, SEO-optimized blog posts about FinCEN compliance, title industry best practices, and beneficial ownership reporting.

WRITING STYLE:
- Professional but accessible — write for title officers who are smart but not lawyers
- Use specific regulation references (31 CFR Part 1031, BSA, etc.) for authority
- Include practical, actionable advice — not just theory
- Break up content with clear headings (H2, H3)
- Use short paragraphs (2-3 sentences max)
- Include bullet points and numbered lists where appropriate
- Write in an authoritative, confident tone — you're the expert

SEO REQUIREMENTS:
- Naturally include the target keyword 3-5 times throughout the article
- Use the keyword in the first paragraph
- Include related keywords and synonyms
- Write a compelling meta description (150-160 characters)
- Structure with H2 headings that include keyword variations

TITLECOMPLY PROMOTION (subtle, not salesy):
- Include ONE natural mention of TitleComply as a solution, placed in the second half of the article
- Frame it as "tools like TitleComply" or "compliance automation platforms like TitleComply"
- End with a brief CTA paragraph: "Ready to automate your FinCEN compliance? TitleComply handles screening, data collection, AI document extraction, and report generation in 15 minutes. Start your 14-day free trial at titlecomply.com."
- Do NOT make the entire post about TitleComply — it should be genuinely informative first

OUTPUT FORMAT:
Return a JSON object with this exact structure (no markdown fencing, just raw JSON):
{
  "title": "The Blog Post Title",
  "slug": "the-blog-post-title",
  "description": "150-160 character meta description for SEO",
  "content": "<h2>First Section</h2><p>Content...</p><h2>Second Section</h2><p>More content...</p>",
  "tags": ["FinCEN", "Compliance", "Tag3"],
  "seoKeywords": ["primary keyword", "secondary keyword", "tertiary keyword"],
  "readingTime": "7 min read",
  "imageSearchQueries": ["real estate closing documents", "title company office"]
}

The content field should be clean HTML with <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <em> tags only. No <script>, no <style>, no <img> (images are added separately). Write 800-1200 words.`;

export async function generateBlogPost(topic?: string): Promise<GeneratedBlogPost> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required for blog generation");
  }

  const selectedTopic = topic || pickRandomTopic();
  const currentYear = new Date().getFullYear();
  const topicWithYear = selectedTopic.replace("[year]", String(currentYear));

  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: BLOG_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Write a blog post about: "${topicWithYear}"\n\nTarget primary keyword: "${topicWithYear}"\n\nToday's date: ${new Date().toISOString().split("T")[0]}`,
      },
    ],
  });

  const block = response.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const raw = block.text.replace(/^```json?\s*|\s*```$/g, "").trim();
  const parsed = JSON.parse(raw) as {
    title: string;
    slug: string;
    description: string;
    content: string;
    tags: string[];
    seoKeywords: string[];
    readingTime: string;
    imageSearchQueries: string[];
  };

  const heroImageQuery = parsed.imageSearchQueries[0] || "real estate compliance";
  const inlineImageQuery = parsed.imageSearchQueries[1] || "title company documents";

  const heroImage =
    (await searchUnsplashImage(heroImageQuery)) || {
      url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=630&fit=crop",
      alt: "Real estate compliance",
      credit: "Unsplash",
    };

  const inlineImage = await searchUnsplashImage(inlineImageQuery);

  const id = crypto.randomBytes(8).toString("hex");

  let enrichedContent = parsed.content;

  const heroImgHtml = `<figure class="my-8"><img src="${heroImage.url}" alt="${heroImage.alt.replace(/"/g, "&quot;")}" class="w-full rounded-xl shadow-sm" loading="lazy" /><figcaption class="text-xs text-gray-400 mt-2 text-center">${heroImage.credit}</figcaption></figure>`;
  enrichedContent = heroImgHtml + enrichedContent;

  if (inlineImage) {
    const h2Matches = [...enrichedContent.matchAll(/<\/h2>/g)];
    if (h2Matches.length >= 3) {
      const insertPos = (h2Matches[2].index ?? 0) + 5;
      const inlineImgHtml = `<figure class="my-8"><img src="${inlineImage.url}" alt="${inlineImage.alt.replace(/"/g, "&quot;")}" class="w-full rounded-xl shadow-sm" loading="lazy" /><figcaption class="text-xs text-gray-400 mt-2 text-center">${inlineImage.credit}</figcaption></figure>`;
      enrichedContent =
        enrichedContent.slice(0, insertPos) + inlineImgHtml + enrichedContent.slice(insertPos);
    }
  }

  const slug =
    parsed.slug ||
    parsed.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return {
    id,
    slug,
    title: parsed.title,
    description: parsed.description,
    content: enrichedContent,
    author: "Jon Alcius",
    authorTitle: "Founder, TitleComply",
    publishedAt: new Date().toISOString().split("T")[0],
    readingTime: parsed.readingTime || "7 min read",
    tags: parsed.tags || ["FinCEN", "Compliance"],
    seoKeywords: parsed.seoKeywords || [],
    heroImage,
    inlineImages: inlineImage
      ? [
          {
            ...inlineImage,
            placement: "after-section-3",
          },
        ]
      : [],
    status: "draft",
    generatedAt: new Date().toISOString(),
  };
}

function pickRandomTopic(): string {
  const allTopics = TOPIC_CATEGORIES.flatMap((c) => c.topics);
  return allTopics[Math.floor(Math.random() * allTopics.length)];
}

export function getTopicCategories(): Array<{ category: string; topics: string[] }> {
  return TOPIC_CATEGORIES;
}

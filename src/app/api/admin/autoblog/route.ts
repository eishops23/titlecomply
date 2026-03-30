import { NextRequest, NextResponse } from "next/server";
import { generateBlogPost, getTopicCategories } from "@/lib/autoblog";
import { getGeneratedPosts, saveGeneratedPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getGeneratedPosts();
    const topics = getTopicCategories();
    return NextResponse.json({ posts, topics });
  } catch (error) {
    console.error("[autoblog/list] Error:", error);
    return NextResponse.json({ error: "Failed to list posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const topic = (body as { topic?: string }).topic;

    const post = await generateBlogPost(topic || undefined);
    await saveGeneratedPost(post);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[autoblog/generate] Error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

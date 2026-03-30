import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getGeneratedPostById, saveGeneratedPost, loadGeneratedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

const publishSchema = z.object({
  id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = publishSchema.parse(body);

    const post = await getGeneratedPostById(id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (post.status === "published") {
      return NextResponse.json({ error: "Post is already published" }, { status: 400 });
    }

    post.status = "published";
    post.publishedAt = new Date().toISOString().split("T")[0];
    await saveGeneratedPost(post);

    await loadGeneratedPosts();

    return NextResponse.json({ post, message: "Post published successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  getGeneratedPostById,
  deleteGeneratedPost,
  saveGeneratedPost,
} from "@/lib/blog";
import type { GeneratedBlogPost } from "@/lib/autoblog";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await getGeneratedPostById(id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await getGeneratedPostById(id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const updates = (await request.json()) as Partial<GeneratedBlogPost>;
    const updated = { ...post, ...updates } as GeneratedBlogPost;
    await saveGeneratedPost(updated);

    return NextResponse.json({ post: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteGeneratedPost(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

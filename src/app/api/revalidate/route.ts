import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const tag = searchParams.get("tag");

  if (path) {
    revalidatePath(path);
  }

  if (tag) {
    revalidateTag(tag);
  }

  return NextResponse.json({ 
    revalidated: true, 
    now: Date.now(), 
    path,
    tag,
    message: "Cache cleared successfully."
  });
}

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (path) {
    revalidatePath(path, "page");
  }

  return NextResponse.json({ 
    revalidated: true, 
    now: Date.now(), 
    path,
    message: "Cache cleared successfully."
  });
}

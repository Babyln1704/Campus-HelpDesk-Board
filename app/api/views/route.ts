
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";



export async function GET() {
  try {
    const redis = await getRedis();

    // Atomic increment for every board visit
    const views = await redis.incr("help:views");

    return NextResponse.json({ views });
  } catch (error) {
    console.error("View counter error:", error);

    return NextResponse.json(
      { error: "Redis is unavailable for the view counter" },
      { status: 503 }
    );
  }
}

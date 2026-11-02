
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRedis } from "@/lib/redis";


// POST: Add a new help request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const student_name = body.student_name?.trim();
    const message = body.message?.trim();

    if (!student_name || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "student_name and message are required",
        },
        { status: 400 }
      );
    }

    if (student_name.length > 50 || message.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: "Name must be at most 50 characters and message at most 200 characters",
        },
        { status: 400 }
      );
    }

    // Parameterized SQL query
    const result = await pool.query(
      `INSERT INTO help_requests (student_name, message)
       VALUES ($1, $2)
       RETURNING id`,
      [student_name, message]
    );

    // Invalidate Redis cache after inserting
    try {
      const redis = await getRedis();
      await redis.del("help:latest");
    } catch (error) {
      console.error("Redis cache invalidation failed:", error);
    }

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("POST request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to post request" },
      { status: 500 }
    );
  }
}

// GET: Fetch latest 10 requests
export async function GET() {
  try {
    // First try Redis
    try {
      const redis = await getRedis();
      const cached = await redis.get("help:latest");

      if (cached !== null) {
        return NextResponse.json({
          source: "Redis",
          requests: JSON.parse(cached),
        });
      }
    } catch (error) {
      console.error("Redis cache read failed:", error);
    }

    // Cache miss or Redis unavailable: query PostgreSQL
    const result = await pool.query(
      `SELECT id, student_name, message, created_at
       FROM help_requests
       ORDER BY created_at DESC, id DESC
       LIMIT 10`
    );

    // Try to cache the database result for 60 seconds
    try {
      const redis = await getRedis();
      await redis.set("help:latest", JSON.stringify(result.rows), {
        EX: 60,
      });
    } catch (error) {
      console.error("Redis cache write failed:", error);
    }

    return NextResponse.json({
      source: "PostgreSQL",
      requests: result.rows,
    });
  } catch (error) {
    console.error("GET request error:", error);
    return NextResponse.json(
      { error: "Failed to fetch help requests" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// In-memory storage for quotas (reset on server restart)
// In production, use a database like PostgreSQL, MongoDB, or Redis
const quotaStore: Record<string, { count: number; date: string }> = {};

function getTodayDateString() {
    return new Date().toISOString().split("T")[0];
}

function getUserQuotaKey(userId: string) {
    return `${userId}-${getTodayDateString()}`;
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;
    const key = getUserQuotaKey(userId);
    const quota = quotaStore[key] || { count: 0, date: getTodayDateString() };

    // Get user's custom limit from localStorage (will be passed from client)
    const url = new URL(req.url);
    const customLimit = url.searchParams.get("customLimit");
    const limit = customLimit ? parseInt(customLimit) : 5;

    return NextResponse.json({
        used: quota.count,
        limit: limit,
        remaining: Math.max(0, limit - quota.count),
    });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;
    const key = getUserQuotaKey(userId);
    const today = getTodayDateString();

    // Initialize or get current quota
    if (!quotaStore[key] || quotaStore[key].date !== today) {
        quotaStore[key] = { count: 0, date: today };
    }

    const { customLimit, increment } = await req.json();
    const limit = customLimit || 5;

    // If increment is true, increment the quota (only after successful generation)
    if (increment) {
        quotaStore[key].count += 1;
        return NextResponse.json({
            used: quotaStore[key].count,
            limit: limit,
            remaining: Math.max(0, limit - quotaStore[key].count),
        });
    }

    // Otherwise, just check if quota would be exceeded
    if (quotaStore[key].count >= limit) {
        return NextResponse.json(
            { error: "Daily quota exceeded", used: quotaStore[key].count, limit },
            { status: 429 }
        );
    }

    return NextResponse.json({
        used: quotaStore[key].count,
        limit: limit,
        remaining: Math.max(0, limit - quotaStore[key].count),
    });
}
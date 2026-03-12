import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db/connection";
import { ScraperConfig, ScrapedData, ActivityLog } from "@/lib/db/models";
import { scraperConfigSchema } from "@/lib/validators";
import { checkApiRateLimit } from "@/lib/utils/rate-limit";
import { canPerformAction, incrementUsage } from "@/lib/anti-detection/rate-limiter";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkApiRateLimit(session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "configs";

  await connectDB();

  if (view === "leads") {
    const type = searchParams.get("type");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const filter: Record<string, unknown> = { userId: session.user.id };
    if (type) filter.type = type;
    if (cursor) filter._id = { $lt: cursor };

    const leads = await ScrapedData.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = leads.length > limit;
    const results = hasMore ? leads.slice(0, limit) : leads;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    return NextResponse.json({ leads: results, nextCursor, hasMore });
  }

  const configs = await ScraperConfig.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ configs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkApiRateLimit(session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Check anti-detection rate limits for scrapes
  const { allowed } = await canPerformAction(session.user.id, "scrapes");
  if (!allowed) {
    return NextResponse.json({ error: "Daily scrape limit reached" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = scraperConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();
  const config = await ScraperConfig.create({ ...parsed.data, userId: session.user.id });

  // Log the scraper config creation activity
  await ActivityLog.create({
    userId: session.user.id,
    action: "scraper_config_created",
    module: "scraper",
    details: { configId: config._id, name: parsed.data.name, type: parsed.data.type },
    status: "success",
    timestamp: new Date(),
  });

  // Increment scrape usage
  await incrementUsage(session.user.id, "scrapes");

  return NextResponse.json({ config }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await connectDB();
  await ScraperConfig.findOneAndDelete({ _id: id, userId: session.user.id });
  return NextResponse.json({ success: true });
}


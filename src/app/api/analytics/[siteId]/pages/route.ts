import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-server";
import { getUser } from "../../../../lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    // Verify ownership
    const { data: site } = await supabaseAdmin
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from =
      searchParams.get("from") ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const to = searchParams.get("to") ||
      new Date().toISOString().split("T")[0];

    // Fetch page URLs
    const { data: pageviews, error } = await supabaseAdmin
      .from("pageviews")
      .select("page_url")
      .eq("site_id", siteId)
      .gte("timestamp", `${from}T00:00:00`)
      .lte("timestamp", `${to}T23:59:59`);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch pageviews" },
        { status: 500 }
      );
    }

    // Count occurrences
    const counter: Record<string, number> = {};
    pageviews?.forEach((pv) => {
      const url = pv.page_url || "unknown";
      counter[url] = (counter[url] || 0) + 1;
    });

    const total = Object.values(counter).reduce((a, b) => a + b, 0);

    // Format output
    const pages = Object.entries(counter)
      .map(([page_url, count]) => ({
        page_url,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ pages });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

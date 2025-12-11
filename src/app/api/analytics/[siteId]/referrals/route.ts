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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { siteId } = await params;

    // Validate that user owns this site
    const { data: site, error: siteError } = await supabaseAdmin
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    // Optional date filtering
    const searchParams = request.nextUrl.searchParams;
    const from =
      searchParams.get("from") ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const to = searchParams.get("to") ||
      new Date().toISOString().split("T")[0];

    // Fetch pageviews with referrers
    const { data: pageviews, error } = await supabaseAdmin
      .from("pageviews")
      .select("referrer")
      .eq("site_id", siteId)
      .gte("timestamp", `${from}T00:00:00`)
      .lte("timestamp", `${to}T23:59:59`);

    if (error) {
      console.error("Referral fetch error:", error);
      return NextResponse.json(
        { error: "Failed to load referrals" },
        { status: 500 }
      );
    }

    // Group and count referrers
    const counts: Record<string, number> = {};

    pageviews?.forEach((pv) => {
      const ref = pv.referrer?.trim() || "Direct";
      counts[ref] = (counts[ref] || 0) + 1;
    });

    // Convert to array and sort by volume
    const referrals = Object.entries(counts)
      .map(([referrer, count]) => ({
        referrer,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ referrals });
  } catch (err) {
    console.error("Referrals API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

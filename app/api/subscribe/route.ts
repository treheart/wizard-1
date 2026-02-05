import { NextRequest, NextResponse } from "next/server";

interface SubscribeRequestBody {
  email: string;
  firstName: string;
  path: string;
  result: string;
  bottleneckTitle?: string;
  answers?: Record<string, string>;
}

// Map answer values to human-readable labels for Beehiiv
function getAnswerLabel(questionId: string, value: string): string {
  const answerLabels: Record<string, Record<string, string>> = {
    // Path A (Logiaweb - Beginners) questions
    Q1A: {
      just_starting: "Just starting ($0-$1k/mo)",
      some_traction: "Some traction ($1k-$3k/mo)",
      unsure_growth: "Earning but unsure how to grow ($3k-$8k/mo)",
    },
    Q2A: {
      not_confident: "Not confident in skills",
      no_focus: "Don't know what to focus on",
      overwhelmed: "Overwhelmed by conflicting advice",
    },
    Q3A: {
      scattered: "Scattered - jumps between tutorials",
      consume_no_apply: "Consumes but doesn't apply",
      second_guess: "Second guesses work constantly",
    },
    // Path B (Klime - Founders) questions
    Q1B: {
      idea_only: "Has idea, nothing built yet",
      amateur_brand: "Has product/MVP, brand feels amateur",
      preparing_launch: "Preparing for fundraising or launch",
    },
    Q2B: {
      dont_know_start: "Doesn't know where to start with branding",
      brand_mismatch: "Brand doesn't match ambition",
      need_premium: "Needs premium presence for investors",
    },
    Q3B: {
      brand_identity: "Needs complete brand identity",
      converting_website: "Needs converting website",
      full_package: "Needs full package (strategy, brand, product, website)",
    },
    // Path C (Limora - Designers) questions
    Q1C: {
      hunting_assets: "Hunting for stock images/icons/illustrations",
      ai_unusable: "AI tools produce unusable results",
      inconsistent_visuals: "Maintaining visual consistency",
    },
    Q2C: {
      platform_hopping: "Searching across multiple platforms",
      tweaking_ai: "Tweaking generic AI outputs",
      redoing_assets: "Re-doing assets that don't match brand",
    },
    Q3C: {
      one_place: "Wants one place for all assets",
      web_design_ai: "Wants AI designed for web design",
      faster_path: "Wants faster path to production-ready visuals",
    },
  };

  return answerLabels[questionId]?.[value] || value;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequestBody = await request.json();
    const { email, firstName, path, result, bottleneckTitle, answers } = body;

    // Validate required fields
    if (!email || !firstName) {
      return NextResponse.json(
        { error: "Email and first name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

    if (!apiKey || !publicationId) {
      console.error("Missing Beehiiv credentials");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Subscribe to Beehiiv
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          custom_fields: [
            { name: "first_name", value: firstName },
            { name: "quiz_path", value: path }, // A, B, or C
            { name: "quiz_result", value: result }, // Result subtitle
            { name: "bottleneck_type", value: bottleneckTitle || "" }, // Full bottleneck title
            { name: "quiz_date", value: new Date().toISOString().split("T")[0] }, // YYYY-MM-DD
            // Individual answers for segmentation
            ...(answers
              ? Object.entries(answers).map(([questionId, value]) => ({
                name: `answer_${questionId.toLowerCase()}`,
                value: getAnswerLabel(questionId, value),
              }))
              : []),
            // Also store raw answers as JSON for reference
            ...(answers ? [{ name: "quiz_answers_raw", value: JSON.stringify(answers) }] : []),
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Beehiiv API error:", errorData);

      // Handle specific Beehiiv errors
      if (response.status === 409) {
        // Already subscribed - this is okay
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }

      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const N8N_INTAKE_WEBHOOK = "https://trealvarado.app.n8n.cloud/webhook/beehive-intake";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, answer } = body;

    if (!email || !name || answer === undefined) {
      return NextResponse.json(
        { error: "email, name, and answer are required" },
        { status: 400 }
      );
    }

    const payload = [{ email, name, answer }];

    const response = await fetch(N8N_INTAKE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("n8n intake webhook error:", response.status, text);
      return NextResponse.json(
        { error: "Intake request failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Intake error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

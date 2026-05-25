import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { input, mode } = await req.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const sentences = input
      .split(/[.!?]/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const first = sentences[0] || "the provided workflow";
    const second = sentences[1] || "follow-up planning";
    const third = sentences[2] || "execution details";

    let summary = "";
    let actions: string[] = [];

    if (mode === "bug") {
      summary = `This bug report appears to focus on ${first.toLowerCase()}. The main areas to investigate include ${second.toLowerCase()} and ${third.toLowerCase()}.`;
      actions = [
        `Reproduce the issue: ${first}`,
        `Check logs and related services for: ${second}`,
        `Create a fix plan for: ${third}`,
      ];
    } else if (mode === "customer") {
      summary = `This customer feedback highlights ${first.toLowerCase()}. It suggests possible user concerns around ${second.toLowerCase()} and ${third.toLowerCase()}.`;
      actions = [
        `Identify customer pain point: ${first}`,
        `Review possible product improvement: ${second}`,
        `Prioritize follow-up based on: ${third}`,
      ];
    } else if (mode === "standup") {
      summary = `This standup update covers progress on ${first.toLowerCase()}, with follow-up items related to ${second.toLowerCase()} and ${third.toLowerCase()}.`;
      actions = [
        `Track progress on: ${first}`,
        `Follow up on blocker/task: ${second}`,
        `Plan next step for: ${third}`,
      ];
    } else {
      summary = `This meeting focuses on ${first.toLowerCase()}. Key discussion points include ${second.toLowerCase()} and ${third.toLowerCase()}.`;
      actions = [
        `Review discussion point: ${first}`,
        `Assign owner for: ${second}`,
        `Set next step for: ${third}`,
      ];
    }

    return NextResponse.json({ summary, actions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
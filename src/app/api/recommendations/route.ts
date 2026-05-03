import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { meals, context } = body;

    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return NextResponse.json({ error: "No meals provided" }, { status: 400 });
    }

    // Build compact meal list — only what Gemini needs, no nested objects
    const mealSummaries = meals.slice(0, 40).map((m: {
      id: string;
      name: string;
      category?: { name: string };
      price: number;
      dietary?: string | null;
      averageRating?: number | null;
    }) => ({
      id: m.id,
      name: m.name,
      category: m.category?.name ?? "Food",
      price: m.price,
      dietary: m.dietary ?? "not specified",
      rating: m.averageRating ?? null,
    }));

    const prompt = `You are a meal recommendation engine for FoodHub, a food delivery app in Bangladesh.

Context: ${context}

Available meals:
${JSON.stringify(mealSummaries)}

Choose exactly 4 meal IDs from the list above. For each write a reason of 5-7 words (friendly, food-focused).

Reply with ONLY a JSON array like this (no other text, no markdown):
[{"id":"...","reason":"..."},{"id":"...","reason":"..."},{"id":"...","reason":"..."},{"id":"...","reason":"..."}]`;

    const geminiBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    };

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("[/api/recommendations] Gemini error:", errBody);
      return NextResponse.json(
        { error: "Gemini API error", detail: errBody },
        { status: 500 },
      );
    }

    const geminiData = await geminiRes.json();
    const candidate = geminiData?.candidates?.[0];
    const rawText: string = candidate?.content?.parts?.[0]?.text ?? "";
    
    console.log("[/api/recommendations] Finish reason:", candidate?.finishReason);

    if (!rawText) {
      console.error("[/api/recommendations] Empty Gemini response", geminiData);
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 500 },
      );
    }

    // Extract JSON array from the response — handles accidental markdown fences
    // or extra text before/after the array
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("[/api/recommendations] No JSON array found in:", rawText);
      return NextResponse.json(
        { error: "Could not parse Gemini response", raw: rawText },
        { status: 500 },
      );
    }

    let picks: { id: string; reason: string }[];
    try {
      picks = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[/api/recommendations] JSON parse failed:", jsonMatch[0], parseErr);
      return NextResponse.json(
        { error: "JSON parse failed", raw: jsonMatch[0] },
        { status: 500 },
      );
    }

    if (!Array.isArray(picks) || picks.length === 0) {
      return NextResponse.json(
        { error: "Gemini returned empty picks" },
        { status: 500 },
      );
    }

    // Hydrate picks with full meal objects
    const mealMap = new Map(meals.map((m: { id: string }) => [m.id, m]));
    const recommended = picks
      .filter((p) => p?.id && mealMap.has(p.id))
      .map((p) => ({ ...mealMap.get(p.id), aiReason: p.reason }))
      .slice(0, 4);

    if (recommended.length === 0) {
      // Gemini picked IDs that don't exist — fall back to first 4 meals
      const fallback = meals.slice(0, 4).map((m: object) => ({
        ...m,
        aiReason: "Popular right now",
      }));
      return NextResponse.json({ recommended: fallback });
    }

    return NextResponse.json({ recommended });
  } catch (err) {
    console.error("[/api/recommendations] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 },
    );
  }
}
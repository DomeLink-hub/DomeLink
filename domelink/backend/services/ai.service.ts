import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 15000,
});

export async function getChatCompletion(messages: any[], systemPrompt?: string) {
  try {
    console.log("[AI Service] getChatCompletion called with messages:", messages);
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.7,
    });
    console.log("[AI Service] OpenAI response:", response.choices[0]?.message?.content);
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("[AI Service] getChatCompletion error:", err);
    throw new Error("AI chat failed");
  }
}

export async function getCostEstimate(input: {
  projectType: string;
  builtUpArea: number;
  location: string;
  qualityTier: string;
}) {
  // Basic rule-based estimate
  const baseRate = input.qualityTier === "premium" ? 3500 : input.qualityTier === "standard" ? 2500 : 1800;
  const estimatedCost = baseRate * input.builtUpArea;
  const costRange = [estimatedCost * 0.9, estimatedCost * 1.1];
  const confidence = 0.85;
  const breakdown = {
    baseRate,
    builtUpArea: input.builtUpArea,
    qualityTier: input.qualityTier,
    location: input.location,
  };
  // Optionally refine with OpenAI
  // ...
  return { estimatedCost, costRange, confidence, breakdown };
}

export async function recommendArchitects(userProfile: any, architects: any[]) {
  // Rule-based scoring
  const scored = architects.map((a) => {
    let score = 0;
    let reason = [];
    if (a.location === userProfile.location) {
      score += 30;
      reason.push("Location match");
    }
    if (a.rating >= 4.5) {
      score += 20;
      reason.push("High rating");
    }
    if (a.available) {
      score += 20;
      reason.push("Available now");
    }
    if (userProfile.budget && a.startingPrice <= userProfile.budget) {
      score += 20;
      reason.push("Within budget");
    }
    if (userProfile.projectType && a.specialty === userProfile.projectType) {
      score += 10;
      reason.push("Project type match");
    }
    return {
      architectId: a._id,
      name: a.name,
      matchScore: score,
      matchReason: reason.join(", "),
    };
  });
  // Optionally refine with OpenAI
  // ...
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}

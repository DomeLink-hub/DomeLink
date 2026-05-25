import { groq, DEFAULT_MODEL } from "./groq.js";

export const generateRecommendationReason = async (architectProfile: any, customContext: string) => {
    const prompt = `
    You are an intelligent reasoning engine for DomeLink. 
    Explain in EXACTLY ONE SHORT SENTENCE (max 15 words) why this architect is recommended for the user context.

    Architect Profile Summary:
    Name: ${architectProfile.name || "Studio"}
    Styles: ${architectProfile.styles?.join(", ") || "various styles"}
    Focus: ${architectProfile.about?.slice(0, 50) || "design excellence"}

    User Context:
    ${customContext}

    Tone: Editorial, sophisticated, extremely concise. 
    Output just the sentence. No quotes, no intro.
    `;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: DEFAULT_MODEL,
            temperature: 0.3,
            max_tokens: 50,
        });

        return response.choices[0]?.message?.content || "Aligns well with your specified architectural goals and design timeline.";
    } catch (e) {
        return "Recommended based on your project preferences and style affinities.";
    }
};

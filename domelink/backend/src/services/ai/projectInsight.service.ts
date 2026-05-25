import { groq, DEFAULT_MODEL } from "./groq.js";

export const generateProjectHealthInsight = async (projectData: any) => {
    const prompt = `
    You are an architectural project manager AI. Analyze the following project state (progress, milestones, timeline) and return a JSON object with:
    1. healthTag ("On Track", "At Risk", "Delayed")
    2. singleLineSummary (max 12 words)

    Project Data:
    ${JSON.stringify(projectData)}
    
    Output STRICTLY in valid JSON format without markdown ticks.
    `;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: DEFAULT_MODEL,
            temperature: 0.1,
            max_tokens: 100,
        });

        const text = response.choices[0]?.message?.content || "{}";
        // Strip markdown backticks if returned
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        return { healthTag: "On Track", singleLineSummary: "Project is progressing steadily." };
    }
};

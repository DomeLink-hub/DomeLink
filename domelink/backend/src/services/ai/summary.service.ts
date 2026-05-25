import { groq, DEFAULT_MODEL } from "./groq.js";

export interface ConsultationSummaryResult {
    summary: string;
    leadScore: number;
    nextBestAction: string;
}

export interface ProjectSummaryResult {
    readinessScore: number;
    summary: string;
    stylisticMatch: string;
    nextBestAction: string;
}

const safeJsonParse = (value: string) => {
    const cleaned = value.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
};

export const summarizeConsultationRequest = async (consultationData: any): Promise<ConsultationSummaryResult> => {
    const prompt = `
You are an architectural lead analyst.
Return STRICT JSON with:
{
    "summary": "2-3 sentence executive summary",
    "leadScore": number between 0 and 100,
    "nextBestAction": "one short action sentence"
}

Evaluate budget fit, project clarity, style alignment, and execution readiness.

Consultation Brief:
${JSON.stringify(consultationData)}

Tone: professional, direct, concise.
`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: DEFAULT_MODEL,
            temperature: 0.15,
            max_tokens: 220,
        });

        const content = response.choices[0]?.message?.content || "";
        const parsed = safeJsonParse(content);

        if (parsed && typeof parsed.summary === "string") {
            return {
                summary: parsed.summary,
                leadScore: Math.max(0, Math.min(100, Number(parsed.leadScore ?? 70))),
                nextBestAction: String(parsed.nextBestAction ?? "Request a brief call to validate scope."),
            };
        }

        return {
            summary: content || "Client has requested a standard architectural consultation.",
            leadScore: 68,
            nextBestAction: "Request a brief discovery call to sharpen scope.",
        };
    } catch {
        return {
            summary: "Unable to generate AI summary at this moment.",
            leadScore: 50,
            nextBestAction: "Review the consultation manually.",
        };
    }
};

export const summarizeProjectWorkspace = async (projectData: any): Promise<ProjectSummaryResult> => {
    const prompt = `
You are DomeLink's project intelligence layer.
Return STRICT JSON with:
{
    "readinessScore": number between 0 and 100,
    "summary": "2-3 sentence project readiness summary",
    "stylisticMatch": "one short sentence about style alignment",
    "nextBestAction": "one short action sentence"
}

Assess milestone progress, timeline confidence, budget clarity, and design coherence.

Project Data:
${JSON.stringify(projectData)}

Tone: premium, calm, professional.
`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: DEFAULT_MODEL,
            temperature: 0.15,
            max_tokens: 220,
        });

        const content = response.choices[0]?.message?.content || "";
        const parsed = safeJsonParse(content);

        if (parsed && typeof parsed.summary === "string") {
            return {
                readinessScore: Math.max(0, Math.min(100, Number(parsed.readinessScore ?? 72))),
                summary: parsed.summary,
                stylisticMatch: String(parsed.stylisticMatch ?? "The current brief needs sharper stylistic definition."),
                nextBestAction: String(parsed.nextBestAction ?? "Review the next milestone and confirm the brief."),
            };
        }

        return {
            readinessScore: 72,
            summary: content || "Project appears to be progressing with reasonable clarity.",
            stylisticMatch: "Style alignment requires a quick review.",
            nextBestAction: "Confirm the next milestone and scope.",
        };
    } catch {
        return {
            readinessScore: 50,
            summary: "Unable to generate project summary at this moment.",
            stylisticMatch: "Style alignment could not be assessed right now.",
            nextBestAction: "Re-run the analysis after refreshing project data.",
        };
    }
};

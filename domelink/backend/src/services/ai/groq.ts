import GroqModule from "groq-sdk";
const Groq = typeof GroqModule === 'function' ? GroqModule : (GroqModule as any).default;

const apiKey = process.env.GROQ_API_KEY;

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

if (!apiKey) {
  console.warn("[AI] GROQ_API_KEY is not configured. DomeLink AI services will be disabled.");
}

export const groq: any = apiKey
  ? new Groq({ apiKey })
  : {
      chat: {
        completions: {
          create: async () => {
            throw new Error("GROQ_API_KEY is not configured.");
          },
        },
      },
    };

import GroqModule from "groq-sdk";
const Groq = typeof GroqModule === 'function' ? GroqModule : (GroqModule as any).default;

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is required for DomeLink AI services.");
}

export const groq = new Groq({
  apiKey,
});

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

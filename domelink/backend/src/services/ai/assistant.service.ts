import { groq, DEFAULT_MODEL } from "./groq.js";
import { ARCHITECTURE_ASSISTANT_SYSTEM_PROMPT } from "./promptTemplates/architectPrompt.js";

export interface ChatMessagePayload {
    role: "system" | "user" | "assistant";
    content: string;
}

/**
 * Handles conversational inquiries by passing them to Groq with an architectural system prompt.
 * Returns the async iterable stream to be piped to the client.
 */
export const chatWithArchitectAI = async (messages: ChatMessagePayload[]) => {
    // Inject system prompt gracefully
    const formattedMessages: any[] = [
        { role: "system", content: ARCHITECTURE_ASSISTANT_SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content }))
    ];

    const stream = await groq.chat.completions.create({
        messages: formattedMessages,
        model: DEFAULT_MODEL,
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 0.9,
        stream: true,
    });

    return stream; 
};

export interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>;
}

export class AIService {
  private static GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  static async streamCompletion(options: {
    model: string;
    messages: ChatMessagePayload[];
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;

    if (!apiKey) {
      throw new Error("Clé API Google AI Studio manquante. Veuillez configurer GEMINI_API_KEY.");
    }

    // Adapt model name for Google AI Studio
    let modelName = options.model;
    if (modelName.includes("/")) {
      modelName = modelName.split("/").pop() || modelName;
    }
    if (!modelName.startsWith("gemini-")) {
      modelName = "gemini-2.0-flash";
    }

    const response = await fetch(this.GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google AI Studio Error (${response.status}): ${errorText}`);
    }

    return response;
  }
}


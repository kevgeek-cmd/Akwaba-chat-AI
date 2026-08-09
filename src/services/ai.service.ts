export interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>;
}

export class AIService {
  private static OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

  static async streamCompletion(options: {
    model: string;
    messages: ChatMessagePayload[];
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("Clé API OpenRouter manquante. Veuillez configurer OPENROUTER_API_KEY.");
    }

    const response = await fetch(this.OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Akwaba Chat",
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
        plugins: [{ id: "web" }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter Error (${response.status}): ${errorText}`);
    }

    return response;
  }
}



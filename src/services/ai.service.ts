export interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>;
}

export interface StreamResult {
  response: Response;
  modelUsed: string;
  fallbackOccurred: boolean;
}

export class AIService {
  private static OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

  // Modèles gratuits rapides et stables vérifiés en direct
  public static readonly DEFAULT_TEXT_MODELS = [
    "minimax/minimax-m2.7:free",
    "dots-studio/dots-3-note-preview:free",
    "openrouter/free",
  ];

  public static readonly DEFAULT_VISION_MODELS = [
    "dots-studio/dots-3-note-preview:free",
    "openrouter/free",
  ];

  /**
   * Effectue un appel streamé direct avec un timeout
   */
  static async streamCompletion(options: {
    model: string;
    messages: ChatMessagePayload[];
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  }): Promise<Response> {
    const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("Clé API OpenRouter manquante. Veuillez configurer OPENROUTER_API_KEY.");
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 15000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
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
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`OpenRouter Error (${response.status}): ${errorText.slice(0, 300)}`);
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timer);
      throw err;
    }
  }

  /**
   * Stream avec cascade de fallback automatique : bascule immédiatement
   * vers un modèle sain en cas d'erreur (429, 500, timeout...)
   */
  static async streamCompletionWithFallback(options: {
    model: string;
    messages: ChatMessagePayload[];
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    hasImage?: boolean;
  }): Promise<StreamResult> {
    const candidateList: string[] = [];

    // Ajouter le modèle demandé en premier si pertinent
    if (options.model && !candidateList.includes(options.model)) {
      candidateList.push(options.model);
    }

    // Modèles de secours selon la présence d'images
    const defaultPool = options.hasImage
      ? this.DEFAULT_VISION_MODELS
      : this.DEFAULT_TEXT_MODELS;

    for (const m of defaultPool) {
      if (!candidateList.includes(m)) {
        candidateList.push(m);
      }
    }

    let lastError: Error | null = null;

    for (let i = 0; i < candidateList.length; i++) {
      const currentModel = candidateList[i];
      // Si le modèle n'est pas le dernier, donner un timeout strict de 7s pour le premier token
      const isLast = i === candidateList.length - 1;
      const timeoutMs = isLast ? 20000 : 7000;

      try {
        const response = await this.streamCompletion({
          model: currentModel,
          messages: options.messages,
          apiKey: options.apiKey,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          timeoutMs,
        });

        return {
          response,
          modelUsed: currentModel,
          fallbackOccurred: currentModel !== options.model,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Passer au modèle suivant dans la cascade
        continue;
      }
    }

    throw lastError || new Error("Tous les modèles gratuits ont échoué.");
  }

  /**
   * Génération non-streamée rapide de secours en cas d'interruption
   */
  static async quickFallbackCompletion(options: {
    messages: ChatMessagePayload[];
    model?: string;
  }): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return "";

    const candidateModels = [
      options.model,
      "minimax/minimax-m2.7:free",
      "dots-studio/dots-3-note-preview:free",
    ].filter(Boolean) as string[];

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(this.OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Akwaba Chat",
          },
          body: JSON.stringify({
            model,
            messages: options.messages,
            max_tokens: 800,
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.ok) {
          const json = await res.json();
          const text = json.choices?.[0]?.message?.content;
          if (text && typeof text === "string" && text.trim().length > 0) {
            return text.trim();
          }
        }
      } catch {
        continue;
      }
    }
    return "";
  }
}




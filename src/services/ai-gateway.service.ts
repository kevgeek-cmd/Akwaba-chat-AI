import { AIService, ChatMessagePayload } from "@/services/ai.service";
import { logger } from "@/lib/logger";

export interface StreamCompletionOptions {
  model: string;
  messages: ChatMessagePayload[];
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GatewayStreamResult {
  response: Response;
  providerUsed: "omniroute" | "openrouter-direct" | "openrouter-fallback";
  fallbackOccurred: boolean;
  modelUsed: string;
}

export class AIGatewayService {
  /**
   * Builds the normalized OmniRoute chat completions URL
   */
  private static getOmniRouteEndpoint(): string {
    const rawUrl = (process.env.OMNIROUTE_BASE_URL || "http://localhost:20128").trim();
    if (rawUrl.endsWith("/chat/completions")) {
      return rawUrl;
    }
    if (rawUrl.endsWith("/v1")) {
      return `${rawUrl}/chat/completions`;
    }
    const cleanBase = rawUrl.replace(/\/+$/, "");
    return `${cleanBase}/v1/chat/completions`;
  }

  /**
   * Checks whether OmniRoute AI Gateway is enabled via environment variable
   */
  public static isGatewayEnabled(): boolean {
    const flag = (process.env.AI_GATEWAY_ENABLED || "").toLowerCase().trim();
    return flag === "true" || flag === "1" || flag === "yes";
  }

  /**
   * Main entrypoint for streaming completions with automated multi-tier fallback
   */
  static async streamCompletion(options: StreamCompletionOptions): Promise<GatewayStreamResult> {
    const gatewayEnabled = this.isGatewayEnabled();

    // 1. Direct mode if AI Gateway feature flag is disabled
    if (!gatewayEnabled) {
      logger.debug("AIGatewayService", "AI Gateway feature flag is disabled. Using Direct OpenRouter provider.", {
        model: options.model,
      });

      const response = await AIService.streamCompletion(options);
      return {
        response,
        providerUsed: "openrouter-direct",
        fallbackOccurred: false,
        modelUsed: options.model,
      };
    }

    // 2. AI Gateway mode (OmniRoute) with automated fallback
    const endpoint = this.getOmniRouteEndpoint();
    const apiKey = process.env.OMNIROUTE_API_KEY?.trim();
    const timeoutMs = parseInt(process.env.OMNIROUTE_TIMEOUT_MS || "8000", 10);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Akwaba Chat",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const payload = {
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: true,
    };

    try {
      logger.info("AIGatewayService", "Dispatching request to OmniRoute Gateway", {
        endpoint,
        model: options.model,
        timeoutMs,
      });

      const abortSignal = AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined;

      const omniResponse = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: abortSignal,
      });

      if (!omniResponse.ok) {
        const errorText = await omniResponse.text().catch(() => "");
        throw new Error(`OmniRoute returned HTTP ${omniResponse.status}: ${errorText.slice(0, 300)}`);
      }

      if (!omniResponse.body) {
        throw new Error("OmniRoute returned an empty response body.");
      }

      logger.info("AIGatewayService", "OmniRoute stream successfully established", {
        model: options.model,
        status: omniResponse.status,
      });

      return {
        response: omniResponse,
        providerUsed: "omniroute",
        fallbackOccurred: false,
        modelUsed: options.model,
      };
    } catch (gatewayError: unknown) {
      const errorMsg = gatewayError instanceof Error ? gatewayError.message : String(gatewayError);

      logger.warn("AIGatewayService", "OmniRoute Gateway encountered an error or timeout. Triggering automatic fallback to Direct OpenRouter.", {
        model: options.model,
        reason: errorMsg,
      });

      // 3. Automated Fallback to existing OpenRouter provider
      try {
        const fallbackResponse = await AIService.streamCompletion(options);

        logger.info("AIGatewayService", "Fallback to Direct OpenRouter succeeded.", {
          model: options.model,
        });

        return {
          response: fallbackResponse,
          providerUsed: "openrouter-fallback",
          fallbackOccurred: true,
          modelUsed: options.model,
        };
      } catch (fallbackError: unknown) {
        const fbMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        logger.error("AIGatewayService", "Both OmniRoute and Fallback Provider failed.", {
          omniError: errorMsg,
          fallbackError: fbMsg,
        });
        throw new Error(`Erreur Gateway et Fallback : ${fbMsg}`);
      }
    }
  }
}

/**
 * Service d'orchestration du scraping responsable
 * Valide l'URL, vérifie robots.txt, extrait le contenu et gère le cache
 */

import { UrlValidator } from "./url-validator";
import { RobotsService } from "./robots.service";
import { WebExtractor, ExtractedWebPage } from "./web-extractor";
import { logger } from "@/lib/logger";

export interface ScrapingServiceResult {
  success: boolean;
  page?: ExtractedWebPage;
  error?: string;
  errorCode?: "INVALID_URL" | "ROBOTS_DENIED" | "FETCH_FAILED" | "TIMEOUT" | "NETWORK_ERROR";
}

export class ScrapingService {
  private static CACHE = new Map<string, { page: ExtractedWebPage; timestamp: number }>();
  private static CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes de cache

  /**
   * Analyse et extrait une page web en respectant toutes les règles éthiques et de sécurité
   */
  static async scrapeUrl(rawUrl: string): Promise<ScrapingServiceResult> {
    const startTime = Date.now();

    // 1. Validation de l'URL & Protection SSRF
    const validation = UrlValidator.validate(rawUrl);
    if (!validation.isValid || !validation.sanitizedUrl) {
      logger.warn("ScrapingService", "URL rejetée par le validateur SSRF", { rawUrl, error: validation.error });
      return {
        success: false,
        error: validation.errorMessage || "L'URL fournie n'est pas autorisée ou est invalide.",
        errorCode: "INVALID_URL",
      };
    }

    const sanitizedUrl = validation.sanitizedUrl;

    // 2. Vérification du cache
    const cached = this.CACHE.get(sanitizedUrl);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      logger.info("ScrapingService", "Page retournée depuis le cache", { url: sanitizedUrl });
      return {
        success: true,
        page: cached.page,
      };
    }

    // 3. Vérification de robots.txt et détection de domaines protégés par connexion
    let domain = "";
    try {
      domain = new URL(sanitizedUrl).hostname.replace(/^www\./, "");
    } catch {}

    const isLinkedIn = domain.includes("linkedin.com");
    const isSocialAuthWall =
      isLinkedIn ||
      domain.includes("facebook.com") ||
      domain.includes("instagram.com") ||
      domain.includes("twitter.com") ||
      domain.includes("x.com");

    const robotsCheck = await RobotsService.isAllowed(sanitizedUrl);
    if (!robotsCheck.allowed || isSocialAuthWall) {
      const siteName = isLinkedIn ? "LinkedIn" : domain;
      const customMessage = isSocialAuthWall
        ? `L'accès à **${siteName}** nécessite une connexion utilisateur (compte connecté) et son fichier \`robots.txt\` interdit le scraping automatisé des profils.\n\n` +
          `💡 **Comment procéder autrement :**\n` +
          `• **Copier-coller le profil :** Copiez directement le texte du profil et collez-le ici dans le chat.\n` +
          `• **Recherche approfondie 🔎 :** Activez le bouton *Recherche approfondie* pour que j'explore les informations publiques disponibles sur le web.`
        : "Je ne peux pas récupérer automatiquement cette page dans ces conditions (accès restreint par robots.txt).";

      return {
        success: false,
        error: customMessage,
        errorCode: "ROBOTS_DENIED",
      };
    }

    // 4. Extraction du contenu
    try {
      const page = await WebExtractor.extract(sanitizedUrl);
      this.CACHE.set(sanitizedUrl, { page, timestamp: Date.now() });

      logger.info("ScrapingService", "Scraping réussi", {
        url: sanitizedUrl,
        durationMs: Date.now() - startTime,
        wordCount: page.wordCount,
      });

      return {
        success: true,
        page,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("ScrapingService", "Échec de l'extraction", { url: sanitizedUrl, error: message });

      const isTimeout = message.toLowerCase().includes("délai") || message.toLowerCase().includes("timeout");
      return {
        success: false,
        error: `Impossible de récupérer le contenu de cette page : ${message}`,
        errorCode: isTimeout ? "TIMEOUT" : "FETCH_FAILED",
      };
    }
  }
}

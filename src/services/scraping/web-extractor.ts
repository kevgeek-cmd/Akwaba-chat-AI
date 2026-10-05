/**
 * Service d'extraction et de nettoyage de contenu HTML
 * Transforme une page web brute en texte structuré prêt pour l'analyse IA
 */

import { logger } from "@/lib/logger";

export interface ExtractedWebPage {
  url: string;
  title: string;
  description?: string;
  content: string;
  fetchedAt: string;
  wordCount: number;
}

export class WebExtractor {
  private static MAX_BYTES = 2 * 1024 * 1024; // 2 Mo max pour éviter saturation mémoire
  private static MAX_CONTENT_LENGTH = 15000;  // 15 000 caractères max pour le prompt LLM

  /**
   * Récupère et extrait le contenu textuel d'une URL sécurisée
   */
  static async extract(
    url: string,
    timeoutMs: number = 8000
  ): Promise<ExtractedWebPage> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AkwabaBot/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`La page a renvoyé un code HTTP ${response.status} (${response.statusText}).`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml") &&
        !contentType.includes("text/plain")
      ) {
        throw new Error("Le contenu de cette ressource n'est pas du texte web lisible (HTML).");
      }

      // Lecture avec limite de taille
      const textBuffer = await response.text();
      const rawHtml = textBuffer.slice(0, this.MAX_BYTES);

      return this.cleanHtml(rawHtml, url);
    } catch (err: unknown) {
      clearTimeout(timer);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("abort") || message.includes("timeout")) {
        throw new Error("Le serveur distant a mis trop de temps à répondre (délai dépassé).");
      }
      throw err;
    }
  }

  /**
   * Nettoie le HTML et extrait le texte significatif
   */
  public static cleanHtml(html: string, url: string): ExtractedWebPage {
    // 1. Extraction du Titre
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    if (!title) {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      title = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : new URL(url).hostname;
    }

    // 2. Extraction de la meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
    const description = descMatch ? descMatch[1].trim() : undefined;

    // 3. Suppression des balises non textuelles ou bruit
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // 4. Conversion des sauts de ligne pour les balises de bloc
    clean = clean
      .replace(/<(p|h1|h2|h3|h4|h5|h6|li|tr|div|br)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ");

    // 5. Décodage des entités HTML courantes
    clean = clean
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&Agrave;|&agrave;/g, "à")
      .replace(/&Eacute;|&eacute;/g, "é")
      .replace(/&Egrave;|&egrave;/g, "è")
      .replace(/&Ccedil;|&ccedil;/g, "ç");

    // 6. Normalisation des espaces et sauts de ligne consécutifs
    clean = clean
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n\n");

    // Limiter la taille du texte extrait pour le prompt IA
    const truncatedContent = clean.slice(0, this.MAX_CONTENT_LENGTH);
    const wordCount = truncatedContent.split(/\s+/).filter(Boolean).length;

    logger.debug("WebExtractor", "Page extraite avec succès", {
      url,
      title,
      wordCount,
      length: truncatedContent.length,
    });

    return {
      url,
      title,
      description,
      content: truncatedContent,
      fetchedAt: new Date().toISOString(),
      wordCount,
    };
  }
}

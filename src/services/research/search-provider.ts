/**
 * Abstraction et implémentation des fournisseurs de recherche web (SearchProvider)
 * Recherche multi-sources avec fallback automatique pour Akwaba Chat
 */

import { logger } from "@/lib/logger";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  source?: string;
}

export interface SearchProvider {
  name: string;
  search(query: string, maxResults?: number): Promise<SearchResult[]>;
}

/**
 * Fournisseur DuckDuckGo HTML — Aucune clé API requise, résultats web réels et fiables
 */
export class DuckDuckGoSearchProvider implements SearchProvider {
  name = "DuckDuckGo HTML";

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`DuckDuckGo a renvoyé le statut HTTP ${res.status}`);
      }

      const html = await res.text();
      const results: SearchResult[] = [];

      // Regex pour parser les résultats HTML de DuckDuckGo
      const resultRegex = /<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;

      while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
        let rawUrl = match[1];

        // Décoder les redirections duckduckgo (uddg=...)
        if (rawUrl.includes("uddg=")) {
          const uMatch = rawUrl.match(/uddg=([^&]+)/);
          if (uMatch) {
            rawUrl = decodeURIComponent(uMatch[1]);
          }
        }

        const rawTitle = match[2].replace(/<[^>]+>/g, "").trim();
        const rawSnippet = match[3].replace(/<[^>]+>/g, "").trim();

        if (rawUrl && rawUrl.startsWith("http")) {
          let hostname = "";
          try {
            hostname = new URL(rawUrl).hostname.replace(/^www\./, "");
          } catch {
            hostname = "Web";
          }

          results.push({
            title: rawTitle || hostname,
            url: rawUrl,
            snippet: rawSnippet,
            source: hostname,
          });
        }
      }

      // Si le premier format n'a rien trouvé, tenter le format standard alternatif
      if (results.length === 0) {
        const altRegex = /<h2 class="result__title">[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
        let altMatch;
        while ((altMatch = altRegex.exec(html)) !== null && results.length < maxResults) {
          let altUrl = altMatch[1];
          if (altUrl.includes("uddg=")) {
            const uMatch = altUrl.match(/uddg=([^&]+)/);
            if (uMatch) altUrl = decodeURIComponent(uMatch[1]);
          }
          const altTitle = altMatch[2].replace(/<[^>]+>/g, "").trim();
          const altSnippet = altMatch[3].replace(/<[^>]+>/g, "").trim();

          if (altUrl && altUrl.startsWith("http")) {
            results.push({
              title: altTitle,
              url: altUrl,
              snippet: altSnippet,
              source: new URL(altUrl).hostname,
            });
          }
        }
      }

      logger.info("SearchProvider", "Recherche DuckDuckGo effectuée", {
        query,
        count: results.length,
      });

      return results;
    } catch (err) {
      clearTimeout(timer);
      logger.error("SearchProvider", "Erreur lors de la recherche DuckDuckGo", {
        error: String(err),
      });
      return [];
    }
  }
}

/**
 * Fournisseur Tavily (si configuré avec TAVILY_API_KEY)
 */
export class TavilySearchProvider implements SearchProvider {
  name = "Tavily Search API";

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    const apiKey = process.env.TAVILY_API_KEY?.trim();
    if (!apiKey) return [];

    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: "basic",
          max_results: maxResults,
        }),
      });

      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map((r: { title: string; url: string; content?: string }) => ({
        title: r.title,
        url: r.url,
        snippet: r.content || "",
        source: new URL(r.url).hostname,
      }));
    } catch {
      return [];
    }
  }
}

/**
 * Fournisseur combiné avec sélection intelligente et fallback
 */
export class CompositeSearchProvider implements SearchProvider {
  name = "Akwaba Composite Search Provider";

  private providers: SearchProvider[] = [
    new TavilySearchProvider(),
    new DuckDuckGoSearchProvider(),
  ];

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    for (const provider of this.providers) {
      try {
        const results = await provider.search(query, maxResults);
        if (results && results.length > 0) {
          logger.info("CompositeSearchProvider", `Résultats obtenus via ${provider.name}`, {
            count: results.length,
          });
          return results;
        }
      } catch (err) {
        logger.warn("CompositeSearchProvider", `Provider ${provider.name} a échoué, essai du suivant`, {
          error: String(err),
        });
      }
    }
    return [];
  }
}

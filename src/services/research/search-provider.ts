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
 * Fournisseur Wikipédia / Wikimedia (100% libre de droit, données encyclopédiques fiables en temps réel)
 */
export class WikipediaSearchProvider implements SearchProvider {
  name = "Wikipédia Open Knowledge";

  async search(query: string, maxResults: number = 3): Promise<SearchResult[]> {
    const cleanQuery = query
      .replace(/^(score|match|résultat|qui est|qu'est ce que|c'est quoi|histoire de)/i, "")
      .trim();

    const encoded = encodeURIComponent(cleanQuery || query);
    const apiUrl = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&origin=*`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "User-Agent": "AkwabaBot/1.0 (https://akwabachat.ci; open knowledge integration)",
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) return [];

      const data = await res.json();
      const items = data.query?.search || [];

      return items.slice(0, maxResults).map((item: { title: string; snippet: string }) => ({
        title: `Wikipédia : ${item.title}`,
        url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
        snippet: item.snippet
          .replace(/<[^>]+>/g, "")
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .trim(),
        source: "fr.wikipedia.org",
      }));
    } catch {
      clearTimeout(timer);
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
 * Fournisseur combiné avec sélection intelligente et agrégation multi-sources
 * Réunit les bases libres de droits (Wikipédia) et le Web en temps réel (DuckDuckGo / Tavily)
 */
export class CompositeSearchProvider implements SearchProvider {
  name = "Akwaba Composite Search Provider";

  private wikiProvider = new WikipediaSearchProvider();
  private tavilyProvider = new TavilySearchProvider();
  private ddgProvider = new DuckDuckGoSearchProvider();

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    try {
      // Interroger en parallèle Wikipédia (données ouvertes libres de droits) et DuckDuckGo/Tavily (web direct)
      const [webResults, wikiResults] = await Promise.all([
        this.tavilyProvider
          .search(query, maxResults)
          .then((res) => (res.length > 0 ? res : this.ddgProvider.search(query, maxResults)))
          .catch(() => this.ddgProvider.search(query, maxResults)),
        this.wikiProvider.search(query, 2).catch(() => []),
      ]);

      // Fusionner les résultats en évitant les doublons
      for (const r of [...webResults, ...wikiResults]) {
        if (!seenUrls.has(r.url)) {
          seenUrls.add(r.url);
          allResults.push(r);
        }
      }

      logger.info("CompositeSearchProvider", "Agrégation multi-sources réussie", {
        query,
        webCount: webResults.length,
        wikiCount: wikiResults.length,
        total: allResults.length,
      });

      return allResults.slice(0, maxResults);
    } catch (err) {
      logger.error("CompositeSearchProvider", "Erreur lors de l'agrégation", { error: String(err) });
      return [];
    }
  }
}


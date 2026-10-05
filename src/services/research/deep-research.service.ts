/**
 * Service d'orchestration de la Recherche Approfondie (Deep Research)
 * Multi-sources, extraction, recoupement et préparation de synthèse avec citations
 */

import { CompositeSearchProvider, SearchResult } from "./search-provider";
import { WebExtractor } from "../scraping/web-extractor";
import { UrlValidator } from "../scraping/url-validator";
import { logger } from "@/lib/logger";

export interface DeepResearchResult {
  query: string;
  sources: SearchResult[];
  contextForPrompt: string;
  citationsMarkdown: string;
}

export class DeepResearchService {
  private static searchProvider = new CompositeSearchProvider();

  /**
   * Pipeline complet de recherche approfondie
   */
  static async execute(
    userPrompt: string,
    onStep?: (step: "query_analysis" | "search_launched" | "sources_collected" | "cross_checking") => void
  ): Promise<DeepResearchResult> {
    const startTime = Date.now();

    // 1. Analyse de la question & extraction des mots-clés
    onStep?.("query_analysis");
    const cleanQuery = this.optimizeQuery(userPrompt);

    // 2. Lancement de la recherche multi-sources
    onStep?.("search_launched");
    const rawResults = await this.searchProvider.search(cleanQuery, 4);

    if (rawResults.length === 0) {
      logger.warn("DeepResearchService", "Aucun résultat trouvé pour la requête", { cleanQuery });
      return {
        query: cleanQuery,
        sources: [],
        contextForPrompt: "",
        citationsMarkdown: "",
      };
    }

    // 3. Collecte et enrichissement des sources pertinentes (jusqu'à 3 pages principales)
    onStep?.("sources_collected");
    const enrichedResults: SearchResult[] = [];

    // Récupérer le contenu approfondi des 2 premières pages si l'URL est sûre
    const topUrls = rawResults.slice(0, 2);
    for (const res of topUrls) {
      const val = UrlValidator.validate(res.url);
      if (val.isValid && val.sanitizedUrl) {
        try {
          const page = await WebExtractor.extract(val.sanitizedUrl, 4000);
          enrichedResults.push({
            ...res,
            content: page.content.slice(0, 2500),
          });
        } catch {
          // Si le fetch individuel échoue ou timeout, conserver le snippet de recherche
          enrichedResults.push(res);
        }
      } else {
        enrichedResults.push(res);
      }
    }

    // Ajouter les autres résultats avec leur snippet
    for (const res of rawResults.slice(2)) {
      enrichedResults.push(res);
    }

    // 4. Recoupement et structuration du contexte pour le modèle IA
    onStep?.("cross_checking");
    const contextLines: string[] = [];
    contextLines.push("=== RÉSULTATS DE RECHERCHE WEB EN DIRECT (SOURCES VÉRIFIÉES) ===");

    enrichedResults.forEach((source, idx) => {
      contextLines.push(`\n[SOURCE ${idx + 1}] : ${source.title}`);
      contextLines.push(`URL : ${source.url}`);
      contextLines.push(`Extrait / Contenu : ${source.content || source.snippet}`);
    });

    contextLines.push("\n=== DIRECTIVES DE SYNTHÈSE ===");
    contextLines.push(
      "1. Fonde impérativement ta réponse sur les sources fiables ci-dessus.\n" +
      "2. Compare les données et mentionne les consensus ou éventuelles divergences.\n" +
      "3. À la fin de ta réponse, inclus une section '### 📚 Sources consultées' avec la liste à puces des sources au format Markdown cliquable : [Titre](URL)."
    );

    // Formater la liste des citations cliquables
    const citationsMarkdown = enrichedResults
      .map((s, idx) => `${idx + 1}. [${s.title}](${s.url}) — *${s.source || "Web"}*`)
      .join("\n");

    logger.info("DeepResearchService", "Recherche approfondie complétée", {
      query: cleanQuery,
      sourcesCount: enrichedResults.length,
      durationMs: Date.now() - startTime,
    });

    return {
      query: cleanQuery,
      sources: enrichedResults,
      contextForPrompt: contextLines.join("\n"),
      citationsMarkdown,
    };
  }

  /**
   * Nettoie les formulations orales superflues pour extraire une requête de recherche efficace
   */
  private static optimizeQuery(prompt: string): string {
    return prompt
      .replace(/^(recherche(-moi)?|cherche(-moi)?|peux-tu (me )?chercher|trouve(-moi)?|fais(-moi)? une recherche sur)/i, "")
      .replace(/^(qu'est-ce que|quelles sont|quels sont|pourquoi|comment)/i, (match) => match)
      .replace(/[?!.]+$/, "")
      .trim();
  }
}

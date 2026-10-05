/**
 * Service de vérification du fichier robots.txt (Scraping Responsable)
 * Respecte les directives d'exclusion des propriétaires de sites
 */

import { logger } from "@/lib/logger";

export interface RobotsCheckResult {
  allowed: boolean;
  reason?: string;
}

export class RobotsService {
  private static USER_AGENT = "AkwabaBot/1.0";
  private static CACHE = new Map<string, { content: string; timestamp: number }>();
  private static CACHE_TTL_MS = 1000 * 60 * 60; // 1 heure de cache pour robots.txt

  /**
   * Vérifie si le chemin d'une URL est autorisé par le robots.txt du domaine
   */
  static async isAllowed(targetUrl: string, timeoutMs: number = 3000): Promise<RobotsCheckResult> {
    try {
      const parsed = new URL(targetUrl);
      const origin = parsed.origin;
      const pathname = parsed.pathname || "/";
      const robotsUrl = `${origin}/robots.txt`;

      let robotsText = "";
      const cached = this.CACHE.get(origin);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
        robotsText = cached.content;
      } else {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const res = await fetch(robotsUrl, {
            method: "GET",
            headers: {
              "User-Agent": this.USER_AGENT,
              Accept: "text/plain,text/html,*/*",
            },
            signal: controller.signal,
          });

          clearTimeout(timer);

          if (res.status === 404 || res.status === 410) {
            // Aucun fichier robots.txt trouvé : par convention web, l'accès est autorisé
            return { allowed: true };
          }

          if (res.ok) {
            robotsText = await res.text();
            this.CACHE.set(origin, { content: robotsText, timestamp: Date.now() });
          } else {
            // En cas d'erreur serveur sur robots.txt, on autorise prudemment
            return { allowed: true };
          }
        } catch {
          clearTimeout(timer);
          // Si timeout ou échec réseau sur robots.txt, autoriser par défaut
          return { allowed: true };
        }
      }

      // Analyse des règles robots.txt
      const lines = robotsText.split("\n").map((l) => l.trim());
      let currentUserAgentMatches = false;
      const disallowedPaths: string[] = [];
      const allowedPaths: string[] = [];

      for (const line of lines) {
        const cleanLine = line.split("#")[0].trim();
        if (!cleanLine) continue;

        const lower = cleanLine.toLowerCase();

        if (lower.startsWith("user-agent:")) {
          const agent = cleanLine.slice("user-agent:".length).trim().toLowerCase();
          currentUserAgentMatches = agent === "*" || agent.includes("akwababot");
        } else if (currentUserAgentMatches) {
          if (lower.startsWith("disallow:")) {
            const path = cleanLine.slice("disallow:".length).trim();
            if (path) disallowedPaths.push(path);
          } else if (lower.startsWith("allow:")) {
            const path = cleanLine.slice("allow:".length).trim();
            if (path) allowedPaths.push(path);
          }
        }
      }

      // Si une règle Allow explicite correspond
      for (const allow of allowedPaths) {
        if (pathname.startsWith(allow)) {
          return { allowed: true };
        }
      }

      // Si une règle Disallow correspond
      for (const disallow of disallowedPaths) {
        if (disallow === "/" || pathname.startsWith(disallow)) {
          logger.info("RobotsService", "Accès refusé par robots.txt", { targetUrl, disallow });
          return {
            allowed: false,
            reason: `L'accès automatisé à cette page est restreint par les règles robots.txt du site (${disallow}).`,
          };
        }
      }

      return { allowed: true };
    } catch (err) {
      logger.warn("RobotsService", "Erreur lors de la vérification robots.txt", { error: String(err) });
      return { allowed: true };
    }
  }
}

/**
 * Service de validation d'URL et de protection stricte contre les attaques SSRF (Server-Side Request Forgery)
 * Akwaba Chat — Extraction responsable de contenu web
 */

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: "INVALID_URL" | "SSRF_BLOCKED" | "UNSUPPORTED_PROTOCOL" | "UNSAFE_PORT";
  errorMessage?: string;
}

// Plages IP privées / réservées (RFC 1918, Loopback, Link-Local, Cloud Metadata)
const BLOCKED_IP_REGEXES = [
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // Loopback 127.0.0.0/8
  /^0\.0\.0\.0$/,                     // 0.0.0.0
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,  // 10.0.0.0/8 (Réseaux privés)
  /^192\.168\.\d{1,3}\.\d{1,3}$/,     // 192.168.0.0/16 (Réseaux privés)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/, // 172.16.0.0/12
  /^169\.254\.\d{1,3}\.\d{1,3}$/,     // 169.254.0.0/16 (Link-local & AWS/GCP metadata 169.254.169.254)
];

const BLOCKED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "metadata.google.internal",
  "instance-data",
  "docker.for.mac.localhost",
  "host.docker.internal",
];

const ALLOWED_PORTS = new Set(["", "80", "443", "8080", "8443"]);

export class UrlValidator {
  /**
   * Valide et filtre strictement une URL pour prévenir tout SSRF
   */
  static validate(rawUrl: string): UrlValidationResult {
    if (!rawUrl || typeof rawUrl !== "string") {
      return {
        isValid: false,
        error: "INVALID_URL",
        errorMessage: "L'adresse web (URL) est vide ou invalide.",
      };
    }

    const trimmed = rawUrl.trim();

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      // Si l'utilisateur a tapé "example.com" sans protocole, essayer avec https://
      try {
        parsed = new URL(`https://${trimmed}`);
      } catch {
        return {
          isValid: false,
          error: "INVALID_URL",
          errorMessage: "L'URL fournie n'a pas un format valide (ex: https://example.com).",
        };
      }
    }

    // 1. Protocole : http ou https uniquement
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        error: "UNSUPPORTED_PROTOCOL",
        errorMessage: "Seuls les protocoles http:// et https:// sont autorisés.",
      };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Vérification des hostnames locaux / métadonnées
    if (
      BLOCKED_HOSTNAMES.includes(hostname) ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname === "::1"
    ) {
      return {
        isValid: false,
        error: "SSRF_BLOCKED",
        errorMessage: "L'accès aux adresses locales, internes ou sensibles est strictement interdit par sécurité.",
      };
    }

    // 3. Vérification des adresses IP directes (IPv4)
    for (const regex of BLOCKED_IP_REGEXES) {
      if (regex.test(hostname)) {
        return {
          isValid: false,
          error: "SSRF_BLOCKED",
          errorMessage: "L'accès aux adresses IP privées ou métadonnées de serveurs internes est bloqué (SSRF).",
        };
      }
    }

    // 4. Ports autorisés
    if (!ALLOWED_PORTS.has(parsed.port)) {
      return {
        isValid: false,
        error: "UNSAFE_PORT",
        errorMessage: `Le port ${parsed.port} n'est pas autorisé pour des raisons de sécurité.`,
      };
    }

    return {
      isValid: true,
      sanitizedUrl: parsed.toString(),
    };
  }

  /**
   * Détecte et extrait une URL présente dans un texte utilisateur
   */
  static extractUrlFromText(text: string): string | null {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`]+)/i;
    const match = text.match(urlRegex);
    if (match && match[1]) {
      return match[1];
    }
    // Détecte aussi les domaines évidents sans protocole (ex: www.site.com ou site.ci)
    const domainRegex = /\b((?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)\b/i;
    const domainMatch = text.match(domainRegex);
    if (domainMatch && domainMatch[1]) {
      return `https://${domainMatch[1]}`;
    }
    return null;
  }
}

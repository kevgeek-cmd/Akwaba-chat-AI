import { MascotState, MascotErrorCode } from "../types/mascot.types";
import { defaultStateMessages } from "../constants/mascot-assets";

/**
 * Détermine l'état de l'éléphant Akwaba selon la progression numérique (fallback déterministe).
 */
export function getMascotState(progress: number): MascotState {
  if (progress <= 0) return "idle";
  if (progress > 0 && progress <= 20) return "walking";
  if (progress > 20 && progress <= 50) return "running";
  if (progress > 50 && progress < 100) return "searching";
  return "success";
}

/**
 * Retourne le texte contextuel en fonction de l'état, de la progression et d'un code d'erreur éventuel.
 */
export function getMascotMessage(
  state: MascotState,
  progress: number,
  customMessage?: string,
  errorCode?: MascotErrorCode | string
): string {
  if (customMessage) return customMessage;

  if (state === "error") {
    switch (errorCode) {
      case "TIMEOUT":
        return "Le traitement a pris trop de temps. Réessaie dans un instant.";
      case "NETWORK_ERROR":
        return "Problème de réseau détecté 😔 Vérifie ta connexion.";
      case "NO_RESULT":
        return "Je n'ai pas trouvé suffisamment d'informations pour répondre correctement.";
      case "PROVIDER_ERROR":
        return "Les serveurs d'IA sont temporairement surchargés.";
      default:
        return "Je n'ai pas réussi à trouver la réponse 😔";
    }
  }

  if (state === "searching") {
    if (progress >= 85) {
      return "J'analyse les résultats...";
    }
    return "Je cherche la réponse...";
  }

  return defaultStateMessages[state] || defaultStateMessages.idle;
}

/**
 * Valide si une transition d'état est autorisée (anti-régression / anti-clignotement).
 * Par exemple, on ne repasse pas de SEARCHING à WALKING au sein d'une même session.
 */
export function isValidStateTransition(current: MascotState, next: MascotState): boolean {
  if (current === next) return true;
  if (next === "error") return true; // L'erreur prévaut toujours
  if (current === "error") return false; // Une fois en erreur, l'état reste bloqué jusqu'au reset
  if (current === "success" && next !== "idle") return false; // Succès ne régresse pas

  const hierarchy: Record<MascotState, number> = {
    idle: 0,
    walking: 1,
    running: 2,
    searching: 3,
    success: 4,
    error: 5,
  };

  return hierarchy[next] >= hierarchy[current];
}

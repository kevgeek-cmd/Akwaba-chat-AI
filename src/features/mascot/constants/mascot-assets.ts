import { MascotState } from "../types/mascot.types";

/**
 * Configuration centralisée et immuable des assets graphiques Akwaba Mascot.
 * Les noms avec espaces correspondent exactement aux fichiers PNG de public/assets/.
 */
export const mascotAssets = {
  walking: "/assets/mascot-walking.png",
  running: "/assets/mascot-running.png",
  searching: "/assets/mascot-searching.png",
  success: "/assets/mascot-success.png",
  error: "/assets/mascot-error.png",
} as const;

export const defaultStateMessages: Record<MascotState, string> = {
  idle: "Prêt à t'accompagner !",
  walking: "Je commence la recherche...",
  running: "J'accélère !",
  searching: "Je cherche la réponse...",
  success: "Réponse trouvée !",
  error: "Je n'ai pas réussi à trouver la réponse.",
};

export const defaultStateProgress: Record<MascotState, number> = {
  idle: 0,
  walking: 15,
  running: 35,
  searching: 72,
  success: 100,
  error: 0,
};

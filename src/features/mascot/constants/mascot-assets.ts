import { MascotState } from "../types/mascot.types";

/**
 * Configuration centralisée et immuable des assets graphiques Akwaba Mascot.
 * Les noms avec espaces correspondent exactement aux fichiers PNG de public/assets/.
 */
export const mascotAssets = {
  walking: "/assets/akwaba chat bot 1.png",
  running: "/assets/akwaba chat bot 2.png",
  searching: "/assets/akwaba chat bot 3.png",
  success: "/assets/akwaba chat bot 4.png",
  error: "/assets/akwaba chat bot 5.png",
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

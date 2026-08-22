/**
 * Base de données lexicale et culturelle du Nouchi
 * Source et inspirations : Nouchitionnaire.com & Nouchi.ci
 */

export interface NouchiEntry {
  term: string;
  category: "expression" | "nom" | "verbe" | "adjectif" | "interjection";
  definition: string;
  example?: string;
  theme?: string;
}

export const NOUCHI_DICTIONARY: NouchiEntry[] = [
  // Salutations & Relations
  { term: "Akwaba", category: "interjection", definition: "Bienvenue (d'origine Akan/Baoulé/Agni).", theme: "accueil" },
  { term: "C'est comment ?", category: "expression", definition: "Comment vas-tu ? Quoi de neuf ?", theme: "salutation" },
  { term: "Ça dit quoi ?", category: "expression", definition: "Quelles sont les nouvelles ?", theme: "salutation" },
  { term: "On est ensemble", category: "expression", definition: "Formule de solidarité et d'amitié sincère.", theme: "amitie" },
  { term: "Môgô", category: "nom", definition: "Personne, gars, individu, pote (d'origine Mandé/Malinké).", theme: "gens" },
  { term: "La go", category: "nom", definition: "La fille, la petite amie, une femme.", theme: "gens" },
  { term: "Le gars / Le môgô puissant", category: "nom", definition: "Un homme d'influence, un ami fiable.", theme: "gens" },
  { term: "Binguiste", category: "nom", definition: "Personne vivant ou revenant de 'Bengue' (l'Europe / l'Occident).", theme: "societe" },
  { term: "Choco", category: "adjectif", definition: "Bourgeois, raffiné, chic, qui vit dans l'aisance.", theme: "apparence" },
  { term: "Gbonhi / Gbon", category: "nom", definition: "Groupe d'amis, bande, équipe, clan.", theme: "amitie" },
  { term: "Famille", category: "nom", definition: "Terme affectueux pour désigner un ami très proche.", theme: "amitie" },
  
  // Travail, Débrouille & Argent
  { term: "Brobro / Brobroli", category: "verbe", definition: "Travailler, se débrouiller, chercher son gagne-pain quotidien.", theme: "travail" },
  { term: "Grouiller", category: "verbe", definition: "Travailler dur, se battre dans la vie pour s'en sortir.", theme: "travail" },
  { term: "Grouilleur", category: "nom", definition: "Travailleur acharné, battant, débrouillard.", theme: "travail" },
  { term: "Gnan", category: "nom", definition: "L'argent, le fric, les sous, les moyens financiers.", theme: "argent" },
  { term: "Gbôlô", category: "nom", definition: "Argent, pièces de monnaie ou billets.", theme: "argent" },
  { term: "Koro", category: "nom", definition: "Un aîné, un chef, une personne d'autorité financière ou morale.", theme: "respect" },
  { term: "Fafiotte / Jetons", category: "nom", definition: "Billets de banque, argent.", theme: "argent" },

  // Expressions & Sentiments
  { term: "Goumin", category: "nom", definition: "Chagrin d'amour, déception amoureuse intense.", theme: "amour" },
  { term: "Enjailler", category: "verbe", definition: "Faire plaisir, amuser, séduire, rendre joyeux.", theme: "plaisir" },
  { term: "S'enjailler", category: "verbe", definition: "Prendre du bon temps, faire la fête, s'amuser.", theme: "fete" },
  { term: "Enjaillement", category: "nom", definition: "Ambiance festive, fête, joie collective.", theme: "fete" },
  { term: "Drap / Y'a drap", category: "expression", definition: "Il y a un gros problème, une situation critique ou dangereuse.", theme: "danger" },
  { term: "Prendre drap", category: "expression", definition: "Avoir des ennuis, subir un échec cuisant ou une sanction.", theme: "danger" },
  { term: "Y'a pas drap", category: "expression", definition: "Aucun souci, tout va bien, zéro problème.", theme: "accord" },
  { term: "Ya likéfi", category: "expression", definition: "Il n'y a absolument rien, c'est le calme plat.", theme: "etat" },
  { term: "Gbê", category: "nom", definition: "La vérité crue, évidente et sans détour.", theme: "verite" },
  { term: "Poser le gbê", category: "expression", definition: "Dire la vérité franchement et cash.", theme: "verite" },
  { term: "Kpakpato", category: "nom", definition: "Personne curieuse, commère, ou fait de rapporter les nouvelles (le scoop).", theme: "nouvelles" },
  { term: "Taper le kpakpato", category: "expression", definition: "Raconter les potins, donner les dernières actualités.", theme: "nouvelles" },
  { term: "Dohi", category: "nom", definition: "Mensonge, intox, fausse information.", theme: "mensonge" },
  { term: "Gnakoué", category: "nom", definition: "Ignorant, personne naïve ou non avertie.", theme: "caractere" },
  { term: "Djafoule", category: "verbe", definition: "Impressionner, tout donner, faire fort, mettre le paquet.", theme: "excellence" },
  { term: "C'est dosé !", category: "expression", definition: "C'est de très haute qualité, c'est réussi, c'est percutant.", theme: "excellence" },
  { term: "C'est zo !", category: "expression", definition: "C'est stylé, beau, élégant, attirant.", theme: "apparence" },
  { term: "C'est propre !", category: "expression", definition: "C'est parfait, impeccable, sans faute.", theme: "excellence" },
  { term: "C'est gâté !", category: "expression", definition: "C'est extraordinaire, l'ambiance a atteint son paroxysme.", theme: "fete" },
  { term: "Soutra / Soutrali", category: "verbe", definition: "Aider financièrement ou moralement, secourir, dépanner.", theme: "entraide" },
  { term: "Tu verses ma figure par terre", category: "expression", definition: "Tu me fais honte, tu me ridiculises en public.", theme: "honneur" },
  { term: "Tu me moyen pas", category: "expression", definition: "Tu ne peux pas rivaliser avec moi, je suis au-dessus.", theme: "defi" },
  { term: "Voir deux deux", category: "expression", definition: "Être ivre ou avoir une faim aveuglante.", theme: "etat" },
  { term: "Piss", category: "nom", definition: "Maison, domicile, chez-soi.", theme: "lieu" },

  // Gastronomie & Vie courante
  { term: "Daba / Dabali", category: "verbe", definition: "Manger copieusement / La nourriture, le repas.", theme: "nourriture" },
  { term: "Garba", category: "nom", definition: "Plat ivoirien populaire composé d'attiéké et de thon frit avec piments et oignons.", theme: "nourriture" },
  { term: "Garbateur", category: "nom", definition: "Le maître cuisinier qui prépare et vend le Garba.", theme: "nourriture" },
  { term: "Alloco", category: "nom", definition: "Bananes plantains mûres découpées en dés et frites à l'huile.", theme: "nourriture" },
  { term: "Allocodrome", category: "nom", definition: "Espace convivial en plein air regroupant plusieurs vendeuses d'alloco et poissons braisés.", theme: "nourriture" },
  { term: "Placali", category: "nom", definition: "Pâte de manioc fermentée accompagnée de sauce gombo, kopê ou kédjénou.", theme: "nourriture" },
  { term: "Kédjénou", category: "nom", definition: "Ragoût de viande ou volaille mijoté à l'étouffée dans un canari en terre cuite.", theme: "nourriture" },
  { term: "Bandji", category: "nom", definition: "Vin de palme traditionnel blanc extrait du palmier.", theme: "boisson" },
  { term: "Gnamankoudji", category: "nom", definition: "Jus de gingembre frais ivoirien, réputé pour son piquant et son énergie.", theme: "boisson" }
];

export function formatNouchiLexiconForPrompt(): string {
  return NOUCHI_DICTIONARY.map(
    (entry) => `- **${entry.term}** (${entry.category}) : ${entry.definition}`
  ).join("\n");
}

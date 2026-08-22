/**
 * Base de données des artistes et musiques de Côte d'Ivoire
 * Sources et inspirations : African Music Library, AMDB.co, Music In Africa
 */

export interface IvorianArtist {
  name: string;
  genre: "Zouglou" | "Coupé-Décalé" | "Rap Ivoire" | "Reggae" | "Variété / Afro-Pop" | "Traditionnel / Folklore" | "Gospel";
  hitSongs: string[];
  bio: string;
  period: "Pionnier / Légende" | "Ère Classique" | "Ère Moderne / Nouvelle Vague";
}

export const IVORIAN_ARTISTS_DATABASE: IvorianArtist[] = [
  // ZOUGLOU
  {
    name: "Magic System",
    genre: "Zouglou",
    hitSongs: ["Premier Gaou", "Bouger Bouger", "1er Gaou", "Ambiance à l'Africaine", "Chérie Coco", "Magic in the Air"],
    bio: "Groupe légendaire originaire d'Anoumabo (Marcory) formé par A'salfo, Goudé, Tino et Manadja. Ambassadeurs planétaires du Zouglou et fondateurs du festival FEMUA.",
    period: "Ère Classique"
  },
  {
    name: "Yodé & Siro",
    genre: "Zouglou",
    hitSongs: ["Asec-Kotoko", "Signe Zo", "Heritage", "Coco", "Victoire", "Géréce"],
    bio: "Duo emblématique du Zouglou engagé et satirique, porte-paroles du peuple et de la jeunesse ivoirienne.",
    period: "Ère Classique"
  },
  {
    name: "Espoir 2000",
    genre: "Zouglou",
    hitSongs: ["Série C", "Abidjan Farot", "Ivoirien", "Génération consciente"],
    bio: "Groupe phare de Koumassi mené par Pat Sako, célèbre pour ses textes poignants et ses critiques sociales acérées.",
    period: "Ère Classique"
  },
  {
    name: "Petit Denis (Denco)",
    genre: "Zouglou",
    hitSongs: ["Ziglibitien", "Mon Gbonhi", "Papa Polo", "Tournoi"],
    bio: "L'enfant prodige de Gbatanikro, l'une des plus belles voix et plus grands paroliers de l'histoire du Zouglou.",
    period: "Ère Classique"
  },
  {
    name: "VDA (Voix Des Anges)",
    genre: "Zouglou",
    hitSongs: ["Tu Chantes Pas Fort", "Sicobois", "Ils Seront Logés"],
    bio: "Porte-étendard de la nouvelle génération Zouglou originaire de Daloa, mêlant mélodies entraînantes et textes fédérateurs.",
    period: "Ère Moderne / Nouvelle Vague"
  },

  // COUPÉ-DÉCALÉ
  {
    name: "DJ Arafat (Ange Didier Houon / Daïshikan / Yorobo)",
    genre: "Coupé-Décalé",
    hitSongs: ["Hommage à Jonathan", "Kpangor", "Zoropoto", "Kpadoompo", "Dosabado", "Moto Moto"],
    bio: "Le Roi incontesté du Coupé-Décalé, légende éternelle de la musique africaine, créateur du mouvement de la 'Chine Populaire' (ses fans).",
    period: "Ère Classique"
  },
  {
    name: "Douk Saga (Stéphane Doukouré)",
    genre: "Coupé-Décalé",
    hitSongs: ["Sagacité", "Foutou Djafoule", "Couleur de Paris"],
    bio: "Le Président créateur du Coupé-Décalé et leader de la Jet Set ivoirienne à Paris et Abidjan au début des années 2000.",
    period: "Pionnier / Légende"
  },
  {
    name: "Serge Beynaud",
    genre: "Coupé-Décalé",
    hitSongs: ["Kabableke", "Okeninkpin", "Kota Koti", "Zangoule"],
    bio: "Artiste, chanteur et brillant arrangeur surnommé 'Le Mannequin des arrangeurs', maître des chorégraphies et des hits festifs.",
    period: "Ère Classique"
  },
  {
    name: "Debordo Leekunfa",
    genre: "Coupé-Décalé",
    hitSongs: ["American Soldier", "Robot Macador", "N'Enfant Gâté", "Viviane"],
    bio: "Surnommé 'Le Mimi', figure incontournable du mouvement Coupé-Décalé avec une voix puissante et un sens du spectacle unique.",
    period: "Ère Classique"
  },
  {
    name: "DJ Mix Premier",
    genre: "Coupé-Décalé",
    hitSongs: ["Touche à Tout", "Mal à la tête", "Tchoki Tchoki"],
    bio: "DJ et chanteur virtuose à la voix d'or, mixant rythmes dansants et arrangements soignés.",
    period: "Ère Classique"
  },
  {
    name: "Kerozen DJ",
    genre: "Coupé-Décalé",
    hitSongs: ["Mon Heure a Sonné", "Le Temps", "La Victoire", "Abidjan Puissance"],
    bio: "Auteur-compositeur inspirant, symbole de persévérance et de réussite par le travail et la foi.",
    period: "Ère Moderne / Nouvelle Vague"
  },

  // RAP IVOIRE
  {
    name: "Didi B (Mojaveli / Shogun)",
    genre: "Rap Ivoire",
    hitSongs: ["Tala", "En Haut", "Chérie Coco", "S'envolement", "Yeye"],
    bio: "Ancien leader du groupe Kiff No Beat, pionnier de la consécration internationale du Rap Ivoire avec son label et son album 'History'.",
    period: "Ère Moderne / Nouvelle Vague"
  },
  {
    name: "Suspect 95",
    genre: "Rap Ivoire",
    hitSongs: ["Enfant des gens", "C'est dans télé", "Société Suspecte", "Promesse"],
    bio: "Le Président du Syndicat, réputé pour son écriture satirique, son flow percutant et ses punchlines sur la vie de couple abidjanaise.",
    period: "Ère Moderne / Nouvelle Vague"
  },
  {
    name: "Himra",
    genre: "Rap Ivoire",
    hitSongs: ["Jeunes Cadres", "Gérer", "Tchitchi"],
    bio: "Figure de proue de la trap et drill ivoirienne avec une énergie brute et des refrains ultra-efficaces.",
    period: "Ère Moderne / Nouvelle Vague"
  },
  {
    name: "Team Paiya",
    genre: "Rap Ivoire",
    hitSongs: ["Fimbu", "Coup du Marteau (avec Tamsir)", "Allo Paiya"],
    bio: "Collectif d'ambianceurs et rappeurs (Zagba le Requin, Noukou Loba, Doupi Papillon) leaders du mouvement 'Paiya' et de la culture festive abidjanaise.",
    period: "Ère Moderne / Nouvelle Vague"
  },
  {
    name: "Tamsir",
    genre: "Rap Ivoire",
    hitSongs: ["Coup du Marteau", "Ghetto Phénomène"],
    bio: "Beatmaker et producteur de génie, artisan du hit planétaire 'Coup du Marteau' durant la CAN 2023 en Côte d'Ivoire.",
    period: "Ère Moderne / Nouvelle Vague"
  },
  {
    name: "Fior 2 Bior",
    genre: "Rap Ivoire",
    hitSongs: ["Gnonmi avec Lait (feat. Niska)", "Kouloulou"],
    bio: "Rappeur au style énergique et décalé qui a propulsé le street talk abidjanais au sommet des charts francophones.",
    period: "Ère Moderne / Nouvelle Vague"
  },

  // REGGAE IVOIRIEN (CAPITALE DU REGGAE AFRICAIN)
  {
    name: "Alpha Blondy",
    genre: "Reggae",
    hitSongs: ["Brigadier Sabari", "Sweet Fanta Diallo", "Jerusalem", "Cocody Rock", "Multipartisme"],
    bio: "Monument mondial de la musique africaine, né à Dimbokro, qui a fait d'Abidjan la 3e capitale mondiale du reggae après Kingston et Londres.",
    period: "Pionnier / Légende"
  },
  {
    name: "Tiken Jah Fakoly",
    genre: "Reggae",
    hitSongs: ["Le Balayeur", "Plus Rien Ne M'Étonne", "Françafrique", "Ouvrez Les Frontières"],
    bio: "Figure de proue du reggae roots et panafricain originaire d'Odienné, porte-voix des sans-voix et militant pour l'éveil des consciences.",
    period: "Ère Classique"
  },

  // VARIÉTÉ, AFRO-POP & PIONNIERS
  {
    name: "Ernesto Djédjé",
    genre: "Traditionnel / Folklore",
    hitSongs: ["Ziboté", "Aguissè"],
    bio: "Créateur légendaire du rythme 'Ziglibithy' et danseur hors pair originaire de Daloa, père fondateur de la musique moderne ivoirienne.",
    period: "Pionnier / Légende"
  },
  {
    name: "Meiway (Frédéric Ehui Meiway)",
    genre: "Variété / Afro-Pop",
    hitSongs: ["200% Zoblazo", "Miss Lolo", "Appolo 95", "Golgotha"],
    bio: "Le Roi du Zoblazo originaire de Grand-Bassam, créateur de danses festives au mouchoir blanc et star internationale.",
    period: "Pionnier / Légende"
  },
  {
    name: "Josey",
    genre: "Variété / Afro-Pop",
    hitSongs: ["Diplôme", "Espoir", "Nagniouma", "Zambeleman"],
    bio: "L'une des plus grandes divas de la musique africaine contemporaine, combinant voix d'opéra, rumba et afro-pop de haute voltige.",
    period: "Ère Moderne / Nouvelle Vague"
  },
  {
    name: "Roseline Layo",
    genre: "Variété / Afro-Pop",
    hitSongs: ["Donnez-nous un peu", "Môgô Fariman", "Amour Kôyô-Kôyô"],
    bio: "Révélation et superstar de la musique urbaine et populaire ivoirienne originaire de Man, réputée pour sa voix authentique et ses récits de vie.",
    period: "Ère Moderne / Nouvelle Vague"
  },
  {
    name: "Dobet Gnahoré",
    genre: "Variété / Afro-Pop",
    hitSongs: ["Palea", "Miziki", "Woman"],
    bio: "Chanteuse, percussionniste et danseuse virtuose, première artiste ivoirienne lauréate d'un prestigieux Grammy Award.",
    period: "Ère Moderne / Nouvelle Vague"
  }
];

export function formatIvorianArtistsForPrompt(): string {
  const zouglou = IVORIAN_ARTISTS_DATABASE.filter((a) => a.genre === "Zouglou")
    .map((a) => `${a.name} (${a.hitSongs.slice(0, 3).join(", ")})`)
    .join(" ; ");

  const coupeDecale = IVORIAN_ARTISTS_DATABASE.filter((a) => a.genre === "Coupé-Décalé")
    .map((a) => `${a.name} (${a.hitSongs.slice(0, 3).join(", ")})`)
    .join(" ; ");

  const rapIvoire = IVORIAN_ARTISTS_DATABASE.filter((a) => a.genre === "Rap Ivoire")
    .map((a) => `${a.name} (${a.hitSongs.slice(0, 3).join(", ")})`)
    .join(" ; ");

  const reggae = IVORIAN_ARTISTS_DATABASE.filter((a) => a.genre === "Reggae")
    .map((a) => `${a.name} (${a.hitSongs.slice(0, 3).join(", ")})`)
    .join(" ; ");

  const afroPop = IVORIAN_ARTISTS_DATABASE.filter((a) => a.genre === "Variété / Afro-Pop" || a.genre === "Traditionnel / Folklore")
    .map((a) => `${a.name} (${a.hitSongs.slice(0, 3).join(", ")})`)
    .join(" ; ");

  return `
🎵 PANTHÉON MUSICAL & ARTISTES IVOIRIENS (Sources : African Music Library, AMDB, Music In Africa) :
- 🇨🇮 Zouglou : ${zouglou}
- 🇨🇮 Coupé-Décalé : ${coupeDecale}
- 🇨🇮 Rap Ivoire : ${rapIvoire}
- 🇨🇮 Reggae (Abidjan Capitale du Reggae) : ${reggae}
- 🇨🇮 Pionniers, Afro-Pop & Divas : ${afroPop}
- 🎪 Grands Événements : Le FEMUA (à Anoumabo par Magic System), le PRIMUD (par Molare), Abidjan Capitale du Rire, Carnaval de Bouaké, Festival International de Jazz d'Abidjan.`;
}

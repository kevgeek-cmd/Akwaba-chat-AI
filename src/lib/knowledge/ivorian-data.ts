/**
 * Base de données des données publiques et institutionnelles de Côte d'Ivoire
 * Source et inspirations : data.gouv.ci (Portail Officiel Open Data Côte d'Ivoire)
 */

export interface AdministrativeRegion {
  name: string;
  capital: string;
  district: string;
  departments?: string[];
}

export const IVORIAN_ADMINISTRATIVE_DATA = {
  country: "République de Côte d'Ivoire",
  capitalPolitical: "Yamoussoukro",
  capitalEconomic: "Abidjan",
  motto: "Union - Discipline - Travail",
  currency: "Franc CFA (XOF)",
  dialCode: "+225",
  districtsAutonomes: [
    {
      name: "District Autonome d'Abidjan",
      communes: [
        "Abobo", "Adjamé", "Attécoubé", "Cocody", "Koumassi", 
        "Marcory", "Plateau", "Port-Bouët", "Treichville", "Yopougon",
        "Bingerville", "Songon", "Anyama"
      ],
      description: "Poumon économique et financier, centre des affaires et de la vie culturelle ivoirienne."
    },
    {
      name: "District Autonome de Yamoussoukro",
      communes: ["Yamoussoukro", "Attiégouakro"],
      description: "Capitale politique et administrative, abritant la Basilique Notre-Dame de la Paix et la Fondation Félix Houphouët-Boigny."
    }
  ],
  regions: [
    { name: "Gbêkê", capital: "Bouaké", district: "Vallée du Bandama" },
    { name: "Poro", capital: "Korhogo", district: "Savanes" },
    { name: "San-Pédro", capital: "San-Pédro", district: "Bas-Sassandra" },
    { name: "Indénié-Djuablin", capital: "Abengourou", district: "Comoé" },
    { name: "Sud-Comoé", capital: "Aboisso", district: "Comoé" },
    { name: "Tonkpi", capital: "Man", district: "Montagnes" },
    { name: "Haut-Sassandra", capital: "Daloa", district: "Sassandra-Marahoué" },
    { name: "Gôh", capital: "Gagnoa", district: "Gôh-Djiboua" },
    { name: "Lôh-Djiboua", capital: "Divo", district: "Gôh-Djiboua" },
    { name: "Marahoué", capital: "Bouaflé", district: "Sassandra-Marahoué" },
    { name: "Bélier", capital: "Toumodi", district: "Lacs" },
    { name: "N'Zi", capital: "Dimbokro", district: "Lacs" },
    { name: "Iffou", capital: "Daoukro", district: "Lacs" },
    { name: "Moronou", capital: "Bongouanou", district: "Lacs" },
    { name: "Kabadougou", capital: "Odienné", district: "Denguélé" },
    { name: "Folon", capital: "Minignan", district: "Denguélé" },
    { name: "Bafing", capital: "Touba", district: "Woroba" },
    { name: "Béré", capital: "Mankono", district: "Woroba" },
    { name: "Worodougou", capital: "Séguéla", district: "Woroba" },
    { name: "Tchologo", capital: "Ferkessédougou", district: "Savanes" },
    { name: "Bagoué", capital: "Boundiali", district: "Savanes" },
    { name: "Gontougo", capital: "Bondoukou", district: "Zanzan" },
    { name: "Bounkani", capital: "Bouna", district: "Zanzan" },
    { name: "Cavally", capital: "Guiglo", district: "Montagnes" },
    { name: "Guémon", capital: "Duékoué", district: "Montagnes" },
    { name: "Agnéby-Tiassa", capital: "Agboville", district: "Lagunes" },
    { name: "Mé", capital: "Adzopé", district: "Lagunes" },
    { name: "Grands-Ponts", capital: "Dabou", district: "Lagunes" },
    { name: "Hambol", capital: "Katiola", district: "Vallée du Bandama" },
    { name: "Nawa", capital: "Soubré", district: "Bas-Sassandra" },
    { name: "Gbôklè", capital: "Sassandra", district: "Bas-Sassandra" }
  ],
  keyEconomicSectors: [
    "Agriculture (1er producteur mondial de cacao, noix de cajou/anacarde, hévéa, palmier à huile, café)",
    "Énergie & Mines (Pétrole, Gaz naturel, Or, Manganèse, Électricité exportée dans la sous-région)",
    "Industrie et Services (Hub portuaire d'Abidjan et San-Pédro, télécommunications, fintech, digital)",
    "Tourisme & Culture (Grand-Bassam classé UNESCO, Parc National de Taï, Parc National de la Comoé, Mont Nimba)"
  ]
};

export function formatIvorianDataForPrompt(): string {
  const regionsSummary = IVORIAN_ADMINISTRATIVE_DATA.regions
    .slice(0, 15)
    .map((r) => `${r.name} (Chef-lieu: ${r.capital})`)
    .join(", ");

  const abidjanCommunes = IVORIAN_ADMINISTRATIVE_DATA.districtsAutonomes[0].communes.join(", ");

  return `
📊 DONNÉES OFFICIELLES & GÉOGRAPHIE NATIONALE (Source : data.gouv.ci) :
- Pays : ${IVORIAN_ADMINISTRATIVE_DATA.country} (Devise : ${IVORIAN_ADMINISTRATIVE_DATA.motto}, Indicatif : ${IVORIAN_ADMINISTRATIVE_DATA.dialCode})
- Capitales : ${IVORIAN_ADMINISTRATIVE_DATA.capitalPolitical} (Politique) & ${IVORIAN_ADMINISTRATIVE_DATA.capitalEconomic} (Économique)
- Communes du District d'Abidjan : ${abidjanCommunes}
- Principales Régions et Chefs-lieux : ${regionsSummary}, etc. (Total 31 Régions, 14 Districts)
- Piliers économiques : ${IVORIAN_ADMINISTRATIVE_DATA.keyEconomicSectors.join(" ; ")}`;
}

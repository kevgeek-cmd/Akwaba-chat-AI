# Akwaba Chat — Mode Recherche Approfondie (Deep Research)

Le mode **Recherche Approfondie** d'Akwaba Chat permet d'exécuter des recherches multi-sources en temps réel sur le web, d'extraire le contenu des pages les plus pertinentes, de croiser les informations et de produire une synthèse claire et documentée avec des citations cliquables.

---

## 🚀 Fonctionnement du Pipeline

```text
QUESTION UTILISATEUR
        ↓
1. ANALYSE DE LA QUESTION (Optimisation de la requête)
        ↓
2. RECHERCHE MULTI-SOURCES (DuckDuckGo HTML / Tavily API)
        ↓
3. EXTRACTION DU CONTENU (Lecture des pages clés via WebExtractor)
        ↓
4. CROISEMENT & COMPARAISON DES INFORMATIONS
        ↓
5. SYNTHÈSE IA & FORMATION DE CITATIONS
        ↓
RÉPONSE FINALE AVEC SOURCES CLIQUABLES
```

---

## 🐘 Intégration avec la Mascotte Akwaba (Mascot Engine)

Pendant la recherche approfondie, la mascotte reflète en temps réel l'avancement déterministe du traitement :

| Étape | Pourcentage | État de la Mascotte | Message affiché |
| :--- | :--- | :--- | :--- |
| **Analyse** | 10% | `walking` (Marche) | "Analyse de la question..." |
| **Recherche** | 25% | `running` (Course) | "Recherche de sources pertinentes..." |
| **Collecte** | 50% | `running` (Course) | "Collecte des informations sur le web..." |
| **Analyse** | 75% | `searching` (Ordinateur) | "Analyse et comparaison des sources..." |
| **Synthèse** | 88% | `searching` (Ordinateur) | "Synthèse et préparation de la réponse..." |
| **Succès** | 100% | `success` (Joie) | "Réponse trouvée !" |
| **Erreur** | 0% | `error` (Triste) | "Impossible de finaliser la recherche 😔" |

---

## 🛠️ Fournisseurs de Recherche (Search Providers)

Le système repose sur l'interface `SearchProvider` :
- **DuckDuckGo HTML (Par défaut)** : Fonctionne nativement sans aucune clé API requise. Résultats réels et à jour.
- **Tavily Search API (Optionnel)** : S'active automatiquement si la variable d'environnement `TAVILY_API_KEY` est définie.

---

## ⚙️ Variables d'Environnement (Optionnelles)

```env
# Clé optionnelle pour utiliser l'API Tavily en priorité
TAVILY_API_KEY=tvly-xxxxxxxxxxxx
```

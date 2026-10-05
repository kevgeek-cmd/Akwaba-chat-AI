# Akwaba Chat — Mode Scraping & Extraction Web Responsable

Le mode **Scraping** d'Akwaba Chat est une fonctionnalité d'**extraction responsable de contenu web autorisé**. Il permet d'analyser le contenu textuel d'une URL publique pour en extraire des résumés, des réponses ciblées ou des synthèses thématiques.

---

## 🛡️ Règles Éthiques & Sécurité Stricte

1. **Scraping Responsable & Autorisé :**
   - Ne contourne aucun CAPTCHA, paywall ou système d'authentification.
   - Ne permet aucun accès aux comptes privés.
   - Respecte strictement les règles du fichier `robots.txt` des sites cibles.

2. **Protection SSRF (Server-Side Request Forgery) :**
   - Blocage systématique des adresses IP locales et privées (`localhost`, `127.0.0.1`, `0.0.0.0`, `10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`).
   - Blocage strict des métadonnées cloud (`169.254.169.254`).
   - Filtrage des ports non-web (seuls les ports 80, 443, 8080, 8443 sont permis).

3. **Protection contre la saturation mémoire & timeouts :**
   - Timeout de 8 secondes par requête.
   - Limite de taille de réponse à 2 Mo max.
   - Nettoyage du HTML (suppression des scripts, styles, iframes, balises publicitaires).

---

## 🚀 Fonctionnement du Pipeline de Scraping

```text
URL FOURNIE PAR L'UTILISATEUR
        ↓
1. VALIDATION SSRF & DU FORMAT (UrlValidator)
        ↓
2. VÉRIFICATION ROBOTS.TXT (RobotsService)
        ↓
3. EXTRACTION DU TEXTE BRUT (WebExtractor)
        ↓
4. NETTOYAGE & NORMALISATION
        ↓
5. ANALYSE IA STRICTE DU CONTENU
        ↓
RÉPONSE STRUCTURÉE + MENTION DE LA SOURCE
```

---

## 🐘 Intégration de la Mascotte Akwaba

| Étape | Progression | État Mascotte | Message |
| :--- | :--- | :--- | :--- |
| **Vérification** | 15% | `walking` | "Je vérifie la page et les autorisations..." |
| **Récupération** | 40% | `running` | "Je récupère le contenu autorisé..." |
| **Extraction** | 68% | `searching` | "Extraction et nettoyage du texte..." |
| **Analyse IA** | 88% | `searching` | "J’analyse les informations..." |
| **Succès** | 100% | `success` | "Analyse terminée avec succès !" |
| **Échec** | 0% | `error` | Motif du rejet (ex: Robots refusé, SSRF bloqué, URL invalide) |

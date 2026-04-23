# Show Me Scales - Web

**Show Me Scales** est une application web interactive et visuelle conçue pour aider les musiciens à explorer, comprendre et mémoriser les gammes et les accords sur différents instruments. Construite entièrement en Vanilla JavaScript, HTML5 et CSS3, elle ne nécessite aucune dépendance externe.

## Fonctionnalités Principales

- **Support Multi-Instruments :**
  - **Instruments à cordes :** Guitare, Basse, Ukulélé avec des manches (fretboards) dynamiques.
  - **Clavier :** Un piano interactif sur 4 octaves.
  - **Partition :** Visualisation classique sur une portée en clé de sol.
- **Accordages Personnalisables :** Choisissez parmi des préconfigurations (Standard, Drop D, Open G, DADGAD, etc.) ou créez votre propre accordage en cliquant sur les mécaniques virtuels de l'instrument.
- **3 Modes d'Utilisation :**
  - **Mode Exploration :** Parcourez le dictionnaire pour visualiser instantanément une gamme ou un accord.
  - **Recherche par Notes :** Cliquez sur les notes de votre instrument pour trouver à quelle(s) gamme(s) ou accord(s) elles appartiennent (recherche inversée).
  - **Recherche par Intervalles :** Construisez une formule (ex: 1, b3, 5) pour trouver la gamme correspondante.
- **Harmonisation et Dictionnaire :** Visualisez tous les accords générés par une gamme spécifique (degrés I, II, III...).
- **Outils Avancés d'Interface :**
  - **Vue Scindée (Split Mode) :** Affichez deux instruments côte à côte (pratique pour comparer un piano et une guitare).
  - **Mode Zen & Plein Écran :** Masquez l'interface utilisateur pour vous concentrer uniquement sur l'instrument.
  - **Navigation sur le Canvas :** Glissez pour vous déplacer (Pan) et utilisez la molette ou les boutons pour zoomer/dézoomer.
- **Persistance des Données :** Vos préférences (tonalité, mode, instruments) sont sauvegardées localement (`localStorage`).

## Installation et Démarrage

L'application est statique. Cependant, comme elle utilise l'API `fetch()` pour charger le dictionnaire de gammes depuis un fichier externe (`scales.json`), il est fortement recommandé de la lancer via un serveur web local pour éviter les restrictions CORS du navigateur.

**Option 1 : Avec Visual Studio Code (Recommandée)**

1. Ouvrez le dossier contenant votre fichier HTML dans Visual Studio Code.
2. Installez l'extension **Live Server**.
3. Faites un clic droit sur votre fichier `index.html` et choisissez **"Open with Live Server"**.

**Option 2 : Avec Python**

1. Ouvrez un terminal dans le dossier du projet.
2. Lancez la commande : `python -m http.server 8000` (ou `python3`).
3. Ouvrez votre navigateur à l'adresse `http://localhost:8000`.

_Note : Si le fichier `scales.json` est manquant, l'application est conçue pour basculer automatiquement sur une base de données de gammes par défaut intégrée dans le code._

## Recommandations d'Utilisation

> **Affichage :** L'application a été pensée pour offrir un maximum d'informations visuelles. Sur les appareils mobiles et les tablettes, elle requiert d'être utilisée en **mode paysage** (un écran d'avertissement s'affiche en mode portrait).

- **Changer de tonalité :** Cliquez sur le bouton de tonalité (ex: "C") en haut à droite.
- **Changer l'affichage Notes/Intervalles :** Utilisez le bouton d'affichage en haut à gauche pour basculer entre le nom de la note (C, D, E...) ou sa fonction dans la gamme (1, 3, 5...).
- **Accorder une corde :** Sélectionnez l'accordage "Custom" dans le menu de l'instrument, puis cliquez sur la lettre de la note au niveau du "sillet" (à gauche du manche) pour la modifier.

## Personnalisation (scales.json)

Vous pouvez étendre le dictionnaire de gammes de l'application en créant ou en modifiant un fichier `scales.json` dans le même répertoire que votre fichier `index.html`.

**Format attendu :**

```json
[
  { "name": "Ionian (major)", "intervals": "1, 3, 5, 7, 9, 11, 13", "common": true },
  { "name": "Dorian", "intervals": "1, b3, 5, b7, 9, 11, 13", "common": true },
  { "name": "Whole tone", "intervals": "1, 3, #5, b7, 9, #11", "common": false }
]
```

_L'attribut `common` permet de filtrer l'affichage pour masquer les gammes moins courantes de la vue principale._

## Architecture Technique

- **Rendu :** API Canvas HTML5 (`CanvasRenderingContext2D`). Le script gère dynamiquement le redimensionnement et le support des écrans haute résolution (Device Pixel Ratio).
- **Interactions :** Écouteurs d'événements Pointer (souris/tactile) unifiés pour le glisser-déposer et les clics sur le Canvas.
- **Gestion de l'énergie :** Utilisation de l'API `WakeLock` expérimentale pour empêcher la mise en veille de l'écran pendant l'utilisation de l'application.

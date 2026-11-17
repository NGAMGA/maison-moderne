# maison moderne — optimisation des performances

Boutique en ligne de démonstration (catalogue, fiche produit, panier, commandes) servant de support à un audit de **performance web**. Ce dépôt documente les mesures réalisées, les corrections appliquées et la méthode suivie.

> **Règle de l'audit : aucune affirmation sans remesure.** On ne dit pas « c'est mieux », on dit « c'est passé de X à Y ».

## Sommaire

1. [Stack technique](#stack-technique)
2. [Lancer le projet](#lancer-le-projet)
3. [Structure du projet](#structure-du-projet)
4. [Méthode de mesure](#méthode-de-mesure)
5. [Mesures de départ](#mesures-de-départ)
6. [Les 4 axes de performance](#les-4-axes-de-performance)
7. [Résultats avant / après](#résultats-avant--après)
8. [Historique des commits](#historique-des-commits)
9. [Ce qui n'a pas été traité](#ce-qui-na-pas-été-traité)

## Stack technique

| Outil | Rôle |
|---|---|
| React + TypeScript | Interface |
| Vite | Outil de build et serveur de développement |
| React Router | Navigation entre les pages |
| Lighthouse | Scores de performance et diagnostic |
| DevTools (onglet Network) | Poids transféré, nombre de requêtes, polices |
| React DevTools (Profiler) | Détection des rendus inutiles |

Les images produits sont hébergées sur Unsplash et les polices (DM Sans, Fraunces) sur Google Fonts.

## Lancer le projet

```bash
npm install
npm run dev          # développement
```

**Pour mesurer, utiliser toujours le build**, jamais le mode développement, qui n'est pas optimisé et fausse les chiffres :

```bash
npm run build
npm run preview      # sert le dossier dist/ sur http://localhost:4173
```

Vérification des types :

```bash
npx tsc --noEmit
```

## Structure du projet

```
src/
├── App.tsx                      routes, découpage du code par page
├── main.tsx                     point d'entrée
├── components/                  en-tête, pied de page, panier
├── features/
│   ├── products/                liste et carte produit
│   └── orders/                  liste des commandes
├── hooks/                       useCart, useFetch
├── pages/                       accueil, produits, détail, commandes, 404
└── types/                       types TypeScript
public/data/                     products.json, orders.json
audit/                           rapports Lighthouse (HTML)
```

## Méthode de mesure

Chaque axe suit le même cycle : **mesurer, corriger, remesurer**. Le chiffre décide.

1. Construire et servir le projet : `npm run build` puis `npm run preview`.
2. Lancer Lighthouse sur deux pages, l'accueil (`/`) et la boutique (`/products`) :
   ```bash
   npx lighthouse http://localhost:4173 --view
   npx lighthouse http://localhost:4173/products --view
   ```
   Relever : score Performance, FCP, LCP, TBT, CLS, Speed Index.
3. Dans les DevTools, onglet **Network**, avec *Disable cache* coché, recharger la page et relever le poids transféré, le nombre de requêtes et le nombre de fichiers de police.
4. Appliquer **un seul axe**, reconstruire, puis refaire les mesures.
5. Faire un commit par axe, préfixé `perf:`.

Les rapports Lighthouse correspondants sont conservés dans le dossier `audit/`.

### Les métriques Lighthouse

| Métrique | Ce qu'elle mesure |
|---|---|
| FCP (First Contentful Paint) | Le premier élément s'affiche |
| LCP (Largest Contentful Paint) | Le plus grand élément s'affiche, la page est « prête » |
| TBT (Total Blocking Time) | Le JavaScript bloque la page pendant le chargement |
| CLS (Cumulative Layout Shift) | Les sauts de mise en page pendant le chargement |
| Speed Index | La vitesse de remplissage visuel global |

## Mesures de départ

Relevé sur l'accueil (`/`), build de production, cache désactivé, avant toute correction :

| Mesure | Valeur |
|---|---|
| Requêtes | 11 |
| Poids transféré | 370 kB |
| Poids des ressources | 576 kB |
| Requêtes de polices | 2 fichiers, 104 kB |
| Images | environ 173 kB (déjà au format AVIF, de 6,8 à 87,6 kB) |
| JavaScript | 1 seul fichier, 85,3 kB |
| DOMContentLoaded | 810 ms |
| Load | 815 ms |

Constats principaux :

- Les polices représentaient environ **28 %** du poids de la page (104 kB sur 370 kB).
- La requête vers `fonts.googleapis.com`, déclenchée par un `@import` dans le CSS, était de loin la plus lente (environ 650 ms pour 658 octets). Les fichiers de police ne démarraient qu'après elle.
- Aucun découpage du code : toutes les pages partaient dans un seul fichier JavaScript.
- Toutes les images étaient demandées en 900 px de large, sans dimensions déclarées ni chargement différé.
- Le panier était géré tout en haut de l'application : chaque ajout re-rendait toute la branche, y compris la liste des produits.

## Les 4 axes de performance

### Axe 1 — Images

**Problème.** Les images sont demandées en 900 px quel que soit l'écran, sans `width` ni `height`, et toutes se chargent immédiatement.

**Corrections** (`ProductCard.tsx`, `ProductList.tsx`, `index.html`) :

- `srcset` et `sizes` : le navigateur choisit parmi trois largeurs (400, 600, 900 px). Les images venant d'Unsplash, la largeur se règle directement dans l'URL (paramètre `w`).
- `width` et `height` sur chaque `<img>` : l'emplacement est réservé, ce qui limite le CLS.
- `loading="lazy"` sur les images hors écran, `loading="eager"` sur les deux premières cartes.
- `fetchPriority="high"` sur la première image, qui est un bon candidat pour le LCP.
- `decoding="async"` sur toutes les images.
- `<link rel="preconnect" href="https://images.unsplash.com">` pour ouvrir la connexion en avance.
- `ProductList` transmet l'index de chaque carte pour distinguer les images visibles des autres.

**À remesurer :** LCP, CLS, poids de la catégorie *Img* dans Network.

### Axe 2 — Polices

**Problème.** Un `@import` en tête du CSS crée une chaîne bloquante : le navigateur télécharge le CSS, découvre l'`@import`, télécharge le CSS de Google, puis seulement les polices. Six graisses étaient demandées alors que quatre sont utilisées.

**Corrections** (`index.html`, `index.css`) :

- Suppression de l'`@import` dans `index.css`.
- Ajout de `<link rel="preconnect">` vers `fonts.googleapis.com` et `fonts.gstatic.com`.
- Chargement des polices par un `<link rel="stylesheet">` dans `index.html`, découvert dès l'analyse du HTML.
- Réduction aux graisses réellement utilisées : DM Sans 400, 500 et 700, Fraunces 500.
- `font-display: swap` conservé : le texte s'affiche tout de suite, la police arrive ensuite.

**À remesurer :** nombre de requêtes de polices, FCP, LCP.

### Axe 3 — Code-splitting

**Problème.** Un seul fichier JavaScript contenait le code de toutes les pages.

**Correction** (`App.tsx`) :

```tsx
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
```

- Les trois pages secondaires deviennent des fichiers séparés, chargés à la demande.
- Un seul `<Suspense>` autour de `<Routes>` affiche « Chargement… » pendant le chargement d'une page.
- L'accueil et la page 404 restent dans le fichier principal : l'accueil est la page d'arrivée, la 404 est minuscule.
- Seules les pages sont différées, pas les composants réutilisés partout.

**Vérification :** après `npm run build`, `dist/assets` doit contenir plusieurs fichiers JavaScript.
**À remesurer :** FCP et LCP sur l'accueil, taille du fichier JavaScript initial.

### Axe 4 — Re-renders

**Problème.** L'état du panier est déclaré tout en haut (`App`). Chaque ajout au panier re-rend toute la branche, dont la liste des produits. Même avec `memo()`, cela ne servirait à rien tant que les fonctions passées en props changent à chaque rendu.

**Corrections** (`useCart.ts`, `ProductList.tsx`), de la moins à la plus invasive :

- `useCallback` sur `dispatch`, `addToCart`, `removeFromCart` et `clearCart`, avec des dépendances stables. C'est possible parce que la mise à jour utilise la forme fonctionnelle `setCart((current) => ...)`.
- `memo()` sur `ProductList`, dont les props sont désormais stables.

**Détection :** React DevTools, onglet Profiler, option *Highlight updates*, puis clic sur « Ajouter au panier ».
**À remesurer :** TBT et fluidité à l'interaction.

## Résultats avant / après

Les cases vides sont à remplir avec les relevés de chaque remesure. Pour chaque ligne, noter la valeur médiane de plusieurs lancements Lighthouse.

### Accueil (`/`)

| Mesure | Avant | Après |
|---|---|---|
| Score Performance | à compléter | à compléter |
| FCP | à compléter | à compléter |
| LCP | à compléter | à compléter |
| TBT | à compléter | à compléter |
| CLS | à compléter | à compléter |
| Speed Index | à compléter | à compléter |
| Requêtes | 11 | à compléter |
| Poids transféré | 370 kB | à compléter |
| Requêtes de polices | 2 (104 kB) | à compléter |
| JavaScript initial | 85,3 kB | à compléter |

### Boutique (`/products`)

| Mesure | Avant | Après |
|---|---|---|
| Score Performance | à compléter | à compléter |
| FCP | à compléter | à compléter |
| LCP | à compléter | à compléter |
| TBT | à compléter | à compléter |
| CLS | à compléter | à compléter |
| Speed Index | à compléter | à compléter |
| Requêtes | à compléter | à compléter |
| Poids transféré | à compléter | à compléter |

### Gain par correction

| Correction | Mesure concernée | Avant → Après |
|---|---|---|
| Polices : préconnexion, suppression de l'`@import`, graisses réduites | Requêtes de polices, FCP, LCP | à compléter |
| Découpage du code par page | JavaScript initial, FCP | à compléter |
| Callbacks stables et `memo()` sur la liste | TBT, rendus au clic | à compléter |
| Images : `srcset`, dimensions, chargement différé | Poids des images, LCP, CLS | à compléter |

## Historique des commits

Un commit par axe, avec le préfixe `perf:` :

| Axe | Commit |
|---|---|
| Polices | `perf: préconnexion aux polices et seules graisses utilisées conservées` |
| Code-splitting | `perf: découpage du code par page avec React.lazy` |
| Re-renders | `perf: stabilisation des fonctions du panier et mémoïsation de la liste` |
| Images | `perf: chargement différé des images produits` |

Les commits `chore:` ajoutent le reste de l'application de base. Les rapports Lighthouse sont dans le dossier `audit/`.

## Ce qui n'a pas été traité

Ce travail porte uniquement sur la partie **performance** du mémo. Les deux autres axes ne sont pas réalisés :

- **Accessibilité** : audit axe DevTools, navigation au clavier, labels, focus visible, titres de page. Quelques bonnes pratiques étaient déjà présentes (focus visible, `aria-label` sur les boutons du panier).
- **Éco-conception** : suppression du superflu, EcoIndex, ménage dans le CSS hérité du modèle de départ (`.counter`, `.hero`, `#next-steps`, etc.) et dans les variables inutilisées.

## Limites connues

- Lighthouse varie d'un lancement à l'autre : les petits écarts (moins de 5 points de score ou 0,2 s) ne sont pas significatifs.
- Les images dépendent d'un service externe (Unsplash) : leur temps de chargement varie avec le réseau.
- La page de détail produit (`ProductDetailPage`) affiche encore une image sans les optimisations de `ProductCard`.


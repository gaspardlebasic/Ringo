# 🔔 Ringo — le bingo du mariage

Un bingo en ligne pour animer un mariage (catho ou pas 😉). Chaque invité·e obtient une
grille 5×5 unique tirée d'un répertoire commun d'« items » (des choses susceptibles
d'arriver pendant la soirée). On coche les cases au fur et à mesure, et l'organisateur·rice
clôt la partie pour calculer les scores.

- 📱 **Mobile-first**, on coche les cases au **double-tap**.
- ➕ N'importe qui peut **ajouter des items** au répertoire commun.
- 🎯 Chacun·e a une **grille unique**, liée à son prénom (stocké dans le navigateur).
- ⚙️ Une **page admin** (mot de passe) pour lancer/clore le jeu, voir le classement et
  supprimer des items.
- 💾 L'état persiste (stocké en base) même après un refresh.

Stack : **React + Vite** (site statique) + **Supabase** (base Postgres gratuite) +
**GitHub Pages** pour l'hébergement. Tout est gratuit.

> ### 🌐 En ligne : **https://gaspardlebasic.github.io/Ringo/**
> Le site est déployé et connecté à Supabase. À chaque `git push` sur `main`, GitHub
> Actions reconstruit et redéploie automatiquement (aucun secret à configurer : la config
> publique est dans [`src/config.ts`](src/config.ts)).
>
> - **Mot de passe admin** actuel : `admin` (à changer dans `src/config.ts` si besoin).
> - Le jeu est **fermé** par défaut : va sur **Admin → Lancer le jeu** le jour J.

---

## 1. Créer la base de données (Supabase) — ~5 min

1. Va sur [supabase.com](https://supabase.com) → **Sign in** (avec GitHub, c'est gratuit).
2. **New project**. Choisis un nom (ex. `ringo`), un mot de passe de base de données
   (garde-le, tu n'en auras pas besoin ensuite), une région proche. Attends ~1 min que le
   projet se crée.
3. Dans le menu de gauche → **SQL Editor** → **New query**. Copie-colle tout le contenu du
   fichier [`supabase-schema.sql`](./supabase-schema.sql) puis clique **Run**.
4. (Facultatif mais recommandé) Nouvelle requête → colle
   [`seed-items.sql`](./seed-items.sql) → **Run** : ça pré-remplit ~35 items pour pouvoir
   jouer tout de suite.
5. Menu de gauche → **Project Settings** (roue crantée) → **API**. Note deux valeurs :
   - **Project URL** → c'est ton `VITE_SUPABASE_URL`
   - **Project API keys → `anon` `public`** → c'est ton `VITE_SUPABASE_ANON_KEY`

> La clé `anon` est **faite pour être publique** (elle finit dans le site). L'accès est
> volontairement permissif : parfait pour un bingo entre invités, ce n'est pas une appli
> bancaire 🙂.

---

## 2. Tester en local (facultatif)

La config Supabase est déjà intégrée dans [`src/config.ts`](src/config.ts), donc pas
besoin de `.env` :

```bash
npm install
npm run dev
```

Ouvre l'URL affichée (http://localhost:5173). Tu peux surcharger la config avec un fichier
`.env` (variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PASSWORD`) si
un jour tu veux pointer vers une autre base.

---

## 3. Déploiement (déjà en place)

Le dépôt est déjà connecté à GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
Il n'y a **rien à reconfigurer** : à chaque `git push` sur `main`, le site est reconstruit
et redéployé automatiquement sur **https://gaspardlebasic.github.io/Ringo/**.

Pour changer quelque chose (items de départ, couleurs, mot de passe admin…), édite le code,
puis :

```bash
git add -A && git commit -m "mon changement" && git push
```

Suis le déploiement dans l'onglet **Actions** du dépôt. Partage le lien aux invités le
jour J ! 🎉

> Le dépôt est **public** (nécessaire pour GitHub Pages gratuit). La clé Supabase `anon`
> est faite pour être publique et l'accès aux données est volontairement permissif (bingo
> entre invités). Le mot de passe admin (`src/config.ts`) est un simple garde-fou visible
> dans le code — ce n'est pas un secret fort.

---

## Comment on joue

1. Chaque invité·e ouvre le lien → saisit son **prénom** (mémorisé sur son téléphone).
2. Avant/pendant le mariage, tout le monde peut **ajouter des items** (onglet Ajouter).
3. L'organisateur·rice va sur **Admin** (mot de passe), et clique **Lancer le jeu**.
4. Onglet **Jouer** : une grille unique apparaît. **Double-tap** sur une case pour la
   cocher quand l'événement se produit. Une ligne/colonne/diagonale complète = un « bingo ».
5. En fin de soirée, l'admin clique **Clore le jeu & calculer les scores** → le
   **classement** s'affiche dans la page Admin.

### Le score
- **Lignes** = nombre de rangées, colonnes ou diagonales entièrement cochées (les
  « bingos »). C'est le critère principal du classement.
- **Cases** = nombre total de cases cochées (départage les ex æquo).
- Grille pleine = 🏆.

---

## Notes techniques

- Les grilles sont un **instantané texte** : si l'admin supprime un item après coup, les
  grilles déjà distribuées ne cassent pas.
- Le nom est stocké en `localStorage`. « Changer de nom » depuis l'accueil permet d'en
  changer (la grille reste liée à l'ancien nom en base).
- Routing en `HashRouter` → pas de 404 au refresh sur GitHub Pages.

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

```bash
npm install
cp .env.example .env      # puis colle tes 2 valeurs Supabase dedans
npm run dev
```

Ouvre l'URL affichée (http://localhost:5173). Le fichier `.env` ressemble à :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_ADMIN_PASSWORD=le-mot-de-passe-admin-de-ton-choix
```

---

## 3. Déployer sur GitHub Pages — ~5 min

1. Crée un dépôt GitHub (ex. `Ringo`) et pousse ce dossier dedans :

   ```bash
   git init
   git add .
   git commit -m "Ringo"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/Ringo.git
   git push -u origin main
   ```

2. Sur GitHub → onglet **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret**. Crée ces **3 secrets** :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSWORD`

3. Sur GitHub → **Settings** → **Pages** → **Build and deployment** → **Source** :
   choisis **GitHub Actions**.

4. Le déploiement se lance automatiquement à chaque `push` sur `main` (onglet **Actions**
   pour suivre). Une fois fini, ton bingo est en ligne à :
   `https://TON-PSEUDO.github.io/Ringo/`

Partage ce lien aux invités le jour J ! 🎉

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

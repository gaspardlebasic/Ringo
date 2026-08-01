-- ============================================================
--  Ringo — schéma de base de données (à exécuter dans Supabase)
--  Supabase > SQL Editor > coller ce script > Run
-- ============================================================

-- Répertoire commun des items de bingo
create table if not exists items (
  id         bigint generated always as identity primary key,
  text       text not null,
  added_by   text not null default 'Anonyme',
  created_at timestamptz not null default now()
);

-- Un joueur = un nom + sa grille (snapshot texte) + l'état des cases cochées
create table if not exists players (
  id         bigint generated always as identity primary key,
  name       text not null,
  name_key   text not null unique,      -- name normalisé (minuscule/trim) = clé unique
  cells      jsonb not null,            -- tableau de 25 chaînes (le texte de chaque case)
  checked    jsonb not null,            -- tableau de 25 booléens
  created_at timestamptz not null default now()
);

-- État global du jeu : une seule ligne (id = 1)
create table if not exists game_state (
  id         int primary key default 1,
  is_open    boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint game_state_singleton check (id = 1)
);

insert into game_state (id, is_open) values (1, false)
  on conflict (id) do nothing;

-- ============================================================
--  Row Level Security
--  Jeu de mariage : on autorise tout via la clé "anon" (publique).
--  Ce n'est PAS sécurisé au sens strict, mais parfait pour un bingo
--  entre invités. La page admin est protégée par un simple mot de passe
--  côté navigateur.
-- ============================================================
alter table items      enable row level security;
alter table players    enable row level security;
alter table game_state enable row level security;

drop policy if exists "anon all items"   on items;
drop policy if exists "anon all players" on players;
drop policy if exists "anon all game"    on game_state;

create policy "anon all items"   on items      for all using (true) with check (true);
create policy "anon all players" on players    for all using (true) with check (true);
create policy "anon all game"    on game_state for all using (true) with check (true);

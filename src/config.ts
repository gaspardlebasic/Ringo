// Configuration de Ringo.
//
// La clé Supabase ci-dessous est la clé PUBLIQUE (`anon` / `publishable`) :
// elle est conçue pour être exposée dans le navigateur, donc pas de souci
// à la versionner. L'accès aux données est volontairement permissif (bingo
// entre invités, pas une appli bancaire).
//
// On peut surcharger ces valeurs via des variables d'environnement Vite
// (VITE_SUPABASE_URL, etc.) si besoin, mais ce n'est pas nécessaire.

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://wgvxrbycpewnioqhpjxt.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_OkMnibMORhPOb6F1oNvO1w_s1XV0z6P'

// Mot de passe de la page Admin. Non secret (il finit dans le bundle),
// c'est juste un garde-fou pour éviter les clics accidentels.
export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || 'admin'

// Mot de passe d'accès à TOUTE l'application (demandé à la première visite).
// Garde-fou léger pour éviter les curieux et les bots. Comme il est présent
// dans le code du site, ce n'est pas une sécurité forte, mais ça suffit pour
// un bingo entre invités.
export const APP_PASSWORD =
  import.meta.env.VITE_APP_PASSWORD || 'cfz'

// Gestion du nom du joueur, stocké dans le navigateur (localStorage)

const KEY = 'ringo.name'

export function getName(): string | null {
  return localStorage.getItem(KEY)
}

export function setName(name: string): void {
  localStorage.setItem(KEY, name.trim())
}

export function clearName(): void {
  localStorage.removeItem(KEY)
}

// Clé normalisée : sert d'identifiant unique en base (insensible casse/espaces)
export function nameKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

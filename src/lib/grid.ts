// Génération de grille et calcul de score

export const GRID_SIZE = 5
export const CELL_COUNT = GRID_SIZE * GRID_SIZE // 25

// Mélange (Fisher-Yates) et tire `n` textes distincts
export function pickCells(texts: string[], n = CELL_COUNT): string[] {
  const pool = [...texts]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}

// Les 12 lignes possibles (5 rangées + 5 colonnes + 2 diagonales)
export function allLines(): number[][] {
  const lines: number[][] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    lines.push(Array.from({ length: GRID_SIZE }, (_, c) => r * GRID_SIZE + c))
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    lines.push(Array.from({ length: GRID_SIZE }, (_, r) => r * GRID_SIZE + c))
  }
  lines.push(Array.from({ length: GRID_SIZE }, (_, i) => i * GRID_SIZE + i))
  lines.push(Array.from({ length: GRID_SIZE }, (_, i) => i * GRID_SIZE + (GRID_SIZE - 1 - i)))
  return lines
}

// Indices des cases faisant partie d'une ligne complète (pour surbrillance)
export function winningCells(checked: boolean[]): Set<number> {
  const set = new Set<number>()
  for (const line of allLines()) {
    if (line.every((i) => checked[i])) {
      line.forEach((i) => set.add(i))
    }
  }
  return set
}

export interface Score {
  checkedCount: number // nombre de cases cochées
  lines: number // nombre de lignes/colonnes/diagonales complètes ("bingos")
  full: boolean // grille pleine ?
}

export function computeScore(checked: boolean[]): Score {
  const checkedCount = checked.filter(Boolean).length
  const lines = allLines().filter((line) => line.every((i) => checked[i])).length
  return { checkedCount, lines, full: checkedCount === CELL_COUNT }
}

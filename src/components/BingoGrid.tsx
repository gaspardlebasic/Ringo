import { useRef } from 'react'
import { winningCells } from '../lib/grid'

interface Props {
  cells: string[]
  checked: boolean[]
  disabled?: boolean
  onToggle: (index: number) => void
}

// Grille 5x5. On coche une case par DOUBLE TAP (évite les cochages
// accidentels pendant le scroll). Sur ordinateur : double-clic.
export default function BingoGrid({ cells, checked, disabled, onToggle }: Props) {
  const winners = winningCells(checked)
  const lastTap = useRef<{ index: number; time: number }>({ index: -1, time: 0 })

  // Fenêtre (ms) pour reconnaître un double-tap sur la même case.
  const DOUBLE_TAP_MS = 500

  function handleTap(index: number) {
    if (disabled) return
    const now = Date.now()
    if (lastTap.current.index === index && now - lastTap.current.time < DOUBLE_TAP_MS) {
      onToggle(index)
      lastTap.current = { index: -1, time: 0 }
    } else {
      lastTap.current = { index, time: now }
    }
  }

  return (
    <div className="grid" role="grid" aria-label="Grille de bingo">
      {cells.map((text, i) => (
        <button
          key={i}
          type="button"
          className={
            'cell' +
            (checked[i] ? ' cell-checked' : '') +
            (winners.has(i) ? ' cell-winning' : '')
          }
          onClick={() => handleTap(i)}
          disabled={disabled}
          aria-pressed={checked[i]}
        >
          <span className="cell-text">{text}</span>
          {checked[i] && <span className="cell-mark" aria-hidden="true">✓</span>}
        </button>
      ))}
    </div>
  )
}

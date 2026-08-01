import { useLayoutEffect, useRef } from 'react'
import { winningCells } from '../lib/grid'

interface Props {
  cells: string[]
  checked: boolean[]
  disabled?: boolean
  onToggle: (index: number) => void
}

const FONT_MAX = 14 // px — taille confortable pour les items courts
const FONT_MIN = 6 // px — plancher pour les items très longs

// Ajuste la taille de police pour que le texte remplisse la case sans déborder.
// On part de FONT_MAX et on réduit tant que le contenu dépasse (en hauteur ou
// en largeur). Se recalcule quand la case est redimensionnée (rotation, écran).
function AutoFitText({ text }: { text: string }) {
  const boxRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const box = boxRef.current
    const inner = box?.firstElementChild as HTMLElement | undefined
    if (!box || !inner) return

    const fit = () => {
      let size = FONT_MAX
      inner.style.overflowWrap = 'normal' // on essaie d'abord de garder les mots entiers
      box.style.fontSize = size + 'px'
      while (
        size > FONT_MIN &&
        (inner.scrollHeight > box.clientHeight || inner.scrollWidth > box.clientWidth)
      ) {
        size -= 0.5
        box.style.fontSize = size + 'px'
      }
      // Dernier recours : un mot reste plus large que la case même au mini →
      // on autorise la coupure du mot pour éviter que le texte soit rogné.
      if (inner.scrollWidth > box.clientWidth) {
        inner.style.overflowWrap = 'anywhere'
      }
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [text])

  return (
    <span className="cell-fit" ref={boxRef}>
      <span className="cell-fit-inner">{text}</span>
    </span>
  )
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
          <AutoFitText text={text} />
          {checked[i] && <span className="cell-mark" aria-hidden="true">✓</span>}
        </button>
      ))}
    </div>
  )
}

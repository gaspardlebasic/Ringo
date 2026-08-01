import { useEffect, useState } from 'react'
import { supabase, type Player } from '../supabase'
import { getName, nameKey } from '../lib/name'
import { pickCells, computeScore, CELL_COUNT } from '../lib/grid'
import BingoGrid from '../components/BingoGrid'

type Status = 'loading' | 'need-items' | 'ready' | 'error'

export default function Play() {
  const [status, setStatus] = useState<Status>('loading')
  const [player, setPlayer] = useState<Player | null>(null)
  const [gameOpen, setGameOpen] = useState(false)
  const [itemCount, setItemCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    setStatus('loading')
    const name = getName()
    if (!name) return
    const key = nameKey(name)

    try {
      // État du jeu
      const { data: game } = await supabase.from('game_state').select('is_open').eq('id', 1).single()
      setGameOpen(game?.is_open ?? false)

      // Le joueur a-t-il déjà une grille ?
      const { data: existing } = await supabase
        .from('players')
        .select('*')
        .eq('name_key', key)
        .maybeSingle()

      if (existing) {
        setPlayer(existing as Player)
        setStatus('ready')
        return
      }

      // Sinon on en génère une à partir du répertoire
      const { data: items, count } = await supabase
        .from('items')
        .select('text', { count: 'exact' })
      const texts = (items ?? []).map((r) => r.text)
      setItemCount(count ?? texts.length)

      if (texts.length < CELL_COUNT) {
        setStatus('need-items')
        return
      }

      const cells = pickCells(texts)
      const checked = new Array(CELL_COUNT).fill(false)

      const { data: inserted, error: insErr } = await supabase
        .from('players')
        .insert({ name, name_key: key, cells, checked })
        .select()
        .single()

      if (insErr) {
        // Conflit (grille créée entre-temps sur un autre appareil) → on relit
        const { data: again } = await supabase
          .from('players')
          .select('*')
          .eq('name_key', key)
          .maybeSingle()
        if (again) {
          setPlayer(again as Player)
          setStatus('ready')
          return
        }
        throw insErr
      }

      setPlayer(inserted as Player)
      setStatus('ready')
    } catch (e: any) {
      setError(e?.message ?? 'Erreur inconnue')
      setStatus('error')
    }
  }

  async function toggle(index: number) {
    if (!player || !gameOpen) return
    const nextChecked = player.checked.slice()
    nextChecked[index] = !nextChecked[index]
    // Optimiste : on met à jour l'écran tout de suite
    setPlayer({ ...player, checked: nextChecked })
    const { error: upErr } = await supabase
      .from('players')
      .update({ checked: nextChecked })
      .eq('id', player.id)
    if (upErr) {
      // Rollback en cas d'échec réseau
      setPlayer({ ...player })
      alert('Impossible d\'enregistrer, réessaie.')
    }
  }

  if (status === 'loading') return <div className="page"><p className="muted">Chargement de ta grille…</p></div>

  if (status === 'need-items')
    return (
      <div className="page">
        <div className="notice">
          <h2>Pas encore assez d'items 🙈</h2>
          <p>
            Il faut au moins <strong>{CELL_COUNT}</strong> items dans le répertoire pour fabriquer une
            grille. Il y en a actuellement <strong>{itemCount}</strong>.
          </p>
          <p>Va sur l'onglet <strong>Ajouter</strong> pour en proposer !</p>
        </div>
      </div>
    )

  if (status === 'error')
    return (
      <div className="page">
        <div className="notice notice-error">
          <h2>Oups</h2>
          <p>{error}</p>
          <button className="btn" onClick={load}>Réessayer</button>
        </div>
      </div>
    )

  const score = player ? computeScore(player.checked) : null

  return (
    <div className="page play">
      {!gameOpen && (
        <div className="notice notice-closed">
          {score && score.checkedCount > 0
            ? `Le jeu est fermé. Ton score : ${score.lines} ligne(s), ${score.checkedCount}/${CELL_COUNT} cases.`
            : 'Le jeu est fermé. Tu pourras cocher tes cases quand l\'organisateur·rice lancera la partie.'}
        </div>
      )}

      {gameOpen && (
        <div className="play-hint">
          👆 <strong>Double-tap</strong> sur une case pour la cocher quand tu la vois se produire.
        </div>
      )}

      {player && (
        <BingoGrid
          cells={player.cells}
          checked={player.checked}
          disabled={!gameOpen}
          onToggle={toggle}
        />
      )}

      {score && (
        <div className="scorebar">
          <div className="score-item">
            <span className="score-num">{score.lines}</span>
            <span className="score-lbl">ligne{score.lines > 1 ? 's' : ''}</span>
          </div>
          <div className="score-item">
            <span className="score-num">{score.checkedCount}</span>
            <span className="score-lbl">/ {CELL_COUNT} cases</span>
          </div>
          {score.full && <div className="score-full">🎉 GRILLE PLEINE !</div>}
        </div>
      )}
    </div>
  )
}

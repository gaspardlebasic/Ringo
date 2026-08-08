import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, type Player } from '../supabase'
import { computeScore, CELL_COUNT } from '../lib/grid'
import { nameKey as toKey, getName } from '../lib/name'
import BingoGrid from '../components/BingoGrid'

const POLL_MS = 5000

// Page « Suivre un·e joueur·euse ».
// Sans paramètre : liste des joueur·euses à choisir.
// Avec ?j=<name_key> : affiche sa grille en lecture seule, en direct.
export default function Spectate() {
  const [params] = useSearchParams()
  const key = params.get('j')
  return key ? <Watch nameKey={key} /> : <PlayerPicker />
}

interface PickRow {
  name: string
  name_key: string
  lines: number
  checkedCount: number
}

function PlayerPicker() {
  const [rows, setRows] = useState<PickRow[]>([])
  const [loaded, setLoaded] = useState(false)
  const myKey = toKey(getName() ?? '')

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.from('players').select('name,name_key,checked')
      const list: PickRow[] = (data ?? [])
        .map((p: any) => {
          const s = computeScore((p.checked ?? []) as boolean[])
          return { name: p.name, name_key: p.name_key, lines: s.lines, checkedCount: s.checkedCount }
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      setRows(list)
      setLoaded(true)
    })()
  }, [])

  return (
    <div className="page spectate">
      <h1 className="script">Suivre un·e joueur·euse</h1>
      <p className="home-lead">Choisis qui regarder — tu verras sa grille et ses cases en direct.</p>

      {!loaded ? (
        <p className="muted">Chargement…</p>
      ) : rows.length === 0 ? (
        <div className="notice">
          <p>Personne n'a encore de grille. Reviens quand des joueur·euses auront rejoint la partie !</p>
        </div>
      ) : (
        <ul className="pick-list">
          {rows.map((r) => (
            <li key={r.name_key}>
              <Link className="pick-row" to={`/suivre?j=${encodeURIComponent(r.name_key)}`}>
                <span className="pick-name">
                  {r.name}
                  {r.name_key === myKey && <span className="lb-live-you"> (toi)</span>}
                </span>
                <span className="pick-score">
                  {r.lines} ligne{r.lines > 1 ? 's' : ''} · {r.checkedCount} case{r.checkedCount > 1 ? 's' : ''}
                </span>
                <span className="pick-chevron" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Watch({ nameKey }: { nameKey: string }) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'notfound'>('loading')
  const mounted = useRef(true)

  async function fetchPlayer() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('name_key', nameKey)
      .maybeSingle()
    if (!mounted.current) return
    if (!data) {
      setStatus('notfound')
      return
    }
    setPlayer(data as Player)
    setStatus('ok')
  }

  useEffect(() => {
    mounted.current = true
    setStatus('loading')
    fetchPlayer()
    const id = setInterval(fetchPlayer, POLL_MS)
    return () => {
      mounted.current = false
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameKey])

  if (status === 'loading') return <div className="page"><p className="muted">Chargement de la grille…</p></div>

  if (status === 'notfound' || !player)
    return (
      <div className="page">
        <div className="notice">
          <h2>Joueur·euse introuvable</h2>
          <p>Cette grille n'existe plus (peut-être réinitialisée par l'admin).</p>
          <Link className="btn btn-primary" to="/suivre">← Choisir quelqu'un d'autre</Link>
        </div>
      </div>
    )

  const score = computeScore(player.checked)

  return (
    <div className="page spectate">
      <div className="spectate-header">
        <Link to="/suivre" className="spectate-back">← Suivre</Link>
        <h1 className="script spectate-who">
          👀 {player.name}
          <span className="lb-live-dot" title="Mis à jour automatiquement" />
        </h1>
      </div>
      <p className="muted small spectate-sub">Grille en lecture seule, mise à jour en direct.</p>

      <BingoGrid cells={player.cells} checked={player.checked} disabled onToggle={() => {}} />

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
    </div>
  )
}

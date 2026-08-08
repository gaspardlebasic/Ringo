import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { computeScore } from '../lib/grid'

interface Row {
  name: string
  name_key: string
  lines: number
  checkedCount: number
  full: boolean
}

const POLL_MS = 5000
const TOP_N = 10

// Classement en direct de tou·tes les joueur·euses.
// Se rafraîchit automatiquement toutes les 5 s, et immédiatement quand
// `refreshKey` change (ex. quand le joueur coche une case).
export default function Leaderboard({
  currentNameKey,
  refreshKey,
}: {
  currentNameKey: string
  refreshKey: number
}) {
  const [rows, setRows] = useState<Row[]>([])
  const [loaded, setLoaded] = useState(false)
  const mounted = useRef(true)

  async function fetchRows() {
    const { data } = await supabase.from('players').select('name,name_key,checked')
    if (!mounted.current || !data) return
    const ranked: Row[] = data
      .map((p: any) => {
        const s = computeScore((p.checked ?? []) as boolean[])
        return { name: p.name, name_key: p.name_key, lines: s.lines, checkedCount: s.checkedCount, full: s.full }
      })
      .sort((a, b) => b.lines - a.lines || b.checkedCount - a.checkedCount || a.name.localeCompare(b.name))
    setRows(ranked)
    setLoaded(true)
  }

  // Polling régulier
  useEffect(() => {
    mounted.current = true
    fetchRows()
    const id = setInterval(fetchRows, POLL_MS)
    return () => {
      mounted.current = false
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Rafraîchissement immédiat quand le joueur agit
  useEffect(() => {
    if (refreshKey > 0) fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  if (!loaded) return null
  if (rows.length === 0) return null

  const myRank = rows.findIndex((r) => r.name_key === currentNameKey)
  const top = rows.slice(0, TOP_N)
  const meOutside = myRank >= TOP_N ? { row: rows[myRank], rank: myRank } : null

  return (
    <section className="lb-live">
      <h2 className="lb-live-title">
        🏆 Classement en direct
        <span className="lb-live-dot" title="Mis à jour automatiquement" />
      </h2>
      <p className="lb-live-hint">👉 Touche un nom pour suivre sa grille en direct</p>
      <ol className="lb-live-list">
        {top.map((r, i) => (
          <LbRow key={r.name_key} rank={i} row={r} me={r.name_key === currentNameKey} />
        ))}
        {meOutside && (
          <>
            <li className="lb-live-sep">⋯</li>
            <LbRow rank={meOutside.rank} row={meOutside.row} me />
          </>
        )}
      </ol>
    </section>
  )
}

function medal(rank: number): string {
  return rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`
}

function LbRow({ rank, row, me }: { rank: number; row: Row; me: boolean }) {
  return (
    <li>
      <Link
        className={'lb-live-row' + (me ? ' lb-live-me' : '')}
        to={`/suivre?j=${encodeURIComponent(row.name_key)}`}
      >
        <span className="lb-live-rank">{medal(rank)}</span>
        <span className="lb-live-name">
          {row.name}
          {me && <span className="lb-live-you"> (toi)</span>}
          {row.full && ' 🎉'}
        </span>
        <span className="lb-live-score">
          <strong>{row.lines}</strong> ligne{row.lines > 1 ? 's' : ''}
          <span className="lb-live-cases"> · {row.checkedCount} case{row.checkedCount > 1 ? 's' : ''}</span>
        </span>
        <span className="lb-live-chevron" aria-hidden="true">›</span>
      </Link>
    </li>
  )
}

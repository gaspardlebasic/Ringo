import { useEffect, useState } from 'react'
import { supabase, type Item, type Player } from '../supabase'
import { computeScore, CELL_COUNT } from '../lib/grid'
import { ADMIN_PASSWORD } from '../config'
import { getName } from '../lib/name'

const UNLOCK_KEY = 'ringo.admin.unlocked'

export default function Admin() {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem(UNLOCK_KEY) === '1')

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />
  return <AdminPanel />
}

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(UNLOCK_KEY, '1')
      onUnlock()
    } else {
      setErr(true)
    }
  }

  return (
    <div className="page">
      <div className="name-card admin-gate">
        <div className="logo">⚙️</div>
        <h1>Admin</h1>
        <form onSubmit={submit}>
          <label htmlFor="pw">Mot de passe</label>
          <input
            id="pw"
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              setErr(false)
            }}
            autoFocus
          />
          {err && <p className="error-text">Mot de passe incorrect</p>}
          <button type="submit">Entrer</button>
        </form>
      </div>
    </div>
  )
}

function AdminPanel() {
  const [gameOpen, setGameOpen] = useState<boolean | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [savingItem, setSavingItem] = useState(false)

  async function refresh() {
    setLoading(true)
    const { data: game } = await supabase.from('game_state').select('is_open').eq('id', 1).single()
    setGameOpen(game?.is_open ?? false)
    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
    setItems((itemsData ?? []) as Item[])
    const { data: playersData } = await supabase.from('players').select('*')
    setPlayers((playersData ?? []) as Player[])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function setGame(open: boolean) {
    await supabase.from('game_state').update({ is_open: open, updated_at: new Date().toISOString() }).eq('id', 1)
    setGameOpen(open)
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    const v = newItem.trim()
    if (!v) return
    setSavingItem(true)
    const { error } = await supabase.from('items').insert({ text: v, added_by: getName() ?? 'Admin' })
    setSavingItem(false)
    if (error) {
      alert('Erreur : ' + error.message)
      return
    }
    setNewItem('')
    refresh()
  }

  async function deleteItem(id: number) {
    if (!confirm('Supprimer cet item du répertoire ?')) return
    await supabase.from('items').delete().eq('id', id)
    refresh()
  }

  async function resetPlayers() {
    if (!confirm('Effacer TOUTES les grilles des joueur·euses ? (nouvelle partie)')) return
    await supabase.from('players').delete().neq('id', 0)
    refresh()
  }

  const leaderboard = players
    .map((p) => ({ name: p.name, ...computeScore(p.checked) }))
    .sort((a, b) => b.lines - a.lines || b.checkedCount - a.checkedCount)

  if (loading) return <div className="page"><p className="muted">Chargement…</p></div>

  return (
    <div className="page admin">
      <h1>Panneau admin</h1>

      {/* Contrôle du jeu */}
      <section className="admin-section">
        <h2>Le jeu</h2>
        <div className="game-control">
          <span className={`badge ${gameOpen ? 'badge-open' : 'badge-closed'}`}>
            {gameOpen ? '● Ouvert' : '● Fermé'}
          </span>
          {gameOpen ? (
            <button className="btn btn-danger" onClick={() => setGame(false)}>
              Clore le jeu &amp; calculer les scores
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setGame(true)}>
              Lancer le jeu
            </button>
          )}
        </div>
      </section>

      {/* Classement */}
      <section className="admin-section">
        <h2>Classement ({players.length} joueur·euses)</h2>
        {leaderboard.length === 0 ? (
          <p className="muted">Personne n'a encore de grille.</p>
        ) : (
          <table className="leaderboard">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Lignes</th>
                <th>Cases</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={row.name} className={i === 0 ? 'lb-first' : ''}>
                  <td>{i + 1}</td>
                  <td>{row.name}{row.full ? ' 🏆' : ''}</td>
                  <td>{row.lines}</td>
                  <td>{row.checkedCount}/{CELL_COUNT}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {players.length > 0 && (
          <button className="link-btn danger" onClick={resetPlayers}>
            Réinitialiser toutes les grilles (nouvelle partie)
          </button>
        )}
      </section>

      {/* Répertoire d'items */}
      <section className="admin-section">
        <h2>Répertoire ({items.length} items)</h2>
        <p className="muted small">
          Propose des choses susceptibles d'arriver pendant le mariage. Elles iront dans le
          répertoire commun d'où sont tirées les grilles.
        </p>
        <form onSubmit={addItem} className="add-form">
          <textarea
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Ex : Le curé fait une blague"
            rows={2}
            maxLength={140}
          />
          <button type="submit" className="btn btn-primary" disabled={savingItem || !newItem.trim()}>
            {savingItem ? 'Ajout…' : 'Ajouter un item'}
          </button>
        </form>
        <ul className="item-list">
          {items.map((it) => (
            <li key={it.id} className="item-row">
              <span className="item-text">
                {it.text}
                <span className="item-by"> — {it.added_by}</span>
              </span>
              <button className="del-btn" onClick={() => deleteItem(it.id)} aria-label="Supprimer">
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

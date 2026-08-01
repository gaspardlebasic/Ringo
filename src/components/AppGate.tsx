import { useState } from 'react'
import { APP_PASSWORD } from '../config'

export const APP_UNLOCK_KEY = 'ringo.app.unlocked'

// Porte d'accès à toute l'application, demandée à la première visite.
// Une fois déverrouillée, l'accès est mémorisé sur l'appareil.
export default function AppGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.trim().toLowerCase() === APP_PASSWORD.toLowerCase()) {
      localStorage.setItem(APP_UNLOCK_KEY, '1')
      onUnlock()
    } else {
      setErr(true)
    }
  }

  return (
    <div className="name-screen">
      <div className="name-card">
        <div className="logo">💍</div>
        <h1 className="script">Ringo</h1>
        <p className="subtitle">Le bingo du mariage</p>
        <form onSubmit={submit}>
          <label htmlFor="app-pw">Mot de passe d'accès</label>
          <input
            id="app-pw"
            type="password"
            autoComplete="off"
            placeholder="Mot de passe"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              setErr(false)
            }}
            autoFocus
          />
          {err && <p className="error-text">Mot de passe incorrect</p>}
          <button type="submit" disabled={!pw.trim()}>
            Entrer
          </button>
        </form>
        <p className="hint">Demande le mot de passe aux mariés 💌</p>
      </div>
    </div>
  )
}

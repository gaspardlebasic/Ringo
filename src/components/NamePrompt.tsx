import { useState } from 'react'
import { setName } from '../lib/name'

// Écran d'accueil au premier lancement : demande le nom et le sauvegarde.
export default function NamePrompt({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = value.trim()
    if (v.length < 1) return
    setName(v)
    onDone()
  }

  return (
    <div className="name-screen">
      <div className="name-card">
        <div className="logo">🔔</div>
        <h1>Ringo</h1>
        <p className="subtitle">Le bingo du mariage</p>
        <form onSubmit={submit}>
          <label htmlFor="name">Comment tu t'appelles ?</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ton prénom"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!value.trim()}>
            C'est parti !
          </button>
        </form>
        <p className="hint">Ton nom est enregistré sur ce téléphone.</p>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { getName, clearName } from '../lib/name'

export default function Home() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [itemCount, setItemCount] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: game } = await supabase.from('game_state').select('is_open').eq('id', 1).single()
      setIsOpen(game?.is_open ?? false)
      const { count } = await supabase.from('items').select('*', { count: 'exact', head: true })
      setItemCount(count ?? 0)
    })()
  }, [])

  return (
    <div className="page home">
      <h1 className="home-title">Bienvenue, {getName()} 👋</h1>
      <p className="home-lead">
        Repère les moments cultes du mariage sur ta grille, et coche-les au fil de la soirée !
      </p>

      <div className="status-banner">
        {isOpen === null ? (
          'Chargement…'
        ) : isOpen ? (
          <span className="badge badge-open">● Le jeu est ouvert</span>
        ) : (
          <span className="badge badge-closed">● Le jeu est fermé pour le moment</span>
        )}
      </div>

      <div className="home-cards">
        <Link to="/play" className="home-card home-card-primary">
          <span className="hc-icon">🎯</span>
          <span className="hc-title">Jouer</span>
          <span className="hc-sub">Ta grille de bingo</span>
        </Link>
        <Link to="/add" className="home-card">
          <span className="hc-icon">➕</span>
          <span className="hc-title">Ajouter des items</span>
          <span className="hc-sub">
            {itemCount === null ? '…' : `${itemCount} item${itemCount > 1 ? 's' : ''} dans le répertoire`}
          </span>
        </Link>
      </div>

      <button
        className="link-btn"
        onClick={() => {
          if (confirm('Changer de nom ? (ta grille reste liée à ton ancien nom)')) {
            clearName()
            location.reload()
          }
        }}
      >
        Ce n'est pas toi, {getName()} ? Changer de nom
      </button>
    </div>
  )
}

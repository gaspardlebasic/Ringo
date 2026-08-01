import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getName } from './lib/name'
import NamePrompt from './components/NamePrompt'
import AppGate, { APP_UNLOCK_KEY } from './components/AppGate'

export default function App() {
  const [unlocked, setUnlocked] = useState(localStorage.getItem(APP_UNLOCK_KEY) === '1')
  const [name, setNameState] = useState<string | null>(getName())
  const location = useLocation()

  // Re-lit le nom quand on change de page (utile après reset)
  useEffect(() => {
    setNameState(getName())
  }, [location.pathname])

  // 1) Porte d'accès à l'appli (mot de passe global)
  if (!unlocked) {
    return <AppGate onUnlock={() => setUnlocked(true)} />
  }

  // 2) Tant que le nom n'est pas défini, on bloque l'app avec le prompt
  if (!name) {
    return <NamePrompt onDone={() => setNameState(getName())} />
  }

  // La barre de navigation du bas reste sur l'accueil, mais pas en mode jeu.
  const showTabbar = location.pathname === '/'

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-logo">💍</span>
          <span className="brand-name script">Ringo</span>
        </Link>
        <span className="who">{name}</span>
      </header>
      <main className={'content' + (showTabbar ? '' : ' content-full')}>
        <Outlet />
      </main>
      {showTabbar && (
        <nav className="tabbar">
          <TabLink to="/play" label="Jouer" icon="🎯" active={location.pathname === '/play'} />
          <TabLink to="/admin" label="Admin" icon="⚙️" active={location.pathname === '/admin'} />
        </nav>
      )}
    </div>
  )
}

function TabLink({ to, label, icon, active }: { to: string; label: string; icon: string; active: boolean }) {
  return (
    <Link to={to} className={`tab ${active ? 'tab-active' : ''}`}>
      <span className="tab-icon">{icon}</span>
      <span className="tab-label">{label}</span>
    </Link>
  )
}

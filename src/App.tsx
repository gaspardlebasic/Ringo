import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getName } from './lib/name'
import NamePrompt from './components/NamePrompt'

export default function App() {
  const [name, setNameState] = useState<string | null>(getName())
  const location = useLocation()

  // Re-lit le nom quand on change de page (utile après reset)
  useEffect(() => {
    setNameState(getName())
  }, [location.pathname])

  // Tant que le nom n'est pas défini, on bloque l'app avec le prompt
  if (!name) {
    return <NamePrompt onDone={() => setNameState(getName())} />
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">🔔 Ringo</Link>
        <span className="who">{name}</span>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <nav className="tabbar">
        <TabLink to="/play" label="Jouer" icon="🎯" active={location.pathname === '/play'} />
        <TabLink to="/add" label="Ajouter" icon="➕" active={location.pathname === '/add'} />
        <TabLink to="/admin" label="Admin" icon="⚙️" active={location.pathname === '/admin'} />
      </nav>
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

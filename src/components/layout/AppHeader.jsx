import { useLocation } from 'react-router-dom'
import './AppHeader.css'

const PAGE_META = {
  '/void':     { system: 'SYSTEM LOG',   title: 'Void' },
  '/pulse':    { system: 'SYSTEM LAB',   title: 'Execution Pulse' },
  '/echo':     { system: 'SIGNAL FEED',  title: 'Echo' },
  '/orbit':    { system: 'SYSTEM PULSE', title: 'Orbit' },
  '/settings': { system: 'CONFIG',       title: 'Settings' },
}

export default function AppHeader() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || PAGE_META['/void']

  return (
    <header className="app-header">
      <div className="app-logo">
        <div className="app-logo-icon">⚡</div>
        RITVA X
      </div>
      <button className="header-icon-btn" aria-label="Settings" onClick={() => window.location.href = '/settings'}>
        ⚙
      </button>
    </header>
  )
}

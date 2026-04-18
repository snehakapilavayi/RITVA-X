import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const NAV_ITEMS = [
  { to: '/void',  label: 'VOID',  icon: '▦' },
  { to: '/pulse', label: 'PULSE', icon: '⚡' },
  { to: '/echo',  label: 'ECHO',  icon: '◈' },
  { to: '/orbit', label: 'ORBIT', icon: '⊙' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

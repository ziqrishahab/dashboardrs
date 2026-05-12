import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type NavItem = {
  path: string
  label: string
  icon: string
  roles: string[]
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'resepsionis'] },
  { path: '/doctors', label: 'Dokter', icon: '👨‍⚕️', roles: ['admin', 'resepsionis'] },
  { path: '/schedules', label: 'Jadwal', icon: '📅', roles: ['admin', 'resepsionis'] },
  { path: '/appointments', label: 'Janji Temu', icon: '📋', roles: ['admin', 'resepsionis'] },
  { path: '/patients', label: 'Pasien', icon: '🧑‍🤝‍🧑', roles: ['admin', 'resepsionis'] },
  { path: '/emergency', label: 'IGD', icon: '🚑', roles: ['admin', 'resepsionis'] },
  { path: '/staff', label: 'Staff', icon: '👥', roles: ['admin'] },
  { path: '/audit', label: 'Audit Log', icon: '📝', roles: ['admin'] },
  { path: '/settings', label: 'Pengaturan', icon: '⚙️', roles: ['admin', 'resepsionis'] },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredNav = navItems.filter((item) => (user?.role ? item.roles.includes(user.role) : false))

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>🏥 HaloRS</h2>
          <small>Panel {user?.role === 'admin' ? 'Admin' : 'Resepsionis'}</small>
        </div>
        <nav className="sidebar-nav">
          {filteredNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <span className="page-title">HaloRS</span>
          </div>
          <div className="topbar-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

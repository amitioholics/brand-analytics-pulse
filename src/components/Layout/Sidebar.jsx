import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Megaphone, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import PortalSwitcher from './PortalSwitcher';
import PulseLogo from '../common/PulseLogo';
import PGLogo from '../common/PGLogo';
import './Sidebar.css';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentConfig, isBrandConnect } = usePortal();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/campaigns', icon: Megaphone, label: isBrandConnect ? 'Campaigns' : 'Reward Campaigns' },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/signin');
    setMobileOpen(false);
  };

  const isActive = (path) => {
    if (path === '/campaigns') {
      return location.pathname.startsWith('/campaigns');
    }
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(true)}>
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <Link to="/" className="sidebar__logo" onClick={() => setMobileOpen(false)}>
            <PulseLogo size="md" />
          </Link>
          <button className="sidebar__close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Top-Left Portal Switcher */}
        <PortalSwitcher onSelect={() => setMobileOpen(false)} />

        <nav className="sidebar__nav">
          <span className="sidebar__nav-label">MENU</span>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar__link ${active ? 'sidebar__link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={19} className="sidebar__link-icon" />
                <span className="sidebar__link-text">{item.label}</span>
                {item.badge && (
                  <span className="sidebar__link-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          {user && (
            <div className="sidebar__user-badge">
              <div className="sidebar__user-avatar" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', overflow: 'hidden' }}>
                <PGLogo size={24} />
              </div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user.name}</div>
                <div className="sidebar__user-email">{user.email}</div>
                <div className="sidebar__user-brand">{user.brand} • Pulse</div>
              </div>
            </div>
          )}
          <button className="sidebar__signout-btn" onClick={handleSignOut} title="Sign Out of Brand Portal">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

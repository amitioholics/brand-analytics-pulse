import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Users, BarChart3, LogOut, Menu, X, Video, ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useDeliverables } from '../../context/DeliverablesContext';
import { useInvoices } from '../../context/InvoiceContext';
import PortalSwitcher from './PortalSwitcher';
import PulseLogo from '../common/PulseLogo';
import './Sidebar.css';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentConfig, isBrandConnect } = usePortal();
  const { pendingCount } = useDeliverables();
  const { pendingCount: pendingInvoicesCount } = useInvoices();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/campaigns', icon: Megaphone, label: isBrandConnect ? 'Collaborations' : 'Reward Campaigns' },
    ...(isBrandConnect ? [{
      path: '/approvals',
      icon: Video,
      label: 'Video Approvals',
      badge: pendingCount > 0 ? pendingCount : null,
    }] : []),
    {
      path: '/invoices',
      icon: FileText,
      label: 'Invoices',
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : null,
    },
    { path: '/creators', icon: Users, label: 'Creators' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings/team', icon: ShieldCheck, label: 'Team & Roles' },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/signin');
    setMobileOpen(false);
  };

  const isActive = (path) => {
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
              <div className="sidebar__user-avatar">{user.avatar || 'MB'}</div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user.name}</div>
                <div className="sidebar__user-brand">{user.brand} • {currentConfig.name}</div>
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

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Activity } from 'lucide-react';
import './AppLayout.css';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-layout__main">
        <Outlet />
      </main>

      {/* Pulse floating action widget */}
      <div className="haulpack-floating-action" title="Pulse Quick Actions">
        <Activity size={20} color="#ffffff" strokeWidth={2.4} />
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortalProvider } from './context/PortalContext';
import { DeliverablesProvider } from './context/DeliverablesContext';
import { InvoiceProvider } from './context/InvoiceContext';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CampaignList from './pages/CampaignList';
import CampaignDashboard from './pages/CampaignDashboard';
import CreatorDetail from './pages/CreatorDetail';
import Creators from './pages/Creators';
import CreatorProfilePage from './pages/CreatorProfilePage';
import Analytics from './pages/Analytics';
import VideoApprovals from './pages/VideoApprovals';
import InvoicesPage from './pages/InvoicesPage';
import TeamSettings from './pages/TeamSettings';
import SignIn from './pages/SignIn';

export default function App() {
  return (
    <AuthProvider>
      <PortalProvider>
        <DeliverablesProvider>
          <InvoiceProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/login" element={<SignIn />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/campaigns" element={<CampaignList />} />
                  <Route path="/campaigns/:campaignId" element={<CampaignDashboard />} />
                  <Route path="/campaigns/:campaignId/creators/:creatorId" element={<CreatorDetail />} />
                  <Route path="/creators" element={<Navigate to="/campaigns" replace />} />
                  <Route path="/creators/:creatorId" element={<CreatorProfilePage />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/approvals" element={<Navigate to="/campaigns/6ace2b3abe742272b6135d8e#deliverables" replace />} />
                  <Route path="/invoices" element={<Navigate to="/campaigns/6ace2b3abe742272b6135d8e#reimbursements" replace />} />
                  <Route path="/settings" element={<TeamSettings />} />
                  <Route path="/settings/team" element={<TeamSettings />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </InvoiceProvider>
        </DeliverablesProvider>
      </PortalProvider>
    </AuthProvider>
  );
}

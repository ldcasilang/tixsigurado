import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import ConnectWallet from './pages/ConnectWallet';
import MyTickets from './pages/MyTickets';
import TicketDetails from './pages/TicketDetails';
import GateScanner from './pages/GateScanner';
import OrganizerPanel from './pages/OrganizerPanel';
import Marketplace from './pages/Marketplace';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/connect" element={<ConnectWallet />} />
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/scan" element={<GateScanner />} />
          <Route path="/organizer" element={<OrganizerPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

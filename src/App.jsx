import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppProvider from './context/AppContext';
import Navbar from './components/Navbar';
import CalendarPage from './pages/CalendarPage';
import ClientsPage from './pages/ClientsPage';
import StockPage from './pages/StockPage';
import InsightsPage from './pages/InsightsPage';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div data-theme="salon" className="min-h-screen p-4 bg-base-200">
          <Navbar />
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AppProvider from "./context/AppContext";
import Navbar from "./components/Navbar";
import CalendarPage from "./pages/CalendarPage";
import ClientsPage from "./pages/ClientsPage";
import StockPage from "./pages/StockPage";
import InsightsPage from "./pages/InsightsPage";
import { db, requestNotificationPermission, listenForMessages } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import "./index.css";

export default function App() {
  useEffect(() => {
    async function setupNotifications() {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          console.log("✅ FCM Token:", token);
          await addDoc(collection(db, "tokens"), { token });
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    }

    setupNotifications();
    listenForMessages();
  }, []);


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

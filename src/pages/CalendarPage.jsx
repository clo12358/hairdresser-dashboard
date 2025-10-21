import CalendarView from "../components/CalendarView";
import NotificationManager from "../components/NotificationManager";
import QuickNotes from "../components/QuickNotes";
import LowStockBanner from "../components/LowStockBanner";
import EarningsSummary from "../components/EarningsSummary"; // 💸 new

export default function CalendarPage() {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Left: Calendar Section */}
      <div className="lg:col-span-2">
        <CalendarView />
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col gap-4">
        <QuickNotes />

        {/* 🔔 Low Stock Alert Banner */}
        <LowStockBanner />

        {/* 💰 Revenue Summary */}
        <EarningsSummary />
      </div>

      <NotificationManager />
    </div>
  );
}

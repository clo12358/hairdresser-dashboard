import { useMemo } from "react";
import { useApp } from "../context/AppContext";

export default function EarningsSummary() {
  const { appointments } = useApp();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Sunday
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 🧮 Compute totals (only count appointments that have already ended)
  const { todayTotal, weekTotal, monthTotal } = useMemo(() => {
    let today = 0,
      week = 0,
      month = 0;

    appointments.forEach((a) => {
      const cost = Number(a.cost) || 0;
      const start = new Date(a.startISO);
      const end = new Date(a.endISO);

      // 💡 Only include appointments that have finished
      if (end <= now) {
        if (start >= startOfDay) today += cost;
        if (start >= startOfWeek) week += cost;
        if (start >= startOfMonth) month += cost;
      }
    });

    return {
      todayTotal: today.toFixed(2),
      weekTotal: week.toFixed(2),
      monthTotal: month.toFixed(2),
    };
  }, [appointments]);

  return (
    <div className="rounded-3xl border border-[#D2BFAF] bg-[#F9F4ED] shadow-md p-5 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-[#3B2F2F] mb-2 text-center">
        💰 Earnings Summary
      </h3>

      <div className="flex flex-col gap-3 text-center">
        <div className="p-3 rounded-xl bg-[#FFF6E9] border border-[#E4D3BE]">
          <p className="text-sm text-[#8A7563] font-medium">Today</p>
          <p className="text-2xl font-bold text-[#3B2F2F]">
            €{todayTotal}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#FFF6E9] border border-[#E4D3BE]">
          <p className="text-sm text-[#8A7563] font-medium">This Week</p>
          <p className="text-2xl font-bold text-[#3B2F2F]">
            €{weekTotal}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#FFF6E9] border border-[#E4D3BE]">
          <p className="text-sm text-[#8A7563] font-medium">This Month</p>
          <p className="text-2xl font-bold text-[#3B2F2F]">
            €{monthTotal}
          </p>
        </div>
      </div>

      <p className="text-xs text-center text-[#8A7563] mt-2">
        *Only completed appointments are included
      </p>
    </div>
  );
}

import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Chart colors
const COLORS = ["#8A7563", "#AD947F", "#D2BFAF", "#3B2F2F", "#F1DCC3"];

export default function InsightsPage() {
  const { appointments } = useApp();

  // =========================
  // 🧮 Monthly Earnings
  // =========================
  const monthlyEarnings = useMemo(() => {
    const earnings = {};
    appointments.forEach((a) => {
      const date = new Date(a.startISO);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!earnings[key]) earnings[key] = 0;
      if (new Date(a.endISO) < new Date()) {
        earnings[key] += Number(a.cost || 0);
      }
    });
    return Object.entries(earnings).map(([month, total]) => ({ month, total }));
  }, [appointments]);

  // =========================
  // 💇 Top Clients
  // =========================
  const topClients = useMemo(() => {
    const totals = {};
    appointments.forEach((a) => {
      if (new Date(a.endISO) < new Date()) {
        totals[a.clientName] = (totals[a.clientName] || 0) + Number(a.cost || 0);
      }
    });

    return Object.entries(totals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [appointments]);

  // =========================
  // ✂️ Service Statistics (now split by multiple services)
  // =========================
  const serviceStats = useMemo(() => {
    const data = {};

    appointments.forEach((a) => {
      if (new Date(a.endISO) >= new Date()) return; // only count completed appointments

      const services = a.service
        ? a.service.split(",").map((s) => s.trim())
        : ["Other"];

      services.forEach((s) => {
        if (!data[s]) data[s] = { total: 0, count: 0, totalDuration: 0 };
        data[s].total += Number(a.cost || 0) / services.length; // split cost fairly
        data[s].count++;
        data[s].totalDuration += Number(a.durationHours || 1);
      });
    });

    return Object.entries(data).map(([service, { total, count, totalDuration }]) => ({
      service,
      total: Number(total.toFixed(2)),
      avgDuration: count ? (totalDuration / count).toFixed(1) : 0,
    }));
  }, [appointments]);

  const pieData = serviceStats.map((s) => ({
    name: s.service,
    value: s.total,
  }));

  return (
    <div className="p-6 md:p-10 bg-[#F9F4ED] min-h-screen rounded-3xl border border-[#D2BFAF] shadow-lg">
      <h2 className="text-3xl font-bold text-[#3B2F2F] mb-8 text-center">
        Business Insights
      </h2>

      {/* Monthly Earnings */}
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-[#3B2F2F] mb-4 text-center sm:text-left">
          Monthly Earnings
        </h3>
        {monthlyEarnings.length > 0 ? (
          <div className="w-full h-64 sm:h-80 bg-white rounded-2xl shadow-md p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D2BFAF" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8A7563" name="Earnings (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[#8A7563] text-center mt-4">No earnings data yet.</p>
        )}
      </section>

      {/* Top Clients */}
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-[#3B2F2F] mb-4 text-center sm:text-left">
          Top Clients
        </h3>
        <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D2BFAF]">
                <th className="p-3 text-[#3B2F2F]">Client</th>
                <th className="p-3 text-[#3B2F2F]">Total Spent (€)</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((c) => (
                <tr key={c.name} className="hover:bg-[#F1DCC3]/40">
                  <td className="p-3 text-[#3B2F2F]">{c.name}</td>
                  <td className="p-3 text-[#3B2F2F] font-semibold">
                    €{c.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Service Statistics */}
      <section className="grid md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div>
          <h3 className="text-2xl font-semibold text-[#3B2F2F] mb-4 text-center sm:text-left">
            Revenue by Service
          </h3>
          {pieData.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    fill="#8A7563"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[#8A7563] mt-4 text-center">No service data yet.</p>
          )}
        </div>

        {/* Average Duration Table */}
        <div>
          <h3 className="text-2xl font-semibold text-[#3B2F2F] mb-4 text-center sm:text-left">
            Average Duration per Service
          </h3>
          <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D2BFAF]">
                  <th className="p-3 text-[#3B2F2F]">Service</th>
                  <th className="p-3 text-[#3B2F2F]">Average Duration (hours)</th>
                </tr>
              </thead>
              <tbody>
                {serviceStats.map((s) => (
                  <tr key={s.service} className="hover:bg-[#F1DCC3]/40">
                    <td className="p-3 text-[#3B2F2F]">{s.service}</td>
                    <td className="p-3 text-[#3B2F2F] font-semibold">
                      {s.avgDuration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

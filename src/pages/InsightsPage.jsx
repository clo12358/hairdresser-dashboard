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
import { motion } from "framer-motion";
import { TrendingUp, Users, Scissors } from "lucide-react";

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
    return Object.entries(earnings).map(([month, total]) => ({
      month: new Date(`${month}-01`).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      total,
    }));
  }, [appointments]);

  const totalEarnings = monthlyEarnings.reduce((acc, m) => acc + m.total, 0);

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
  // ✂️ Service Statistics
  // =========================
  const serviceStats = useMemo(() => {
    const data = {};
    appointments.forEach((a) => {
      if (new Date(a.endISO) >= new Date()) return;
      const services = a.service ? a.service.split(",").map((s) => s.trim()) : ["Other"];
      services.forEach((s) => {
        if (!data[s]) data[s] = { total: 0, count: 0, totalDuration: 0 };
        data[s].total += Number(a.cost || 0) / services.length;
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

  const pieData = serviceStats.map((s) => ({ name: s.service, value: s.total }));

  // =========================
  // 💻 UI
  // =========================
  return (
    <motion.div
      className="p-6 md:p-10 bg-[#F9F4ED] min-h-screen rounded-3xl border border-[#D2BFAF] shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-[#3B2F2F] mb-10 text-center">
        Business Insights
      </h2>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-3">
          <TrendingUp size={32} className="text-[#8A7563]" />
          <div>
            <p className="text-sm text-[#8A7563]">Total Earnings</p>
            <p className="text-xl font-bold text-[#3B2F2F]">
              €{totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-3">
          <Users size={32} className="text-[#8A7563]" />
          <div>
            <p className="text-sm text-[#8A7563]">Top Clients</p>
            <p className="text-xl font-bold text-[#3B2F2F]">{topClients.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-3">
          <Scissors size={32} className="text-[#8A7563]" />
          <div>
            <p className="text-sm text-[#8A7563]">Active Services</p>
            <p className="text-xl font-bold text-[#3B2F2F]">{serviceStats.length}</p>
          </div>
        </div>
      </div>

      {/* Monthly Earnings */}
      <motion.section
        className="mb-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-semibold text-[#3B2F2F] mb-4 border-b border-[#D2BFAF] pb-2">
          Monthly Earnings
        </h3>
        {monthlyEarnings.length > 0 ? (
          <div className="w-full h-64 sm:h-80 bg-white rounded-2xl shadow-md p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D2BFAF" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`€${value.toFixed(2)}`, "Earnings"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="total" fill="#8A7563" name="Earnings (€)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[#8A7563] text-center mt-4">No earnings data yet.</p>
        )}
      </motion.section>

      {/* Top Clients */}
      <motion.section
        className="mb-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl font-semibold text-[#3B2F2F] mb-4 border-b border-[#D2BFAF] pb-2">
          Top Clients
        </h3>
        {topClients.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D2BFAF]">
                  <th className="p-3 text-[#3B2F2F]">Client</th>
                  <th className="p-3 text-[#3B2F2F]">Total Spent (€)</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c, i) => (
                  <tr
                    key={c.name}
                    className={`hover:bg-[#F1DCC3]/40 transition-all ${
                      i % 2 === 0 ? "bg-[#F9F4ED]" : "bg-white"
                    }`}
                  >
                    <td className="p-3 text-[#3B2F2F] font-medium">{c.name}</td>
                    <td className="p-3 text-[#3B2F2F] font-semibold">
                      €{c.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#8A7563] text-center mt-4">No client data yet.</p>
        )}
      </motion.section>

      {/* Service Statistics */}
      <motion.section
        className="grid md:grid-cols-2 gap-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Pie Chart */}
        <div>
          <h3 className="text-2xl font-semibold text-[#3B2F2F] mb-4 border-b border-[#D2BFAF] pb-2">
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
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`€${value.toFixed(2)}`, name]}
                  />
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
          <h3 className="text-2xl font-semibold text-[#3B2F2F] mb-4 border-b border-[#D2BFAF] pb-2">
            Average Duration per Service
          </h3>
          {serviceStats.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D2BFAF]">
                    <th className="p-3 text-[#3B2F2F]">Service</th>
                    <th className="p-3 text-[#3B2F2F]">Avg Duration (hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceStats.map((s, i) => (
                    <tr
                      key={s.service}
                      className={`hover:bg-[#F1DCC3]/40 transition-all ${
                        i % 2 === 0 ? "bg-[#F9F4ED]" : "bg-white"
                      }`}
                    >
                      <td className="p-3 text-[#3B2F2F] font-medium">{s.service}</td>
                      <td className="p-3 text-[#3B2F2F] font-semibold">{s.avgDuration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#8A7563] text-center mt-4">No service duration data.</p>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}

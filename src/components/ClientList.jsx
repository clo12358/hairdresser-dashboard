import { useMemo, useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import AppointmentForm from "./AppointmentForm";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Eye, PlusCircle } from "lucide-react";

export default function ClientList() {
  const { clients, appointments, addClient, editClient, removeClient } = useApp();
  const [q, setQ] = useState("");
  const [expandedClient, setExpandedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [newClient, setNewClient] = useState({ name: "", phone: "", notes: "" });
  const [loading, setLoading] = useState(false);

  // 🔍 Smart search: name, phone, or notes
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return clients;
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(t) ||
        c.phone?.toLowerCase().includes(t) ||
        c.notes?.toLowerCase().includes(t)
    );
  }, [q, clients]);

  // 🧭 Smooth scroll to expanded client
  useEffect(() => {
    if (expandedClient) {
      const el = document.getElementById(`client-${expandedClient}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [expandedClient]);

  // 🧠 Add client handler with toast
  async function handleAddClient(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await addClient(newClient);
      toast.success(`Client "${newClient.name}" added!`);
      setNewClient({ name: "", phone: "", notes: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add client.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#D2BFAF] bg-[#F9F4ED] p-4 sm:p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-[#3B2F2F] mb-6 text-center sm:text-left">
        Clients
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Add Client Form */}
        <div>
          <h4 className="text-xl font-semibold text-[#3B2F2F] mb-4 text-center sm:text-left">
            Add Client
          </h4>
          <form className="grid gap-3" onSubmit={handleAddClient}>
            <input
              autoFocus
              className="w-full px-4 py-2 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200"
              placeholder="Name"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              required
            />
            <input
              className="w-full px-4 py-2 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200"
              placeholder="Phone"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
            />
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200 min-h-[80px]"
              placeholder="Notes"
              value={newClient.notes}
              onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
            />
            <button
              disabled={loading}
              className={`w-full px-6 py-3 rounded-full bg-[#8A7563] text-[#F9F4ED] font-semibold hover:bg-[#AD947F] transition-all duration-200 shadow-md text-sm sm:text-base ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Adding..." : "Add Client"}
            </button>
          </form>
        </div>

        {/* Right side - Client List */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h4 className="text-xl font-semibold text-[#3B2F2F] text-center sm:text-left">
              All Clients
            </h4>
            <input
              className="w-full sm:w-48 px-4 py-2 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200"
              placeholder="Search name, phone, or notes..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-[#8A7563] italic">No matching clients found.</p>
          ) : (
            <ul className="divide-y divide-[#D2BFAF] max-h-[28rem] overflow-auto bg-white rounded-xl p-4 shadow-inner">
              <AnimatePresence>
                {filtered.map((c, i) => {
                  const isExpanded = expandedClient === c.id;
                  const clientAppointments = appointments.filter(
                    (a) => a.clientName === c.name
                  );
                  const now = new Date();
                  const pastAppointments = clientAppointments.filter(
                    (a) => new Date(a.endISO) < now
                  );
                  const upcomingAppointments = clientAppointments.filter(
                    (a) => new Date(a.startISO) >= now
                  );

                  return (
                    <motion.li
                      key={c.id}
                      id={`client-${c.id}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`py-3 rounded-xl px-2 ${
                        i % 2 === 0 ? "bg-[#F9F4ED]" : "bg-white"
                      }`}
                    >
                      {editingClient?.id === c.id ? (
                        // ✏️ Edit mode
                        <div className="space-y-2">
                          <input
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D2BFAF] bg-white text-[#3B2F2F] focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
                            value={editingClient.name}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                name: e.target.value,
                              })
                            }
                          />
                          <input
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D2BFAF] bg-white text-[#3B2F2F]"
                            placeholder="Phone"
                            value={editingClient.phone}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                phone: e.target.value,
                              })
                            }
                          />
                          <textarea
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D2BFAF] bg-white text-[#3B2F2F]"
                            placeholder="Notes"
                            value={editingClient.notes}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                notes: e.target.value,
                              })
                            }
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={async () => {
                                const { id, ...patch } = editingClient;
                                await editClient(id, patch);
                                toast.success("Client updated!");
                                setEditingClient(null);
                              }}
                              className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-[#8A7563] text-[#F9F4ED] text-sm font-semibold hover:bg-[#AD947F]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingClient(null)}
                              className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-[#D2BFAF] text-[#3B2F2F] text-sm font-semibold hover:bg-[#AD947F] hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // 👁️ View mode
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#D2BFAF] flex items-center justify-center font-bold text-[#3B2F2F]">
                                {c.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-[#3B2F2F] flex items-center gap-2">
                                  {c.name}
                                  {clientAppointments.length > 0 && (
                                    <span className="text-xs bg-[#D2BFAF] text-[#3B2F2F] px-2 py-0.5 rounded-full">
                                      {clientAppointments.length} appt
                                      {clientAppointments.length > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-[#8A7563]">{c.phone}</div>
                                {c.notes && (
                                  <div className="text-sm text-[#8A7563] mt-1 line-clamp-2">
                                    {c.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:ml-2">
                              <button
                                onClick={() => setEditingClient({ ...c })}
                                className="px-3 py-1 rounded-full bg-[#D2BFAF] text-[#3B2F2F] text-xs font-semibold hover:bg-[#AD947F] hover:text-white flex items-center gap-1"
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete ${c.name}?`)) {
                                    await removeClient(c.id);
                                    toast.success(`Client "${c.name}" deleted.`);
                                  }
                                }}
                                className="px-3 py-1 rounded-full bg-[#FF8A80] text-white text-xs font-semibold hover:bg-red-600 flex items-center gap-1"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                              <button
                                onClick={() =>
                                  setExpandedClient(isExpanded ? null : c.id)
                                }
                                className="px-3 py-1 rounded-full bg-[#8A7563] text-white text-xs font-semibold hover:bg-[#AD947F] flex items-center gap-1"
                              >
                                <Eye size={14} /> {isExpanded ? "Hide" : "View"}
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-3 pl-2 border-l-4 border-[#D2BFAF]"
                              >
                                <div className="flex justify-between items-center">
                                  <h5 className="text-sm font-semibold text-[#3B2F2F] mb-1">
                                    Upcoming Appointments:
                                  </h5>
                                  <button
                                    onClick={() =>
                                      setAppointmentToEdit({ clientName: c.name })
                                    }
                                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#AD947F] text-white hover:bg-[#8A7563]"
                                  >
                                    <PlusCircle size={14} /> New
                                  </button>
                                </div>
                                {upcomingAppointments.length ? (
                                  <ul className="text-sm text-[#8A7563] mb-3">
                                    {upcomingAppointments.map((a) => (
                                      <li
                                        key={a.id}
                                        className="mb-1 cursor-pointer hover:text-[#3B2F2F] transition-colors"
                                        onClick={() => setAppointmentToEdit(a)}
                                      >
                                        {new Date(a.startISO).toLocaleString([], {
                                          dateStyle: "short",
                                          timeStyle: "short",
                                        })}{" "}
                                        —{" "}
                                        <span className="font-semibold">{a.service}</span>{" "}
                                        {a.cost ? ` (€${a.cost})` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-[#8A7563] mb-3">
                                    No upcoming appointments.
                                  </p>
                                )}

                                <h5 className="text-sm font-semibold text-[#3B2F2F] mb-1">
                                  Past Appointments:
                                </h5>
                                {pastAppointments.length ? (
                                  <ul className="text-sm text-[#8A7563]">
                                    {pastAppointments.map((a) => (
                                      <li
                                        key={a.id}
                                        className="mb-1 cursor-pointer hover:text-[#3B2F2F] transition-colors"
                                        onClick={() => setAppointmentToEdit(a)}
                                      >
                                        {new Date(a.startISO).toLocaleDateString()} —{" "}
                                        <span className="font-semibold">{a.service}</span>{" "}
                                        {a.cost ? ` (€${a.cost})` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-[#8A7563]">
                                    No past appointments.
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* Appointment Modal */}
      {appointmentToEdit && (
        <AppointmentForm
          existing={
            appointmentToEdit.id ? appointmentToEdit : undefined
          }
          slotInfo={
            !appointmentToEdit.id ? { start: new Date() } : undefined
          }
          onClose={() => setAppointmentToEdit(null)}
        />
      )}
    </div>
  );
}

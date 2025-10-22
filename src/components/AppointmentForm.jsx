import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // 👈 Firestore connection

export default function AppointmentForm({ slotInfo, existing, onClose }) {
  const isEdit = !!existing;
  const { addAppointment, editAppointment, removeAppointment, clients } = useApp();

  // Helpers
  const ensureDate = (v) => (v instanceof Date ? v : new Date(v));
  const msToHours = (ms) => ms / 3600000;
  const hoursToMs = (h) => h * 3600000;

  // Initial setup
  const initialStart = useMemo(() => {
    if (isEdit) return ensureDate(existing.start ?? existing.startISO);
    if (slotInfo?.start) return ensureDate(slotInfo.start);
    return new Date();
  }, [isEdit, existing, slotInfo]);

  const initialDurationHours = useMemo(() => {
    if (isEdit) {
      const s = ensureDate(existing.start ?? existing.startISO);
      const e = ensureDate(existing.end ?? existing.endISO ?? s);
      const h = Math.max(0.25, msToHours(e - s));
      return Number.isFinite(h) ? h : 1;
    }
    return 1;
  }, [isEdit, existing]);

  // State
  const [clientName, setClientName] = useState(existing?.clientName || "");
  const [selectedServices, setSelectedServices] = useState(
    existing?.service ? existing.service.split(", ").map((s) => s.trim()) : []
  );
  const [title, setTitle] = useState(existing?.title || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [cost, setCost] = useState(existing?.cost || "");
  const [start, setStart] = useState(initialStart);
  const [durationHours, setDurationHours] = useState(initialDurationHours);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const serviceOptions = [
    "Full Head",
    "Half Head",
    "T-Bar",
    "Root Colour",
    "All Over Colour",
    "Treatment",
    "Blowdry",
    "Wash Cut & Blowdry",
    "Bonds - 2 Packs",
    "Bonds - 3 Packs",
    "Bonds - 4 Packs",
    "Bonds - 5 Packs",
    "Tapes - 1 Pack",
    "Tapes - 2 Packs",
  ];

  // Auto title
  useEffect(() => {
    if (!isEdit && clientName && selectedServices.length) {
      setTitle(`${clientName} - ${selectedServices.join(", ")}`);
    }
  }, [clientName, selectedServices, isEdit]);

  // Sync when reopened
  useEffect(() => {
    setStart(initialStart);
    setDurationHours(initialDurationHours);
  }, [initialStart, initialDurationHours]);

  // ✅ Updated submit handler
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const startDate = ensureDate(start);
      const endDate = new Date(startDate.getTime() + hoursToMs(durationHours || 1));

      const data = {
        title,
        clientName,
        service: selectedServices.join(", "),
        notes,
        startISO: startDate.toISOString(),
        endISO: endDate.toISOString(),
        durationHours,
        cost: cost ? Number(cost) : 0,
        reminderSent: false, // 👈 so Cloud Function knows it hasn’t sent a reminder
      };

      if (isEdit) {
        await editAppointment(existing.id, data);
      } else {
        await addAppointment(data);
        // ✅ Save to Firestore
        await addDoc(collection(db, "appointments"), data);
        console.log("✅ Appointment added to Firestore!");
      }

      onClose?.();
    } catch (err) {
      console.error("Error saving appointment:", err);
      setError("Sorry, we couldn’t save that. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setError("");
    setSaving(true);
    try {
      await removeAppointment(existing.id);
      onClose?.();
    } catch (err) {
      console.error(err);
      setError("Couldn’t delete this appointment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleService(service) {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      style={{ animation: "fadeIn 0.25s ease-in-out" }}
    >
      <div className="w-full max-h-[90vh] overflow-y-auto flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-2xl bg-[#F9F4ED] border border-[#D2BFAF] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto"
          style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.08)" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-[#D2BFAF] pb-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#3B2F2F]">
              {isEdit ? "Edit Appointment" : "New Appointment"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[#8A7563] hover:text-[#AD947F] text-2xl font-semibold transition-all"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">
                  Client Name
                </label>
                <select
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="select select-bordered bg-[#F1DCC3] border-[#D2BFAF] text-[#3B2F2F] rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Services */}
              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">
                  Services
                </label>
                <div className="bg-[#F1DCC3] border border-[#D2BFAF] rounded-xl p-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {serviceOptions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleService(s)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        selectedServices.includes(s)
                          ? "bg-[#8A7563] text-white"
                          : "bg-white text-[#3B2F2F] border border-[#D2BFAF] hover:bg-[#D2BFAF]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full input input-bordered bg-[#F1DCC3] border-[#D2BFAF] text-[#3B2F2F] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
                />
              </div>

              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">
                  Cost (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 45"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full input input-bordered bg-[#F1DCC3] border-[#D2BFAF] text-[#3B2F2F] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  className="w-full textarea textarea-bordered bg-[#F1DCC3] border-[#D2BFAF] text-[#3B2F2F] rounded-xl resize-none px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
                />
              </div>

              <div className="flex flex-col gap-5 mt-2">
                <div>
                  <label className="block text-[#3B2F2F] font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={toLocal(start)}
                    onChange={(e) => setStart(ensureDate(e.target.value))}
                    required
                    className="input input-bordered w-full bg-[#F1DCC3] border-[#D2BFAF] text-[#3B2F2F] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
                  />
                </div>

                <div>
                  <label className="block text-[#3B2F2F] font-medium mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="input input-bordered w-full bg-[#F1DCC3] border-[#D2BFAF] text-[#3B2F2F] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-[#B36C5B] bg-[#FCEBE8] border border-[#E7C1BB] px-3 py-2 rounded-lg text-sm sm:text-base">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t border-[#D2BFAF]">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className={`btn bg-[#B36C5B] text-[#F9F4ED] hover:bg-[#8A4F42] rounded-full w-full sm:w-auto px-6 ${
                  saving ? "btn-disabled opacity-60" : ""
                }`}
                disabled={saving}
              >
                Delete
              </button>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="btn bg-[#D2BFAF] text-[#3B2F2F] hover:bg-[#AD947F] rounded-full w-full sm:w-auto px-6"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn bg-[#8A7563] text-[#F9F4ED] hover:bg-[#AD947F] rounded-full w-full sm:w-auto px-6 ${
                  saving ? "btn-disabled opacity-60" : ""
                }`}
                disabled={saving}
              >
                {isEdit ? "Save Changes" : "Add Appointment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper to format datetime-local input
function toLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

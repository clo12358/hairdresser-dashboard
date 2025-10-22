import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function AppointmentForm({ slotInfo, existing, onClose }) {
  const isEdit = !!existing;
  const { addAppointment, editAppointment, removeAppointment, clients } = useApp();

  const ensureDate = (v) => (v instanceof Date ? v : new Date(v));
  const msToHours = (ms) => ms / 3600000;
  const hoursToMs = (h) => h * 3600000;

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

  // 🧠 Auto-fill appointment title
  useEffect(() => {
    if (!isEdit && clientName && selectedServices.length) {
      setTitle(`${clientName} – ${selectedServices.join(", ")}`);
    }
  }, [clientName, selectedServices, isEdit]);

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
        reminderSent: false,
      };

      if (isEdit) {
        await editAppointment(existing.id, data);
        toast.success("Appointment updated successfully!");
      } else {
        await addAppointment(data);
        toast.success("New appointment added!");
      }

      onClose?.();
    } catch (err) {
      console.error("Error saving appointment:", err);
      setError("Sorry, we couldn’t save that. Please try again.");
      toast.error("Error saving appointment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing?.id) return;
    setSaving(true);
    try {
      await removeAppointment(existing.id);
      toast.success("Appointment deleted");
      onClose?.();
    } catch (err) {
      console.error(err);
      setError("Couldn’t delete this appointment. Please try again.");
      toast.error("Error deleting appointment.");
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-h-[90vh] overflow-y-auto flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-2xl bg-[#F9F4ED] border border-[#D2BFAF] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto transition-all duration-300"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-[#D2BFAF] pb-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#3B2F2F]">
              {isEdit ? "Edit Appointment" : "New Appointment"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[#8A7563] hover:text-[#AD947F] text-2xl font-semibold"
            >
              ✕
            </button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side */}
            <div className="flex flex-col gap-4">
              {/* Client */}
              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">
                  Client
                </label>
                <select
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full bg-[#F1DCC3] border border-[#D2BFAF] rounded-xl p-2 focus:ring-2 focus:ring-[#AD947F] focus:outline-none transition"
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
                <div className="bg-[#F1DCC3] border border-[#D2BFAF] rounded-xl p-3 flex flex-wrap gap-2 max-h-44 overflow-y-auto">
                  {serviceOptions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleService(s)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        selectedServices.includes(s)
                          ? "bg-[#8A7563] text-white shadow-sm"
                          : "bg-white text-[#3B2F2F] border border-[#D2BFAF] hover:bg-[#D2BFAF]/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Appointment title"
                className="input input-bordered bg-[#F1DCC3] border-[#D2BFAF] rounded-xl p-2 focus:ring-2 focus:ring-[#AD947F] focus:outline-none"
                required
              />

              {/* Cost */}
              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">
                  Cost (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="input input-bordered bg-[#F1DCC3] border-[#D2BFAF] rounded-xl p-2 focus:ring-2 focus:ring-[#AD947F] focus:outline-none"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col gap-4">
              {/* Notes */}
              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  placeholder="Add any notes here..."
                  className="w-full textarea textarea-bordered bg-[#F1DCC3] border-[#D2BFAF] rounded-xl p-2 focus:ring-2 focus:ring-[#AD947F] focus:outline-none"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-[#3B2F2F] font-medium mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={toLocal(start)}
                  onChange={(e) => setStart(ensureDate(e.target.value))}
                  required
                  className="input input-bordered bg-[#F1DCC3] border-[#D2BFAF] rounded-xl p-2 focus:ring-2 focus:ring-[#AD947F] focus:outline-none"
                />
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <label className="text-[#3B2F2F] font-medium">
                  Duration (hrs)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setDurationHours(Math.max(0.25, durationHours - 0.25))
                  }
                  className="px-3 py-1 bg-[#D2BFAF] rounded-full hover:bg-[#AD947F] transition"
                >
                  −
                </button>
                <span className="font-semibold">{durationHours.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => setDurationHours(durationHours + 0.25)}
                  className="px-3 py-1 bg-[#D2BFAF] rounded-full hover:bg-[#AD947F] transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="mt-4 text-[#B36C5B] bg-[#FCEBE8] border border-[#E7C1BB] px-3 py-2 rounded-lg text-sm text-center">
              {error}
            </p>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6 border-t border-[#D2BFAF] pt-4">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-5 py-2 rounded-full bg-[#FF8A80] text-white hover:bg-red-600 transition-all duration-200 shadow-sm"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#8A7563] to-[#AD947F] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function toLocal(date) {
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 16);
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ensureAnonAuth } from "../firebase";
import { cache } from "../utils/localCache";
import { colorForService } from "../utils/colors";

import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  deleteAppointmentsForClient,
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  fetchStock,
  createStockItem,
  updateStockItem,
  deleteStockItem,
} from "../utils/firebaseAPI";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [appointments, setAppointments] = useState(() =>
    cache.get("appointments", [])
  );
  const [clients, setClients] = useState(() => cache.get("clients", []));
  const [stock, setStock] = useState(() => cache.get("stock", []));
  const [quickNotes, setQuickNotes] = useState(() =>
    cache.get("quickNotes", "")
  );
  const [view, setView] = useState(() => cache.get("view", "week"));
  const [serviceFilter, setServiceFilter] = useState(() =>
    cache.get("serviceFilter", "All")
  );

  // ===============================
  // 🚀 INITIAL LOAD
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        await ensureAnonAuth();
        const [appts, clnts, stk] = await Promise.all([
          fetchAppointments(),
          fetchClients(),
          fetchStock(),
        ]);

        const normalized = appts.map((a) => ({
          ...a,
          start: new Date(a.startISO),
          end: new Date(a.endISO),
        }));

        setAppointments(normalized);
        cache.set("appointments", normalized);
        setClients(clnts);
        cache.set("clients", clnts);
        setStock(stk);
        cache.set("stock", stk);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // ===============================
  // 💾 CACHE
  // ===============================
  useEffect(() => cache.set("quickNotes", quickNotes), [quickNotes]);
  useEffect(() => cache.set("view", view), [view]);
  useEffect(() => cache.set("serviceFilter", serviceFilter), [serviceFilter]);

  // ===============================
  // 🗓️ APPOINTMENTS
  // ===============================
  async function addAppointment(data) {
    const start = new Date(data.startISO);
    const end = new Date(data.endISO);

    const appt = {
      ...data,
      color: colorForService(data.service),
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      start,
      end,
    };

    const created = await createAppointment(appt); // ✅ Firestore write handled here
    const full = { id: created.id, ...appt };

    setAppointments((prev) => {
      const next = [...prev, full];
      cache.set("appointments", next);
      return next;
    });

    return full;
  }

  async function editAppointment(id, patch) {
    const apiPatch = { ...patch };
    if (patch.service) apiPatch.color = colorForService(patch.service);

    await updateAppointment(id, apiPatch);

    setAppointments((prev) => {
      const next = prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...patch,
              color: patch.service ? colorForService(patch.service) : a.color,
              start: patch.startISO ? new Date(patch.startISO) : a.start,
              end: patch.endISO ? new Date(patch.endISO) : a.end,
            }
          : a
      );
      cache.set("appointments", next);
      return next;
    });
  }

  async function removeAppointment(id) {
    await deleteAppointment(id); // ✅ Deletes from Firestore
    setAppointments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      cache.set("appointments", next);
      return next;
    });
  }

  // ===============================
  // 👥 CLIENTS
  // ===============================
  async function addClient(client) {
    const created = await createClient(client);
    const full = { id: created.id, ...client };

    setClients((prev) => {
      const next = [...prev, full];
      cache.set("clients", next);
      return next;
    });

    return full;
  }

  async function editClient(id, patch) {
    await updateClient(id, patch);
    setClients((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      cache.set("clients", next);
      return next;
    });
  }

  async function removeClient(id) {
    const client = clients.find((c) => c.id === id);
    if (client) {
      await deleteAppointmentsForClient(client.name);
    }
    await deleteClient(id);

    setClients((prev) => {
      const next = prev.filter((c) => c.id !== id);
      cache.set("clients", next);
      return next;
    });

    setAppointments((prev) => {
      const next = prev.filter((a) => a.clientName !== client?.name);
      cache.set("appointments", next);
      return next;
    });
  }

  // ===============================
  // 📦 STOCK
  // ===============================
  async function addStockItem(item) {
    const created = await createStockItem(item);
    const full = { id: created.id, ...item };
    setStock((prev) => {
      const next = [...prev, full];
      cache.set("stock", next);
      return next;
    });
    return full;
  }

  async function editStockItem(id, patch) {
    await updateStockItem(id, patch);
    setStock((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      cache.set("stock", next);
      return next;
    });
  }

  async function removeStockItem(id) {
    await deleteStockItem(id);
    setStock((prev) => {
      const next = prev.filter((s) => s.id !== id);
      cache.set("stock", next);
      return next;
    });
  }

  // ===============================
  // 📅 FILTERED APPOINTMENTS
  // ===============================
  const filteredAppointments = useMemo(() => {
    return serviceFilter === "All"
      ? appointments
      : appointments.filter((a) => a.service === serviceFilter);
  }, [appointments, serviceFilter]);

  // ===============================
  // PROVIDER VALUE
  // ===============================
  const value = {
    ready,
    appointments: filteredAppointments,
    allAppointments: appointments,
    clients,
    stock,
    quickNotes,
    setQuickNotes,
    view,
    setView,
    serviceFilter,
    setServiceFilter,
    addAppointment,
    editAppointment,
    removeAppointment,
    addClient,
    editClient,
    removeClient,
    addStockItem,
    editStockItem,
    removeStockItem,
    setAppointments, // ✅ added for CalendarView sync
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

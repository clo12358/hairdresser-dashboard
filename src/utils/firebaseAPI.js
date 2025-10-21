import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

// ===============================
// 🗓️ APPOINTMENTS
// ===============================
export async function fetchAppointments() {
  const q = query(collection(db, "appointments"), orderBy("startISO", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createAppointment(appt) {
  const withMeta = {
    ...appt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "appointments"), withMeta);
  return { id: ref.id, ...appt };
}

export async function updateAppointment(id, patch) {
  patch.updatedAt = serverTimestamp();
  await updateDoc(doc(db, "appointments", id), patch);
}

export async function deleteAppointment(id) {
  await deleteDoc(doc(db, "appointments", id));
}

// 🔥 NEW: Delete all appointments for a specific client
export async function deleteAppointmentsForClient(clientName) {
  const q = query(collection(db, "appointments"), where("clientName", "==", clientName));
  const snap = await getDocs(q);
  const deletes = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);
}

// ===============================
// 👥 CLIENTS
// ===============================
export async function fetchClients() {
  const snap = await getDocs(collection(db, "clients"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createClient(client) {
  const withMeta = {
    ...client,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "clients"), withMeta);
  return { id: ref.id, ...client };
}

export async function updateClient(id, patch) {
  patch.updatedAt = serverTimestamp();
  await updateDoc(doc(db, "clients", id), patch);
}

export async function deleteClient(id) {
  await deleteDoc(doc(db, "clients", id));
}

// ===============================
// 📦 STOCK
// ===============================
export async function fetchStock() {
  const snap = await getDocs(collection(db, "stock"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createStockItem(item) {
  const withMeta = {
    ...item,
    lastUpdatedISO: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "stock"), withMeta);
  return { id: ref.id, ...item };
}

export async function updateStockItem(id, patch) {
  patch.updatedAt = serverTimestamp();
  if (!patch.lastUpdatedISO) patch.lastUpdatedISO = new Date().toISOString();
  await updateDoc(doc(db, "stock", id), patch);
}

export async function deleteStockItem(id) {
  await deleteDoc(doc(db, "stock", id));
}

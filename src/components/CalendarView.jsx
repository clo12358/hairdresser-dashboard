import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enIE from "date-fns/locale/en-IE";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import AppointmentForm from "./AppointmentForm";
import { db } from "../firebase"; // ✅ your Firebase config file
import { doc, deleteDoc } from "firebase/firestore"; // ✅ import Firestore delete
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-IE": enIE };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarView() {
  const { appointments, setAppointments } = useApp(); // ✅ make sure setAppointments is exposed in AppContext
  const [modalState, setModalState] = useState(null);
  const [view, setView] = useState("day");
  const [date, setDate] = useState(new Date());

  // ✅ Force Day view on mount
  useEffect(() => setView("day"), []);

  // ✅ Prepare calendar events
  const events = useMemo(
    () =>
      appointments.map((a) => ({
        ...a,
        title: a.clientName || "No client",
        service: a.service || "No service",
        start: new Date(a.startISO),
        end: new Date(a.endISO),
        allDay: false,
      })),
    [appointments]
  );

  // ✅ Custom event card
  function EventCard({ event }) {
    return (
      <div className="p-1">
        <div className="font-semibold text-sm leading-tight text-[#3B2F2F]">
          {event.clientName || event.title}
        </div>
        <div className="text-xs text-[#5C4B3A] opacity-90 truncate">
          {event.service}
        </div>
      </div>
    );
  }

  // ✅ Style events visually
  function eventStyleGetter(event) {
    return {
      style: {
        background:
          event.color || "linear-gradient(135deg, #D2BFAF 0%, #AD947F 100%)",
        color: "#3B2F2F",
        borderRadius: "10px",
        border: "1px solid #8A7563",
        padding: "4px 6px",
        fontWeight: 500,
        boxShadow: "0 4px 10px rgba(138, 117, 99, 0.2)",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      },
    };
  }

  // ✅ Toolbar with navigation & views
  function CustomToolbar({ label, onNavigate, onView, view }) {
    const navBtn =
      "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#D2BFAF] text-[#3B2F2F] hover:bg-[#AD947F] transition-all duration-200 text-sm sm:text-base";
    const viewBtn =
      "px-2 sm:px-4 h-8 sm:h-10 rounded-full bg-[#F1DCC3] text-[#3B2F2F] hover:bg-[#D2BFAF] transition-all duration-200 capitalize text-xs sm:text-sm";

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mb-4 sm:mb-6 pb-3 border-b border-[#D2BFAF]">
        {/* Navigation */}
        <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
          <button
            onClick={() => onNavigate("PREV")}
            className={navBtn}
            title="Previous"
          >
            ‹
          </button>
          <button
            onClick={() => onNavigate("TODAY")}
            className="px-4 sm:px-6 h-8 sm:h-10 rounded-full bg-[#8A7563] text-[#F9F4ED] font-semibold hover:bg-[#AD947F] transition-all duration-200 text-xs sm:text-base"
          >
            Today
          </button>
          <button
            onClick={() => onNavigate("NEXT")}
            className={navBtn}
            title="Next"
          >
            ›
          </button>
        </div>

        {/* Label */}
        <h3 className="text-lg sm:text-2xl font-bold text-[#3B2F2F] order-1 sm:order-2">
          {label}
        </h3>

        {/* View Switcher */}
        <div className="flex gap-1 sm:gap-2 order-3">
          {["month", "week", "day"].map((viewName) => (
            <button
              key={viewName}
              onClick={() => onView(viewName)}
              className={`${viewBtn} ${
                view === viewName ? "bg-[#D2BFAF] font-semibold" : ""
              }`}
            >
              {viewName}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Function to delete an appointment
  async function handleDeleteAppointment(appointmentId) {
    if (!appointmentId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );
    if (!confirmDelete) return;

    try {
      // 🔥 Delete from Firestore
      await deleteDoc(doc(db, "appointments", appointmentId));

      // ✅ Update local state instantly
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment. Please try again.");
    }
  }

  return (
    <div className="w-full mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3B2F2F]">
          Appointments
        </h2>
        <button
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#8A7563] text-[#F9F4ED] font-semibold hover:bg-[#AD947F] transition-all duration-200 shadow-md text-sm sm:text-base"
          onClick={() => setModalState({})}
        >
          + New Appointment
        </button>
      </div>

      {/* Calendar */}
      <div
        className="rounded-2xl sm:rounded-3xl border border-[#D2BFAF] bg-[#F9F4ED] p-3 sm:p-6 shadow-lg"
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="day"
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          views={["day", "week", "month"]}
          selectable
          step={30}
          timeslots={2}
          popup
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 21, 0, 0)}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: (props) => <CustomToolbar {...props} view={view} />,
            event: (props) => (
              <div
                onDoubleClick={() => handleDeleteAppointment(props.event.id)} // ✅ double click to delete
                title="Double-click to delete"
              >
                <EventCard {...props} />
              </div>
            ),
          }}
          style={{
            height:
              window.innerWidth < 640
                ? "500px"
                : window.innerWidth < 1024
                ? "600px"
                : "700px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: window.innerWidth < 640 ? "8px" : "12px",
          }}
          onSelectSlot={(slotInfo) => setModalState({ slotInfo })}
          onSelectEvent={(existing) => setModalState({ existing })}
        />
      </div>

      {/* Modal for creating/editing */}
      {modalState && (
        <AppointmentForm
          slotInfo={modalState.slotInfo}
          existing={modalState.existing}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}

import { useEffect } from 'react';
import { differenceInMinutes, isToday } from 'date-fns';
import { useApp } from '../context/AppContext';

export default function NotificationManager() {
  const { allAppointments } = useApp();

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const timers = [];
    allAppointments.filter(a => isToday(a.start)).forEach(a => {
      const mins = differenceInMinutes(a.start, new Date());
      const msBefore = (mins - 10) * 60000; // 10 minutes before
      if (msBefore > 0) {
        const t = setTimeout(() => {
          new Notification(`Upcoming: ${a.title}`, {
            body: `${a.clientName} at ${a.start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`
          });
        }, msBefore);
        timers.push(t);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [allAppointments]);

  return null;
}

/**
 * functions/index.js
 * Sends notifications 15 minutes before each appointment start time.
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ⏰ Run every minute to check upcoming appointments
exports.sendUpcomingAppointmentReminders = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

    console.log("Checking for appointments between", now, "and", fifteenMinutesLater);

    try {
      // Query appointments starting within the next 15 minutes
      const appointmentsRef = db.collection("appointments");
      const snapshot = await appointmentsRef
        .where("startISO", ">=", now.toISOString())
        .where("startISO", "<=", fifteenMinutesLater.toISOString())
        .get();

      if (snapshot.empty) {
        console.log("No upcoming appointments in 15 minutes.");
        return null;
      }

      // Get all saved FCM tokens
      const tokensSnap = await db.collection("tokens").get();
      const tokens = tokensSnap.docs.map((doc) => doc.data().token);

      if (!tokens.length) {
        console.log("⚠️ No tokens found — skipping notifications.");
        return null;
      }

      // Send a notification for each appointment found
      const messages = snapshot.docs.map((doc) => {
        const appt = doc.data();
        return {
          notification: {
            title: "💇 Appointment Reminder",
            body: `${appt.clientName} has an appointment for ${appt.service} in 15 minutes.`,
          },
          tokens,
        };
      });

      for (const message of messages) {
        await messaging.sendEachForMulticast(message);
      }

      console.log(`✅ Sent reminders for ${snapshot.size} appointment(s).`);
      return null;
    } catch (err) {
      console.error("🔥 Error sending reminders:", err);
      return null;
    }
  });

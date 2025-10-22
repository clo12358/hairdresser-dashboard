importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBv53EoMvhuACYhMJpIuOp9kIhRSds90a8",
  authDomain: "kathleen.firebaseapp.com",
  projectId: "kathleen",
  messagingSenderId: "907995032351",
  appId: "1:907995032351:web:3e3b8da050d6a4e6629e2a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📬 Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

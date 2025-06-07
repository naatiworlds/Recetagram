// -----------------------------
// Firebase Messaging para Push
// -----------------------------
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Inicializa Firebase en el Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDOcNFiueudh-2fSszcqOSSjhBzL5mdo_Y",
  authDomain: "recetagram-d8ba9.firebaseapp.com",
  projectId: "recetagram-d8ba9",
  messagingSenderId: "425201033639",
  appId: "1:425201033639:web:91342b5accb1e9842f1682",
});

// Inicializa el messaging
const messaging = firebase.messaging();

// Muestra notificaciones cuando llegan en segundo plano
messaging.onBackgroundMessage(function (payload) {
  console.log(" Mensaje recibido en segundo plano:", payload);

  const notificationTitle = payload.notification.title || "Notificación";
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/images/logo.png", // Puedes cambiar el ícono
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
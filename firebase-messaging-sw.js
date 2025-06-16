// Importa los scripts necesarios desde Firebase CDN
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Configuración de Firebase (puedes reemplazar los valores directamente o cargarlos desde el environment si haces build dinámico)
firebase.initializeApp({
    apiKey: "TU_API_KEY",
    authDomain: "pawcareapp-c64ee.firebaseapp.com",
    projectId: "pawcareapp-c64ee",
    storageBucket: "pawcareapp-c64ee.appspot.com",
    messagingSenderId: "TU_MESSAGING_ID",
    appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXX",
    measurementId: "G-XXXXXXXXXX" 
});

// Inicializa Firebase Messaging
const messaging = firebase.messaging();

// Manejo de notificaciones en segundo plano
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Recibido en segundo plano:', payload);

  const notificationTitle = payload.notification?.title || 'Notificación';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: 'assets/icon/icon.png' // Asegúrate de que este ícono exista
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

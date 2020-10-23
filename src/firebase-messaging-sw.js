// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyA3n47b9Kgdiy4l4ubnRMh6XGPGTJzod8c",
  authDomain: "prontoappl.firebaseapp.com",
  databaseURL: "https://prontoappl.firebaseio.com",
  projectId: "prontoappl",
  storageBucket: "prontoappl.appspot.com",
  messagingSenderId: "494375460942",
  appId: "1:494375460942:web:f55aa2ab2ca80946fbe31f",
  measurementId: "G-MB5SYLV0WJ",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
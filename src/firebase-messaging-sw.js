// This file should be placed in the root of your web app's public directory
// For Angular, this is typically in the 'src' folder

importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js")

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyAgetZuSTCipWBiRnt7y6FkG7dn0HTlHbM",
  authDomain: "svit-e610a.firebaseapp.com",
  projectId: "svit-e610a",
  storageBucket: "svit-e610a.firebasestorage.app",
  messagingSenderId: "372869535016",
  appId: "1:372869535016:web:5154218e87e5a50e3b2c1d",
  measurementId: "G-28S4HRBYGJ"
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload)

  const notification = payload.notification

  if (notification) {
    const notificationTitle = notification.title || "New Notification"
    const notificationOptions = {
      body: notification.body || "",
      icon: notification.icon || "/assets/icons/icon-72x72.png",
      badge: notification.badge || "/assets/icons/icon-72x72.png",
      data: payload.data,
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
  }
})

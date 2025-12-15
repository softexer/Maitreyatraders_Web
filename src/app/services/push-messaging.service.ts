import { Injectable, inject } from '@angular/core';
import {  getToken, onMessage } from 'firebase/messaging';
import { BehaviorSubject } from 'rxjs';
import { Messaging } from '@angular/fire/messaging';   // Angular DI token

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PushMessagingService {
 
  private messaging = inject(Messaging);
  currentMessage = new BehaviorSubject<any>(null);

  constructor() {
    this.listenToMessages();
  }

  async requestPermission() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Notification permission not granted.');
      return null;
    }

    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey
      });
      console.log('FCM Token:', token);
      return token;
    } catch (err) {
      console.error('Unable to get FCM token', err);
      return null;
    }
  }

  listenToMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received: ', payload);
      this.currentMessage.next(payload);
      this.showCustomNotification(payload);
    });
  }

  showCustomNotification(payload: any) {
    const title = payload.notification?.title || 'Notification';
    const body = payload.notification?.body || '';

    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
}
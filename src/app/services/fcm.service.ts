import { Injectable } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class FcmService {
  constructor(
    private messaging: Messaging,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async solicitarPermisoYGuardarToken() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('🔒 Permiso de notificaciones no concedido');
        return;
      }

      const currentToken = await getToken(this.messaging, {
        vapidKey: 'BPduUlZPbQLLYPHHxtRyd98Er9aXsRTiR3-DC4hx6srbuxF0Ehghbo9XuHkSJuK9ApGUbpjO9ThodcdMJPxIdxQ' // ← Reemplaza con tu clave VAPID
      });

      if (!currentToken) {
        console.warn('⚠️ No se pudo obtener el token FCM');
        return;
      }

      const user = this.auth.currentUser;
      if (!user) {
        console.warn('⚠️ Usuario no autenticado, no se guarda token');
        return;
      }

      const tokenRef = doc(this.firestore, `userTokens/${user.uid}`);
      await setDoc(tokenRef, {
        token: currentToken,
        uid: user.uid,
        email: user.email || null,
        timestamp: new Date()
      });

      console.log('✅ Token FCM guardado en Firestore:', currentToken);

      // Escuchar mensajes mientras la app está en primer plano
      onMessage(this.messaging, (payload) => {
        console.log('📩 Mensaje recibido en primer plano:', payload);
        // Aquí podrías mostrar un toast, alerta, etc.
      });

    } catch (error) {
      console.error('❌ Error solicitando token FCM:', error);
    }
  }
}

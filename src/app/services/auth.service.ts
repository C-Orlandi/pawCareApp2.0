import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAdmin: boolean = false;

  constructor(private auth: Auth) {}

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  recoveryPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email)
      .then(() => {
        console.log('Correo de recuperación enviado');
      })
      .catch((error) => {
        console.error('Error al enviar correo de recuperación', error);
        throw error;
      });
  }

  eliminarUsuario() {
    const user = this.auth.currentUser;
    if (user) {
      return deleteUser(user);
    } else {
      return Promise.reject('No hay usuario autenticado');
    }
  }
}
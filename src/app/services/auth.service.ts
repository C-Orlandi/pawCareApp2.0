// auth.service.ts
import { HttpClient } from '@angular/common/http';  // Importa HttpClient
import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private backendUrl = 'http://localhost:3000/api';  // Cambia por la URL de tu backend

  constructor(private auth: Auth, private http: HttpClient) {}

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
    return sendPasswordResetEmail(this.auth, email);
  }

  // Nuevo método: elimina usuario por UID desde backend (que usa Firebase Admin SDK)
  eliminarUsuarioPorUid(uid: string) {
    return this.http.delete(`${this.backendUrl}/usuarios/${uid}`);
  }

  actualizarUsuarioEnAuth(uid: string, email: string, password: string) {
  return this.http.put('http://localhost:3000/api/usuarios', {
    uid,
    email,
    password
  });
}
}
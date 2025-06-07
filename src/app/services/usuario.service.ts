// usuario.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private collectionName = 'usuarios';

  constructor(private firestore: Firestore, private authService: AuthService) {}

  getUsuarios(): Observable<Usuario[]> {
    const usuariosRef = collection(this.firestore, this.collectionName);
    return collectionData(usuariosRef, { idField: 'uid' }) as Observable<Usuario[]>;
  }

  getUsuarioPorUid(uid: string): Observable<Usuario | undefined> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${uid}`);
    return docData(usuarioDocRef, { idField: 'uid' }) as Observable<Usuario | undefined>;
  }

  crearUsuario(usuario: Usuario): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${usuario.uid}`);
    return setDoc(usuarioDocRef, usuario);
  }

  actualizarUsuario(usuario: Usuario): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${usuario.uid}`);
    const { uid, ...data } = usuario;
    return updateDoc(usuarioDocRef, data);
  }

  // Modificamos para eliminar en Firestore y luego en Firebase Auth via backend
  async eliminarUsuario(uid: string): Promise<void> {
    try {
      // Eliminar de Firestore: usuarios y duenos
      const usuarioDocRef = doc(this.firestore, `usuarios/${uid}`);
      const duenoDocRef = doc(this.firestore, `duenos/${uid}`);

      await deleteDoc(usuarioDocRef);
      await deleteDoc(duenoDocRef);

      // Eliminar de Firebase Auth via backend
      await this.authService.eliminarUsuarioPorUid(uid).toPromise();

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }
}

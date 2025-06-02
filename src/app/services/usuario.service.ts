import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private collectionName = 'usuarios';

  constructor(private firestore: Firestore) {}

  // Obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    const usuariosRef = collection(this.firestore, this.collectionName);
    return collectionData(usuariosRef, { idField: 'uid' }) as Observable<Usuario[]>;
  }

  // Obtener un usuario por UID
  getUsuarioPorUid(uid: string): Observable<Usuario | undefined> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${uid}`);
    return docData(usuarioDocRef, { idField: 'uid' }) as Observable<Usuario | undefined>;
  }

  // Crear un usuario nuevo (usa setDoc con merge: false)
  crearUsuario(usuario: Usuario): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${usuario.uid}`);
    return setDoc(usuarioDocRef, usuario);
  }

  // Actualizar usuario (sin enviar uid dentro del objeto a actualizar)
  actualizarUsuario(usuario: Usuario): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${usuario.uid}`);
    // Desestructura para eliminar uid y no actualizarlo dentro del documento
    const { uid, ...data } = usuario;
    return updateDoc(usuarioDocRef, data);
  }

  // Eliminar usuario
  eliminarUsuario(uid: string): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${uid}`);
    return deleteDoc(usuarioDocRef);
  }
}

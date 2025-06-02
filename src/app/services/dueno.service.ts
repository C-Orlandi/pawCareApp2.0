import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  deleteDoc,
  setDoc,
  query,
  where,
  DocumentReference,
  docData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Dueno } from '../interfaces/dueno';

@Injectable({
  providedIn: 'root'
})
export class DuenoService {

  private collectionName = 'duenos';

  constructor(private firestore: Firestore) {}

  // Obtener todos los dueños
  getDuenos(): Observable<Dueno[]> {
    const duenosRef = collection(this.firestore, this.collectionName);
    return collectionData(duenosRef, { idField: 'uid' }) as Observable<Dueno[]>;
  }

  // Obtener dueños por un array de UIDs
  getDuenosPorUids(uids: string[]): Observable<Dueno[]> {
    const duenosRef = collection(this.firestore, this.collectionName);
    const q = query(duenosRef, where('uid', 'in', uids));
    return collectionData(q, { idField: 'uid' }) as Observable<Dueno[]>;
  }

  // Eliminar dueño por UID
  eliminarDueno(uid: string): Promise<void> {
    const duenoDocRef = doc(this.firestore, `${this.collectionName}/${uid}`);
    return deleteDoc(duenoDocRef);
  }

  // Agregar o actualizar un dueño
  guardarDueno(dueno: Dueno): Promise<void> {
    const duenoDocRef = doc(this.firestore, `${this.collectionName}/${dueno.uid}`);
    return setDoc(duenoDocRef, dueno);
  }

  // Obtener un dueño por UID
  getDuenoPorUid(uid: string): Observable<Dueno | undefined> {
    const duenoDocRef = doc(this.firestore, `${this.collectionName}/${uid}`);
    return docData(duenoDocRef) as Observable<Dueno | undefined>;
  }
}

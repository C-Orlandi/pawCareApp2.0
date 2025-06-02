import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  constructor(private firestore: Firestore) {}

  obtenerRegistros(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'registrosMedicos');
    const q = query(ref, where('mid', '==', mid), orderBy('fechaVisita', 'desc'));
    return collectionData(q, { idField: 'rid' });
  }

  async agregarRegistro(data: any): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'registrosMedicos'), data);
    await updateDoc(doc(this.firestore, 'registrosMedicos', docRef.id), { rid: docRef.id });
    return docRef.id;
  }

  async actualizarRegistro(id: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, 'registrosMedicos', id);
    await updateDoc(docRef, data);
  }

  async eliminarRegistro(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'registrosMedicos', id));
  }

  async agregarRecordatorio(data: any): Promise<void> {
    await addDoc(collection(this.firestore, 'recordatorios'), data);
  }
}

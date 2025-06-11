import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordatorioService {
  constructor(private firestore: Firestore) {}

  // Si no existe, añade este método para filtrar por UID
  obtenerRecordatoriosPorUsuario(uid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'recordatorios');
    const q = query(ref, where('uid', '==', uid), orderBy('creadoEn', 'desc'));
    return collectionData(q, { idField: 'rid' });
  }

  // Si quieres mantener este que ya tienes para mid, ok:
  obtenerRecordatoriosPorMid(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'recordatorios');
    const q = query(ref, where('mid', '==', mid), orderBy('creadoEn', 'desc'));
    return collectionData(q, { idField: 'rid' });
  }

  async agregarRecordatorio(data: any): Promise<void> {
    const docRef = await addDoc(collection(this.firestore, 'recordatorios'), data);
    await updateDoc(doc(this.firestore, 'recordatorios', docRef.id), { rid: docRef.id });
  }

  async actualizarRecordatorio(rid: string, data: any): Promise<void> {
    const ref = doc(this.firestore, 'recordatorios', rid);
    await updateDoc(ref, data);
  }

  async eliminarRecordatorio(rid: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'recordatorios', rid));
  }
}
 
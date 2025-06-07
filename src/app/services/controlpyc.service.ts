import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControlpycService {

  constructor(private firestore: Firestore) {}

  obtenerControles(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'controlPesoCrecimiento');
    const q = query(ref, where('mid', '==', mid), orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'cid' });
  }

  async agregarControl(data: any): Promise<void> {
    const docRef = await addDoc(collection(this.firestore, 'controlPesoCrecimiento'), data);
    await updateDoc(doc(this.firestore, 'controlPesoCrecimiento', docRef.id), { cid: docRef.id });
  }

  async actualizarControl(cid: string, data: any): Promise<void> {
    const ref = doc(this.firestore, 'controlPesoCrecimiento', cid);
    await updateDoc(ref, data);
  }

  async eliminarControl(cid: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'controlPesoCrecimiento', cid));
  }
}
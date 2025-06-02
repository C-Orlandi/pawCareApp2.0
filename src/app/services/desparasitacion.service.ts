import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DesparasitacionService {
  constructor(private firestore: Firestore) {}

  obtenerDesparasitaciones(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'desparasitacionesMascotas');
    const q = query(ref, where('mid', '==', mid), orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'did' });
  }

  async agregarDesparasitacion(data: any): Promise<void> {
    const docRef = await addDoc(collection(this.firestore, 'desparasitacionesMascotas'), data);
    await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', docRef.id), { did: docRef.id });
  }

  async actualizarDesparasitacion(did: string, data: any): Promise<void> {
    const ref = doc(this.firestore, 'desparasitacionesMascotas', did);
    await updateDoc(ref, data);
  }

  async eliminarDesparasitacion(did: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'desparasitacionesMascotas', did));
  }
}

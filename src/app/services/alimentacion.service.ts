import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection, deleteDoc, doc, orderBy, query, where } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlimentacionService {

  constructor(private firestore: Firestore) {}

  obtenerAlimentacion(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'alimentacionMascotas');
    const q = query(ref, where('mid', '==', mid), orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'aid' });
  }

  async eliminarAlimentacion(aid: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'alimentacionMascotas', aid));
  }
}


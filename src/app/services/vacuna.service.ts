import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacunaService {
  
  constructor(private firestore: Firestore) {}

  obtenerVacunas(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'vacunasMascotas');
    const q = query(ref, where('mid', '==', mid), orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'vid' });
  }

  obtenerVacunasporEstadp(mid: string): Observable<any[]> {
    const vacunasRef = collection(this.firestore, 'vacunasMascotas');
    const q = query(vacunasRef,
                    where('mid', '==', mid),
                    where('estado', '==', 'aplicada'));
    return collectionData(q, { idField: 'vid' });
  }

  async agregarVacuna(data: any): Promise<void> {
    const docRef = await addDoc(collection(this.firestore, 'vacunasMascotas'), data);
    await updateDoc(doc(this.firestore, 'vacunasMascotas', docRef.id), { vid: docRef.id });
  }

  async actualizarVacuna(vid: string, data: any): Promise<void> {
    const ref = doc(this.firestore, 'vacunasMascotas', vid);
    await updateDoc(ref, data);
  }

  async eliminarVacuna(vid: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'vacunasMascotas', vid));
  }
}
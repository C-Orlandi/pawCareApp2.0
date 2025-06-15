import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DesparasitacionService {

  constructor(private firestore: Firestore) {}

  // Obtener todas las desparasitaciones de una mascota por su mid
  obtenerDesparasitaciones(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'desparasitacionesMascotas');
    const q = query(ref, where('mid', '==', mid), orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'did' });
  }

  // Obtener solo las desparasitaciones con estado "aplicada"
  obtenerDesparasitacionesPorEstado(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'desparasitacionesMascotas');
    const q = query(ref,
                    where('mid', '==', mid),
                    where('estado', '==', 'aplicada'));
    return collectionData(q, { idField: 'did' });
  }

  // Agregar nueva desparasitación
  async agregarDesparasitacion(data: any): Promise<void> {
    const docRef = await addDoc(collection(this.firestore, 'desparasitacionesMascotas'), data);
    await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', docRef.id), { did: docRef.id });
  }

  // Actualizar una desparasitación existente
  async actualizarDesparasitacion(did: string, data: any): Promise<void> {
    const ref = doc(this.firestore, 'desparasitacionesMascotas', did);
    await updateDoc(ref, data);
  }

  // Eliminar una desparasitación
  async eliminarDesparasitacion(did: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'desparasitacionesMascotas', did));
  }
}

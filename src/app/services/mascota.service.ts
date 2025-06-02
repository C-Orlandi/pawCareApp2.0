import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc, docData, query, where } from '@angular/fire/firestore';
import { Mascota } from '../interfaces/mascota';
import { Observable } from 'rxjs';
import { collectionSnapshots } from '@angular/fire/firestore/lite';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {

  private coleccion = 'mascotas';

  constructor(private firestore: Firestore) {}

  getMascotas(): Observable<Mascota[]> {
    const mascotasRef = collection(this.firestore, this.coleccion);
    return collectionData(mascotasRef, { idField: 'mid' }) as Observable<Mascota[]>;
  }

  getMascotasPorUsuario(uid: string): Observable<Mascota[]> {
    const mascotasRef = collection(this.firestore, this.coleccion);
    const q = query(mascotasRef, where('usuarioUid', '==', uid));
    return collectionData(q, { idField: 'mid' }) as Observable<Mascota[]>;
  }

  getMascotaPorId(mid: string): Observable<Mascota | undefined> {
    const mascotaDoc = doc(this.firestore, this.coleccion, mid);
    return docData(mascotaDoc, { idField: 'mid' }) as Observable<Mascota | undefined>;
  }

  crearMascota(mascota: Mascota): Promise<void> {
    const mascotaDoc = doc(this.firestore, this.coleccion, mascota.mid);
    return setDoc(mascotaDoc, mascota);
  }

  actualizarMascota(mascota: Mascota): Promise<void> {
    const mascotaDoc = doc(this.firestore, this.coleccion, mascota.mid);
    return updateDoc(mascotaDoc, { ...mascota });
  }

  eliminarMascota(mid: string): Promise<void> {
    const mascotaDoc = doc(this.firestore, this.coleccion, mid);
    return deleteDoc(mascotaDoc);
  }
}

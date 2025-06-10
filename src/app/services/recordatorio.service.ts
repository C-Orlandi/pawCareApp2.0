import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, doc, getDoc } from '@angular/fire/firestore';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecordatorioService {
  constructor(private firestore: Firestore) {}

  obtenerRecordatoriosPorMid(mid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'recordatorios');
    const q = query(ref, where('tipo', 'in', ['vacuna', 'desparasitacion', 'medicamento']));
    return collectionData(q, { idField: 'rid' }).pipe(
      switchMap((recordatorios: any[]) => {
        const filtrados$ = recordatorios.map(recordatorio =>
          this.obtenerMascotaDesdeVid(recordatorio.vid).pipe(
            map(nombreMascota => ({
              ...recordatorio,
              nombreMascota
            }))
          )
        );
        return forkJoin(filtrados$);
      }),
      map(recordatoriosConMascota =>
        recordatoriosConMascota.filter(r => r.mid === mid)
      )
    );
  }

  private obtenerMascotaDesdeVid(vid: string): Observable<string> {
    const vacunaRef = doc(this.firestore, 'vacunasMascotas', vid);
    return from(getDoc(vacunaRef)).pipe(
      switchMap(snapshotVacuna => {
        const dataVacuna: any = snapshotVacuna.data();
        if (!dataVacuna || !dataVacuna.mid) return of('Desconocido');
        const mascotaRef = doc(this.firestore, 'mascotas', dataVacuna.mid);
        return from(getDoc(mascotaRef)).pipe(
          map(snapshotMascota => {
            const dataMascota: any = snapshotMascota.data();
            return dataMascota?.nombre || 'Desconocido';
          })
        );
      })
    );
  }
}

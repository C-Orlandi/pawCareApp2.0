// recordatorios.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { RecordatorioService } from 'src/app/services/recordatorio.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { Firestore, collection, collectionData, query, where, doc, getDoc, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.page.html',
  styleUrls: ['./recordatorios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RecordatoriosPage implements OnInit {
  usuarioLogin?: string;
  uidUsuario?: string;
  recordatorios: any[] = [];
  cargando = true;

  constructor(
    private firestore: Firestore,
    private recordatorioService: RecordatorioService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.nombre;
      this.uidUsuario = usuarioParsed.uid;
      await this.cargarRecordatorios();
    }
  }

  async cargarRecordatorios() {
    try {
      const mascotasSnapshot = await getDocs(
        query(collection(this.firestore, 'mascotas'), where('uid', '==', this.uidUsuario))
      );

      const midToNombre: Record<string, string> = {};
      const mids = mascotasSnapshot.docs.map(doc => {
        midToNombre[doc.id] = doc.data()['nombre'];
        return doc.id;
      });

      const vacunasSnapshot = await getDocs(
        query(collection(this.firestore, 'vacunasMascotas'), where('mid', 'in', mids))
      );

      const vidToMid: Record<string, string> = {};
      vacunasSnapshot.docs.forEach(doc => {
        vidToMid[doc.id] = doc.data()['mid'];
      });

      const recordatoriosSnapshot = await getDocs(
        query(collection(this.firestore, 'recordatorios'))
      );

      this.recordatorios = recordatoriosSnapshot.docs
        .map(doc => {
          const data = doc.data();
          const mid = vidToMid[data['vid']];
          const nombreMascota = midToNombre[mid];
          return {
            ...data,
            rid: doc.id,
            nombreMascota
          };
        })
        .filter(r => r.nombreMascota)
        .sort((a, b) => a.nombreMascota.localeCompare(b.nombreMascota));
    } catch (error) {
      console.error('Error al cargar recordatorios:', error);
    } finally {
      this.cargando = false;
    }
  }

  formatearFrecuencia(f: string): string {
    return f.charAt(0).toUpperCase() + f.slice(1);
  }
}

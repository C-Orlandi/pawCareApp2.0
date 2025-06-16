import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, query, where, collectionData, getDocs, deleteDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AlertController,
  IonicModule,
  LoadingController,
  ModalController
} from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ModalRecordatorioComponent } from 'src/app/components/modal-recordatorio/modal-recordatorio.component';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.page.html',
  styleUrls: ['./recordatorios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class RecordatoriosPage implements OnInit {
  usuarioLogin?: string;
  uid?: string;
  recordatorios: any[] = [];

  private firestore = inject(Firestore);

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalController: ModalController,
    private http: HttpClient  
  ) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.nombre;
      this.uid = usuarioParsed.uid;
      this.cargarRecordatorios();
    }
  }

  async cargarRecordatorios() {
  if (!this.uid) return;

  const recordatoriosRef = collection(this.firestore, 'recordatorios');
  const q = query(recordatoriosRef, where('uid', '==', this.uid));

  collectionData(q, { idField: 'rid' }).subscribe(async data => {
    const recordatoriosCompletos = await Promise.all(data.map(async rec => {
      // Obtener nombre de mascota
      const mascotaSnap = await getDocs(query(
        collection(this.firestore, 'mascotas'),
        where('mid', '==', rec['mid'])
      ));
      rec['nombreMascota'] = mascotaSnap.docs[0]?.data()?.['nombre'] || 'Desconocida';

      // Determinar colección según tipo
      const col = rec['tipo'] === 'medicamento'
        ? 'medicamentosMascotas'
        : rec['tipo'] === 'vacuna'
          ? 'vacunasMascotas'
          : 'desparasitacionesMascotas';

      const snap = await getDocs(query(
        collection(this.firestore, col),
        where('rid', '==', rec['rid'])
      ));
      const docTipo = snap.docs[0]?.data();

      rec['estado'] = docTipo?.['estado'] ?? 'pendiente'; // fallback si no hay campo
      rec['dosis'] = docTipo?.['dosis'];
      rec['duracion'] = docTipo?.['duracion'];
      rec['frecuenciaHoras'] = docTipo?.['frecuenciaHoras'];
      rec['horaInicio'] = rec['fecha'];

      return rec;
    }));

    // ✅ Filtrar solo los pendientes
    this.recordatorios = recordatoriosCompletos.filter(rec => rec['estado'] === 'pendiente');
  });
}

  async abrirModalRecordatorio(recordatorio?: any) {
    const modal = await this.modalController.create({
      component: ModalRecordatorioComponent,
      componentProps: {
        recordatorioEdit: recordatorio,
        uid: this.uid
      }
    });

    modal.onDidDismiss().then(result => {
      if (result.data?.actualizado || result.data?.guardado) {
        this.cargarRecordatorios();
      }
    });

    await modal.present();
  }

  async eliminarRecordatorio(recordatorio: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar recordatorio?',
      message: `¿Seguro que deseas eliminar el recordatorio de tipo ${recordatorio.tipo}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => this.procesarEliminacion(recordatorio)
        }
      ]
    });

    await alert.present();
  }

  async procesarEliminacion(recordatorio: any) {
    const rid = recordatorio.rid;
    const tipo = recordatorio.tipo;

    const loading = await this.loadingCtrl.create({
      message: 'Eliminando...',
      spinner: 'circles',
    });

    await loading.present();

    try {
      await deleteDoc(doc(this.firestore, 'recordatorios', rid));

      if (tipo === 'vacuna') {
        await this.borrarColeccionPorRid('vacunasMascotas', rid);
        await this.borrarColeccionPorRid('vacunasRecordatorios', rid);
      } else if (tipo === 'medicamento') {
        await this.borrarColeccionPorRid('medicamentosMascotas', rid);
        await this.borrarColeccionPorRid('medicamentosRecordatorios', rid);
      } else if (tipo === 'desparasitacion') {
        await this.borrarColeccionPorRid('desparasitacionesMascotas', rid);
        await this.borrarColeccionPorRid('desparasitacionRecordatorios', rid);
      }

      await loading.dismiss();

      await Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El recordatorio ha sido eliminado correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });

      // Aquí llamas a la función para enviar correo
      this.enviarCorreoEliminacion(recordatorio);

      this.cargarRecordatorios();

    } catch (error) {
      console.error('❌ Error al eliminar recordatorio:', error);
      await loading.dismiss();

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el recordatorio.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }

  private async borrarColeccionPorRid(nombreColeccion: string, rid: string) {
    const colRef = collection(this.firestore, nombreColeccion);
    const q = query(colRef, where('rid', '==', rid));
    const snapshot = await getDocs(q);

    for (const docu of snapshot.docs) {
      await deleteDoc(docu.ref);
    }
  }

  formatearFechaHora(fecha: string): string {
  const f = new Date(fecha);
  const dia = f.getDate().toString().padStart(2, '0');
  const mes = (f.getMonth() + 1).toString().padStart(2, '0');
  const anio = f.getFullYear();
  const hora = f.getHours().toString().padStart(2, '0');
  const minutos = f.getMinutes().toString().padStart(2, '0');

  return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
}

private async enviarCorreoEliminacion(recordatorio: any) {
  // Aquí armas la info que quieres enviar
  const payload = {
    email: 'correo@usuario.com', // reemplaza por email real o dinámico si lo tienes
    asunto: 'Recordatorio eliminado',
    cuerpo: `
      Se ha eliminado el siguiente recordatorio:
      Tipo: ${recordatorio.tipo}
      Mascota: ${recordatorio.nombreMascota || 'Desconocida'}
      Fecha: ${this.formatearFechaHora(recordatorio.fecha)}
      Estado: ${recordatorio.estado}
      Detalles adicionales: ${JSON.stringify(recordatorio)}
    `
  };

  try {
    // Cambia esta URL a la de tu backend que envía correos
    await this.http.post('https://tu-backend.com/api/enviar-correo', payload).toPromise();

  } catch (error) {
    console.error('Error enviando correo eliminación:', error);
  }
}

}

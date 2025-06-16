import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DesparasitacionService } from 'src/app/services/desparasitacion.service';
import { ModalDesparasitacionComponent } from 'src/app/components/modal-desparasitacion/modal-desparasitacion.component';
import jsPDF from 'jspdf';
import { ExportarpdfService } from 'src/app/services/exportarpdf.service';
import { LoadingController } from '@ionic/angular/standalone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-desparasitacion',
  templateUrl: './desparasitacion.page.html',
  styleUrls: ['./desparasitacion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class DesparasitacionPage implements OnInit {
  desparasitaciones: any[] = [];
  mascotaSeleccionada: any;
  desparasitaciones$!: Observable<any[]>;

  constructor(
    private desparasitacionService: DesparasitacionService,
    private modalController: ModalController,
    private alertController: AlertController,
    private exportarpdf: ExportarpdfService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
      this.cargarDesparasitaciones();
    }
  }

  cargarDesparasitaciones() {
    this.desparasitaciones$ = this.desparasitacionService.obtenerDesparasitacionesPorEstado(this.mascotaSeleccionada.mid);

    this.desparasitaciones$.subscribe((data) => {
      this.desparasitaciones = data || [];
    });
  }

  async abrirModalDesparasitacion(desparasitacion?: any) {
    const modal = await this.modalController.create({
      component: ModalDesparasitacionComponent,
      componentProps: { desparasitacion, mid: this.mascotaSeleccionada.mid }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.cargarDesparasitaciones();
    });

    await modal.present();
  }

  async eliminarDesparasitacion(did: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar Desparasitación',
      message: '¿Estás seguro de eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              await this.desparasitacionService.eliminarDesparasitacion(did);
              await loading.dismiss();

              this.cargarDesparasitaciones();

              Swal.fire({
                icon: 'success',
                title: 'Registro eliminado',
                text: 'La desparasitación fue eliminada exitosamente.',
                confirmButtonText: 'OK',
                heightAuto: false
              });
            } catch (error) {
              console.error('Error al eliminar desparasitación:', error);
              await loading.dismiss();

              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al eliminar la desparasitación.',
                confirmButtonText: 'OK',
                heightAuto: false
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  formatearFechaHora(fechayhora: string): string {
    if (!fechayhora) return 'N/A';
    const dt = new Date(fechayhora);
    const fecha = dt.toLocaleDateString('es-PE');
    const horas = dt.getHours().toString().padStart(2, '0');
    const minutos = dt.getMinutes().toString().padStart(2, '0');
    return `${fecha} ${horas}:${minutos}`;
  }

  exportarPDF() {
    if (!this.desparasitaciones || this.desparasitaciones.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin historial',
        text: 'No hay registros de desparasitación para exportar.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    this.exportarpdf.exportarDesparasitaciones(
      this.desparasitaciones,
      this.mascotaSeleccionada?.nombre,
      this.formatearFechaHora
    );
  }
}


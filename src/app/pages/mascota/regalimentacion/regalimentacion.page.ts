import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ModalAlimentacionComponent } from 'src/app/components/modal-alimentacion/modal-alimentacion.component';
import { AlimentacionService } from 'src/app/services/alimentacion.service';
import { ExportarpdfService } from 'src/app/services/exportarpdf.service';
import Swal from 'sweetalert2';
import { LoadingController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-regalimentacion',
  templateUrl: './regalimentacion.page.html',
  styleUrls: ['./regalimentacion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RegalimentacionPage implements OnInit {
  alimentaciones$!: Observable<any[]>;
  alimentaciones: any[] = [];
  mascotaSeleccionada: any;

  constructor(
    private alimentacionService: AlimentacionService,
    private modalController: ModalController,
    private alertController: AlertController,
    private exportarpdf: ExportarpdfService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
      this.cargarAlimentacion();
    }
  }

  cargarAlimentacion() {
    this.alimentaciones$ = this.alimentacionService.obtenerAlimentacion(this.mascotaSeleccionada.mid);
    this.alimentaciones$.subscribe(data => this.alimentaciones = data || []);
  }

  async abrirModalAlimentacion(alimentacion?: any) {
    const modal = await this.modalController.create({
      component: ModalAlimentacionComponent,
      componentProps: { alimentacion, mid: this.mascotaSeleccionada.mid }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.cargarAlimentacion();
    });

    await modal.present();
  }

  async eliminarAlimentacion(aid: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar Registro',
      message: '¿Deseas eliminar este registro de alimentación?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...',
              spinner: 'circles',
            });
            await loading.present();

            try {
              await this.alimentacionService.eliminarAlimentacion(aid);
              await loading.dismiss();

              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Registro eliminado exitosamente.',
                confirmButtonText: 'OK',
                heightAuto: false,
              });

              this.cargarAlimentacion();
            } catch (error) {
              await loading.dismiss();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el registro.',
                confirmButtonText: 'OK',
                heightAuto: false,
              });
              console.error('Error eliminando registro:', error);
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
    const fecha = dt.toLocaleDateString('es-CL');
    const horas = dt.getHours().toString().padStart(2, '0');
    const minutos = dt.getMinutes().toString().padStart(2, '0');
    return `${fecha} ${horas}:${minutos}`;
  }

  exportarPDF() {
    if (this.alimentaciones.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin historial',
        text: 'No hay registros de alimentación para exportar.',
        confirmButtonText: 'OK',
        heightAuto: false,
      });
      return;
    }

    this.exportarpdf.exportarAlimentacion(
      this.alimentaciones,
      this.mascotaSeleccionada?.nombre,
      this.formatearFechaHora
    );
  }

}

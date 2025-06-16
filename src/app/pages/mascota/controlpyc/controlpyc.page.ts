import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ControlpycService } from 'src/app/services/controlpyc.service';
import { ModalControlpycComponent } from 'src/app/components/modal-controlpyc/modal-controlpyc.component';
import { ExportarpdfService } from 'src/app/services/exportarpdf.service';
import { LoadingController } from '@ionic/angular/standalone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-controlpyc',
  templateUrl: './controlpyc.page.html',
  styleUrls: ['./controlpyc.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ControlpycPage implements OnInit {
  controles$!: Observable<any[]>;
  controles: any[] = [];
  mascotaSeleccionada: any;

  constructor(
    private controlService: ControlpycService,
    private modalController: ModalController,
    private alertController: AlertController,
    private exportarpdf: ExportarpdfService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
      this.cargarControles();
    }
  }

  cargarControles() {
    this.controles$ = this.controlService.obtenerControles(this.mascotaSeleccionada.mid);
    this.controles$.subscribe((data) => {
      this.controles = data || [];
    });
  }

  async abrirModalControl(control?: any) {
    const modal = await this.modalController.create({
      component: ModalControlpycComponent,
      componentProps: { control, mid: this.mascotaSeleccionada.mid }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.cargarControles();
    });

    await modal.present();
  }

  async eliminarControl(cid: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar Registro',
      message: '¿Deseas eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...',
              spinner: 'crescent',
            });
            await loading.present();

            try {
              await this.controlService.eliminarControl(cid);
              this.cargarControles();

              await loading.dismiss();
              Swal.fire({
                icon: 'success',
                title: 'Registro eliminado',
                text: 'El registro fue eliminado correctamente.',
                confirmButtonText: 'OK',
                heightAuto: false
              });
            } catch (error) {
              await loading.dismiss();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el registro.',
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
    const fecha = dt.toLocaleDateString('es-CL');
    const horas = dt.getHours().toString().padStart(2, '0');
    const minutos = dt.getMinutes().toString().padStart(2, '0');
    return `${fecha} ${horas}:${minutos}`;
  }

  exportarPDF() {
    this.exportarpdf.exportarControles(this.controles, this.mascotaSeleccionada?.nombre, this.formatearFechaHora);
  }
}

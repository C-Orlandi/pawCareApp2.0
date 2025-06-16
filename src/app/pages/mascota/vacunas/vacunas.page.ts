import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AlertController, IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { VacunaService } from 'src/app/services/vacuna.service';
import { ModalVacunaComponent } from 'src/app/components/modal-vacuna/modal-vacuna.component';
import jsPDF from 'jspdf';
import { ExportarpdfService } from 'src/app/services/exportarpdf.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vacunas',
  templateUrl: './vacunas.page.html',
  styleUrls: ['./vacunas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class VacunasPage implements OnInit {
  vacunas$!: Observable<any[]>;
  mascotaSeleccionada: any;
  vacunas: any[] = [];

  constructor(
    private vacunaService: VacunaService,
    private modalController: ModalController,
    private alertController: AlertController,
    private exportarpdf: ExportarpdfService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
      this.cargarVacunas();
    }
  }

  cargarVacunas() {
    this.vacunas$ = this.vacunaService.obtenerVacunasporEstadp(this.mascotaSeleccionada.mid);

    this.vacunas$.subscribe((vacunasData) => {
      this.vacunas = vacunasData || [];
    });
  }


  async abrirModalVacuna(vacuna?: any) {
    const modal = await this.modalController.create({
      component: ModalVacunaComponent,
      componentProps: { vacuna, mid: this.mascotaSeleccionada.mid }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.cargarVacunas();
    });

    await modal.present();
  }

  async eliminarVacuna(vid: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar Vacuna',
      message: '¿Estás seguro de eliminar esta vacuna?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...',
              spinner: 'circles'
            });
            await loading.present();

            try {
              await this.vacunaService.eliminarVacuna(vid);
              this.cargarVacunas();
              await loading.dismiss();

              Swal.fire({
                icon: 'success',
                title: 'Eliminación Exitosa',
                text: 'La vacuna ha sido eliminada correctamente.',
                confirmButtonText: 'OK',
                heightAuto: false
              });
            } catch (error) {
              await loading.dismiss();
              Swal.fire({
                icon: 'error',
                title: 'Error al eliminar',
                text: 'Ocurrió un error al eliminar la vacuna.',
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
   const fecha = dt.toLocaleDateString('es-PE'); // o 'es-ES' según preferencia
   const horas = dt.getHours().toString().padStart(2, '0');
   const minutos = dt.getMinutes().toString().padStart(2, '0');
   return `${fecha} ${horas}:${minutos}`;  // ej: 10/06/2025 1345
  }

  exportarPDF() {
    if (!this.vacunas || this.vacunas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Historial',
        text: 'No hay vacunas registradas para exportar.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    this.exportarpdf.exportarVacunas(this.vacunas, this.mascotaSeleccionada?.nombre, this.formatearFechaHora);
  }

}



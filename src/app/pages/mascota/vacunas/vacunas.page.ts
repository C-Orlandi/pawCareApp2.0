import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { VacunaService } from 'src/app/services/vacuna.service';
import { ModalVacunaComponent } from 'src/app/components/modal-vacuna/modal-vacuna.component';

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

  constructor(
    private vacunaService: VacunaService,
    private modalController: ModalController,
    private alertController: AlertController
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
            await this.vacunaService.eliminarVacuna(vid);
            this.cargarVacunas();
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
}
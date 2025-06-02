import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ModalDesparasitacionComponent } from 'src/app/components/modal-desparasitacion/modal-desparasitacion.component';
import { DesparasitacionService } from 'src/app/services/desparasitacion.service';

@Component({
  selector: 'app-desparasitacion',
  templateUrl: './desparasitacion.page.html',
  styleUrls: ['./desparasitacion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class DesparasitacionPage implements OnInit {
  desparasitaciones$!: Observable<any[]>;
  mascotaSeleccionada: any;

  constructor(
    private desparasitacionService: DesparasitacionService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
      this.cargarDesparasitaciones();
    }
  }

  cargarDesparasitaciones() {
    this.desparasitaciones$ = this.desparasitacionService.obtenerDesparasitaciones(this.mascotaSeleccionada.mid);
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
      message: '¿Estás seguro de eliminar esta desparasitación?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.desparasitacionService.eliminarDesparasitacion(did);
            this.cargarDesparasitaciones();
          }
        }
      ]
    });

    await alert.present();
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString();
  }
}
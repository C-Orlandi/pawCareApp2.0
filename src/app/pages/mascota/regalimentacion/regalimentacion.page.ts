import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ModalAlimentacionComponent } from 'src/app/components/modal-alimentacion/modal-alimentacion.component';
import { AlimentacionService } from 'src/app/services/alimentacion.service';

@Component({
  selector: 'app-regalimentacion',
  templateUrl: './regalimentacion.page.html',
  styleUrls: ['./regalimentacion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule]
})
export class RegalimentacionPage implements OnInit {
  
  alimentaciones$!: Observable<any[]>;
  mascotaSeleccionada: any;

  constructor(
    private alimentacionService: AlimentacionService,
    private modalController: ModalController,
    private alertController: AlertController
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
            await this.alimentacionService.eliminarAlimentacion(aid);
            this.cargarAlimentacion();
          }
        }
      ]
    });

    await alert.present();
  }
}
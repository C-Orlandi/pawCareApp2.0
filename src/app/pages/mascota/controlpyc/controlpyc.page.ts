import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { ControlpycService } from 'src/app/services/controlpyc.service';
import { ModalControlpycComponent } from 'src/app/components/modal-controlpyc/modal-controlpyc.component';

@Component({
  selector: 'app-controlpyc',
  templateUrl: './controlpyc.page.html',
  styleUrls: ['./controlpyc.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ControlpycPage implements OnInit {

  controles$!: Observable<any[]>;
  mascotaSeleccionada: any;

  constructor(
    private controlService: ControlpycService,
    private modalController: ModalController,
    private alertController: AlertController
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
            await this.controlService.eliminarControl(cid);
            this.cargarControles();
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
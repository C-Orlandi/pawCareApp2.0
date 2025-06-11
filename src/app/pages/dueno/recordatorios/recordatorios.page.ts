import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { RecordatorioService } from 'src/app/services/recordatorio.service';
import { ModalRecordatorioComponent } from 'src/app/components/modal-recordatorio/modal-recordatorio.component';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.page.html',
  styleUrls: ['./recordatorios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RecordatoriosPage implements OnInit {
  recordatorios$!: Observable<any[]>;

  constructor(
    private recordatorioService: RecordatorioService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarRecordatorios();
  }

  cargarRecordatorios() {
    const user = getAuth().currentUser;
    if (user) {
      this.recordatorios$ = this.recordatorioService.obtenerRecordatoriosPorUsuario(user.uid);
    }
  }

  async abrirModalRecordatorio(recordatorio?: any) {
    const modal = await this.modalController.create({
      component: ModalRecordatorioComponent,
      componentProps: { recordatorio }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.cargarRecordatorios();
    });

    await modal.present();
  }

  async eliminarRecordatorio(rid: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar Recordatorio',
      message: '¿Estás seguro de eliminar este recordatorio?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.recordatorioService.eliminarRecordatorio(rid);
            this.cargarRecordatorios();
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

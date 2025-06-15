import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Observable, firstValueFrom } from 'rxjs';
import { ModalAlimentacionComponent } from 'src/app/components/modal-alimentacion/modal-alimentacion.component';
import { AlimentacionService } from 'src/app/services/alimentacion.service';
import { ExportarpdfService } from 'src/app/services/exportarpdf.service';

@Component({
  selector: 'app-regalimentacion',
  templateUrl: './regalimentacion.page.html',
  styleUrls: ['./regalimentacion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule]
})
export class RegalimentacionPage implements OnInit {
  alimentaciones$!: Observable<any[]>;
  alimentaciones: any[] = [];
  mascotaSeleccionada: any;

  constructor(
    private alimentacionService: AlimentacionService,
    private modalController: ModalController,
    private alertController: AlertController,
    private exportarpdf: ExportarpdfService
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
    this.alimentaciones$.subscribe(data => {
      this.alimentaciones = data.map(item => ({
        ...item,
        horaFormateada: this.formatearFechaHora(item.fecha)
      }));
    });
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

  formatearFechaHora(fechayhora: string): string {
    if (!fechayhora) return 'N/A';
    const dt = new Date(fechayhora);
    const fecha = dt.toLocaleDateString('es-CL');
    const horas = dt.getHours().toString().padStart(2, '0');
    const minutos = dt.getMinutes().toString().padStart(2, '0');
    return `${fecha} ${horas}:${minutos}`;
  }

  exportarPDF() {
    firstValueFrom(this.alimentaciones$).then(alimentaciones => {
      this.exportarpdf.exportarAlimentacion(
        alimentaciones,
        this.mascotaSeleccionada?.nombre,
        this.formatearFechaHora
      );
    });
  }
}

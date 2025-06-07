import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { MascotaService } from '../../../services/mascota.service';
import { DuenoService } from 'src/app/services/dueno.service';
import { Mascota } from 'src/app/interfaces/mascota';
import { Dueno } from 'src/app/interfaces/dueno';
import { ModalMascotaComponent } from 'src/app/components/modal-mascota/modal-mascota.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestionar-mascota',
  templateUrl: './gestionar-mascota.page.html',
  styleUrls: ['./gestionar-mascota.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class GestionarMascotaPage implements OnInit {
  mascotas: any[] = [];
  duenosMap = new Map<string, string>();

  constructor(
    private mascotaService: MascotaService,
    private duenoService: DuenoService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.duenoService.getDuenos().subscribe(duenos => {
      this.duenosMap.clear();
      duenos.forEach(d => {
        this.duenosMap.set(d.uid, d.nombre);
      });

      this.mascotaService.getMascotas().subscribe(mascotas => {
        this.mascotas = mascotas.map(m => ({
          ...m,
          nombreDueno: this.duenosMap.get(m.usuarioUid) || 'Desconocido'
        }));
      });
    });
  }

  async abrirModal(mascota?: Mascota) {
    const modal = await this.modalController.create({
      component: ModalMascotaComponent,
      componentProps: { mascota }
    });

    modal.onDidDismiss().then(result => {
      const mascotaModificada: Mascota = result.data;
      if (mascotaModificada) {
        if (mascota) {
          this.mascotaService.actualizarMascota(mascotaModificada);
        } else {
          this.mascotaService.crearMascota(mascotaModificada);
        }
      }
    });

    await modal.present();
  }

  eliminarMascota(mid: string) {
    if (confirm('¿Seguro que quieres eliminar esta mascota?')) {
      this.mascotaService.eliminarMascota(mid);
    }
  }
}

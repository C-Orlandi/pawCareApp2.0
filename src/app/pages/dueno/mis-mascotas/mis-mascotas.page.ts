import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule, MenuController, ActionSheetController, ToastController} from '@ionic/angular';
import { Router } from '@angular/router';
import {Firestore, collection, getDocs, query, where} from '@angular/fire/firestore';
import { MascotaService } from 'src/app/services/mascota.service'; 

@Component({
  selector: 'app-mis-mascotas',
  templateUrl: './mis-mascotas.page.html',
  styleUrls: ['./mis-mascotas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class MisMascotasPage {
  mascotas: any[] = [];
  usuarioLogin?: any;

  constructor(
    private router: Router,
    private firestore: Firestore,
    private menuController: MenuController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private mascotaService: MascotaService
  ) {}

  ionViewWillEnter() {
    this.menuController.enable(true);
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      this.usuarioLogin = JSON.parse(usuario);
      this.cargarMascotas();
    }
  }

  async cargarMascotas() {
  try {
    if (!this.usuarioLogin?.uid) {
      console.error('UID de usuario no disponible');
      return;
    }

    this.mascotaService.getMascotasPorUsuario(this.usuarioLogin.uid).subscribe({
      next: (mascotas) => {
        this.mascotas = mascotas;
      },
      error: (err) => {
        console.error('Error al cargar mascotas desde el servicio:', err);
      },
    });
  } catch (error) {
    console.error('Error general al cargar mascotas:', error);
  }
}

  agregarMascota() {
    this.router.navigate(['/registro-mascota']);
  }

  async mostrarOpcionesMascota(mascota: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: mascota.nombre,
      buttons: [
        {
          text: 'Ver Perfil',
          icon: 'eye',
          handler: () => {
            localStorage.setItem(
              'mascotaSeleccionada',
              JSON.stringify(mascota)
            );
            this.router.navigate(['/home-mascota']);
          },
        },
        {
          text: 'Editar',
          icon: 'create',
          handler: () => {
            localStorage.setItem(
              'mascotaSeleccionada',
              JSON.stringify(mascota)
            );
            this.router.navigate(['/registro-mascota'], {
              queryParams: { modo: 'editar' },
            });
          },
        },
        {
          text: 'Eliminar',
          icon: 'trash',
          role: 'destructive',
          handler: () => this.eliminarMascota(mascota.mid),
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  async eliminarMascota(mid: string) {
    try {
      await this.mascotaService.eliminarMascota(mid);
      await this.mostrarToast('Mascota eliminada.');
      this.cargarMascotas();
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      this.mostrarToast('Error al eliminar.');
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}

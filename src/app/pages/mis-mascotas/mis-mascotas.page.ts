import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

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
    private menuController: MenuController
  ) {}

  ionViewWillEnter() {
    this.menuController.enable(true); // Activar menú si aplica
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      this.usuarioLogin = JSON.parse(usuario);
      this.cargarMascotas();
    }
  }

  async cargarMascotas() {
    try {
      const mascotaRef = collection(this.firestore, 'mascotas');
      const q = query(mascotaRef, where('usuarioUid', '==', this.usuarioLogin?.uid));
      const querySnapshot = await getDocs(q);
      this.mascotas = querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    }
  }

  verPerfilMascota(mascota: any) {
    localStorage.setItem('mascotaSeleccionada', JSON.stringify(mascota));
    this.router.navigate(['/home-mascota']);
  }

  agregarMascota() {
    this.router.navigate(['/registro-mascota']);
  }
}

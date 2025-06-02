import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home-mascota',
  templateUrl: './home-mascota.page.html',
  styleUrls: ['./home-mascota.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomeMascotaPage {
  mascota: any;
  esExotico = false;
  mostrarVacunas = false;

  constructor(private router: Router) {}

  ionViewWillEnter() {
    const data = localStorage.getItem('mascotaSeleccionada');
    if (data) {
      this.mascota = JSON.parse(data);
      this.esExotico = this.mascota?.categoria === 'exotico';
      this.mostrarVacunas = this.mascota?.categoria === 'domestico' || this.mascota?.tieneVacunas;
    }
  }

  goTo(pagina: string) {
    this.router.navigateByUrl(`/${pagina}`);
  }
}
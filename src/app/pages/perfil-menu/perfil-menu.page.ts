import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-perfil-menu',
  templateUrl: './perfil-menu.page.html',
  styleUrls: ['./perfil-menu.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PerfilMenuPage implements OnInit {

  usuarioLogin?: string;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.nombre;
    }
  }

  goTo(seccion: string) {
    this.router.navigate(['/' + seccion]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
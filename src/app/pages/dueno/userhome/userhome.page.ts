import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.page.html',
  styleUrls: ['./userhome.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class UserhomePage implements OnInit {

  usuarioLogin?: string;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.nombre;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goTo(seccion: string) {
    this.router.navigate(['/' + seccion]);
  }
}

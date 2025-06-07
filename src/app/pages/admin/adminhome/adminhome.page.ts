import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-adminhome',
  templateUrl: './adminhome.page.html',
  styleUrls: ['./adminhome.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AdminhomePage implements OnInit {

usuarioLogin?: string;

  constructor(private router: Router, private authService: AuthService, private navCtrl: NavController) {}

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

  goTo(route: string) {
    this.navCtrl.navigateForward(route);
  }
}

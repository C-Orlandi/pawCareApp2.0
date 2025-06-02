import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonicModule, IonLabel } from '@ionic/angular';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
  standalone: true,
  imports: [
    IonicModule,    // Aquí importas el módulo completo
    CommonModule
  ]
})
export class SplashscreenPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  console.log('Splashscreen iniciado');
    setTimeout(() => {
      console.log('Redirigiendo al login...');
      this.router.navigate(['/login']);
    }, 2000);
  }
}

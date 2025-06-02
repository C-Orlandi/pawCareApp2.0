import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestionar-dueno',
  templateUrl: './gestionar-dueno.page.html',
  styleUrls: ['./gestionar-dueno.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestionarDuenoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

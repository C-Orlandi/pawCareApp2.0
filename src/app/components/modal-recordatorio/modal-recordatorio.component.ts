import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-modal-recordatorio',
  templateUrl: './modal-recordatorio.component.html',
  styleUrls: ['./modal-recordatorio.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalRecordatorioComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}

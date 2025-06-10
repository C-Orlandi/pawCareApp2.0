// modal-recordatorio.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-recordatorio',
  templateUrl: './modal-recordatorio.component.html',
  styleUrls: ['./modal-recordatorio.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalRecordatorioComponent implements OnInit {
  @Input() nombreVacuna!: string;
  @Input() fechaVacuna!: string;

  recordatorioForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.recordatorioForm = this.fb.group({
      frecuenciaMeses: [null, [Validators.required, Validators.min(1)]],
      hora: ['08:00']
    });
  }

  guardar() {
    if (this.recordatorioForm.invalid) return;

    this.modalCtrl.dismiss({
      guardado: true,
      recordatorio: this.recordatorioForm.value
    });
  }

  cancelar() {
    this.modalCtrl.dismiss({
      guardado: false
    });
  }
}

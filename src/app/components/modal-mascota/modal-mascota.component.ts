import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Mascota } from 'src/app/interfaces/mascota';

@Component({
  selector: 'app-modal-mascota',
  templateUrl: './modal-mascota.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ModalMascotaComponent implements OnInit {
  @Input() mascota?: Mascota;

  mascotaForm!: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.mascotaForm = this.fb.group({
      nombre: [this.mascota?.nombre || '', Validators.required],
      tipo: [this.mascota?.tipo || '', Validators.required],
      raza: [this.mascota?.raza || ''],
      fechaNacimiento: [this.mascota?.fechaNacimiento || '', Validators.required],
      edad: [this.mascota?.edad || ''],
      peso: [this.mascota?.peso || ''],
      imagen: [this.mascota?.imagen || '']
    });
  }

  guardar() {
    if (this.mascotaForm.invalid) return;

    const mascotaGuardada: Mascota = {
      ...this.mascotaForm.value,
      mid: this.mascota?.mid || this.generarMID(),
      usuarioUid: this.mascota?.usuarioUid || 'desconocido'
    };

    this.modalCtrl.dismiss(mascotaGuardada);
  }

  cerrar() {
    this.modalCtrl.dismiss(false);
  }

  generarMID() {
    return Math.random().toString(36).substring(2, 10);
  }
}

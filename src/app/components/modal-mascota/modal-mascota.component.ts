import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mascota } from 'src/app/interfaces/mascota';

@Component({
  selector: 'app-modal-mascota',
  templateUrl: './modal-mascota.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalMascotaComponent implements OnInit {

  @Input() mascota?: Mascota;

  mid = '';
  nombre = '';
  tipo = '';
  raza = '';
  fechaNacimiento = '';
  edad = '';
  peso = '';
  imagen = '';
  usuarioUid = '';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.mascota) {
      this.mid = this.mascota.mid;
      this.nombre = this.mascota.nombre;
      this.tipo = this.mascota.tipo;
      this.raza = this.mascota.raza;
      this.fechaNacimiento = this.mascota.fechaNacimiento;
      this.edad = this.mascota.edad;
      this.peso = this.mascota.peso;
      this.imagen = this.mascota.imagen;
      this.usuarioUid = this.mascota.usuarioUid;
    } else {
      this.mid = this.generarMID();
    }
  }

  guardar() {
    const mascotaGuardada: Mascota = {
      mid: this.mid,
      nombre: this.nombre,
      tipo: this.tipo,
      raza: this.raza,
      fechaNacimiento: this.fechaNacimiento,
      edad: this.edad,
      peso: this.peso,
      imagen: this.imagen,
      usuarioUid: this.usuarioUid || 'desconocido'
    };

    this.modalCtrl.dismiss(mascotaGuardada);
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  generarMID() {
    return Math.random().toString(36).substring(2, 10);
  }
}

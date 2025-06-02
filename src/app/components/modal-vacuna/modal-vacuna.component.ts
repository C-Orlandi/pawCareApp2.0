import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular/standalone';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-modal-vacuna',
  templateUrl: './modal-vacuna.component.html',
  styleUrls: ['./modal-vacuna.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalVacunaComponent  implements OnInit {
  @Input() vacuna: any;
  @Input() mid!: string;

  vacunaForm: FormGroup;
  hoy: string = new Date().toISOString();

  frecuencias = [
    { label: 'Cada 3 meses', value: 3 },
    { label: 'Cada 6 meses', value: 6 },
    { label: 'Anual', value: 12 }
  ];

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.vacunaForm = this.fb.group({
      nombre: ['', Validators.required],
      dosis: [''],
      fecha: [this.hoy, Validators.required],
      frecuencia: [3, Validators.required],
      proximaDosis: [''],
      aplicada: [false]
    });
  }

  ngOnInit() {
    if (this.vacuna) {
      this.vacunaForm.patchValue(this.vacuna);
    }

    this.vacunaForm.get('fecha')?.valueChanges.subscribe(() => this.calcularProximaDosis());
    this.vacunaForm.get('frecuencia')?.valueChanges.subscribe(() => this.calcularProximaDosis());

    this.calcularProximaDosis(); // Calcular al iniciar
  }

  calcularProximaDosis() {
    const fecha = new Date(this.vacunaForm.value.fecha);
    const meses = parseInt(this.vacunaForm.value.frecuencia, 10);

    if (!isNaN(fecha.getTime()) && !isNaN(meses)) {
      fecha.setMonth(fecha.getMonth() + meses);
      this.vacunaForm.patchValue({
        proximaDosis: fecha.toISOString()
      }, { emitEvent: false });
    }
  }

  async guardarVacuna() {
    if (this.vacunaForm.invalid || !this.mid) return;

    const data = {
      ...this.vacunaForm.value,
      mid: this.mid,
      creadaEn: new Date()
    };

    try {
      if (this.vacuna?.vid) {
        await updateDoc(doc(this.firestore, 'vacunasMascotas', this.vacuna.vid), data);
        this.presentToast('Vacuna actualizada');
      } else {
        const docRef = await addDoc(collection(this.firestore, 'vacunasMascotas'), data);
        await updateDoc(doc(this.firestore, 'vacunasMascotas', docRef.id), { vid: docRef.id });
        this.presentToast('Vacuna guardada');
      }

      this.modalController.dismiss(true);
    } catch (error) {
      console.error('Error al guardar vacuna:', error);
      this.presentToast('Error al guardar la vacuna');
    }
  }

  cerrar() {
    this.modalController.dismiss(false);
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }
}
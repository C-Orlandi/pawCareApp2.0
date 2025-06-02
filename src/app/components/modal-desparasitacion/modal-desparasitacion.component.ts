import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular/standalone';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-modal-desparasitacion',
  templateUrl: './modal-desparasitacion.component.html',
  styleUrls: ['./modal-desparasitacion.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class ModalDesparasitacionComponent  implements OnInit {
  @Input() desparasitacion: any;
  @Input() mid!: string;

  desparasitacionForm: FormGroup;
  hoy: string = new Date().toISOString();

  frecuencias = [
    { label: 'Cada 1 mes', value: 1 },
    { label: 'Cada 3 meses', value: 3 },
    { label: 'Cada 6 meses', value: 6 }
  ];

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.desparasitacionForm = this.fb.group({
      nombre: ['', Validators.required],
      dosis: [''],
      fecha: [this.hoy, Validators.required],
      frecuencia: [3, Validators.required],
      proximaDosis: [''],
      aplicada: [false]
    });
  }

  ngOnInit() {
    if (this.desparasitacion) {
      this.desparasitacionForm.patchValue(this.desparasitacion);
    }

    this.desparasitacionForm.get('fecha')?.valueChanges.subscribe(() => this.calcularProximaDosis());
    this.desparasitacionForm.get('frecuencia')?.valueChanges.subscribe(() => this.calcularProximaDosis());

    this.calcularProximaDosis();
  }

  calcularProximaDosis() {
    const fecha = new Date(this.desparasitacionForm.value.fecha);
    const meses = parseInt(this.desparasitacionForm.value.frecuencia, 10);

    if (!isNaN(fecha.getTime()) && !isNaN(meses)) {
      fecha.setMonth(fecha.getMonth() + meses);
      this.desparasitacionForm.patchValue({
        proximaDosis: fecha.toISOString()
      }, { emitEvent: false });
    }
  }

  async guardarDesparasitacion() {
    if (this.desparasitacionForm.invalid || !this.mid) return;

    const data = {
      ...this.desparasitacionForm.value,
      mid: this.mid,
      creadaEn: new Date()
    };

    try {
      if (this.desparasitacion?.did) {
        await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', this.desparasitacion.did), data);
        this.presentToast('Registro actualizado');
      } else {
        const docRef = await addDoc(collection(this.firestore, 'desparasitacionesMascotas'), data);
        await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', docRef.id), { did: docRef.id });
        this.presentToast('Registro guardado');
      }

      this.modalController.dismiss(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      this.presentToast('Error al guardar el registro');
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
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular/standalone';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-modal-alimentacion',
  templateUrl: './modal-alimentacion.component.html',
  styleUrls: ['./modal-alimentacion.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalAlimentacionComponent  implements OnInit {

  @Input() alimentacion: any;
  @Input() mid!: string;

  alimentacionForm: FormGroup;
  hoy = new Date().toISOString();

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.alimentacionForm = this.fb.group({
      fecha: [this.hoy, Validators.required],
      tipoAlimento: ['', Validators.required],
      nombreAlimento: ['', Validators.required],
      cantidad: ['', Validators.required],
      metodo: ['', Validators.required],
      comio: ['true', Validators.required],
      obsDigestivas: [''],
      obsAdicionales: ['']
    });
  }

  ngOnInit() {
    if (this.alimentacion) {
      this.alimentacionForm.patchValue(this.alimentacion);
    }
  }

  async guardarAlimentacion() {
    if (this.alimentacionForm.invalid) return;

    const data = {
      ...this.alimentacionForm.value,
      mid: this.mid,
      comio: this.alimentacionForm.value.comio === 'true',
      creadaEn: new Date()
    };

    try {
      if (this.alimentacion?.aid) {
        await updateDoc(doc(this.firestore, 'alimentacionMascotas', this.alimentacion.aid), data);
        this.presentToast('Registro actualizado');
      } else {
        const docRef = await addDoc(collection(this.firestore, 'alimentacionMascotas'), data);
        await updateDoc(doc(this.firestore, 'alimentacionMascotas', docRef.id), { aid: docRef.id });
        this.presentToast('Registro guardado');
      }

      this.modalController.dismiss(true);
    } catch (error) {
      console.error('Error al guardar registro de alimentación:', error);
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
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular/standalone';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';

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
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {

    this.alimentacionForm = this.fb.group({
      fecha: [this.hoy, Validators.required],
      tipoAlimento: ['', Validators.required],
      nombreAlimento: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$')]],
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]+([.,][0-9]+)?\\s?(g|kg)?$')]],
      metodo: ['', Validators.required],
      comio: ['true', Validators.required],
      obsAdicionales: ['', Validators.minLength(3)]
    });
  }

  ngOnInit() {
    if (this.alimentacion) {
      this.alimentacionForm.patchValue(this.alimentacion);
    }
  }

  async guardarAlimentacion() {
    if (this.alimentacionForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    const data = {
      ...this.alimentacionForm.value,
      mid: this.mid,
      comio: this.alimentacionForm.value.comio === 'true',
      creadaEn: new Date()
    };

    try {
      if (this.alimentacion?.aid) {
        await updateDoc(doc(this.firestore, 'alimentacionMascotas', this.alimentacion.aid), data);
      } else {
        const docRef = await addDoc(collection(this.firestore, 'alimentacionMascotas'), data);
        await updateDoc(doc(this.firestore, 'alimentacionMascotas', docRef.id), { aid: docRef.id });
      }

      await loading.dismiss();

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Registro de alimentación guardado correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => {
        this.modalController.dismiss(true);
      });

    } catch (error: any) {
      console.error('🔥 Error al guardar registro:', error);
      await loading.dismiss();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar el registro. Inténtalo nuevamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
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
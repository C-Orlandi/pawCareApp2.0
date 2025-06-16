import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Firestore, collection, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import { EmailService } from 'src/app/services/email.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { LoadingController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-modal-desparasitacion',
  templateUrl: './modal-desparasitacion.component.html',
  styleUrls: ['./modal-desparasitacion.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalDesparasitacionComponent implements OnInit {
  @Input() mid!: string;
  @Input() desparasitacion: any;

  usuarioLogin?: string;
  desparasitacionForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private emailService: EmailService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    
  this.desparasitacionForm = this.fb.group({
  nombre: [
    '',
    [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
    ]
  ],
  fechaHora: ['', Validators.required],
});


    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.uid;
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }

  async guardarDesparasitacion() {
    if (this.desparasitacionForm.invalid || !this.mid) {
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
      message: 'Guardando...',
      spinner: 'circles'
    });
    await loading.present();

    const formValue = this.desparasitacionForm.value;
    const formData = {
      nombre: formValue.nombre,
      fechayhora: formValue.fechaHora,
      mid: this.mid,
      uid: this.usuarioLogin || 'desconocido',
      creadaEn: new Date(),
      estado: 'aplicada',
    };

    try {
      let idDesp = '';

      if (this.desparasitacion?.id_desp) {
        await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', this.desparasitacion.id_desp), formData);
        idDesp = this.desparasitacion.id_desp;
      } else {
        const docRef = await addDoc(collection(this.firestore, 'desparasitacionesMascotas'), formData);
        idDesp = docRef.id;
        await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', idDesp), { id_desp: idDesp });
      }

      await loading.dismiss();

      Swal.fire({
        icon: 'success',
        title: 'Registro Exitoso',
        text: 'La desparasitación fue guardada correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => {
        this.modalCtrl.dismiss(true);
      });
    } catch (error) {
      await loading.dismiss();
      console.error('Error al guardar la desparasitación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar la desparasitación.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }


  cerrar() {
    this.modalCtrl.dismiss(false);
  }
}

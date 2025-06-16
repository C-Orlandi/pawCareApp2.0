import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, collection, doc, addDoc, updateDoc } from '@angular/fire/firestore';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalControlpycComponent } from '../modal-controlpyc/modal-controlpyc.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-rmedico',
  templateUrl: './modal-rmedico.component.html',
  styleUrls: ['./modal-rmedico.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalRmedicoComponent implements OnInit {
  @Input() registro: any;
  registroForm: FormGroup;
  hoy: string = new Date().toISOString();
  mascotaSeleccionada: any;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {
    this.registroForm = this.fb.group({
      fechaVisita: [this.hoy, Validators.required],
      motivo: ['',[Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]*$')]],
      veterinario: ['',[Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]*$')]],
      diagnostico: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]*$')]],
      tratamiento: ['', [Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9 ,.()\\n\\r-]*$')]],
      medicamentos: ['',[Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9 ,.()\\n\\r-]*$')]],
    });
  }

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
    }

    if (this.registro) {
      this.registroForm.patchValue(this.registro);
    }
  }

  async guardarRegistro() {
    if (this.registroForm.invalid || !this.mascotaSeleccionada) {
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
      spinner: 'circles'
    });

    await loading.present();

    const data = this.registroForm.value;

    // Si es edición
    if (this.registro?.rid) {
      const registroData = {
        ...data,
        mid: this.mascotaSeleccionada.mid,
        creadoEn: this.registro.creadoEn || new Date()
      };

      try {
        const docRef = doc(this.firestore, 'registrosMedicos', this.registro.rid);
        await updateDoc(docRef, registroData);
        
        await loading.dismiss();

        Swal.fire({
          icon: 'success',
          title: 'Registro Actualizado',
          text: 'El registro médico fue actualizado correctamente.',
          confirmButtonText: 'OK',
          heightAuto: false
        }).then(() => this.modalController.dismiss(true));
      } catch (error) {
        console.error('Error al actualizar:', error);
        await loading.dismiss();
        this.mostrarMensajeDeError();
      }

      return;
    }
        
    const registroData = {
      ...data,
      mid: this.mascotaSeleccionada.mid,
      creadoEn: new Date()
    };

    try {
      const docRef = await addDoc(collection(this.firestore, 'registrosMedicos'), registroData);
      await updateDoc(doc(this.firestore, 'registrosMedicos', docRef.id), { rid: docRef.id });

      await loading.dismiss();

      Swal.fire({
        icon: 'success',
        title: 'Registro Exitoso',
        text: 'Registro médico guardado correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => this.modalController.dismiss(true));
    } catch (error) {
      console.error('Error al guardar:', error);
      await loading.dismiss();
      this.mostrarMensajeDeError();
    }
  }

  mostrarMensajeDeError() {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un problema al guardar el registro. Intenta nuevamente.',
      confirmButtonText: 'OK',
      heightAuto: false
    });
  }

  cerrar() {
    this.modalController.dismiss(false);
  }
}
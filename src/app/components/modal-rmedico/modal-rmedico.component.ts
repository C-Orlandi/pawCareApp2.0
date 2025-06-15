import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, collection, doc, addDoc, updateDoc } from '@angular/fire/firestore';
import { IonicModule, ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalControlpycComponent } from '../modal-controlpyc/modal-controlpyc.component';

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
    private modalController: ModalController
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
    if (this.registroForm.invalid || !this.mascotaSeleccionada) return;

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

        const toast = await this.toastController.create({
          message: 'Registro actualizado',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        this.modalController.dismiss(true);
      } catch (error) {
        console.error('Error al actualizar registro médico:', error);
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

      const toast = await this.toastController.create({
        message: 'Registro guardado exitosamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.modalController.dismiss(true);
    } catch (error) {
      console.error('Error al guardar registro médico:', error);
    }
  }

  cerrar() {
    this.modalController.dismiss(false);
  }
}
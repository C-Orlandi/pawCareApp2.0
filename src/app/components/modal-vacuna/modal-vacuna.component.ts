import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Firestore, collection, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { EmailService } from 'src/app/services/email.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-vacuna',
  templateUrl: './modal-vacuna.component.html',
  styleUrls: ['./modal-vacuna.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalVacunaComponent implements OnInit {
  @Input() mid!: string;
  @Input() vacuna: any;

  vacunaForm!: FormGroup;
  crearRecordatorio: boolean = false;
  usuarioEmail: string = 'sin-correo@pawcare.com';  // valor por defecto

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private modalController: ModalController,
    private toastController: ToastController,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    // Inicializar formulario
    this.vacunaForm = this.fb.group({
      nombre: [this.vacuna?.nombre || '', Validators.required],
      dosis: [this.vacuna?.dosis || '', Validators.required],
      fecha: [this.vacuna?.fecha || '', Validators.required],
      frecuencia: [this.vacuna?.frecuencia || ''],
      frecuenciaPersonalizada: [this.vacuna?.frecuenciaPersonalizada || '']
    });

    // Obtener email del usuario desde localStorage
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      if (usuarioParsed.email) {
        this.usuarioEmail = usuarioParsed.email;
      }
      console.log('📧 Email del usuario:', this.usuarioEmail);
    } else {
      console.warn('⚠️ No se encontró usuarioLogin en localStorage');
    }
  }

  cancelar() {
    this.modalController.dismiss();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }

  preguntarRecordatorio() {
    const frecuencia = this.vacunaForm.value.frecuencia;
    const personalizada = this.vacunaForm.value.frecuenciaPersonalizada;

    if (frecuencia === 'personalizada' && !personalizada) {
      this.presentToast('Especifica la frecuencia personalizada');
      return;
    }

    if (frecuencia) {
      const texto = frecuencia === 'personalizada' ? `${personalizada}` : frecuencia;
      Swal.fire({
        title: '¿Deseas crear un recordatorio?',
        text: `Se repetirá cada ${texto}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'No'
      }).then((result) => {
        this.crearRecordatorio = result.isConfirmed;
        this.guardarVacuna();
      });
    } else {
      this.guardarVacuna();
    }
  }

  async guardarVacuna() {
    if (this.vacunaForm.invalid || !this.mid) return;

    const formValue = this.vacunaForm.value;
    const frecuenciaFinal = formValue.frecuencia === 'personalizada'
      ? formValue.frecuenciaPersonalizada
      : formValue.frecuencia;

    const formData = {
      nombre: formValue.nombre,
      dosis: formValue.dosis,
      fecha: formValue.fecha,
      frecuencia: frecuenciaFinal,
      mid: this.mid,
      creadaEn: new Date()
    };

    let vacunaId = '';

    try {
      if (this.vacuna?.vid) {
        await updateDoc(doc(this.firestore, 'vacunasMascotas', this.vacuna.vid), formData);
        vacunaId = this.vacuna.vid;
        this.presentToast('Vacuna actualizada');
        console.log('✏️ Vacuna actualizada:', formData);
      } else {
        const docRef = await addDoc(collection(this.firestore, 'vacunasMascotas'), formData);
        vacunaId = docRef.id;
        await updateDoc(doc(this.firestore, 'vacunasMascotas', vacunaId), { vid: vacunaId });
        this.presentToast('Vacuna guardada');
        console.log('📥 Vacuna creada:', formData);
      }

      if (this.crearRecordatorio) {
        const recordatorioRef = await addDoc(collection(this.firestore, 'recordatorios'), {
          vid: vacunaId,
          tipo: 'vacuna',
          mid: this.mid,
          fecha: formValue.fecha,
          frecuencia: frecuenciaFinal,
          creadaEn: new Date(),
          rid: '' // se actualizará luego
        });

        await updateDoc(doc(this.firestore, 'recordatorios', recordatorioRef.id), {
          rid: recordatorioRef.id
        });

        // Usar el email del usuario que obtuvimos en ngOnInit
        const email = this.usuarioEmail;

        console.log('📨 Enviando correo a:', email);
        console.log('📧 Datos correo:', {
          vacuna: formData.nombre,
          dosis: formData.dosis,
          fecha: new Date(formData.fecha).toLocaleDateString(),
          frecuencia: frecuenciaFinal
        });

        this.emailService.enviarEmailRecordatorio({
          email,
          tipo: 'vacuna',
          datos: {
            vacuna: formData.nombre,
            dosis: formData.dosis,
            fecha: new Date(formData.fecha).toLocaleDateString(),
            frecuencia: frecuenciaFinal
          }
        }).subscribe({
          next: () => console.log('✅ Correo enviado exitosamente'),
          error: (err) => console.error('❌ Error al enviar correo:', err)
        });
      }

      this.modalController.dismiss(true);
    } catch (error) {
      console.error('❌ Error al guardar vacuna:', error);
      this.presentToast('Error al guardar la vacuna');
    }
  }

  cerrar() {
    this.modalController.dismiss(false);
  }
}

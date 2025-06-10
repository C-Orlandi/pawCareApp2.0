import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { EmailService } from 'src/app/services/email.service';

@Component({
  selector: 'app-modal-desparasitacion',
  templateUrl: './modal-desparasitacion.component.html',
  styleUrls: ['./modal-desparasitacion.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class ModalDesparasitacionComponent implements OnInit {
  @Input() desparasitacion: any;
  @Input() mid!: string;

  desparasitacionForm: FormGroup;
  hoy: string = new Date().toISOString();

  frecuencias = [
    { label: 'Cada 1 mes', value: '1 mes' },
    { label: 'Cada 3 meses', value: '3 meses' },
    { label: 'Cada 6 meses', value: '6 meses' },
    { label: 'Cada 12 meses', value: '12 meses' },
    { label: 'Personalizada', value: 'personalizada' }
  ];

  crearRecordatorio: boolean = false;
  usuarioEmail: string = 'sin-correo@pawcare.com';  // valor por defecto

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private modalController: ModalController,
    private toastController: ToastController,
    private emailService: EmailService
  ) {
    this.desparasitacionForm = this.fb.group({
      nombre: ['', Validators.required],
      dosis: [''],
      fecha: [this.hoy, Validators.required],
      frecuencia: [''],
      frecuenciaPersonalizada: [''],
      proximaDosis: [''],
      aplicada: [false]
    });
  }

  ngOnInit() {
    if (this.desparasitacion) {
      this.desparasitacionForm.patchValue(this.desparasitacion);
    }

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

    this.desparasitacionForm.get('fecha')?.valueChanges.subscribe(() => this.calcularProximaDosis());
    this.desparasitacionForm.get('frecuencia')?.valueChanges.subscribe(() => this.calcularProximaDosis());

    this.calcularProximaDosis();
  }

  calcularProximaDosis() {
    const fecha = new Date(this.desparasitacionForm.value.fecha);
    let meses = 0;

    const frecuencia = this.desparasitacionForm.value.frecuencia;
    if (frecuencia === 'personalizada') {
      // No calculamos automática para personalizada
      this.desparasitacionForm.patchValue({ proximaDosis: '' }, { emitEvent: false });
      return;
    } else if (frecuencia) {
      meses = parseInt(frecuencia);
      if (isNaN(meses)) {
        // Si frecuencia es string como '1 mes', '3 meses', extraemos número
        const match = frecuencia.match(/\d+/);
        meses = match ? parseInt(match[0]) : 0;
      }
    }

    if (!isNaN(fecha.getTime()) && meses > 0) {
      fecha.setMonth(fecha.getMonth() + meses);
      this.desparasitacionForm.patchValue({
        proximaDosis: fecha.toISOString()
      }, { emitEvent: false });
    }
  }

  cancelar() {
    this.modalController.dismiss(false);
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
    const frecuencia = this.desparasitacionForm.value.frecuencia;
    const personalizada = this.desparasitacionForm.value.frecuenciaPersonalizada;

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
        this.guardarDesparasitacion();
      });
    } else {
      this.guardarDesparasitacion();
    }
  }

  async guardarDesparasitacion() {
    if (this.desparasitacionForm.invalid || !this.mid) return;

    const formValue = this.desparasitacionForm.value;
    const frecuenciaFinal = formValue.frecuencia === 'personalizada'
      ? formValue.frecuenciaPersonalizada
      : formValue.frecuencia;

    const data = {
      nombre: formValue.nombre,
      dosis: formValue.dosis,
      fecha: formValue.fecha,
      frecuencia: frecuenciaFinal,
      proximaDosis: formValue.proximaDosis,
      aplicada: formValue.aplicada,
      mid: this.mid,
      creadaEn: new Date()
    };

    let desparasitacionId = '';

    try {
      if (this.desparasitacion?.did) {
        await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', this.desparasitacion.did), data);
        desparasitacionId = this.desparasitacion.did;
        this.presentToast('Registro actualizado');
        console.log('✏️ Desparasitación actualizada:', data);
      } else {
        const docRef = await addDoc(collection(this.firestore, 'desparasitacionesMascotas'), data);
        desparasitacionId = docRef.id;
        await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', desparasitacionId), { did: desparasitacionId });
        this.presentToast('Registro guardado');
        console.log('📥 Desparasitación creada:', data);
      }

      if (this.crearRecordatorio) {
        const recordatorioRef = await addDoc(collection(this.firestore, 'recordatorios'), {
          rid: '',
          did: desparasitacionId,
          tipo: 'desparasitacion',
          mid: this.mid,
          fecha: formValue.fecha,
          frecuencia: frecuenciaFinal,
          creadaEn: new Date()
        });

        await updateDoc(doc(this.firestore, 'recordatorios', recordatorioRef.id), {
          rid: recordatorioRef.id
        });

        const email = this.usuarioEmail;
        console.log('📨 Enviando correo a:', email);
        console.log('📧 Datos correo:', {
          antiparasitario: data.nombre,
          dosis: data.dosis,
          fecha: new Date(data.fecha).toLocaleDateString(),
          frecuencia: frecuenciaFinal
        });

        this.emailService.enviarEmailRecordatorio({
          email,
          tipo: 'desparasitacion',
          datos: {
            antiparasitario: data.nombre,
            dosis: data.dosis,
            fecha: new Date(data.fecha).toLocaleDateString(),
            frecuencia: frecuenciaFinal
          }
        }).subscribe({
          next: () => console.log('✅ Correo enviado exitosamente'),
          error: (err) => console.error('❌ Error al enviar correo:', err)
        });
      }

      this.modalController.dismiss(true);
    } catch (error) {
      console.error('❌ Error al guardar desparasitacion:', error);
      this.presentToast('Error al guardar el registro');
    }
  }

  cerrar() {
    this.modalController.dismiss(false);
  }
}

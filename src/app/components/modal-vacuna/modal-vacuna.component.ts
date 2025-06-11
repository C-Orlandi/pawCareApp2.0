// modal-vacuna.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Firestore, collection, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import { EmailService } from 'src/app/services/email.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalRecordatorioComponent } from '../modal-recordatorio/modal-recordatorio.component';

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
  usuarioEmail: string = 'sin-correo@pawcare.com';
  recordatorioData: any = null;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    this.vacunaForm = this.fb.group({
      nombre: [this.vacuna?.nombre || '', Validators.required],
      dosis: [this.vacuna?.dosis || '', Validators.required],
      fecha: [this.vacuna?.fecha || '', Validators.required],
      crearRecordatorio: [false]
    });

    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      if (usuarioParsed.email) {
        this.usuarioEmail = usuarioParsed.email;
      }
    }

    this.vacunaForm.get('crearRecordatorio')?.valueChanges.subscribe(async (valor) => {
      if (valor === true) {
        await this.abrirModalRecordatorio();
      } else {
        this.recordatorioData = null;
      }
    });
  }

  async abrirModalRecordatorio() {
    const modal = await this.modalCtrl.create({
      component: ModalRecordatorioComponent,
      componentProps: {
        nombreVacuna: this.vacunaForm.value.nombre,
        fechaVacuna: this.vacunaForm.value.fecha
      }
    });

    modal.onDidDismiss().then((resultado) => {
      if (resultado.data?.guardado) {
        this.recordatorioData = resultado.data.recordatorio;
      } else {
        this.vacunaForm.get('crearRecordatorio')?.setValue(false, { emitEvent: false });
        this.recordatorioData = null;
      }
    });

    await modal.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }

  async guardarVacuna() {
    if (this.vacunaForm.invalid || !this.mid) return;

    const formValue = this.vacunaForm.value;
    const formData = {
      nombre: formValue.nombre,
      dosis: formValue.dosis,
      fecha: formValue.fecha,
      mid: this.mid,
      creadaEn: new Date()
    };

    try {
      let vacunaId = '';

      if (this.vacuna?.vid) {
        await updateDoc(doc(this.firestore, 'vacunasMascotas', this.vacuna.vid), formData);
        vacunaId = this.vacuna.vid;
      } else {
        const docRef = await addDoc(collection(this.firestore, 'vacunasMascotas'), formData);
        vacunaId = docRef.id;
        await updateDoc(doc(this.firestore, 'vacunasMascotas', vacunaId), { vid: vacunaId });
      }

      if (this.recordatorioData) {
        // Guardar recordatorio en colección principal
        const recordatorioPayload = {
          creadoEn: new Date(),
          frecuencia: this.recordatorioData.frecuenciaTexto,
          hora: this.recordatorioData.hora || null,
          fechaLimite: this.recordatorioData.fechaLimite || null,
          vid: vacunaId,
          mid: this.mid,
          rid: '',
          tipo: 'vacuna'
        };

        const recordatorioRef = await addDoc(collection(this.firestore, 'recordatorios'), recordatorioPayload);
        await updateDoc(doc(this.firestore, 'recordatorios', recordatorioRef.id), {
          rid: recordatorioRef.id
        });

        // Crear relación en vacunasRecordatorios (sin fechaVacuna ni fechaRecordatorio)
        const relacion = {
          vrid: '',
          vid: vacunaId,
          rid: recordatorioRef.id,
          mid: this.mid,
          nombreVacuna: formData.nombre,
          frecuencia: this.recordatorioData.frecuenciaTexto,
          fechaLimite: this.recordatorioData.fechaLimite || null,
          creadoEn: new Date()
        };

        const relacionRef = await addDoc(collection(this.firestore, 'vacunasRecordatorios'), relacion);
        await updateDoc(doc(this.firestore, 'vacunasRecordatorios', relacionRef.id), {
          vrid: relacionRef.id
        });

        // Enviar correo
        this.emailService.enviarEmailRecordatorio({
          email: this.usuarioEmail,
          tipo: 'vacuna',
          datos: {
            vacuna: formData.nombre,
            frecuencia: this.recordatorioData.frecuenciaTexto,
            hora: this.recordatorioData.hora || 'No especificada'
          }
        }).subscribe({
          next: () => console.log('📧 Correo enviado exitosamente'),
          error: (err) => console.error('❌ Error al enviar correo:', err)
        });
      }

      this.presentToast(this.vacuna ? 'Vacuna actualizada' : 'Vacuna guardada');
      this.modalCtrl.dismiss(true);
    } catch (error) {
      console.error('❌ Error al guardar vacuna:', error);
      this.presentToast('Error al guardar la vacuna');
    }
  }

  calcularProximaFecha(fechaAplicacion: string, frecuencia: string): string | null {
    console.log('📅 Fecha de aplicación:', fechaAplicacion);
    console.log('🔁 Frecuencia ingresada:', frecuencia);

    const fecha = new Date(fechaAplicacion);
    const partes = frecuencia.toLowerCase().split(' ');
    const cantidad = parseInt(partes[0], 10);
    const unidad = partes[1];

    if (isNaN(cantidad)) {
      if (frecuencia.toLowerCase() === 'hoy') {
        return fecha.toISOString();
      }
      return null;
    }

    if (unidad.includes('mes')) {
      fecha.setMonth(fecha.getMonth() + cantidad);
    } else if (unidad.includes('día')) {
      fecha.setDate(fecha.getDate() + cantidad);
    } else {
      return null;
    }

    const proxima = fecha.toISOString();
    console.log('✅ Próxima fecha calculada:', proxima);
    return proxima;
  }

  cerrar() {
    this.modalCtrl.dismiss(false);
  }
}

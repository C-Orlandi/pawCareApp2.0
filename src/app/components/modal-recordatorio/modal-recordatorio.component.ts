
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { Auth, getAuth } from '@angular/fire/auth'; // Nuevo import 
import { EmailService } from 'src/app/services/email.service';

@Component({
  selector: 'app-modal-recordatorio',
  templateUrl: './modal-recordatorio.component.html',
  styleUrls: ['./modal-recordatorio.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalRecordatorioComponent implements OnInit {
  @Input() medicamentoTexto: string = '';
  @Input() mascota: any;
  recordatorioForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private firestore: Firestore,
    private emailService: EmailService
  ) {
    this.recordatorioForm = this.fb.group({
      medicamento: ['', Validators.required],
      dosis: ['', Validators.required],
      duracion: [1, Validators.required],
      frecuencia: [1, Validators.required],
      horaInicio: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.recordatorioForm.patchValue({
      medicamento: this.medicamentoTexto
    });
  }

  async guardar() {
    const data = this.recordatorioForm.value;
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('Usuario no autenticado');
      this.modalController.dismiss();
      return;
    }

    const recordatorio = {
      ...data,
      mid: this.mascota?.mid,
      uid: user.uid,
      correo: user.email,
      creadoEn: new Date()
    };

    try {
      // Guardar en Firestore
      await addDoc(collection(this.firestore, 'recordatorios'), recordatorio);

      // Enviar email
      this.emailService.enviarEmailRecordatorio({
        email: user.email || '',
        medicamento: data.medicamento,
        dosis: data.dosis,
        duracion: data.duracion,
        frecuencia: data.frecuencia,
        horaInicio: data.horaInicio
      }).subscribe({
        next: () => console.log('Email enviado con éxito'),
        error: err => console.error('Error enviando email', err)
      });

      this.modalController.dismiss();

    } catch (error) {
      console.error('Error guardando recordatorio:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  cerrar() {
    this.modalController.dismiss();
  }
}

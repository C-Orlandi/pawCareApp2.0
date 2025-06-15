// modal-vacuna.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Firestore, collection, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import { EmailService } from 'src/app/services/email.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  usuarioLogin?: string;
  vacunaForm!: FormGroup;
  usuarioEmail: string = 'sin-correo@pawcare.com';

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
      fechaHora: [this.vacuna?.fechayhora || '', Validators.required]
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

  async guardarVacuna() {
    if (this.vacunaForm.invalid || !this.mid) return;

    const formValue = this.vacunaForm.value;
    const formData = {
      nombre: formValue.nombre,
      fechayhora: formValue.fechaHora,
      mid: this.mid,
      uid: this.usuarioLogin || 'desconocido',
      creadaEn: new Date(),
      estado: 'aplicada',
      //
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

      this.presentToast('Vacuna guardada correctamente');
      this.modalCtrl.dismiss(true);
    } catch (error) {
      this.presentToast('Error al guardar la vacuna');
      console.error('Error al guardar la vacuna:', error);
    }
  }

  exportarPDF() {
  const dataElement = document.getElementById('historial-content'); // el div que contiene el historial

  if (!dataElement) {
    console.error('❌ No se encontró el contenedor del historial');
    return;
  }

  html2canvas(dataElement).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('historial_pawcare.pdf');
  });
}

  cerrar() {
    this.modalCtrl.dismiss(false);
  }
  
}

import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

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
    private firestore: Firestore
  ) {
    this.recordatorioForm = this.fb.group({
      medicamento: ['', Validators.required],
      dosis: ['', Validators.required],
      duracion: [1, Validators.required],
      frecuencia: [1, Validators.required],
    });
  }

  ngOnInit() {
    this.recordatorioForm.patchValue({
      medicamento: this.medicamentoTexto
    });
  }

  async guardar() {
    const data = this.recordatorioForm.value;

    const recordatorio = {
      ...data,
      mid: this.mascota?.mid,
      creadoEn: new Date()
    };

    await addDoc(collection(this.firestore, 'recordatorios'), recordatorio);
    this.modalController.dismiss();
  }

  cerrar() {
    this.modalController.dismiss();
  }
}

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ControlpycService } from 'src/app/services/controlpyc.service';

@Component({
  selector: 'app-modal-controlpyc',
  templateUrl: './modal-controlpyc.component.html',
  styleUrls: ['./modal-controlpyc.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalControlpycComponent  implements OnInit {

  @Input() control: any;
  @Input() mid!: string;
  formulario!: FormGroup;
  esEdicion = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private controlService: ControlpycService
  ) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      fecha: [new Date().toISOString(), Validators.required],
      peso: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      unidad: ['', Validators.required],
      condicionCorporal: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]],
      actividadFisica: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]],
      observaciones: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]]
    });

    this.esEdicion = !!this.control;
  }

  async guardar() {
    const data = {
      ...this.formulario.value,
      mid: this.mid
    };

    if (this.esEdicion) {
      await this.controlService.actualizarControl(this.control.cid, data);
    } else {
      await this.controlService.agregarControl(data);
    }

    this.modalController.dismiss(true);
  }

  cerrarModal() {
    this.modalController.dismiss(false);
  }
}
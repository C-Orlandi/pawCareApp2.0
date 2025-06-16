import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular/standalone';
import { ControlpycService } from 'src/app/services/controlpyc.service';
import Swal from 'sweetalert2';

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
    private controlService: ControlpycService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      fecha: [this.control?.fecha || new Date().toISOString(), Validators.required],
      peso: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      unidad: ['', Validators.required],
      condicionCorporal: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]],
      actividadFisica: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]],
      observaciones: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]]
    });

    this.esEdicion = !!this.control;
  }

  async guardar() {
    if (this.formulario.invalid) {
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

    const data = {
      ...this.formulario.value,
      mid: this.mid
    };

    try {
      if (this.esEdicion) {
        await this.controlService.actualizarControl(this.control.cid, data);
      } else {
        await this.controlService.agregarControl(data);
      }

      await loading.dismiss();

      Swal.fire({
        icon: 'success',
        title: this.esEdicion ? 'Registro Actualizado' : 'Registro Exitoso',
        text: this.esEdicion ? 'El registro fue actualizado correctamente.' : 'El registro fue guardado correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => {
        this.modalController.dismiss(true);
      });

    } catch (error) {
      console.error('❌ Error al guardar el control:', error);
      await loading.dismiss();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el registro. Intenta nuevamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }

  cerrar() {
    this.modalController.dismiss(false);
  }
}
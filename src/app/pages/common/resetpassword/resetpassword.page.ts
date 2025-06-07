import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule, LoadingController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.page.html',
  styleUrls: ['./resetpassword.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule // Necesario para formularios reactivos
  ]
})
export class ResetpasswordPage implements OnInit {

  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private menuCtrl: MenuController
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.menuCtrl.enable(false); // Desactiva el menú en esta página
  }

  getEmailErrorMessage(): string {
    const emailCtrl = this.resetForm.get('email');
    if (emailCtrl?.hasError('required')) {
      return 'El correo es obligatorio.';
    }
    if (emailCtrl?.hasError('email')) {
      return 'El correo no tiene un formato válido.';
    }
    return '';
  }

  async resetPassword() {
    if (this.resetForm.invalid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Enviando correo...'
    });
    await loading.present();

    const { email } = this.resetForm.value;

    try {
      await this.authService.recoveryPassword(email);
      await loading.dismiss();

      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    } catch (error) {
      await loading.dismiss();

      console.error('🔥 Error al enviar correo de recuperación:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar el correo. Verifica que esté bien escrito o intenta más tarde.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { UsuariosService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Router } from '@angular/router';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class PerfilUsuarioPage implements OnInit {

  usuarioAuth?: User;
  usuarioData?: Usuario;

  // Para bindear en el form:
  nombre = '';
  email = '';
  password = '';  // Nuevo password si se cambia
  contacto = '';
  // otros campos que tengas en Usuario...

  constructor(
    private auth: Auth,
    private usuarioService: UsuariosService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    this.usuarioAuth = this.auth.currentUser ?? undefined;

    if (!this.usuarioAuth) {
      // Usuario no autenticado, redirigir a login
      this.router.navigate(['/login']);
      return;
    }

    this.email = this.usuarioAuth.email ?? '';

    // Cargar datos del usuario Firestore
    this.usuarioService.getUsuarioPorUid(this.usuarioAuth.uid).subscribe(data => {
      if (data) {
        this.usuarioData = data;
        this.nombre = data.nombre || '';
        this.contacto = data.contacto || '';
        // otros campos...
      }
    });
  }

  async guardarCambios() {
    if (!this.usuarioAuth || !this.usuarioData) return;

    // Mostrar loading
    const loading = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loading.present();

    try {
      // Actualizar perfil completo (incluyendo nombre, contacto)
      await this.usuarioService.actualizarPerfil({
        uid: this.usuarioAuth.uid,
        email: this.email,
        password: this.password.trim(),
        nombre: this.nombre,
        contacto: this.contacto
      }).toPromise();

      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Perfil actualizado correctamente.',
        buttons: ['OK']
      });
      await alert.present();

      // Si cambió email, hace logout para que se re-autentique
      if (this.email !== this.usuarioAuth.email) {
        await this.auth.signOut();
        this.router.navigate(['/login']);
      }
    } catch (error) {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar el perfil: ' + error,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async eliminarCuenta() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            if (!this.usuarioAuth) return;

            const loading = await this.loadingCtrl.create({ message: 'Eliminando cuenta...' });
            await loading.present();

            try {
              // Eliminar de Firestore (usuarios y duenos) y Firebase Auth
              await this.usuarioService.eliminarUsuarioPerfil(this.usuarioAuth.uid);
              await loading.dismiss();

              await this.auth.signOut();
              this.router.navigate(['/login']);
            } catch (error) {
              await loading.dismiss();
              const errAlert = await this.alertCtrl.create({
                header: 'Error',
                message: 'No se pudo eliminar la cuenta: ' + error,
                buttons: ['OK']
              });
              await errAlert.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from 'src/app/interfaces/usuario';
import { DuenoService } from 'src/app/services/dueno.service';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular/standalone';
import { doc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalUsuarioComponent implements OnInit {

  @Input() usuario?: Usuario;

  nombre = '';
  email = '';
  pass = '';
  tipo = 'dueno';

  constructor(
    private modalCtrl: ModalController,
    private duenoService: DuenoService,
    private firestore: Firestore,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    if (this.usuario) {
      this.nombre = this.usuario.nombre;
      this.email = this.usuario.email;
      this.pass = this.usuario.pass;
      this.tipo = this.usuario.tipo;
    }
  }

  async guardar() {
    try {
      if (this.usuario) {
        // 🟡 Actualizar usuario existente (Firestore solamente)
        const usuarioActualizado: Usuario = {
          uid: this.usuario.uid,
          nombre: this.nombre,
          email: this.email,
          pass: this.pass,
          tipo: this.tipo
        };

        await setDoc(doc(this.firestore, 'usuarios', usuarioActualizado.uid), usuarioActualizado);
        await setDoc(doc(this.firestore, 'duenos', usuarioActualizado.uid), {
          uid: usuarioActualizado.uid,
          nombre: this.nombre,
          email: this.email,
          creadoEn: new Date()
        });

        this.modalCtrl.dismiss(usuarioActualizado);
      } else {
        // 🟢 Crear usuario nuevo (Auth + Firestore)
        const aux = await this.authService.register(this.email, this.pass);
        const user = aux.user;

        if (!user) throw new Error('No se pudo crear el usuario en Auth');

        const nuevoUsuario: Usuario = {
          uid: user.uid,
          nombre: this.nombre,
          email: this.email,
          pass: this.pass,
          tipo: this.tipo
        };

        await setDoc(doc(this.firestore, 'usuarios', user.uid), nuevoUsuario);
        await setDoc(doc(this.firestore, 'duenos', user.uid), {
          uid: user.uid,
          nombre: this.nombre,
          email: this.email,
          creadoEn: new Date()
        });

        this.modalCtrl.dismiss(nuevoUsuario);
      }
    } catch (error: any) {
      console.error('❌ Error al guardar usuario:', error);
      this.alertController.create({
        header: 'Error',
        message: error?.message || 'No se pudo guardar el usuario.',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  generarPasswordAleatoria(longitud: number = 10) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < longitud; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      password += caracteres.charAt(indice);
    }
    this.pass = password;
  }
}
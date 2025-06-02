import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, IonList } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { ModalUsuarioComponent } from 'src/app/components/modal-usuario/modal-usuario.component';

@Component({
  selector: 'app-gestionar-usuario',
  templateUrl: './gestionar-usuario.page.html',
  styleUrls: ['./gestionar-usuario.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GestionarUsuarioPage implements OnInit {

  usuarios: Usuario[] = [];

  constructor(
    private usuariosService: UsuariosService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.usuariosService.getUsuarios().subscribe(data => {
      this.usuarios = data.filter(u => u.tipo === 'dueno');
    });
  }

  async abrirModal(usuario?: Usuario) {
    const modal = await this.modalController.create({
      component: ModalUsuarioComponent,
      componentProps: { usuario }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) {
        const usuarioModificado: Usuario = result.data;
        if (usuario) {
          this.usuariosService.actualizarUsuario(usuarioModificado);
        } else {
          this.usuariosService.crearUsuario(usuarioModificado);
        }
      }
    });

    await modal.present();
  }

  eliminarUsuario(uid: string) {
    if(confirm('¿Seguro que quieres eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(uid);
    }
  }

  getTipoLegible(tipo: string): string {
    switch (tipo) {
      case 'dueno': return 'Dueño';
      case 'admin': return 'Admin';
      case 'otro': return 'Otro';
      default: return tipo;
    }
  }
}

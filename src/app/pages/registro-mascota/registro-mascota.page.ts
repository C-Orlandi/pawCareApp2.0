import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  IonicModule,
  LoadingController,
  MenuController
} from '@ionic/angular';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-registro-mascota',
  templateUrl: './registro-mascota.page.html',
  styleUrls: ['./registro-mascota.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class RegistroMascotaPage implements OnInit {
  mascotaForm: FormGroup;
  usuarioLogin?: any;
  imagenFile: File | null = null;
  imagenPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private firestore: Firestore,
    private router: Router,
    private menuController: MenuController,
    private http: HttpClient
  ) {
    this.mascotaForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      raza: ['', Validators.required],
      sexo: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      color: ['', Validators.required],
      chip: [''],
      peso: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      tieneVacunas: [false]
    });
  }

  ngOnInit() {
    this.menuController.enable(true);
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      this.usuarioLogin = JSON.parse(usuario);
    }
  }

  onCategoriaChange() {
    const categoria = this.mascotaForm.get('categoria')?.value;
    if (categoria !== 'exotico') {
      this.mascotaForm.patchValue({ tieneVacunas: false });
    }
  }

  seleccionarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  async guardarMascota() {
    if (this.mascotaForm.invalid) {
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
      message: 'Guardando mascota...'
    });
    await loading.present();

    try {
      const data = this.mascotaForm.value;
      const edadCalculada = this.calcularEdad(data.fechaNacimiento);
      const mid = uuidv4();

      let urlImagen = '';
      if (this.imagenFile) {
        const formData = new FormData();
        formData.append('foto', this.imagenFile);

        const uploadResponse: any = await this.http
          .post('http://localhost:3000/upload', formData)
          .toPromise();
        urlImagen = uploadResponse.url;
      }

      const mascotaData = {
        mid,
        ...data,
        edad: edadCalculada,
        imagen: urlImagen,
        usuarioUid: this.usuarioLogin?.uid || 'desconocido',
        dueno: {
          nombre: this.usuarioLogin?.nombre || 'No registrado',
          contacto: this.usuarioLogin?.contacto || 'No registrado'
        }
      };

      await setDoc(doc(this.firestore, 'mascotas', mid), mascotaData);
      await loading.dismiss();

      localStorage.setItem('mascotaSeleccionada', JSON.stringify(mascotaData));

      Swal.fire({
        icon: 'success',
        title: 'Registro Exitoso',
        text: 'Mascota registrada correctamente',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => {
        (document.activeElement as HTMLElement)?.blur();
        this.router.navigate(['/home-mascota']);
      });

    } catch (error) {
      console.error('❌ Error al guardar mascota:', error);
      await loading.dismiss();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al registrar la mascota. Intenta nuevamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }
}

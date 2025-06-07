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
import { ActivatedRoute, Router } from '@angular/router';
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
  modoEdicion: boolean = false;
  midExistente: string | null = null;
  imagenAnterior: string | null = null;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private firestore: Firestore,
    private router: Router,
    private menuController: MenuController,
    private http: HttpClient,
    private route: ActivatedRoute,
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

  ionViewWillEnter() {
    const modo = this.route.snapshot.queryParamMap.get('modo');
    if (modo === 'editar') {
      this.modoEdicion = true;
      const mascota = localStorage.getItem('mascotaSeleccionada');
      if (mascota) {
        const mascotaData = JSON.parse(mascota);
        this.midExistente = mascotaData.mid || null;
        this.imagenAnterior = mascotaData.imagen || null;

        this.mascotaForm.patchValue({
          nombre: mascotaData.nombre || '',
          tipo: mascotaData.tipo || '',
          raza: mascotaData.raza || '',
          sexo: mascotaData.sexo || '',
          fechaNacimiento: mascotaData.fechaNacimiento || '',
          color: mascotaData.color || '',
          chip: mascotaData.chip || '',
          peso: mascotaData.peso || '',
          categoria: mascotaData.categoria || '',
          tieneVacunas: mascotaData.tieneVacunas || false
        });

        if (mascotaData.imagen) {
          this.imagenPreview = mascotaData.imagen;
        }
      }
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
      message: this.modoEdicion ? 'Actualizando mascota...' : 'Guardando mascota...'
    });
    await loading.present();

    try {
      const data = this.mascotaForm.value;
      const edadCalculada = this.calcularEdad(data.fechaNacimiento);

      const mid = this.modoEdicion && this.midExistente ? this.midExistente : uuidv4();

      let urlImagen = this.imagenAnterior || '';
      if (this.imagenFile) {
        const formData = new FormData();
        formData.append('foto', this.imagenFile);
        const uploadResponse: any = await this.http.post('http://localhost:3000/upload', formData).toPromise();
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
        title: this.modoEdicion ? 'Actualización Exitosa' : 'Registro Exitoso',
        text: this.modoEdicion
          ? 'La información de la mascota fue actualizada correctamente.'
          : 'Mascota registrada correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => {
        this.router.navigate(['/mis-mascotas']);
      });

    } catch (error) {
      console.error('Error al guardar la mascota:', error);
      await loading.dismiss();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar la mascota.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }
}
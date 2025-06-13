import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, LoadingController } from '@ionic/angular';
import { MascotaService } from 'src/app/services/mascota.service';
import { Firestore, collection, addDoc, doc, updateDoc, query, getDocs, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { EmailService } from 'src/app/services/email.service';

@Component({
  selector: 'app-modal-recordatorio',
  templateUrl: './modal-recordatorio.component.html',
  styleUrls: ['./modal-recordatorio.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class ModalRecordatorioComponent implements OnInit {
  @Input() recordatorioEdit: any;
  usuarioUid!: string;
  mascotas: any[] = [];

  mostrarCheckboxAplicada = false;
  tipo: 'vacuna' | 'medicamento' | 'desparasitacion' = 'vacuna';
  form!: FormGroup;

  constructor(
    private mascotaService: MascotaService,
    private modalCtrl: ModalController,
    private firestore: Firestore,
    private fb: FormBuilder,
    private emailService: EmailService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioUid = usuarioParsed.uid;
    }

    this.form = this.fb.group({
      tipo: ['', Validators.required],
      mid: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$'), Validators.minLength(3)]],
      fechaHora: ['', Validators.required],
      estadoAplicada: [false]
    });
  }

  ionViewWillEnter() {
    if (this.recordatorioEdit) {
      this.form.patchValue({
        tipo: this.recordatorioEdit.tipo || '',
        mid: this.recordatorioEdit.mid || '',
        nombre: this.recordatorioEdit.nombre || '',
        fechaHora: this.recordatorioEdit.fecha || ''
      });

      const tipo = this.recordatorioEdit.tipo;
      const fechaGuardada = new Date(this.recordatorioEdit.fecha);
      const ahora = new Date();
      
      if ((tipo === 'vacuna' || tipo === 'desparasitacion') && fechaGuardada <= ahora) {
        this.mostrarCheckboxAplicada = true;
      }
    }

    if (this.usuarioUid) {
      this.cargarMascotas(this.usuarioUid);
    }
  }

  cargarMascotas(uid: string) {
    this.mascotaService.getMascotasPorUsuario(uid).subscribe({
      next: (mascotas) => this.mascotas = mascotas,
      error: (err) => console.error('Error cargando mascotas:', err)
    });
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Completa todos los campos requeridos.');
      return;
    }

    if (this.recordatorioEdit?.rid) {
      const formData = this.form.value;
      const rid = this.recordatorioEdit?.rid;

      const estadoDesdeCheckbox = this.form.get('estadoAplicada')?.value;
      let estado = estadoDesdeCheckbox ? 'aplicada' : undefined;

      const recordatorioActualizado: any = {
        rid: rid,
        tipo: formData.tipo,
        mid: formData.mid,
        nombre: formData.nombre,
        fecha: formData.fechaHora,
        estado: estado
      };

      await this.actualizarRecordatorioYEstado(recordatorioActualizado);
      this.modalCtrl.dismiss(true);
      return;
    }

    const tipoSeleccionado = this.form.value.tipo;
    const mid = this.form.value.mid;
    const mascotaSeleccionada = this.mascotas.find(m => m.mid === mid);
    const nombreMascota = mascotaSeleccionada?.nombre || 'Desconocido';

    const usuario = localStorage.getItem('usuarioLogin');
    const usuarioParsed = usuario ? JSON.parse(usuario) : null;

    const creadoEn = new Date().toISOString();
    const { nombre, fechaHora } = this.form.value;

    const hora = new Date(fechaHora).toISOString().split('T')[1].substring(0, 5);

    const recordatorioData: any = {
      uid: this.usuarioUid,
      mid,
      tipo: tipoSeleccionado,
      nombre,
      fecha: fechaHora,
      creadoEn
    };

    try {
      const docRef = await addDoc(collection(this.firestore, 'recordatorios'), recordatorioData);
      const rid = docRef.id;
      await updateDoc(doc(this.firestore, 'recordatorios', rid), { rid });

      if (tipoSeleccionado === 'vacuna') {
        const vacuna = await addDoc(collection(this.firestore, 'vacunasMascotas'), {
          uid: this.usuarioUid, mid, rid, nombre, fecha: fechaHora, estado: 'pendiente', creadoEn
        });
        const vid = vacuna.id;
        await updateDoc(doc(this.firestore, 'vacunasMascotas', vid), { vid });
        await addDoc(collection(this.firestore, 'vacunasRecordatorios'), {
          vrid: `${vid}_${rid}`, vid, rid
        });

        await this.emailService.enviarEmailRecordatorio({
          email: usuarioParsed.email,
          tipo: 'vacuna',
          datos: {
            nombreMascota,
            nombreVacuna: nombre,
            fecha: fechaHora,
            estado: 'pendiente'
          }
        }).toPromise();

      } else if (tipoSeleccionado === 'desparasitacion') {
        const desp = await addDoc(collection(this.firestore, 'desparasitacionesMascotas'), {
          uid: this.usuarioUid, mid, rid, nombre, fecha: fechaHora, estado: 'pendiente', creadoEn
        });
        const id_desp = desp.id;
        await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', id_desp), { id_desp });
        await addDoc(collection(this.firestore, 'desparasitacionRecordatorios'), {
          drid: `${id_desp}_${rid}`, id_desp, rid
        });

        await this.emailService.enviarEmailRecordatorio({
          email: usuarioParsed.email,
          tipo: 'desparasitacion',
          datos: {
            nombreMascota,
            nombreDesparasitacion: nombre,
            fecha: fechaHora,
            estado: 'pendiente'
          }
        }).toPromise();
      }

      this.modalCtrl.dismiss(true);
    } catch (error) {
      console.error('Error guardando recordatorio:', error);
    }
  }

  private async actualizarRecordatorioYEstado(recordatorioActualizado: any) {
    const loading = await this.loadingCtrl.create({ message: 'Actualizando...' });
    await loading.present();

    try {
      let { rid, tipo, fecha, estado, ...otrosCampos } = recordatorioActualizado;

      if (!estado) {
        estado = this.determinarEstadoPorTipo(tipo);
      }

      const docRefRecordatorio = doc(this.firestore, 'recordatorios', rid);
      await updateDoc(docRefRecordatorio, { fecha, ...otrosCampos });

      if (tipo === 'vacuna') {
        await this.actualizarEstadoPorRid('vacunasMascotas', rid, { fecha, estado, ...otrosCampos });
      } else if (tipo === 'desparasitacion') {
        await this.actualizarEstadoPorRid('desparasitacionesMascotas', rid, { fecha, estado, ...otrosCampos });
      }
    } catch (error) {
      console.error('Error al actualizar recordatorio:', error);
    } finally {
      loading.dismiss();
    }
  }

  private async actualizarEstadoPorRid(nombreColeccion: string, rid: string, datosActualizar: any) {
    const colRef = collection(this.firestore, nombreColeccion);
    const q = query(colRef, where('rid', '==', rid));
    const snapshot = await getDocs(q);

    for (const docu of snapshot.docs) {
      await updateDoc(docu.ref, datosActualizar);
    }
  }

  private determinarEstadoPorTipo(tipo: string): string {
    if (tipo === 'vacuna' || tipo === 'desparasitacion') {
      return 'pendiente';
    }
    return '';
  }
}

import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { MascotaService } from 'src/app/services/mascota.service';
import { Firestore, collection, addDoc, doc, updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { EmailService } from 'src/app/services/email.service'; // Asegúrate que esté importado

@Component({
  selector: 'app-modal-recordatorio',
  templateUrl: './modal-recordatorio.component.html',
  styleUrls: ['./modal-recordatorio.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class ModalRecordatorioComponent implements OnInit {

  usuarioUid!: string;
  mascotas: any[] = [];

  tipo: 'vacuna' | 'medicamento' | 'desparasitacion' = 'vacuna';
  form!: FormGroup;

  constructor(
    private mascotaService: MascotaService,
    private modalCtrl: ModalController,
    private firestore: Firestore,
    private fb: FormBuilder,
    private emailService: EmailService // Agregado
  ) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioUid = usuarioParsed.uid;
    }

    this.form = this.fb.group({
      mid: ['', Validators.required],
      nombre: ['', Validators.required],
      fechaHora: ['', Validators.required],
      dosis: [''],
      duracion: [''],
      frecuenciaHoras: ['']
    });

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

  async guardar() {
    if (this.form.invalid) {
      alert('Completa los campos requeridos.');
      return;
    }

    const mid = this.form.value.mid;
    const mascotaSeleccionada = this.mascotas.find(m => m.mid === mid);
    const nombreMascota = mascotaSeleccionada?.nombre || 'Desconocido';

    const usuario = localStorage.getItem('usuarioLogin');
    const usuarioParsed = usuario ? JSON.parse(usuario) : null;

    const creadoEn = new Date().toISOString();
    const { nombre, fechaHora, dosis, duracion, frecuenciaHoras } = this.form.value;

    const hora = new Date(fechaHora).toISOString().split('T')[1].substring(0, 5);

    const recordatorioData: any = {
      uid: this.usuarioUid,
      mid,
      tipo: this.tipo,
      nombre,
      fecha: fechaHora,
      creadoEn
    };

    try {
      const docRef = await addDoc(collection(this.firestore, 'recordatorios'), recordatorioData);
      const rid = docRef.id;
      await updateDoc(doc(this.firestore, 'recordatorios', rid), { rid });

      const mascota = this.mascotas.find(m => m.id === mid);

      if (this.tipo === 'vacuna') {
        const vacuna = await addDoc(collection(this.firestore, 'vacunasMascotas'), {
          uid: this.usuarioUid, mid, rid, nombre, fecha: fechaHora, estado: 'pendiente', creadoEn
        });
        const vid = vacuna.id;
        await updateDoc(doc(this.firestore, 'vacunasMascotas', vid), { vid });
        await addDoc(collection(this.firestore, 'vacunasRecordatorios'), {
          vrid: `${vid}_${rid}`, vid, rid
        });

        // Enviar correo
        console.log(`Enviando correo de recordatorio de vacuna a: ${usuarioParsed.email}`);
        await this.emailService.enviarEmailRecordatorio({
          email: usuarioParsed.email,
          tipo: 'vacuna',
          datos: {
            nombreMascota: nombreMascota,
            nombreVacuna: nombre,
            fecha: fechaHora,
            frecuencia: 'No aplica',
            estado: 'pendiente'
          }
        }).toPromise();
        console.log('Correo de recordatorio de vacuna enviado.');

      } else if (this.tipo === 'desparasitacion') {
        const desp = await addDoc(collection(this.firestore, 'desparasitacionesMascotas'), {
          uid: this.usuarioUid, mid, rid, nombre, fecha: fechaHora, estado: 'pendiente', creadoEn
        });
        const id_desp = desp.id;
        await updateDoc(doc(this.firestore, 'desparasitacionesMascotas', id_desp), { id_desp });
        await addDoc(collection(this.firestore, 'desparasitacionRecordatorios'), {
          drid: `${id_desp}_${rid}`, id_desp, rid
        });

        // Enviar correo
        console.log(`Enviando correo de recordatorio de desparasitacion a: ${usuarioParsed.email}`);
        await this.emailService.enviarEmailRecordatorio({
          email: usuarioParsed.email,
          tipo: 'desparasitacion',
          datos: {
            nombreMascota: nombreMascota,
            nombreDesparasitacion: nombre,
            fecha: fechaHora,
            frecuencia: 'No aplica',
            estado: 'pendiente'
          }
        }).toPromise();
        console.log('Correo de recordatorio de desparasitacion enviado.');

      } else if (this.tipo === 'medicamento') {
        if (!dosis || !duracion || !frecuenciaHoras) {
          alert('Completa todos los campos del medicamento.');
          return;
        }

        const medic = await addDoc(collection(this.firestore, 'medicamentosMascotas'), {
          uid: this.usuarioUid, mid, rid, nombre, dosis, duracion, frecuenciaHoras,
          fecha: fechaHora, hora, estado: 'activo', creadoEn
        });
        const id_medic = medic.id;
        await updateDoc(doc(this.firestore, 'medicamentosMascotas', id_medic), { id_medic });
        await addDoc(collection(this.firestore, 'medicamentosRecordatorios'), {
          mrid: `${id_medic}_${rid}`, id_medic, rid
        });

        // Enviar correo
        console.log(`Enviando correo de recordatorio de medicamento a: ${usuarioParsed.email}`);
        await this.emailService.enviarEmailRecordatorio({
          email: usuarioParsed.email,
          tipo: 'medicamento',
          datos: {
            nombreMascota: nombreMascota,
            nombreMedicamento: nombre,
            dosis,
            duracion,
            frecuenciaHoras,
            fecha: fechaHora,
            estado: 'activo'
          }
        }).toPromise();
        console.log('Correo de recordatorio de medicamento enviado.');
      }

      this.modalCtrl.dismiss({ guardado: true });

    } catch (error) {
      console.error('Error guardando recordatorio:', error);
      alert('Error al guardar. Intenta de nuevo.');
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }
}

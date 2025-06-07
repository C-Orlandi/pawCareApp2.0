import { Component, OnInit } from '@angular/core';
import { Firestore, collectionData, collection, query, where, orderBy } from '@angular/fire/firestore';
import { Auth, getAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class NotificacionesPage implements OnInit {
  recordatorios$: Observable<any[]> | undefined;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('Usuario no autenticado');
      return;
    }

    const recordatoriosRef = collection(this.firestore, 'recordatorios');
    const q = query(
      recordatoriosRef,
      where('uid', '==', user.uid),
      orderBy('horaInicio', 'desc') // puedes usar creadoEn si prefieres
    );

    this.recordatorios$ = collectionData(q, { idField: 'id' });
  }
}

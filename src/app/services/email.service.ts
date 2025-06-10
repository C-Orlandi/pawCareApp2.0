import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private backendUrl = 'http://localhost:3000/api/enviar-email-recordatorio';

  constructor(private http: HttpClient) {}

  enviarEmailRecordatorio(data: {
    email: string;
    tipo: 'medicamento' | 'vacuna' | 'desparasitacion';
    datos: any;
  }) {
    return this.http.post(this.backendUrl, data);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private backendUrl = 'http://localhost:3001/enviar-email-recordatorio';

  constructor(private http: HttpClient) {}

  enviarEmailRecordatorio(data: {
    email: string,
    medicamento: string,
    dosis: string,
    duracion: number,
    frecuencia: number,
    horaInicio: string
  }) {
    return this.http.post(this.backendUrl, data);
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthAdminService {
  private baseUrl = 'http://localhost:3000/auth'; // Cambia URL si usas remoto

  // Para proteger rutas con el token Firebase y uid admin
  private getHeaders() {
    const token = localStorage.getItem('tokenFirebase'); // o como guardes token
    const uid = localStorage.getItem('uidAdmin'); // uid admin guardado al login
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'x-uid': uid || ''
    });
  }

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`, { headers: this.getHeaders() });
  }

  crearUsuario(datos: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/crear`, datos, { headers: this.getHeaders() });
  }

  actualizarUsuario(uid: string, datos: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/actualizar/${uid}`, datos, { headers: this.getHeaders() });
  }

  eliminarUsuario(uid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminar/${uid}`, { headers: this.getHeaders() });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`;

  login(data: { correo: string; clave: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  guardarSesion(resp: any) {
    localStorage.setItem('token', resp.token);
    localStorage.setItem('correo', resp.correo);
    localStorage.setItem('rol', resp.rol);
    localStorage.setItem('nombreCompleto', resp.nombreCompleto);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRol() {
    return localStorage.getItem('rol');
  }

  logout() {
    localStorage.clear();
  }

  estaLogueado(): boolean {
    return !!this.getToken();
  }
  registrarCliente(data: any) {
    return this.http.post(
      `${environment.apiUrl}/Auth/registrar-cliente`,
      data,
      { responseType: 'text' }
    );
  }
}

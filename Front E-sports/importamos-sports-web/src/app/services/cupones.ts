import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class CuponesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/Cupones`;


  listar() {
    return this.http.get<any[]>(
      this.apiUrl
    );
  }

  crear(data: any) {
    return this.http.post<any>(
      this.apiUrl,
      data
    );
  }
   eliminar(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  actualizar(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  cambiarEstado(id: number, activo: boolean) {
    return this.http.put<any>(
      `${this.apiUrl}/${id}/estado`,
      { activo }
    );
  }

  validar(codigo: string, subtotal: number) {
    return this.http.post<any>(
      `${this.apiUrl}/validar`,
      { codigo, subtotal }
    );
  }
}

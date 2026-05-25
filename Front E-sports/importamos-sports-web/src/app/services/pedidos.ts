import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/Pedidos`;


  crearPedido(detalles: any[], codigoCupon: string | null) {
    return this.http.post<any>(
      this.apiUrl,
      {
        codigoCupon,
        detalles
      });
  }

  misPedidos() {
    return this.http.get<any[]>(
      `${this.apiUrl}/mis-pedidos`,
      );
  }

  listarTodos() {
    return this.http.get<any[]>(
      this.apiUrl,
      );
  }

  cambiarEstado(id: number, estadoId: number) {
    return this.http.put<any>(
      `${this.apiUrl}/${id}/estado/${estadoId}`,
      {});
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Productos`;

  listar() {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarAdmin() {
    return this.http.get<any[]>(`${this.apiUrl}/admin`);
  }

  crear(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  obtenerPorId(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  editar(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  cambiarEstado(id: number, activo: boolean) {
    return this.http.put<any>(`${this.apiUrl}/${id}/activo`, { activo });
  }

  subirImagen(file: File) {
    const formData = new FormData();
    formData.append('archivo', file);

    return this.http.post<any>(`${environment.apiUrl}/Uploads/producto`, formData);
  }
}

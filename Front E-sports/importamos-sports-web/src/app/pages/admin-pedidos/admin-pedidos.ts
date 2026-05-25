import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth';
import { PedidosService } from '../../services/pedidos';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-admin-pedidos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.css'
})
export class AdminPedidos implements OnInit {
  private authService = inject(AuthService);
  private pedidosService = inject(PedidosService);
  private router = inject(Router);

  pedidos: any[] = [];
  estados = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pagado' },
    { id: 3, nombre: 'En preparación' },
    { id: 4, nombre: 'En camino' },
    { id: 5, nombre: 'Entregado' }
  ];

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidosService.listarTodos().subscribe({
      next: (resp) => {
        this.pedidos = resp;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
      }
    });
  }

  actualizarEstado(pedido: any) {
    const nuevoEstadoId = Number(pedido.estadoPedidoId);

    this.pedidosService.cambiarEstado(pedido.id, nuevoEstadoId).subscribe({
      next: (resp) => {
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: resp.mensaje,
          timer: 1400,
          showConfirmButton: false
        });

        this.cargarPedidos();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
      }
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

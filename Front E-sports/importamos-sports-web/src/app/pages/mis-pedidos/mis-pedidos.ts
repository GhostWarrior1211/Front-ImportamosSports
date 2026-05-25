import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos';

@Component({
  selector: 'app-mis-pedidos',
  imports: [CommonModule],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css'
})
export class MisPedidos implements OnInit {
  private pedidosService = inject(PedidosService);
  private router = inject(Router);

  pedidos: any[] = [];

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidosService.misPedidos().subscribe({
      next: (resp) => {
        this.pedidos = resp;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  volver() {
    this.router.navigate(['/productos']);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  private productosService = inject(ProductosService);
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);
  private apiBase = environment.apiUrl.replace('/api', '');

  productos: any[] = [];
  totalItemsCarrito = 0;
  contadorCarrito = 0;

  ngOnInit(): void {
    this.cargarProductos();
    this.actualizarContador();
  }

  cargarProductos() {
    this.productosService.listar().subscribe({
      next: (resp) => {
        this.productos = resp;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  agregarAlCarrito(item: any) {
    const stockDisponible = this.obtenerStockDisponible(item);

    if (stockDisponible <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin stock',
        text: 'Ya no hay stock disponible de este producto'
      });
      return;
    }

    const agregado = this.carritoService.agregarProducto(item);

    if (!agregado) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: 'Ya agregaste la cantidad máxima disponible'
      });
      return;
    }

    this.actualizarContador();

    Swal.fire({
      icon: 'success',
      title: 'Agregado',
      text: `${item.nombre} fue agregado al carrito`,
      timer: 1200,
      showConfirmButton: false
    });
  }

  actualizarContador() {
    this.totalItemsCarrito = this.carritoService.contarItems();
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  irAMisPedidos() {
    this.router.navigate(['/mis-pedidos']);
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  imagenError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = '/img/productos/no-image.jpg';
  }
  obtenerCantidadEnCarrito(productoId: number): number {
    const carrito = this.carritoService.obtenerCarrito();
    const item = carrito.find(x => x.id === productoId);
    return item ? item.cantidad : 0;
  }

  obtenerStockDisponible(item: any): number {
    return item.stock - this.obtenerCantidadEnCarrito(item.id);
  }
  getImageUrl(path: string): string {
    if (!path) return '/img/no-image.jpg';
    if (path.startsWith('http')) return path;
    return `${this.apiBase}${path}`;
  }
}

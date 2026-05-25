import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CarritoService } from '../../services/carrito';
import { PedidosService } from '../../services/pedidos';
import { CuponesService } from '../../services/cupones';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito implements OnInit {
  private carritoService = inject(CarritoService);
  private pedidosService = inject(PedidosService);
  private cuponesService = inject(CuponesService);
  private router = inject(Router);

  private apiBase = environment.apiUrl.replace('/api', '');

  carrito: any[] = [];
  cupon = '';
  descuento = 0;
  subtotal = 0;
  igv = 0;
  total = 0;
  mensajeCupon = '';

  ngOnInit(): void {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.carrito = this.carritoService.obtenerCarrito();

    this.subtotal = Number(
      this.carrito
        .reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
        .toFixed(2)
    );

    this.calcularResumen();
  }

  calcularResumen() {
    const baseConDescuento = this.subtotal - this.descuento;
    const montoBase = baseConDescuento < 0 ? 0 : baseConDescuento;

    this.igv = Number((montoBase * 0.18).toFixed(2));
    this.total = Number((montoBase + this.igv).toFixed(2));
  }

  incrementarCantidad(item: any) {
    if (item.cantidad >= item.stock) {
      Swal.fire('Atención', 'Llegaste al stock máximo disponible', 'warning');
      return;
    }

    this.carritoService.aumentarCantidad(item.id);
    this.cargarCarrito();
  }

  disminuirCantidad(item: any) {
    this.carritoService.disminuirCantidad(item.id);
    this.cargarCarrito();
  }

  eliminarDelCarrito(item: any) {
    this.carritoService.eliminarProducto(item.id);
    this.cargarCarrito();
  }

  aplicarCupon() {
    const codigo = this.cupon.trim();

    if (!codigo) {
      this.mensajeCupon = 'Ingresa un código.';
      this.descuento = 0;
      this.calcularResumen();
      return;
    }

    this.cuponesService.validar(codigo, this.subtotal).subscribe({
      next: (resp) => {
        if (resp.esValido) {
          this.descuento = Number(resp.descuentoAplicado);
          this.mensajeCupon = `Cupón aplicado: ${resp.codigo}`;
        } else {
          this.descuento = 0;
          this.mensajeCupon = resp.mensaje;
        }

        this.calcularResumen();
      },
      error: (err) => {
        console.error(err);
        this.descuento = 0;
        this.mensajeCupon = 'No se pudo validar el cupón';
        this.calcularResumen();
      }
    });
  }

  quitarCupon() {
    this.cupon = '';
    this.descuento = 0;
    this.mensajeCupon = '';
    this.calcularResumen();
  }

  confirmarPedido() {
    if (this.carrito.length === 0) {
      Swal.fire('Atención', 'Tu carrito está vacío', 'warning');
      return;
    }

    const detalles = this.carrito.map(item => ({
      productoId: item.id,
      cantidad: item.cantidad
    }));

    const codigoCupon = this.descuento > 0 ? this.cupon : null;

    this.pedidosService.crearPedido(detalles, codigoCupon).subscribe({
      next: (resp) => {
        Swal.fire({
          icon: 'success',
          title: 'Pedido registrado',
          text: `Tu pedido #${resp.pedidoId} fue registrado correctamente`
        });

        this.carritoService.limpiarCarrito();
        this.cupon = '';
        this.descuento = 0;
        this.mensajeCupon = '';
        this.cargarCarrito();

        this.router.navigate(['/mis-pedidos']);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar el pedido', 'error');
      }
    });
  }

  volver() {
    this.router.navigate(['/productos']);
  }

  getImageUrl(path: string): string {
    if (!path) return '/img/productos/no-image.jpg';
    if (path.startsWith('http')) return path;
    return `${this.apiBase}${path}`;
  }

  imagenError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = '/img/productos/no-image.jpg';
  }
}

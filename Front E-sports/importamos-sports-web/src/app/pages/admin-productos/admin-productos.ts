import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-productos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css'
})
export class AdminProductos implements OnInit {
  private productosService = inject(ProductosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiBase = environment.apiUrl.replace('/api', '');

  productos: any[] = [];
  editando = false;
  productoEditandoId: number | null = null;

  marcas = [
    { id: 1, nombre: 'Nike' },
    { id: 2, nombre: 'Adidas' },
    { id: 3, nombre: 'Puma' }
  ];

  form = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagenUrl: '',
    activo: true,
    marcaId: 1
  };

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productosService.listarAdmin().subscribe({
      next: (resp) => {
        this.productos = resp;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    });
  }

  guardarProducto() {
    if (!this.form.nombre || !this.form.descripcion || this.form.precio <= 0 || this.form.stock < 0) {
      Swal.fire('Atención', 'Completa correctamente los datos del producto', 'warning');
      return;
    }

    const data = {
      id: this.editando && this.productoEditandoId ? this.productoEditandoId : 0,
      nombre: this.form.nombre,
      descripcion: this.form.descripcion,
      precio: Number(this.form.precio),
      stock: Number(this.form.stock),
      imagenUrl: this.form.imagenUrl,
      activo: this.form.activo,
      marcaId: Number(this.form.marcaId)
    };

    if (this.editando && this.productoEditandoId) {
      this.productosService.editar(this.productoEditandoId, data).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');
          this.limpiarFormulario();
          this.cargarProductos();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
        }
      });
      return;
    }

    this.productosService.crear(data).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Producto creado correctamente', 'success');
        this.limpiarFormulario();
        this.cargarProductos();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo crear el producto', 'error');
      }
    });
  }

  editarProducto(item: any) {
    this.editando = true;
    this.productoEditandoId = item.id;

    this.form = {
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio,
      stock: item.stock,
      imagenUrl: item.imagenUrl,
      activo: item.activo,
      marcaId: item.marcaId
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarProducto(item: any) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `Se eliminará ${item.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.productosService.eliminar(item.id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
          this.cargarProductos();

          if (this.productoEditandoId === item.id) {
            this.limpiarFormulario();
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
        }
      });
    });
  }

  limpiarFormulario() {
    this.editando = false;
    this.productoEditandoId = null;

    this.form = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagenUrl: '',
      activo: true,
      marcaId: 1
    };
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    this.productosService.subirImagen(file).subscribe({
      next: (resp) => {
        this.form.imagenUrl = resp.imagenUrl;
        Swal.fire({
          icon: 'success',
          title: 'Imagen subida',
          text: 'La imagen se cargó correctamente',
          timer: 1200,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo subir la imagen', 'error');
      }
    });
  }
  cambiarEstadoProducto(item: any, activo: boolean) {
    this.productosService.cambiarEstado(item.id, activo).subscribe({
      next: (resp) => {
        Swal.fire({
          icon: 'success',
          title: resp.mensaje,
          timer: 1200,
          showConfirmButton: false
        });
        this.cargarProductos();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', err?.error || 'No se pudo cambiar el estado', 'error');
      }
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  getImageUrl(path: string): string {
    if (!path) return '/img/no-image.jpg';
    if (path.startsWith('http')) return path;
    return `${this.apiBase}${path}`;
  }

  imagenError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = '/img/productos/no-image.jpg';
  }
}

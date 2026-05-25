import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CuponesService } from '../../services/cupones';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-cupones',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-cupones.html',
  styleUrl: './admin-cupones.css'
})
export class AdminCupones implements OnInit {
  private cuponesService = inject(CuponesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cupones: any[] = [];
  editando = false;
  cuponIdEditando: number | null = null;

  form = {
    codigo: '',
    tipoDescuento: 'MontoFijo',
    valor: 0,
    activo: true,
    fechaInicio: '',
    fechaFin: '',
    compraMinima: 0
  };

  ngOnInit(): void {
    this.cargarCupones();
  }

  cargarCupones() {
    this.cuponesService.listar().subscribe({
      next: (resp) => {
        this.cupones = resp;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los cupones', 'error');
      }
    });
  }

  guardarCupon() {
    if (!this.form.codigo.trim()) {
      Swal.fire('Atención', 'Ingresa el código del cupón', 'warning');
      return;
    }

    if (!this.form.tipoDescuento) {
      Swal.fire('Atención', 'Selecciona el tipo de descuento', 'warning');
      return;
    }

    if (this.form.valor <= 0) {
      Swal.fire('Atención', 'El valor del cupón debe ser mayor a 0', 'warning');
      return;
    }

    if (!this.form.fechaInicio || !this.form.fechaFin) {
      Swal.fire('Atención', 'Completa fecha inicio y fecha fin', 'warning');
      return;
    }

    if (new Date(this.form.fechaFin) <= new Date(this.form.fechaInicio)) {
      Swal.fire('Atención', 'La fecha fin debe ser mayor que la fecha inicio', 'warning');
      return;
    }

    const payload = {
      codigo: this.form.codigo.trim().toUpperCase(),
      tipoDescuento: this.form.tipoDescuento,
      valor: Number(this.form.valor),
      activo: this.form.activo,
      fechaInicio: this.form.fechaInicio,
      fechaFin: this.form.fechaFin,
      compraMinima: Number(this.form.compraMinima)
    };

    if (this.editando && this.cuponIdEditando !== null) {
      this.cuponesService.actualizar(this.cuponIdEditando, payload).subscribe({
        next: (resp) => {
          Swal.fire('Éxito', resp?.mensaje || 'Cupón actualizado correctamente', 'success');
          this.limpiarFormulario();
          this.cargarCupones();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', err?.error || 'No se pudo actualizar el cupón', 'error');
        }
      });

      return;
    }

    this.cuponesService.crear(payload).subscribe({
      next: (resp) => {
        Swal.fire('Éxito', resp?.mensaje || 'Cupón creado correctamente', 'success');
        this.limpiarFormulario();
        this.cargarCupones();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', err?.error || 'No se pudo crear el cupón', 'error');
      }
    });
  }

  editarCupon(item: any) {
    this.editando = true;
    this.cuponIdEditando = item.id;

    this.form = {
      codigo: item.codigo ?? '',
      tipoDescuento: item.tipoDescuento ?? 'MontoFijo',
      valor: Number(item.valor ?? 0),
      activo: !!item.activo,
      fechaInicio: this.formatearFechaInput(item.fechaInicio),
      fechaFin: this.formatearFechaInput(item.fechaFin),
      compraMinima: Number(item.compraMinima ?? 0)
    };
  }

  limpiarFormulario() {
    this.editando = false;
    this.cuponIdEditando = null;

    this.form = {
      codigo: '',
      tipoDescuento: 'MontoFijo',
      valor: 0,
      activo: true,
      fechaInicio: '',
      fechaFin: '',
      compraMinima: 0
    };
  }

  cambiarEstado(item: any, activo: boolean) {
    this.cuponesService.cambiarEstado(item.id, activo).subscribe({
      next: (resp) => {
        Swal.fire({
          icon: 'success',
          title: resp?.mensaje || 'Estado actualizado correctamente',
          timer: 1200,
          showConfirmButton: false
        });
        this.cargarCupones();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', err?.error || 'No se pudo actualizar el estado', 'error');
      }
    });
  }
  eliminarCupon(item: any) {
    Swal.fire({
      title: '¿Eliminar cupón?',
      text: `Se eliminará el cupón ${item.codigo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.cuponesService.eliminar(item.id).subscribe({
        next: (resp) => {
          Swal.fire('Éxito', resp?.mensaje || 'Cupón eliminado correctamente', 'success');
          this.cargarCupones();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', err?.error || 'No se pudo eliminar el cupón', 'error');
        }
      });
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private formatearFechaInput(fecha: string | null | undefined): string {
    if (!fecha) return '';

    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}

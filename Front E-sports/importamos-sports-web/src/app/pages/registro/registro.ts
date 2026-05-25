import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  private authService = inject(AuthService);
  private router = inject(Router);
  mostrarClave = false;

  form = {
    nombres: '',
    apellidos: '',
    correo: '',
    clave: '',
    telefono: ''
  };

  registrando = false;

  registrar() {
    if (
      !this.form.nombres.trim() ||
      !this.form.apellidos.trim() ||
      !this.form.correo.trim() ||
      !this.form.clave.trim() ||
      !this.form.telefono.trim()
    ) {
      Swal.fire('Atención', 'Completa todos los campos', 'warning');
      return;
    }

    this.registrando = true;

    this.authService.registrarCliente(this.form).subscribe({
      next: (resp) => {
        this.registrando = false;

        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: resp || 'Cliente registrado correctamente'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.registrando = false;
        console.error(err);

        let mensaje = 'No se pudo registrar el cliente';

        if (typeof err?.error === 'string' && err.error.trim()) {
          mensaje = err.error;
        } else if (err?.error?.title) {
          mensaje = err.error.title;
        } else if (err?.error?.message) {
          mensaje = err.error.message;
        } else if (err?.error?.errors) {
          mensaje = Object.values(err.error.errors)
            .flat()
            .join('\n');
        } else if (err?.message) {
          mensaje = err.message;
        }

        Swal.fire('Error', mensaje, 'error');
      }
    });
  }
}

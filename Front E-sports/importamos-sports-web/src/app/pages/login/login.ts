import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  correo = '';
  clave = '';
  mostrarClave = false;
  recordarme = false;
  cargando = false;

  ngOnInit(): void {
    const correoGuardado = localStorage.getItem('correo_recordado');
    if (correoGuardado) {
      this.correo = correoGuardado;
      this.recordarme = true;
    }
  }

  iniciarSesion() {
    if (!this.correo.trim() || !this.clave.trim()) {
      Swal.fire('Atención', 'Completa correo y contraseña', 'warning');
      return;
    }

    this.cargando = true;

    const data = {
      correo: this.correo,
      clave: this.clave
    };

    this.authService.login(data).subscribe({
      next: (resp) => {
        this.cargando = false;

        this.authService.guardarSesion(resp);

        if (this.recordarme) {
          localStorage.setItem('correo_recordado', this.correo);
        } else {
          localStorage.removeItem('correo_recordado');
        }

        if (resp.rol === 'Cliente') {
          this.router.navigate(['/productos']);
          return;
        }

        if (resp.rol === 'Admin' || resp.rol === 'Trabajador') {
          this.router.navigate(['/admin-pedidos']);
          return;
        }

        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        Swal.fire('Error', err?.error || 'No se pudo iniciar sesión', 'error');
      }
    });
  }
}

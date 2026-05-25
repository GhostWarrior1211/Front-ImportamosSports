import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolUsuario = authService.getRol();
  const rolesPermitidos = route.data?.['roles'] as string[];

  if (!authService.estaLogueado()) {
    router.navigate(['/login']);
    return false;
  }

  if (rolesPermitidos?.includes(rolUsuario || '')) {
    return true;
  }

  if (rolUsuario === 'Cliente') {
    router.navigate(['/productos']);
    return false;
  }

  if (rolUsuario === 'Admin' || rolUsuario === 'Trabajador') {
    router.navigate(['/admin-pedidos']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};

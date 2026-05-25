import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Productos } from './pages/productos/productos';
import { Carrito } from './pages/carrito/carrito';
import { MisPedidos } from './pages/mis-pedidos/mis-pedidos';
import { AdminPedidos } from './pages/admin-pedidos/admin-pedidos';
import { AdminCupones } from './pages/admin-cupones/admin-cupones';
import { AdminProductos } from './pages/admin-productos/admin-productos';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  {
    path: 'productos',
    component: Productos,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Cliente'] }
  },
  {
    path: 'carrito',
    component: Carrito,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Cliente'] }
  },
  {
    path: 'mis-pedidos',
    component: MisPedidos,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Cliente'] }
  },

  {
    path: 'admin-pedidos',
    component: AdminPedidos,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Trabajador'] }
  },
  {
    path: 'admin-cupones',
    component: AdminCupones,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Trabajador'] }
  },
  {
    path: 'admin-productos',
    component: AdminProductos,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Trabajador'] }
  },

  { path: '**', redirectTo: 'login' }
];

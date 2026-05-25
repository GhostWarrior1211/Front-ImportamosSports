import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private key = 'carrito';


  obtenerCarrito(): any[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  guardarCarrito(carrito: any[]) {
    localStorage.setItem(this.key, JSON.stringify(carrito));
  }

  agregarProducto(producto: any): boolean {
    const carrito = this.obtenerCarrito();
    const existe = carrito.find(x => x.id === producto.id);

    if (existe) {
      if (existe.cantidad < existe.stock) {
        existe.cantidad += 1;
        this.guardarCarrito(carrito);
        return true;
      }

      return false;
    } else {
      if (producto.stock <= 0) {
        return false;
      }

      carrito.push({
        ...producto,
        cantidad: 1
      });

      this.guardarCarrito(carrito);
      return true;
    }
  }

  eliminarProducto(id: number) {
    const carrito = this.obtenerCarrito().filter(x => x.id !== id);
    this.guardarCarrito(carrito);
  }

  aumentarCantidad(id: number) {
    const carrito = this.obtenerCarrito();
    const item = carrito.find(x => x.id === id);

    if (item && item.cantidad < item.stock) {
      item.cantidad += 1;
      this.guardarCarrito(carrito);
    }
  }

  disminuirCantidad(id: number) {
    const carrito = this.obtenerCarrito();
    const item = carrito.find(x => x.id === id);
    if (item && item.cantidad > 1) {
      item.cantidad -= 1;
      this.guardarCarrito(carrito);
    }
  }

  limpiarCarrito() {
    localStorage.removeItem(this.key);
  }

  contarItems(): number {
    const carrito = this.obtenerCarrito();
    return carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }
}

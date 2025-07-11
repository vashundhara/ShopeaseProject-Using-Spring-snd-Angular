import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../../../core/services/base.service';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getCartItems(): Observable<CartItem[]> {
    return this.get<CartItem[]>('/cart/items');
  }

  addToCart(productId: number, quantity: number): Observable<CartItem> {
    return this.post<CartItem>('/cart/items', { productId, quantity });
  }

  updateCartItem(cartItemId: number, quantity: number): Observable<CartItem> {
    return this.put<CartItem>(`/cart/items/${cartItemId}`, { quantity });
  }

  removeFromCart(cartItemId: number): Observable<void> {
    return this.delete<void>(`/cart/items/${cartItemId}`);
  }

  clearCart(): Observable<void> {
    return this.delete<void>('/cart/clear');
  }
} 
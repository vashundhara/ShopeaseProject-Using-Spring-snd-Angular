import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Order } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(customerId: number, totalAmount: number, cartItems: CartItem[]): Observable<Order> {
    const orderItems = cartItems.map(item => ({
      productId: item.productId, // Assuming CartItem has productId
      quantity: item.quantity,
      price: item.price
    }));
    return this.http.post<Order>(this.apiUrl, { customerId, totalAmount, items: orderItems });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }
} 
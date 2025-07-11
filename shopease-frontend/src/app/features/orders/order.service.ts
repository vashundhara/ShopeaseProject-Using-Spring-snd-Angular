import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8084/api/orders'; // Directly call order-service

  constructor(private http: HttpClient) { }

  getOrdersByCustomer(customerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  placeOrder(cartItems: any[], orderDetails: any) {
    const items = cartItems.map(item => ({
      productId: item.productId || item.id,
      quantity: item.quantity,
      price: item.price
    }));
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderRequest = {
      customerId: orderDetails.customerId,
      shippingAddress: orderDetails.shippingAddress,
      billingAddress: orderDetails.billingAddress,
      paymentMethod: orderDetails.paymentMethod,
      totalAmount,
      items
    };
    return this.http.post(this.apiUrl, orderRequest);
  }
} 
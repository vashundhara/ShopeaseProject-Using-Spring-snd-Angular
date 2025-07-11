import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../../../core/services/base.service';
import { Order, OrderRequest, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  createOrder(orderRequest: OrderRequest): Observable<Order> {
    return this.post<Order>('/orders', orderRequest);
  }

  getOrder(orderId: number, customerId: number): Observable<Order> {
    return this.get<Order>(`/orders/${orderId}?customerId=${customerId}`);
  }

  getCustomerOrders(customerId: number): Observable<Order[]> {
    return this.get<Order[]>(`/orders/customer/${customerId}`);
  }

  updateOrderStatus(orderId: number, customerId: number, status: OrderStatus): Observable<Order> {
    return this.put<Order>(`/orders/${orderId}/status?customerId=${customerId}&status=${status}`, {});
  }
} 
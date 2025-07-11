import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../models/order.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  displayedColumns: string[] = ['id', 'totalAmount', 'status', 'createdAt', 'actions'];
  OrderStatus = OrderStatus; // Make enum available in template

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {
    console.log('OrderListComponent constructor called'); // Debug log
  }

  ngOnInit(): void {
    console.log('OrderListComponent initialized'); // Debug log for initialization
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    const customerId = 1;
    console.log('Customer ID:', customerId); // Add this line
    
    if (!customerId) {
      this.error = 'User not authenticated';
      this.loading = false;
      this.snackBar.open(this.error, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.orderService.getCustomerOrders(customerId).subscribe({
      next: (orders) => {
        console.log('Orders loaded:', orders); // Debug log
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Order load error:', error); // Debug log for errors
        this.error = 'Failed to load orders';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  updateOrderStatus(orderId: number, status: OrderStatus): void {
    // TODO: Replace with actual customer ID from auth service
    const customerId = 1;
    
    this.orderService.updateOrderStatus(orderId, customerId, status).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.snackBar.open('Order status updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.snackBar.open('Failed to update order status', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warn'; // Or any color for pending
      case OrderStatus.PROCESSING:
        return 'primary'; // Or any color for processing
      case OrderStatus.SHIPPED:
        return 'accent'; // Or any color for shipped
      case OrderStatus.DELIVERED:
        return 'primary'; // Or any color for delivered
      case OrderStatus.CANCELLED:
        return 'warn'; // Or any color for cancelled
      case OrderStatus.REFUNDED:
        return 'warn'; // Or any color for refunded
      default:
        return '';
    }
  }
}

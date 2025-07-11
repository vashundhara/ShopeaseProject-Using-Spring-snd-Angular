import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../models/order.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error = '';
  OrderStatus = OrderStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    this.loading = true;
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    // TODO: Replace with actual customer ID from auth service
    const customerId = 1;

    this.orderService.getOrder(orderId, customerId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load order details';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  updateOrderStatus(status: OrderStatus): void {
    if (!this.order) return;

    // TODO: Replace with actual customer ID from auth service
    const customerId = 1;

    this.orderService.updateOrderStatus(this.order.id, customerId, status).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
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
        return 'accent';
      case OrderStatus.PROCESSING:
      case OrderStatus.CONFIRMED:
        return 'primary';
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
        return 'primary';
      case OrderStatus.CANCELLED:
      case OrderStatus.REFUNDED:
        return 'warn';
      default:
        return 'primary';
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}

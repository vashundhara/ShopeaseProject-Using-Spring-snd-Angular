import { Component, OnInit } from '@angular/core';
import { CartService } from './cart.service';
import { OrderService } from '../features/orders/order.service';
import { PaymentService } from './payment.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderDialogComponent } from './order-dialog.component';

@Component({
  selector: 'app-cart',
  template: `
    <h2>Cart</h2>
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error" class="error">{{ error }}</div>
    <table *ngIf="cartItems.length">
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Price</th>
      </tr>
      <tr *ngFor="let item of cartItems">
        <td>{{ item.productName }}</td>
        <td>{{ item.quantity }}</td>
        <td>{{ item.price | currency }}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2"><strong>Total</strong></td>
        <td><strong>{{ getTotal() | currency }}</strong></td>
      </tr>
    </table>
    <div *ngIf="!cartItems.length && !loading">Your cart is empty.</div>
    <button *ngIf="cartItems.length" (click)="placeOrder()" [disabled]="processingPayment">
      {{ processingPayment ? 'Processing...' : 'Place Order' }}
    </button>
  `,
  styles: [`
    .error { color: red; } 
    table { width: 100%; margin-top: 16px; } 
    th, td { padding: 8px; }
    .total-row { border-top: 2px solid #ddd; }
    button { margin-top: 16px; }
  `]
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  loading = false;
  error = '';
  processingPayment = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loading = true;
    this.cartService.getCartItems(1).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load cart items';
        this.loading = false;
      }
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  async placeOrder() {
    this.processingPayment = true;
    try {
      // Get order details from dialog
      const dialogRef = this.dialog.open(OrderDialogComponent, {
        width: '400px',
        data: {}
      });

      const orderDetails = await dialogRef.afterClosed().toPromise();
      if (!orderDetails) {
        this.processingPayment = false;
        return;
      }

      // Initiate payment link creation
      const totalAmount = Math.round(this.getTotal());
      const paymentResponse = await this.paymentService.initiatePayment(totalAmount).toPromise();

      if (paymentResponse && paymentResponse.short_url) {
        // Redirect to the payment link URL
        this.paymentService.redirectToPaymentLink(paymentResponse.short_url);

        // Note: With this approach, order completion/clearing the cart
        // would typically be handled by Razorpay webhooks to your backend
        // when the payment is successful.
        // For simplicity in this example, we might manually clear the cart
        // or show a success message after redirection, but a robust solution
        // would rely on backend processing of webhooks.

        // For now, let's just indicate the process started.
        this.processingPayment = false;
        // You might want to clear the cart here or based on a webhook
        // this.cartItems = [];

      } else {
        alert('Failed to get payment link.');
        this.processingPayment = false;
      }

    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Payment failed. Please try again.');
      this.processingPayment = false;
    }
  }
} 
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../services/order.service';
import { CartService } from '../../cart/services/cart.service';
import { OrderRequest } from '../models/order.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  loading = false;
  totalAmount = 0;
  paymentInitiated = false;
  paymentDetails: any = null;
  paymentConfirmed = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      billingAddress: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: ['QR_CODE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.loading = true;
    // TODO: Replace with actual customer ID from auth service
    const customerId = 1;

    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load cart items', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      return;
    }

    this.loading = true;
    // TODO: Replace with actual customer ID from auth service
    const customerId = 1;

    const amountInRupees = this.totalAmount;

    // Call backend payment gateway to initiate payment
    this.http.get(`http://localhost:8080/payment/${amountInRupees}`).subscribe({
      next: (paymentResponse: any) => {
        this.paymentDetails = {
          id: paymentResponse.id,
          amount: paymentResponse.amount,
          currency: paymentResponse.currency,
          qr_code_id: paymentResponse.qr_code_id,
          qr_code_image: paymentResponse.qr_code_image
        };
        this.paymentInitiated = true;
        this.loading = false;
        this.snackBar.open('Payment initiated. Please scan QR code.', 'Close', { duration: 5000 });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error initiating payment:', error);
        this.snackBar.open('Failed to initiate payment. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  confirmPaymentAndPlaceOrder(): void {
    if (!this.paymentDetails) {
      this.snackBar.open('Payment not initiated.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    // TODO: Replace with actual customer ID from auth service
    const customerId = 1;

    const orderRequest: OrderRequest = {
      customerId: customerId,
      totalAmount: this.totalAmount,
      shippingAddress: this.checkoutForm.get('shippingAddress')?.value,
      billingAddress: this.checkoutForm.get('billingAddress')?.value,
      paymentMethod: this.checkoutForm.get('paymentMethod')?.value,
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      paymentDetails: this.paymentDetails
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        this.loading = false;
        this.paymentConfirmed = true;
        this.snackBar.open('Order placed successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.cartService.clearCart().subscribe(() => {
          setTimeout(() => {
            this.router.navigate(['/orders', order.id]);
          }, 2000);
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error placing order after payment confirmation:', error);
        this.snackBar.open('Failed to place order after payment. Please contact support.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.paymentInitiated = false;
        this.paymentDetails = null;
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.checkoutForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return 'Address must be at least 10 characters long';
    }
    return '';
  }
} 
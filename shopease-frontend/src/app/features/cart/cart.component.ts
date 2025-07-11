import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { CartItem } from '../../core/models/cart-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.loading = true;
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load cart items';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', { duration: 3000 });
      }
    });
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      this.cartService.updateCartItem(item.id, newQuantity).subscribe({
        next: () => {
          item.quantity = newQuantity;
          this.snackBar.open('Cart updated', 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Failed to update cart', 'Close', { duration: 3000 });
        }
      });
    }
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.snackBar.open('Item removed from cart', 'Close', { duration: 2000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to remove item', 'Close', { duration: 3000 });
      }
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('Your cart is empty', 'Close', { duration: 3000 });
      return;
    }
    this.router.navigate(['/orders/checkout']);
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('Your cart is empty', 'Close', { duration: 3000 });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.snackBar.open('User not authenticated or customer ID not available.', 'Close', { duration: 3000 });
      return;
    }

    const customerId = currentUser.id;
    const totalAmount = this.getTotal();

    this.loading = true;
    this.orderService.createOrder(customerId, totalAmount, this.cartItems).subscribe({
      next: (order) => {
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        this.cartService.clearCart().subscribe(() => {
          this.cartItems = [];
          this.router.navigate(['/orders']);
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error placing order:', error);
        this.snackBar.open('Failed to place order. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
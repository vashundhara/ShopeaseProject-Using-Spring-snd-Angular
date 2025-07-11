import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from './product.service';
import { CartService } from '../cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-list',
  template: `
    <div class="product-list">
      <h2>Products</h2>
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div class="product-grid" *ngIf="products.length">
        <mat-card *ngFor="let product of products" class="product-card">
          <img mat-card-image [src]="product.imageUrl" [alt]="product.name" />
          <mat-card-title>{{ product.name }}</mat-card-title>
          <mat-card-content>
            <p>{{ product.description }}</p>
            <p><strong>Price:</strong> {{ product.price | currency }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="addToCart(product)">Add to Cart</button>
          </mat-card-actions>
        </mat-card>
      </div>
      <div *ngIf="message" class="message">{{ message }}</div>
    </div>
  `,
  styles: [`
    .product-list { padding: 20px; }
    .error { color: red; }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 24px;
    }
    .product-card {
      max-width: 300px;
      margin: auto;
    }
    .message { color: green; margin-top: 16px; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  message = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product).subscribe({
      next: () => {
        this.snackBar.open(`${product.name} added to cart!`, 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to add to cart.', 'Close', { duration: 2000 });
      }
    });
  }
} 
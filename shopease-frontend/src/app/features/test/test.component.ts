import { Component, OnInit } from '@angular/core';
import { ProductService } from '../products/services/product.service';
import { CartService } from '../cart/services/cart.service';
import { Product } from '../products/models/product.model';
import { CartItem } from '../cart/models/cart-item.model';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  products: Product[] | null = null;
  cartItems: CartItem[] | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {}

  testProductService() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        console.log('Products:', products);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  testCartService() {
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        console.log('Cart Items:', items);
      },
      error: (error) => {
        console.error('Error fetching cart items:', error);
      }
    });
  }
} 
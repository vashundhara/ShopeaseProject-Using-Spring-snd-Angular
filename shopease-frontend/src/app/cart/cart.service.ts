import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../products/product.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:8087/api/cart';

  constructor(private http: HttpClient) {}

  addToCart(product: Product): Observable<any> {
    // You may want to include userId and quantity in a real app
    const cartItem = {
      userId: 1, // Hardcoded for demo; replace with real user ID
      productId: product.id,
      quantity: 1,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    };
    return this.http.post(this.apiUrl, cartItem);
  }

  getCartItems(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }
} 
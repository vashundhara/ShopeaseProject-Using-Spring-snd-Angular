import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../../../core/services/base.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getProducts(): Observable<Product[]> {
    return this.get<Product[]>('/products');
  }

  getProduct(id: number): Observable<Product> {
    return this.get<Product>(`/products/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.post<Product>('/products', product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.put<Product>(`/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.delete<void>(`/products/${id}`);
  }
} 
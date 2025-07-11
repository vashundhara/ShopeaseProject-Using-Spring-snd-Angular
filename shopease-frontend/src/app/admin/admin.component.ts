import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface Order {
  id: number;
  customerId: number;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  items: any[];
}

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

@Component({
  selector: 'app-admin',
  template: `
    <mat-tab-group>
      <mat-tab label="Orders">
        <div style="padding: 16px;">
          <h2>Orders Management</h2>
          <table mat-table [dataSource]="orders" class="mat-elevation-z8" *ngIf="orders">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>Order ID</th>
              <td mat-cell *matCellDef="let order">{{ order.id }}</td>
            </ng-container>
            <ng-container matColumnDef="customerId">
              <th mat-header-cell *matHeaderCellDef>Customer ID</th>
              <td mat-cell *matCellDef="let order">{{ order.customerId }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let order">
                <mat-form-field appearance="fill" style="width: 120px;">
                  <mat-select [formControl]="order.statusControl">
                    <mat-option *ngFor="let s of orderStatuses" [value]="s">{{ s }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-button color="primary" (click)="updateStatus(order)">Update</button>
              </td>
            </ng-container>
            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let order">{{ order.totalAmount | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let order">{{ order.createdAt | date:'short' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="orders && orders.length === 0" style="margin-top: 16px;">No orders found.</div>
          <div *ngIf="error" class="error">{{ error }}</div>
        </div>
      </mat-tab>
      <mat-tab label="Products">
        <div style="padding: 16px; max-width: 600px;">
          <h2>Product Management</h2>
          <form [formGroup]="productForm" (ngSubmit)="editingProduct ? updateProduct() : addProduct()">
            <mat-form-field appearance="fill" style="width: 100%;">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required />
            </mat-form-field>
            <mat-form-field appearance="fill" style="width: 100%;">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" required></textarea>
            </mat-form-field>
            <mat-form-field appearance="fill" style="width: 100%;">
              <mat-label>Price</mat-label>
              <input matInput type="number" formControlName="price" required />
            </mat-form-field>
            <mat-form-field appearance="fill" style="width: 100%;">
              <mat-label>Stock</mat-label>
              <input matInput type="number" formControlName="stock" required />
            </mat-form-field>
            <mat-form-field appearance="fill" style="width: 100%;">
              <mat-label>Category</mat-label>
              <input matInput formControlName="category" required />
            </mat-form-field>
            <mat-form-field appearance="fill" style="width: 100%;">
              <mat-label>Image URL</mat-label>
              <input matInput formControlName="imageUrl" required />
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || addingProduct">
              {{ editingProduct ? 'Update Product' : 'Add Product' }}
            </button>
            <button *ngIf="editingProduct" mat-button type="button" (click)="cancelEdit()">Cancel</button>
            <span *ngIf="addProductSuccess" style="color: green; margin-left: 16px;">Product saved!</span>
            <span *ngIf="addProductError" style="color: red; margin-left: 16px;">Failed to save product</span>
          </form>
          <h3 style="margin-top: 32px;">All Products</h3>
          <table mat-table [dataSource]="products" class="mat-elevation-z8" *ngIf="products">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let product">{{ product.id }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let product">{{ product.name }}</td>
            </ng-container>
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let product">{{ product.price | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let product">{{ product.stock }}</td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let product">{{ product.category }}</td>
            </ng-container>
            <ng-container matColumnDef="imageUrl">
              <th mat-header-cell *matHeaderCellDef>Image</th>
              <td mat-cell *matCellDef="let product"><img [src]="product.imageUrl" alt="{{product.name}}" style="max-width: 60px; max-height: 40px;"></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let product">
                <button mat-button color="accent" (click)="startEdit(product)">Edit</button>
                <button mat-button color="warn" (click)="deleteProduct(product)">Delete</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="productColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: productColumns;"></tr>
          </table>
          <div *ngIf="products && products.length === 0" style="margin-top: 16px;">No products found.</div>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`.error { color: red; } table { width: 100%; margin-top: 16px; } th, td { padding: 8px; }`]
})
export class AdminComponent implements OnInit {
  orders: any[] = [];
  error = '';
  displayedColumns = ['id', 'customerId', 'status', 'totalAmount', 'createdAt'];
  orderStatuses = ['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'];

  products: Product[] = [];
  productColumns = ['id', 'name', 'price', 'stock', 'category', 'imageUrl', 'actions'];
  productForm: FormGroup;
  addingProduct = false;
  addProductSuccess = false;
  addProductError = false;
  editingProduct: Product | null = null;

  constructor(private http: HttpClient) {
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      price: new FormControl('', [Validators.required, Validators.min(0.01)]),
      stock: new FormControl('', [Validators.required, Validators.min(0)]),
      category: new FormControl('', Validators.required),
      imageUrl: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.fetchOrders();
    this.fetchProducts();
  }

  fetchOrders() {
    this.http.get<Order[]>('http://localhost:8080/api/orders/admin').subscribe({
      next: (orders) => {
        this.orders = orders.map(order => ({
          ...order,
          statusControl: new FormControl(order.status)
        }));
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to load orders';
      }
    });
  }

  updateStatus(order: any) {
    const newStatus = order.statusControl.value;
    this.http.put(`http://localhost:8080/api/orders/admin/${order.id}/status?status=${newStatus}`, {}).subscribe({
      next: () => {
        order.status = newStatus;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to update order status';
      }
    });
  }

  fetchProducts() {
    this.http.get<Product[]>('http://localhost:8080/api/products').subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.products = [];
      }
    });
  }

  addProduct() {
    if (this.productForm.invalid) return;
    this.addingProduct = true;
    this.addProductSuccess = false;
    this.addProductError = false;
    const product: Product = this.productForm.value;
    this.http.post<Product>('http://localhost:8080/api/products', product).subscribe({
      next: (newProduct) => {
        this.products.push(newProduct);
        this.productForm.reset();
        this.addProductSuccess = true;
        this.addingProduct = false;
      },
      error: () => {
        this.addProductError = true;
        this.addingProduct = false;
      }
    });
  }

  startEdit(product: Product) {
    this.editingProduct = { ...product };
    this.productForm.setValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl
    });
    this.addProductSuccess = false;
    this.addProductError = false;
  }

  cancelEdit() {
    this.editingProduct = null;
    this.productForm.reset();
    this.addProductSuccess = false;
    this.addProductError = false;
  }

  updateProduct() {
    if (!this.editingProduct || this.productForm.invalid) return;
    this.addingProduct = true;
    this.addProductSuccess = false;
    this.addProductError = false;
    const updatedProduct: Product = { ...this.editingProduct, ...this.productForm.value };
    this.http.put<Product>(`http://localhost:8080/api/products/${updatedProduct.id}`, updatedProduct).subscribe({
      next: (prod) => {
        const idx = this.products.findIndex(p => p.id === prod.id);
        if (idx !== -1) this.products[idx] = prod;
        this.cancelEdit();
        this.addProductSuccess = true;
        this.addingProduct = false;
      },
      error: () => {
        this.addProductError = true;
        this.addingProduct = false;
      }
    });
  }

  deleteProduct(product: Product) {
    if (!confirm(`Are you sure you want to delete product '${product.name}'?`)) return;
    this.http.delete(`http://localhost:8080/api/products/${product.id}`).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== product.id);
      },
      error: () => {
        alert('Failed to delete product');
      }
    });
  }
} 
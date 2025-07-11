import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-order-dialog',
  template: `
    <h2 mat-dialog-title>Order Details</h2>
    <form [formGroup]="orderForm" (ngSubmit)="onSubmit()" mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Customer ID</mat-label>
        <input matInput formControlName="customerId" type="number" required />
      </mat-form-field>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Shipping Address</mat-label>
        <input matInput formControlName="shippingAddress" required />
      </mat-form-field>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Billing Address</mat-label>
        <input matInput formControlName="billingAddress" required />
      </mat-form-field>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Payment Method</mat-label>
        <input matInput formControlName="paymentMethod" required />
      </mat-form-field>
      <div mat-dialog-actions style="margin-top: 16px;">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="orderForm.invalid">Place Order</button>
      </div>
    </form>
  `
})
export class OrderDialogComponent {
  orderForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.orderForm = this.fb.group({
      customerId: [data?.customerId || '', Validators.required],
      shippingAddress: [data?.shippingAddress || '', Validators.required],
      billingAddress: [data?.billingAddress || '', Validators.required],
      paymentMethod: [data?.paymentMethod || '', Validators.required],
    });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      this.dialogRef.close(this.orderForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 
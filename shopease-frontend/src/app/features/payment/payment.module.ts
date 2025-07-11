import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentFailureComponent } from './payment-failure/payment-failure.component';



@NgModule({
  declarations: [
    PaymentFormComponent,
    PaymentSuccessComponent,
    PaymentFailureComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PaymentModule { }

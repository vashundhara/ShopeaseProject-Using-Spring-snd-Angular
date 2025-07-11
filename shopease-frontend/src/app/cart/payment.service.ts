import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8006/payment'; // Payment gateway endpoint

  constructor(private http: HttpClient) {}

  // Now initiates creation of a Payment Link instead of a QR code
  initiatePayment(amount: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${amount}`);
  }

  // This method is no longer needed for this approach
  // createRazorpayOrder(orderDetails: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const options = {
  //       key: 'rzp_test_Uj39upN4G9uX5p', // Using backend key ID for testing
  //       amount: orderDetails.amount,
  //       currency: orderDetails.currency,
  //       name: 'ShopEase',
  //       description: 'Payment for your order',
  //       order_id: orderDetails.id,
  //       handler: (response: any) => {
  //         resolve(response);
  //       },
  //       prefill: {
  //         name: 'Customer Name',
  //         email: 'customer@example.com',
  //         contact: '9999999999'
  //       },
  //       theme: {
  //         color: '#3399cc'
  //       }
  //     };

  //     const rzp = new Razorpay(options);
  //     rzp.open();
  //   });
  // }

  // This method will open the Payment Link URL
  redirectToPaymentLink(shortUrl: string): void {
    window.open(shortUrl, '_blank');
  }

  // You could add a method here to generate a QR code image from the shortUrl
  // using a library if you prefer displaying a QR code on the page.
} 
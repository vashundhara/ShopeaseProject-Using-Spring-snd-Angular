package com.spring.controller;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.PaymentLink;

@RestController
@CrossOrigin
public class PaymentIntegrationController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentIntegrationController.class); // Logger instance

    @Value("${rzp_key_id}")
    private String keyId;

    @Value("${rzp_key_secret}")
    private String secret;

    @GetMapping("/payment/{amount}")
    public String Payment(@PathVariable int amount) throws RazorpayException {
        logger.info("Request received to initiate payment for amount: {}", amount);

        try {
            RazorpayClient razorpayClient = new RazorpayClient(keyId, secret);

            JSONObject paymentLinkRequest = new JSONObject();
            paymentLinkRequest.put("amount", amount * 100); // amount in paise
            paymentLinkRequest.put("currency", "INR");
            paymentLinkRequest.put("accept_partial", false);
            paymentLinkRequest.put("first_min_partial_amount", amount * 100);
            paymentLinkRequest.put("expire_by", System.currentTimeMillis() / 1000L + 3600); // Link valid for 1 hour
            paymentLinkRequest.put("reference_id", "order_receipt_" + System.currentTimeMillis()); // Using a timestamp for uniqueness
            paymentLinkRequest.put("description", "Payment for order");

            JSONObject customer = new JSONObject();
            customer.put("name", "Test Customer"); // Replace with actual customer name
            customer.put("contact", "+919876543210"); // Replace with actual customer contact
            customer.put("email", "test.customer@example.com"); // Replace with actual customer email
            paymentLinkRequest.put("customer", customer);

            JSONObject notify = new JSONObject();
            notify.put("sms", true);
            notify.put("email", true);
            paymentLinkRequest.put("notify", notify);

            paymentLinkRequest.put("reminder_enable", true);

            JSONObject notes = new JSONObject();
            notes.put("order_id", "order_receipt_11"); // Link to your internal order ID
            paymentLinkRequest.put("notes", notes);

            PaymentLink paymentLink = razorpayClient.paymentLink.create(paymentLinkRequest);

            String paymentLinkId = paymentLink.get("id").toString();
            String shortUrl = paymentLink.get("short_url").toString();

            logger.info("Payment Link created successfully with ID: {} and URL: {}", paymentLinkId, shortUrl);

            // Return the payment link URL to the frontend
            JSONObject response = new JSONObject();
            response.put("payment_link_id", paymentLinkId);
            response.put("short_url", shortUrl);
            // We no longer need to return qr_code_id and qr_code_image

            return response.toString();

        } catch (RazorpayException e) {
            logger.error("Error occurred while creating payment link: {}", e.getMessage());
            throw e;
        }
    }

}

package com.shopease.cart.service;

import com.shopease.cart.entity.CartItem;
import com.shopease.cart.entity.ShoppingCart;
import com.shopease.cart.exception.CartItemNotFoundException;
import com.shopease.cart.repository.CartRepository;
import com.shopease.cart.repository.ShoppingCartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CartService {
    private static final Logger logger = LoggerFactory.getLogger(CartService.class);
    
    private final CartRepository cartRepository;
    private final ShoppingCartRepository shoppingCartRepository;

    @Autowired
    public CartService(CartRepository cartRepository, ShoppingCartRepository shoppingCartRepository) {
        this.cartRepository = cartRepository;
        this.shoppingCartRepository = shoppingCartRepository;
    }

    @Transactional
    public CartItem addToCart(CartItem cartItem) {
        try {
            // Get or create shopping cart for the user
            ShoppingCart shoppingCart = shoppingCartRepository.findByUserId(cartItem.getUserId());
            logger.debug("Found shopping cart: {}", shoppingCart);
            
            if (shoppingCart == null) {
                shoppingCart = new ShoppingCart();
                shoppingCart.setUserId(cartItem.getUserId());
                shoppingCart = shoppingCartRepository.save(shoppingCart);
                logger.debug("Created new shopping cart: {}", shoppingCart);
            }
            
            // Check if item already exists in cart
            CartItem existingItem = cartRepository.findByUserIdAndProductId(
                cartItem.getUserId(), cartItem.getProductId());
            
            if (existingItem != null) {
                existingItem.setQuantity(existingItem.getQuantity() + cartItem.getQuantity());
                existingItem.setShoppingCart(shoppingCart);
                CartItem savedItem = cartRepository.save(existingItem);
                logger.debug("Updated existing cart item: {}", savedItem);
                return savedItem;
            }
            
            // Set up new cart item
            cartItem.setShoppingCart(shoppingCart);
            CartItem savedItem = cartRepository.save(cartItem);
            logger.debug("Saved new cart item: {}", savedItem);
            
            return savedItem;
        } catch (Exception e) {
            logger.error("Error adding item to cart", e);
            throw new RuntimeException("Error adding item to cart: " + e.getMessage(), e);
        }
    }

    public List<CartItem> getCartItems(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public CartItem updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        CartItem cartItem = cartRepository.findByUserIdAndProductId(userId, productId);
        if (cartItem == null) {
            throw new CartItemNotFoundException("Cart item not found for user " + userId + " and product " + productId);
        }
        cartItem.setQuantity(quantity);
        return cartRepository.save(cartItem);
    }

    public void removeFromCart(Long userId, Long productId) {
        cartRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
    }
} 
package com.shopease.cart.service;

import com.shopease.cart.entity.CartItem;
import com.shopease.cart.entity.ShoppingCart;
import com.shopease.cart.exception.CartItemNotFoundException;
import com.shopease.cart.repository.CartRepository;
import com.shopease.cart.repository.ShoppingCartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ShoppingCartRepository shoppingCartRepository;

    @InjectMocks
    private CartService cartService;

    private CartItem cartItem;
    private ShoppingCart shoppingCart;

    @BeforeEach
    void setUp() {
        cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setUserId(1L);
        cartItem.setProductId(1L);
        cartItem.setQuantity(2);
        cartItem.setProductName("Test Product");
        cartItem.setPrice(new BigDecimal("19.99"));
        cartItem.setImageUrl("test-image.jpg");

        shoppingCart = new ShoppingCart();
        shoppingCart.setId(1L);
        shoppingCart.setUserId(1L);
    }

    @Test
    void addToCart_NewItem_Success() {
        when(shoppingCartRepository.findByUserId(anyLong())).thenReturn(null);
        when(shoppingCartRepository.save(any(ShoppingCart.class))).thenReturn(shoppingCart);
        when(cartRepository.findByUserIdAndProductId(anyLong(), anyLong())).thenReturn(null);
        when(cartRepository.save(any(CartItem.class))).thenReturn(cartItem);

        CartItem result = cartService.addToCart(cartItem);

        assertNotNull(result);
        assertEquals(cartItem.getId(), result.getId());
        verify(cartRepository).save(any(CartItem.class));
    }

    @Test
    void addToCart_ExistingItem_UpdatesQuantity() {
        CartItem existingItem = new CartItem();
        existingItem.setQuantity(1);
        
        when(shoppingCartRepository.findByUserId(anyLong())).thenReturn(shoppingCart);
        when(cartRepository.findByUserIdAndProductId(anyLong(), anyLong())).thenReturn(existingItem);
        when(cartRepository.save(any(CartItem.class))).thenReturn(existingItem);

        CartItem result = cartService.addToCart(cartItem);

        assertNotNull(result);
        assertEquals(3, result.getQuantity()); // 1 + 2
        verify(cartRepository).save(any(CartItem.class));
    }

    @Test
    void getCartItems_ReturnsItems() {
        List<CartItem> expectedItems = Arrays.asList(cartItem);
        when(cartRepository.findByUserId(anyLong())).thenReturn(expectedItems);

        List<CartItem> result = cartService.getCartItems(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(cartRepository).findByUserId(1L);
    }

    @Test
    void updateCartItemQuantity_Success() {
        when(cartRepository.findByUserIdAndProductId(anyLong(), anyLong())).thenReturn(cartItem);
        when(cartRepository.save(any(CartItem.class))).thenReturn(cartItem);

        CartItem result = cartService.updateCartItemQuantity(1L, 1L, 5);

        assertNotNull(result);
        assertEquals(5, result.getQuantity());
        verify(cartRepository).save(any(CartItem.class));
    }

    @Test
    void updateCartItemQuantity_ItemNotFound_ThrowsException() {
        when(cartRepository.findByUserIdAndProductId(anyLong(), anyLong())).thenReturn(null);

        assertThrows(CartItemNotFoundException.class, () -> {
            cartService.updateCartItemQuantity(1L, 1L, 5);
        });
    }

    @Test
    void removeFromCart_Success() {
        doNothing().when(cartRepository).deleteByUserIdAndProductId(anyLong(), anyLong());

        assertDoesNotThrow(() -> {
            cartService.removeFromCart(1L, 1L);
        });

        verify(cartRepository).deleteByUserIdAndProductId(1L, 1L);
    }

    @Test
    void clearCart_Success() {
        doNothing().when(cartRepository).deleteByUserId(anyLong());

        assertDoesNotThrow(() -> {
            cartService.clearCart(1L);
        });

        verify(cartRepository).deleteByUserId(1L);
    }
} 
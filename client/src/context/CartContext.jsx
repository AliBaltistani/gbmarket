import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const stored = localStorage.getItem('gbmarket_cart');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('gbmarket_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addItem = (product, weightOption, quantity) => {
        setCartItems(prev => {
            // Check if item with same id and weight already exists
            const existingKey = prev.findIndex(item => item.product_id === product.id && item.weight_option === weightOption.label);
            if (existingKey >= 0) {
                const updated = [...prev];
                updated[existingKey].quantity += quantity;
                return updated;
            }
            return [...prev, {
                product_id: product.id,
                slug: product.slug,
                product_name: product.name,
                image: product.images?.[0] || product.image_url,
                weight_option: weightOption?.label || 'Standard',
                price: weightOption?.price || product.base_price || product.basePrice || 0,
                quantity: quantity || 1
            }];
        });
        toast.success(`Added ${quantity} x ${product.name} to cart.`);
    };

    const removeItem = (productId, weightOption) => {
        setCartItems(prev => prev.filter(item => !(item.product_id === productId && item.weight_option === weightOption)));
        toast.success(`Item removed from cart.`);
    };

    const updateQuantity = (productId, weightOption, delta) => {
        setCartItems(prev => prev.map(item => {
            if (item.product_id === productId && item.weight_option === weightOption) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addItem, removeItem, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

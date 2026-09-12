import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(undefined);
const STORAGE_KEY = "velora_cart";

function sameLine(a, productId, size, color) {
  return a.productId === productId && a.size === size && a.color === color;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item) {
    setItems((prev) => {
      const existing = prev.find((p) => sameLine(p, item.productId, item.size, item.color));
      if (existing) {
        return prev.map((p) =>
          sameLine(p, item.productId, item.size, item.color)
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });
  }

  function removeItem(productId, size, color) {
    setItems((prev) => prev.filter((p) => !sameLine(p, productId, size, color)));
  }

  function updateQuantity(productId, size, color, quantity) {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((p) => (sameLine(p, productId, size, color) ? { ...p, quantity } : p))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

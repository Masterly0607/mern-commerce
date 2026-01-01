import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const response = await axios.get("/coupons");
      set({ coupon: response.data });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  },
  applyCoupon: async (code) => {
    try {
      const response = await axios.post("/coupons/validate", { code });
      set({ coupon: response.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");

      const normalized = (res.data || []).map((item) => ({
        product: item.product ?? item, // if backend returns product directly
        quantity: item.quantity ?? 1,
      }));

      set({ cart: normalized });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  clearCart: async () => {
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
  },
  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });
      toast.success("Product added to cart");

      set((prev) => {
        const idx = prev.cart.findIndex(
          (item) => item.product?._id === product._id
        );

        if (idx !== -1) {
          const newCart = [...prev.cart];
          newCart[idx] = {
            ...newCart[idx],
            quantity: newCart[idx].quantity + 1,
          };
          return { cart: newCart };
        }

        return { cart: [...prev.cart, { product, quantity: 1 }] };
      });

      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  removeFromCart: async (productId) => {
    try {
      if (!productId) return;

      await axios.delete("/cart", { data: { productId } });

      set((prev) => ({
        cart: prev.cart.filter((item) => item.product?._id !== productId),
      }));

      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      if (!productId) return;
      if (quantity <= 0) return get().removeFromCart(productId);

      await axios.put(`/cart/${productId}`, { quantity });

      set((prev) => ({
        cart: prev.cart.map((item) =>
          item.product?._id === productId ? { ...item, quantity } : item
        ),
      }));

      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();

    const subtotal = cart.reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);

    let total = subtotal;

    if (coupon) {
      total = subtotal - subtotal * (coupon.discountPercentage / 100);
    }

    set({ subtotal, total });
  },
}));

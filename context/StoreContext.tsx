import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Category,
  Supplier,
  Product,
  Order,
  User,
  CartItem,
  OrderItem,
  Role,
} from "../types";
import { uid } from "../utils";

interface StoreContextType {
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  orders: Order[];
  users: User[];
  currentUser: User | null;
  cart: CartItem[];
  loading: boolean;

  login: (identifier: string, password?: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    role: Role,
    extras?: Partial<User>,
  ) => Promise<User>;
  logout: () => void;

  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;

  registerSupplier: (name: string) => Promise<Supplier>;
  toggleSupplierStatus: (id: string) => Promise<void>;

  verifyUser: (userId: string, status: boolean, expirationDate?: string) => Promise<void>;
  uploadUserDocument: (userId: string, key: string, file: File) => Promise<string>;

  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addToCart: (product: Product, qty: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  placeOrder: (paymentMethod: "cod" | "card") => Promise<Order>;
  markOrderDelivered: (orderId: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: "placed" | "delivered" | "refunded" | "disposed",
  ) => Promise<void>;
  refundOrderItem: (orderId: string, productId: string) => Promise<void>;
  refundOrder: (orderId: string) => Promise<void>;
  disposeOrder: (orderId: string) => Promise<void>;

  updateUserProfile: (
    updates: Partial<Pick<User, "email" | "phone" | "pfp" | "name">>,
  ) => Promise<void>;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
  uploadUserProfilePicture: (file: File) => Promise<string>;
  getUserPayments: () => Order[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("bs:user");
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() =>
    JSON.parse(localStorage.getItem("bs:cart") || "[]"),
  );
  const [loading, setLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, supsRes, prodsRes, usersRes, ordersRes] =
          await Promise.all([
            fetch("/api/categories"),
            fetch("/api/suppliers"),
            fetch("/api/products"),
            fetch("/api/users"),
            fetch("/api/orders"),
          ]);

        const [cats, sups, prods, usrs, ords] = await Promise.all([
          catsRes.json(),
          supsRes.json(),
          prodsRes.json(),
          usersRes.json(),
          ordersRes.json(),
        ]);

        setCategories(cats);
        setSuppliers(sups);
        setProducts(prods);
        setUsers(usrs);
        setOrders(ords);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser)
      localStorage.setItem("bs:user", JSON.stringify(currentUser));
    else localStorage.removeItem("bs:user");
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("bs:cart", JSON.stringify(cart));
  }, [cart]);

  const login = async (identifier: string, password?: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    const user = await res.json();
    setCurrentUser(user);
  };

  const register = async (
    name: string,
    email: string,
    role: Role,
    extras?: Partial<User>,
  ) => {
    const id = uid();
    const registrationDate = new Date().toISOString();
    let supplierId = extras?.supplierId;
    let finalRole = role;
    let finalName = name;

    if (role === "supplier" || role === "supplier-admin") {
      const newSupplier = await registerSupplier(extras?.businessName || name);
      finalRole = "supplier-admin";
      supplierId = newSupplier.id;
      finalName = extras?.businessName || name;
    }

    const newUser = {
      id,
      name: finalName,
      email,
      role: finalRole,
      verified: false,
      registrationDate,
      supplierId,
      suspended: true,
      ...extras,
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const registerSupplier = async (name: string) => {
    const id = uid();
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, active: true, joinedAt: new Date().toISOString() }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to register supplier");
    }

    const newSupplier = await res.json();
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  };

  const verifyUser = async (
    userId: string,
    status: boolean,
    expirationDate?: string,
  ) => {
    const payload: any = { verified: status };
    if (status && expirationDate) payload.expirationDate = expirationDate;

    const res = await fetch(`/api/users/${userId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? updated : u)),
      );
      if (currentUser?.id === userId) {
        setCurrentUser(updated);
      }
    }
  };

  const addCategory = async (name: string) => {
    const id = uid();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });

    if (res.ok) {
      setCategories((prev) => [...prev, { id, name }]);
    }
  };

  const updateCategory = async (id: string, name: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name } : c)),
      );
    }
  };

  const toggleSupplierStatus = async (id: string) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) return;

    const res = await fetch(`/api/suppliers/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !supplier.active }),
    });

    if (res.ok) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
      );
    }
  };

  const addProduct = async (productData: Omit<Product, "id">) => {
    const id = uid();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...productData, id }),
    });

    if (res.ok) {
      setProducts((prev) => [...prev, { ...productData, id }]);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    }
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const addToCart = (product: Product, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item,
        );
      }
      return [...prev, { product, qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, qty } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (paymentMethod: "cod" | "card") => {
    if (!currentUser || cart.length === 0)
      throw new Error("Cannot place order");

    const subtotal = cart.reduce(
      (acc, item) => acc + item.product.price * item.qty,
      0,
    );
    const deliveryFee = subtotal > 1000 ? 0 : 50;
    const total = subtotal + deliveryFee;

    const createdAt = new Date().toISOString();

    const orderItems: OrderItem[] = cart.map((c) => ({
      productId: c.product.id,
      productName: c.product.name,
      price: c.product.price,
      qty: c.qty,
      supplierId: c.product.supplierId,
      refundable: c.product.nonRefundable ? false : true,
      refunded: false,
    }));

    const newOrder: Order = {
      id: `ORD-${uid().toUpperCase()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      status: "placed",
      createdAt,
      date: createdAt,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });

    if (res.ok) {
      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    } else {
      throw new Error("Failed to place order");
    }
  };

  const patchOrder = async (orderId: string, updates: Partial<Order>) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update order");
    }

    const updatedOrder = await res.json();

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    return updatedOrder;
  };

  const markOrderDelivered = async (orderId: string) => {
    const deliveredAt = new Date().toISOString();
    await patchOrder(orderId, {
      status: "delivered",
      deliveredAt,
      deliveredBy: currentUser?.name || "Unknown Driver",
    });
  };

  const updateOrderStatus = async (
    orderId: string,
    status: "placed" | "delivered" | "refunded" | "disposed",
  ) => {
    const updates: Partial<Order> = { status };
    if (status === "refunded") updates.refundedAt = new Date().toISOString();
    if (status === "disposed") updates.disposedAt = new Date().toISOString();
    await patchOrder(orderId, updates);
  };

  const refundOrderItem = async (orderId: string, productId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const updatedItems = order.items.map((item) =>
      item.productId === productId ? { ...item, refunded: true } : item,
    );

    const allRefunded = updatedItems.every((item) =>
      item.refundable !== false ? item.refunded : true,
    );

    await patchOrder(orderId, {
      items: updatedItems,
      status: allRefunded ? "refunded" : order.status,
      refundedAt: new Date().toISOString(),
    });
  };

  const refundOrder = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const updatedItems = order.items.map((item) =>
      item.refundable === false ? item : { ...item, refunded: true },
    );

    await patchOrder(orderId, {
      items: updatedItems,
      status: "refunded",
      refundedAt: new Date().toISOString(),
    });
  };

  const disposeOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "disposed");
  };

  const updateUserProfile = async (
    updates: Partial<Pick<User, "email" | "phone" | "pfp" | "name">>,
  ) => {
    if (!currentUser) throw new Error("Not authenticated");
    const res = await fetch(`/api/users/${currentUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update profile");
    }

    const updatedUser = await res.json();
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
  };

  const updateUserRole = async (userId: string, role: Role) => {
    if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'admin')) {
      throw new Error("Not authorized");
    }

    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update user role");
    }

    const updatedUser = await res.json();
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
  };

  const uploadUserProfilePicture = async (file: File) => {
    if (!currentUser) throw new Error("Not authenticated");

    const form = new FormData();
    form.append("pfp", file);

    const res = await fetch(`/api/users/${currentUser.id}/pfp`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to upload profile picture");
    }

    const data = await res.json();
    const updatedUser = { ...currentUser, pfp: data.pfp };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
    return data.pfp as string;
  };

  const uploadUserDocument = async (
    userId: string,
    key: string,
    file: File,
  ) => {
    const form = new FormData();
    form.append("document", file);
    form.append("key", key);

    const res = await fetch(`/api/users/${userId}/documents`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to upload document");
    }

    const data = await res.json();
    const updatedDocs = data.documents as Record<string, string>;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              documents: updatedDocs,
            }
          : u,
      ),
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, documents: updatedDocs } : null));
    }

    return updatedDocs[key];
  };

  const getUserPayments = () => {
    if (!currentUser) return [];
    return orders.filter((o) => o.userId === currentUser.id);
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        suppliers,
        products,
        orders,
        users,
        currentUser,
        cart,
        loading,
        login,
        register,
        logout,
        addCategory,
        updateCategory,
        registerSupplier,
        toggleSupplierStatus,
        verifyUser,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        placeOrder,
        markOrderDelivered,
        updateOrderStatus,
        refundOrderItem,
        refundOrder,
        disposeOrder,
        updateUserProfile,
        updateUserRole,
        uploadUserProfilePicture,
        uploadUserDocument,
        getUserPayments,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};

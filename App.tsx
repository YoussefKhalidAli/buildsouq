import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
  useParams,
} from "react-router-dom";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Login } from "./views/Login";
import { Marketplace } from "./views/Marketplace/Marketplace";
import { SupplierDashboard } from "./views/Supplier/SupplierDashboard";
import { SuperAdminDashboard } from "./views/Admin/SuperAdminDashboard";
import { DeliveryDashboard } from "./views/Delivery/DeliveryDashboard";
import { Header } from "./components/layout/Header";
import { CartDrawer } from "./views/Marketplace/CartDrawer";
import { Invoice } from "./views/Marketplace/Invoice";

const rolePath = (role: string) => {
  switch (role) {
    case "superadmin":
      return "/superadmin";
    case "supplier":
    case "supplier-admin":
      return "/supplier";
    case "delivery":
      return "/delivery";
    case "user":
    default:
      return "/marketplace";
  }
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

const Layout = () => {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  const isCartOpen = location.pathname === "/cart";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>

      {currentUser?.role === "user" && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => navigate("/marketplace")}
          onInvoiceRequest={(order) => navigate(`/invoice/${order.id}`)}
        />
      )}
    </div>
  );
};

const RoleRedirect = () => {
  const { currentUser } = useStore();

  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={rolePath(currentUser.role)} replace />;
};

const MarketplacePage = () => {
  const navigate = useNavigate();
  return <Marketplace onOpenCart={() => navigate("/cart")} />;
};

const InvoicePage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, currentUser } = useStore();
  const navigate = useNavigate();

  const order = orders.find((o) => o.id === orderId);

  if (!order || !currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleClose = () => navigate(rolePath(currentUser.role));

  return <Invoice order={order} onClose={handleClose} />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login initialMode="login" />} />
      <Route path="/register" element={<Login initialMode="register" />} />
      <Route path="/forgot" element={<Login initialMode="forgot" />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<RoleRedirect />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="superadmin" element={<SuperAdminDashboard />} />
        <Route path="supplier" element={<SupplierDashboard />} />
        <Route path="delivery" element={<DeliveryDashboard />} />
        <Route path="cart" element={<div />} />
        <Route path="invoice/:orderId" element={<InvoicePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <StoreProvider>
    <AppRoutes />
  </StoreProvider>
);

export default App;

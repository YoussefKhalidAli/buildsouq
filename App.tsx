import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Login } from './views/Login';
import { Marketplace } from './views/Marketplace/Marketplace';
import { SupplierDashboard } from './views/Supplier/SupplierDashboard';
import { SuperAdminDashboard } from './views/Admin/SuperAdminDashboard';
import { DeliveryDashboard } from './views/Delivery/DeliveryDashboard';
import { Header } from './components/layout/Header';
import { CartDrawer } from './views/Marketplace/CartDrawer';
import { Invoice } from './views/Marketplace/Invoice';
import { Modal } from './components/ui/Modal';
import { Order } from './types';

const AppContent = () => {
  const { currentUser } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentUser.role) {
      case 'superadmin':
        return <SuperAdminDashboard />;
      case 'supplier-admin':
      case 'supplier':
        return <SupplierDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'user':
      default:
        return <Marketplace onOpenCart={() => setIsCartOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header />
      <main className="flex-grow">
        {renderView()}
      </main>

      {/* Shared Modals for User Role */}
      {currentUser.role === 'user' && (
        <>
          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            onInvoiceRequest={(order) => setInvoiceOrder(order)}
          />
          
          <Modal
            isOpen={!!invoiceOrder}
            onClose={() => setInvoiceOrder(null)}
            title="Invoice"
            size="lg"
          >
            {invoiceOrder && <Invoice order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
          </Modal>
        </>
      )}
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;

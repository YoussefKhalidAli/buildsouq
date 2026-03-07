import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils';
import { X, Trash2, CreditCard, Banknote, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Order } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceRequest: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onInvoiceRequest }) => {
  const { cart, updateCartQty, removeFromCart, placeOrder } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const order = await placeOrder(paymentMethod);
      onClose();
      onInvoiceRequest(order);
    } catch (e) {
      alert("Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Your Cart <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p>Your cart is empty.</p>
                <Button variant="ghost" onClick={onClose} className="mt-4">Start Shopping</Button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-md overflow-hidden shrink-0">
                    <img src={item.product.imageUrl || `https://picsum.photos/seed/${item.product.id}/100/100`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-slate-900 truncate">{item.product.name}</h4>
                    <p className="text-xs text-slate-500 mb-2">{formatMoney(item.product.price)}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border bg-white rounded">
                        <button 
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100" 
                          onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                        >-</button>
                        <span className="px-2 text-xs font-medium w-8 text-center">{item.qty}</span>
                        <button 
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                          onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t bg-slate-50 space-y-4">
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'Free' : formatMoney(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <Banknote className="w-4 h-4" /> Cash on Delivery
                  </button>
                  <button 
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="w-4 h-4" /> Card Payment
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                className="w-full py-4 text-lg shadow-lg shadow-blue-200"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Place Order • ${formatMoney(total)}`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

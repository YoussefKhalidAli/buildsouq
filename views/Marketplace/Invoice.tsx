import React from 'react';
import { Order } from '../../types';
import { formatDate, formatMoney } from '../../utils';
import { CheckCircle, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface InvoiceProps {
  order: Order;
  onClose: () => void;
}

export const Invoice: React.FC<InvoiceProps> = ({ order, onClose }) => {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
      <p className="text-slate-500 mb-6">Thank you for your order. Your invoice is below.</p>

      <div className="bg-white border rounded-lg shadow-sm text-left p-6 max-w-lg mx-auto mb-6 print:shadow-none print:border-none">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">BuildSouq</h1>
            <p className="text-xs text-slate-500 mt-1">Building Materials Marketplace</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">Invoice #{order.id}</p>
            <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bill To</p>
          <p className="font-medium text-slate-900">{order.userName}</p>
          <p className="text-sm text-slate-500">Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}</p>
        </div>

        <table className="w-full text-sm mb-6">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-2 px-2 text-left font-semibold text-slate-600">Item</th>
              <th className="py-2 px-2 text-right font-semibold text-slate-600">Qty</th>
              <th className="py-2 px-2 text-right font-semibold text-slate-600">Price</th>
              <th className="py-2 px-2 text-right font-semibold text-slate-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-2 px-2">{item.productName}</td>
                <td className="py-2 px-2 text-right">{item.qty}</td>
                <td className="py-2 px-2 text-right">{formatMoney(item.price)}</td>
                <td className="py-2 px-2 text-right font-medium">{formatMoney(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t pt-4 space-y-1 text-right">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Delivery</span>
            <span>{formatMoney(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 mt-2 border-t border-dashed">
            <span>Total Amount</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 no-print">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button onClick={onClose}>Continue Shopping</Button>
      </div>
    </div>
  );
};

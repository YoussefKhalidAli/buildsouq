
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatMoney, formatDate } from '../../utils';
import { Truck, MapPin, CheckCircle, Package, Filter, Banknote, CreditCard, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const DeliveryDashboard = () => {
  const { orders, markOrderDelivered, currentUser } = useStore();
  
  // Filtering States
  const [statusFilter, setStatusFilter] = useState<'all' | 'placed' | 'delivered'>('placed');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cod' | 'card'>('all');

  // Logic: Filter orders based on status and payment method
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  const pendingCount = orders.filter(o => o.status === 'placed').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  // Dynamic titles based on filters
  const getListTitle = () => {
    let title = statusFilter === 'all' ? 'All' : statusFilter === 'placed' ? 'Pending' : 'Delivered';
    if (paymentFilter !== 'all') {
      title += ` ${paymentFilter.toUpperCase()}`;
    }
    return `${title} Orders`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-8 h-8 text-orange-500" />
            Driver Dashboard
          </h1>
          <p className="text-slate-500">Welcome, {currentUser?.name}. Manage your deliveries.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-bold text-sm">
            {pendingCount} Pending Total
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase tracking-wider">Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="relative flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Order Status</label>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Pending Deliveries</option>
              <option value="delivered">Completed Deliveries</option>
            </select>
            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Payment Filter */}
        <div className="relative flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Payment Method</label>
          <div className="relative">
            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium transition-all"
            >
              <option value="all">All Methods</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="card">Paid via Card</option>
            </select>
            {paymentFilter === 'card' ? (
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            ) : (
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            )}
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { setStatusFilter('all'); setPaymentFilter('all'); }}
          className="text-xs text-slate-500 hover:text-orange-600 mt-4 md:mt-0"
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List: Filtered Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{getListTitle()}</h2>
            <span className="text-sm text-slate-500 font-medium">{filteredOrders.length} results found</span>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="text-lg font-medium">No matches found</p>
              <p className="text-sm">Try adjusting your filters or status selection.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-300 ${order.status === 'placed' ? 'border-slate-200 hover:border-orange-300' : 'border-slate-100 opacity-80'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">#{order.id}</span>
                      {order.status === 'delivered' ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Delivered
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                          <Truck className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-slate-900">{order.userName}</h3>
                    <div className="flex items-center text-slate-500 text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1 text-red-400" />
                      <span className="truncate">Downtown Dubai, Area 4, Site 2B</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-slate-900">{formatMoney(order.total)}</div>
                    <div className="flex items-center justify-end gap-1.5 mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {order.paymentMethod === 'cod' ? (
                        <><Banknote className="w-3 h-3 text-green-500" /> Cash to Collect</>
                      ) : (
                        <><CreditCard className="w-3 h-3 text-blue-500" /> Paid Online</>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Details ({order.items.length} items)</p>
                    <span className="text-[10px] text-slate-400">{formatDate(order.createdAt)}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {order.items.slice(0, 3).map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex justify-between">
                        <span>{item.qty}x <span className="font-medium">{item.productName}</span></span>
                        <span className="text-slate-400 text-xs">{formatMoney(item.price * item.qty)}</span>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="text-xs text-slate-400 italic pt-1 border-t border-slate-200 mt-1">
                        + {order.items.length - 3} additional items
                      </li>
                    )}
                  </ul>
                </div>

                {order.status === 'placed' ? (
                  <Button 
                    onClick={async () => await markOrderDelivered(order.id)}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-100"
                  >
                    Mark as Delivered
                  </Button>
                ) : (
                  <div className="flex items-center justify-center p-3 rounded-lg border border-green-100 bg-green-50 text-green-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" /> Delivered on {formatDate(order.deliveredAt!)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar: Recent Activity / History */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl h-fit">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Recently Delivered
            </h2>
            <div className="space-y-4">
              {deliveredOrders.slice(0, 5).length > 0 ? (
                deliveredOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="bg-white/10 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-bold text-blue-300">#{order.id}</div>
                      <div className="text-[10px] text-white/40">{formatDate(order.deliveredAt!).split(',')[1]}</div>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">{order.userName}</div>
                    <div className="text-xs text-white/60 mt-1">{formatMoney(order.total)} • {order.paymentMethod.toUpperCase()}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-white/40 italic">No recent history</p>
                </div>
              )}
            </div>
            {deliveredOrders.length > 5 && (
              <button 
                onClick={() => setStatusFilter('delivered')}
                className="w-full mt-4 text-xs font-bold text-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Full History
              </button>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Daily Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">{deliveredOrders.length}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Success</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">To Go</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

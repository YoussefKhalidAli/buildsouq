import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../utils";
import { Order } from "../../types";
import { Search, Filter, ArrowUpDown, Calendar, MapPin, Truck, User } from "lucide-react";

export const AllOrders = () => {
  const navigate = useNavigate();
  const { orders, users } = useStore();

  // Debug logging
  console.log('Orders:', orders);
  console.log('Users:', users);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Map order status to filter categories
  const getStatusCategory = (status: string) => {
    switch (status) {
      case "delivered":
        return "completed";
      case "placed":
        return "ongoing";
      case "refunded":
      case "disposed":
        return "canceled";
      default:
        return "ongoing";
    }
  };

  // Get user location (simplified - you might want to add location field to users)
  const getUserLocation = (userId: string) => {
    const user = users.find(u => u.id === userId);
    // For now, return a placeholder. In real app, you'd have user location data
    return user?.businessName || "N/A";
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const user = users.find(u => u.id === order.userId);
      const displayName = order.userName || user?.name || '';
      const matchesSearch = searchTerm === "" ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || getStatusCategory(order.status) === statusFilter;
      const matchesType = typeFilter === "all" ||
        (typeFilter === "delivery" && order.paymentMethod === "cod") ||
        (typeFilter === "customer" && order.paymentMethod === "card");

      const matchesLocation = locationFilter === "all" || getUserLocation(order.userId).toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesType && matchesLocation;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortBy === "date") {
        aValue = new Date(a.createdAt || a.date || 0);
        bValue = new Date(b.createdAt || b.date || 0);
      } else {
        aValue = a.total;
        bValue = b.total;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, users, searchTerm, statusFilter, typeFilter, locationFilter, sortBy, sortOrder]);

  // Debug logging
  console.log('Filtered orders:', filteredAndSortedOrders);

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
          <p className="text-sm text-slate-500">Monitor and manage all customer orders</p>
        </div>
        <div className="text-sm text-slate-500">
          {filteredAndSortedOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="canceled">Canceled</option>
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
            >
              <option value="all">All Types</option>
              <option value="delivery">Delivery Orders</option>
              <option value="customer">Customer Orders</option>
            </select>
            <Truck className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by location..."
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={locationFilter === "all" ? "" : locationFilter}
              onChange={(e) => setLocationFilter(e.target.value || "all")}
            />
            <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Order ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Customer</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Type</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              <th
                className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSort("amount")}
              >
                <div className="flex items-center gap-1">
                  Amount
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Date
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedOrders.map((order) => {
              const user = users.find(u => u.id === order.userId);
              const displayName = order.userName || user?.name || 'Unknown User';
              const statusCategory = getStatusCategory(order.status);

              return (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{order.id}</div>
                    <div className="text-[10px] text-slate-400">{order.items.length} items</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                        {displayName.charAt(0)}
                      </div>
                      <div>
                        <button 
                          className="font-medium text-slate-900 hover:text-blue-600 transition-colors text-left"
                          onClick={() => navigate(`/admin/users/${order.userId}`)}
                        >
                          {displayName}
                        </button>
                        <div className="text-[10px] text-slate-400">{user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {order.paymentMethod === "cod" ? (
                        <Truck className="w-4 h-4 text-orange-500" />
                      ) : (
                        <User className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-sm capitalize">{order.paymentMethod === "cod" ? "Delivery" : "Customer"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      statusCategory === "completed" ? "bg-emerald-100 text-emerald-700" :
                      statusCategory === "ongoing" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {statusCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatMoney(order.total)}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {order.createdAt || order.date ? new Date(order.createdAt || order.date).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAndSortedOrders.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <div className="text-lg font-medium mb-2">No orders found</div>
            <div className="text-sm">Try adjusting your filters or search terms</div>
          </div>
        )}
      </div>
    </div>
  );
};
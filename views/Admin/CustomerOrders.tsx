import React from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../utils";

export const CustomerOrders = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentUser, users, orders } = useStore();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== "superadmin") return <Navigate to="/" replace />;

  const user = users.find((u) => u.id === userId);
  const userOrders = orders.filter((o) => o.userId === userId);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600 font-semibold">User not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{user.name}&apos;s Orders</h1>
          <p className="text-sm text-slate-500">Review purchase history (read-only)</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500">
          No orders found for this user.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Order ID</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Total</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{order.id}</td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{order.status}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney(order.total)}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

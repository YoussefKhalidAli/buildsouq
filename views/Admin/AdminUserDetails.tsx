import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { formatMoney } from "../../utils";
import { formatDate } from "../../utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  Truck,
  Eye,
  Crown,
  AlertCircle
} from "lucide-react";

export const AdminUserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { users, orders, verifyUser, currentUser, updateUserRole } = useStore();

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const user = users.find(u => u.id === userId);
  const userOrders = orders.filter(o => o.userId === userId);

  if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'admin')) {
    return <div>Access denied</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600 font-semibold">User not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const handleVerifyUser = async (status: boolean) => {
    try {
      await verifyUser(user.id, status);
      alert(`User ${status ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      alert('Failed to update user verification status');
    }
  };

  const handlePromoteToSuperAdmin = async () => {
    if (!currentUser || currentUser.role !== 'superadmin') {
      alert('Only super admins can promote users');
      return;
    }

    try {
      await updateUserRole(user.id, 'superadmin');
      alert('User promoted to Super Admin successfully');
      setShowPromoteModal(false);
      // Refresh the page to show updated role
      window.location.reload();
    } catch (error) {
      alert('Failed to promote user');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'user': { bg: 'bg-gray-100', text: 'text-gray-700', icon: User, label: 'Customer' },
      'supplier': { bg: 'bg-green-100', text: 'text-green-700', icon: Building2, label: 'Supplier' },
      'supplier-admin': { bg: 'bg-green-100', text: 'text-green-700', icon: Building2, label: 'Supplier Admin' },
      'admin': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Shield, label: 'Admin' },
      'logistics-super-admin': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Truck, label: 'Logistics Admin' },
      'superadmin': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Crown, label: 'Super Admin' },
      'delivery': { bg: 'bg-orange-100', text: 'text-orange-700', icon: Truck, label: 'Delivery' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Details</h1>
          <p className="text-slate-500">Manage user account and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-4">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{user.name}</h2>
              {getRoleBadge(user.role)}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{user.email || 'No email'}</div>
                  <div className="text-xs text-slate-500">Email</div>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{user.phone}</div>
                    <div className="text-xs text-slate-500">Phone</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{formatDate(user.registrationDate)}</div>
                  <div className="text-xs text-slate-500">Joined</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {!user.verified && (
                <Button
                  onClick={() => handleVerifyUser(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify Account
                </Button>
              )}

              {user.verified && currentUser.role === 'superadmin' && user.role !== 'superadmin' && (
                <Button
                  onClick={() => setShowPromoteModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Promote to Super Admin
                </Button>
              )}

              {user.verified && (
                <Button
                  variant="danger"
                  onClick={() => handleVerifyUser(false)}
                  className="w-full"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Unverify Account
                </Button>
              )}
            </div>

            {/* Status */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <div className="flex items-center gap-2">
                  {user.verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <AlertCircle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {user.suspended && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-slate-700">Account</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" />
                    Suspended
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Summary & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Orders Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">{userOrders.length}</div>
                <div className="text-sm text-slate-500">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-700">
                  {userOrders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-sm text-slate-500">Completed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">
                  {userOrders.filter(o => o.status === 'placed').length}
                </div>
                <div className="text-sm text-slate-500">Pending</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">
                  {formatMoney(userOrders.reduce((sum, o) => sum + o.total, 0))}
                </div>
                <div className="text-sm text-slate-500">Total Spent</div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {userOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{order.id}</div>
                      <div className="text-sm text-slate-500">
                        {order.createdAt || order.date ? new Date(order.createdAt || order.date).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatMoney(order.total)}</div>
                      <div className={`text-sm capitalize ${
                        order.status === 'delivered' ? 'text-emerald-600' :
                        order.status === 'placed' ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {userOrders.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  No orders found for this user.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Promote to Super Admin Modal */}
      <Modal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        title="Promote to Super Admin"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to promote <strong>{user.name}</strong> to Super Admin?
            This will give them full administrative privileges.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handlePromoteToSuperAdmin}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Confirm Promotion
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPromoteModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatMoney } from "../../utils";
import { Button } from "../../components/ui/Button";

export const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentUser, orders, refundOrderItem, refundOrder, disposeOrder } =
    useStore();

  const order = orders.find((o) => o.id === orderId);

  const orderDate = useMemo(() => {
    if (!order) return null;
    const dateStr = order.createdAt || order.date;
    return dateStr ? new Date(dateStr) : null;
  }, [order]);

  const isOwner = currentUser?.id === order?.userId;
  const isAdminView = !isOwner;

  const canRefund = useMemo(() => {
    if (!orderDate || !isOwner) return false;
    const days = Math.floor(
      (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return (
      days < 15 && order.status !== "refunded" && order.status !== "disposed"
    );
  }, [order, orderDate, isOwner]);

  const canDispose = useMemo(() => {
    if (!orderDate || !isOwner) return false;
    const days = Math.floor(
      (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days >= 15 && order.status !== "disposed";
  }, [order, orderDate, isOwner]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const hasRefundableItems = order?.items.some(
    (item) => item.refundable !== false && !item.refunded,
  );

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!order) return <Navigate to={"/profile"} replace />;

  const handleRefundItem = async (productId: string) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await refundOrderItem(order.id, productId);
    } catch (err: any) {
      setActionError(err?.message || "Failed to process refund");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispose = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      await disposeOrder(order.id);
    } catch (err: any) {
      setActionError(err?.message || "Failed to dispose order");
    } finally {
      setActionLoading(false);
    }
  };

  const orderStatusLabel = () => {
    switch (order.status) {
      case "placed":
        return "Placed";
      case "delivered":
        return "Delivered";
      case "refunded":
        return "Refunded";
      case "disposed":
        return "Disposed";
      default:
        return order.status;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-sm text-slate-600 mt-1">
            Order <span className="font-medium">{order.id}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          {canRefund && hasRefundableItems && (
            <Button
              disabled={actionLoading}
              onClick={async () => {
                setActionError(null);
                setActionLoading(true);
                try {
                  await refundOrder(order.id);
                } catch (err: any) {
                  setActionError(err?.message || "Failed to refund order");
                } finally {
                  setActionLoading(false);
                }
              }}
            >
              {actionLoading ? "Processing..." : "Refund Order"}
            </Button>
          )}
          {canDispose && (
            <Button
              variant="danger"
              disabled={actionLoading}
              onClick={handleDispose}
            >
              {actionLoading ? "Disposing..." : "Dispose Order"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-slate-500">Status</div>
          <div className="mt-1 font-semibold">{orderStatusLabel()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-slate-500">Date</div>
          <div className="mt-1 font-semibold">
            {orderDate ? orderDate.toLocaleDateString() : "—"}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-slate-500">Total</div>
          <div className="mt-1 font-semibold">{formatMoney(order.total)}</div>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 text-sm text-red-600">{actionError}</div>
      )}

      {canRefund && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <p className="text-sm">
            You can request a refund on refundable items within 15 days of
            purchase.
          </p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>

        {order.items.map((item) => {
          const isRefunded = item.refunded;
          const refundable = item.refundable !== false;
          const showRefundButton =
            canRefund &&
            refundable &&
            !isRefunded &&
            order.status !== "refunded";

          return (
            <div
              key={item.productId}
              className="border-b last:border-b-0 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <div className="font-medium">{item.productName}</div>
                <div className="text-sm text-slate-500">
                  Qty: {item.qty} • {formatMoney(item.price)} each
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <div className="text-sm font-semibold">
                  {formatMoney(item.price * item.qty)}
                </div>
                {isRefunded ? (
                  <span className="text-sm text-green-600">Refunded</span>
                ) : !refundable ? (
                  <span className="text-sm text-orange-600">
                    Non-refundable
                  </span>
                ) : showRefundButton ? (
                  <Button
                    size="sm"
                    onClick={() => handleRefundItem(item.productId)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Refund item"}
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {canDispose && (
        <div className="mt-6 text-sm text-slate-600">
          Since this order is older than 15 days, refund is no longer available.
          You can dispose of it instead.
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import { formatMoney } from "../../utils";
import { Edit2, Trash2, Plus, Package, AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

export const SupplierDashboard = () => {
  const {
    products,
    categories,
    currentUser,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const supplierId = currentUser?.supplierId;
  const myProducts = products.filter((p) => p.supplierId === supplierId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    lowStockThreshold: "10",
    categoryId: "",
    nonRefundable: false,
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      lowStockThreshold: (product.lowStockThreshold || 10).toString(),
      categoryId: product.categoryId,
      nonRefundable: product.nonRefundable || false,
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      lowStockThreshold: "10",
      categoryId: categories[0]?.id || "",
      nonRefundable: false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      categoryId: formData.categoryId,
      supplierId: supplierId,
      nonRefundable: formData.nonRefundable,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }
    setIsModalOpen(false);
  };

  const lowStockProducts = myProducts.filter(
    (p) => p.stock <= (p.lowStockThreshold || 10),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Supplier Dashboard
          </h1>
          <p className="text-slate-500">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </Button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
            <Package className="w-5 h-5" />
            <span>Low Stock Alerts ({lowStockProducts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-lg border border-amber-100 flex justify-between items-center shadow-sm"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Current Stock:{" "}
                    <span className="text-red-600 font-bold">{p.stock}</span>
                  </div>
                </div>
                <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  Threshold: {p.lowStockThreshold || 10}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Product
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Category
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                Price
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                Stock
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>You haven't added any products yet.</p>
                </td>
              </tr>
            ) : (
              myProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">
                      {product.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                      {
                        categories.find((c) => c.id === product.categoryId)
                          ?.name
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatMoney(product.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${product.stock > (product.lowStockThreshold || 10) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {product.stock}
                      </span>
                      {product.stock <= (product.lowStockThreshold || 10) && (
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this product?"))
                          deleteProduct(product.id);
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Name
            </label>
            <input
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price (AED)
              </label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock
              </label>
              <input
                required
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                required
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="nonRefundable"
              type="checkbox"
              checked={formData.nonRefundable}
              onChange={(e) =>
                setFormData({ ...formData, nonRefundable: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="nonRefundable" className="text-sm text-slate-700">
              Mark this product as non-refundable
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

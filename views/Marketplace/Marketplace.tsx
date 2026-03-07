import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatMoney } from "../../utils";
import { Search, ShoppingCart, Filter, Info } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Product } from "../../types";

interface MarketplaceProps {
  onOpenCart: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onOpenCart }) => {
  const { products, categories, suppliers, addToCart, cart } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<
    "price-asc" | "price-desc" | "default"
  >("default");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter Logic
  const activeSupplierIds = new Set(
    suppliers.filter((s) => s.active).map((s) => s.id),
  );

  const filteredProducts = products
    .filter((p) => activeSupplierIds.has(p.supplierId))
    .filter(
      (p) => selectedCategory === "all" || p.categoryId === selectedCategory,
    )
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "price-asc") return a.price - b.price;
      if (sortOrder === "price-desc") return b.price - a.price;
      return 0;
    });

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header / Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search cement, tiles, paint..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
          >
            <option value="default">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <Button
            variant="secondary"
            className="relative ml-auto md:ml-0"
            onClick={onOpenCart}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const supplier = suppliers.find((s) => s.id === product.supplierId);
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full border border-slate-100 overflow-hidden"
              >
                <div
                  className="h-48 bg-slate-100 relative group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={
                      product.imageUrl ||
                      `https://picsum.photos/seed/${product.id}/400/300`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {categories.find((c) => c.id === product.categoryId)
                        ?.name || "General"}
                    </span>
                  </div>

                  <h3
                    className="font-bold text-slate-800 mb-1 line-clamp-2"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Sold by {supplier?.name}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <span className="text-lg font-bold text-slate-900">
                      {formatMoney(product.price)}
                    </span>
                    <Button size="sm" onClick={() => addToCart(product, 1)}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Product Details"
        size="lg"
      >
        {selectedProduct && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <img
                src={
                  selectedProduct.imageUrl ||
                  `https://picsum.photos/seed/${selectedProduct.id}/600/400`
                }
                alt={selectedProduct.name}
                className="w-full rounded-lg object-cover shadow-sm"
              />
            </div>
            <div className="md:w-1/2 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedProduct.name}
                </h2>
                <p className="text-blue-600 font-medium text-xl mt-1">
                  {formatMoney(selectedProduct.price)}
                </p>
              </div>

              <div className="prose prose-sm text-slate-600">
                <p>{selectedProduct.description}</p>
              </div>

              <div className="py-4 border-t border-b border-slate-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 block">Category</span>
                  <span className="font-medium">
                    {
                      categories.find(
                        (c) => c.id === selectedProduct.categoryId,
                      )?.name
                    }
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Stock Status</span>
                  <span
                    className={`font-medium ${selectedProduct.stock > 10 ? "text-green-600" : "text-orange-500"}`}
                  >
                    {selectedProduct.stock > 0
                      ? `${selectedProduct.stock} Available`
                      : "Out of Stock"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Supplier</span>
                  <span className="font-medium">
                    {
                      suppliers.find((s) => s.id === selectedProduct.supplierId)
                        ?.name
                    }
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    addToCart(selectedProduct, 1);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.stock <= 0}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  DollarSign, ShoppingBag, Box, Users, AlertTriangle, 
  Plus, Edit2, Trash2, Check, RefreshCw, X 
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // States
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Forms
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    categorySlug: '',
    brand: '',
    price: '',
    discountPrice: '',
    stockQuantity: '',
    imageUrl: ''
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/admin/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProductForm(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      alert('Failed to upload product image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const prodRes = await api.get('/products?page=0&size=100');
      setProducts(prodRes.data.content || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const catRes = await api.get('/categories');
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const orderRes = await api.get('/admin/orders');
      setOrders(orderRes.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchStats(), fetchProducts(), fetchCategories(), fetchOrders()]);
    } catch (err) {
      setError('Failed to fetch dashboard administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // --- Product CRUD Actions ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
        stockQuantity: Number(productForm.stockQuantity)
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '', description: '', shortDescription: '', categorySlug: '',
        brand: '', price: '', discountPrice: '', stockQuantity: '', imageUrl: ''
      });
      await refreshAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing product');
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      shortDescription: prod.shortDescription || '',
      categorySlug: prod.categorySlug,
      brand: prod.brand,
      price: prod.price,
      discountPrice: prod.discountPrice || '',
      stockQuantity: prod.stockQuantity,
      imageUrl: prod.imageUrl || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Deactivate this product? (Soft Delete)')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      await refreshAllData();
    } catch (err) {
      alert('Failed to deactivate product.');
    }
  };

  // --- Category CRUD Actions ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', categoryForm);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      await refreshAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? This might break product mappings.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      await refreshAllData();
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  // --- Order Management Status Update ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      await refreshAllData();
    } catch (err) {
      alert('Failed to update order status.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h1>
          <p className="text-xs text-gray-500 mt-1">Manage catalog, categories, low stock, and order fulfillments.</p>
        </div>
        <button
          onClick={refreshAllData}
          className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {['overview', 'products', 'categories', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold border-b-2 uppercase tracking-wide transition-all ${
                activeTab === tab 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Dashboard Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-green-50 rounded-xl text-green-600"><DollarSign className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Total Revenue</span>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">${stats.totalRevenue.toFixed(2)}</h3>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Fulfillment Orders</span>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalOrders}</h3>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Box className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Active Products</span>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalProducts}</h3>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Users className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Customer Accounts</span>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalCustomers}</h3>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-gray-900">Low Stock Inventory Alerts</h2>
            </div>
            {stats.lowStockProducts.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">All product stocks are in healthy levels.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 font-bold uppercase">
                      <th className="p-4">Product ID</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">Available Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.lowStockProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4 font-mono text-gray-500">#{p.id}</td>
                        <td className="p-4 font-semibold text-gray-800">{p.name}</td>
                        <td className="p-4 text-gray-500">{p.brand}</td>
                        <td className="p-4"><span className="text-red-600 font-black">{p.stockQuantity} items left</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Product Tab Content --- */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '', description: '', shortDescription: '', categorySlug: categories[0]?.slug || '',
                  brand: '', price: '', discountPrice: '', stockQuantity: '', imageUrl: ''
                });
                setShowProductModal(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-700 shadow"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 font-bold uppercase">
                    <th className="p-4">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-gray-400">#{p.id}</td>
                      <td className="p-4 font-semibold text-gray-800">{p.name}</td>
                      <td className="p-4 text-gray-500">{p.categoryName}</td>
                      <td className="p-4 text-gray-500">{p.brand}</td>
                      <td className="p-4 font-bold text-gray-800">${p.price.toFixed(2)}</td>
                      <td className="p-4 text-gray-600">{p.stockQuantity}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {p.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-primary-600 rounded-md transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          disabled={!p.active}
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-600 rounded-md transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Category Tab Content --- */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-1.5 rounded-full bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-700 shadow"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 font-bold uppercase">
                    <th className="p-4">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-gray-400">#{c.id}</td>
                      <td className="p-4 font-semibold text-gray-800">{c.name}</td>
                      <td className="p-4 text-gray-500 font-mono">{c.slug}</td>
                      <td className="p-4 text-gray-500 line-clamp-1 max-w-sm">{c.description}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Orders Tab Content --- */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 font-bold uppercase">
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Shipping Address</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="p-4 font-black text-gray-850 uppercase">{o.orderNumber}</td>
                    <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{o.shippingAddress}</td>
                    <td className="p-4 font-bold text-gray-800">${o.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`rounded px-2.5 py-1 text-[10px] font-bold border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                          o.status === 'DELIVERED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          o.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                          o.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT PRODUCT MODAL DIALOG --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Category</label>
                <select
                  value={productForm.categorySlug}
                  onChange={(e) => setProductForm({ ...productForm, categorySlug: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Discount Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Image URL</label>
                  <input
                    type="text"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/product.jpg"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Or Upload Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {uploadingImage && <span className="text-[10px] text-gray-400">Uploading...</span>}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Long Description</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-4 py-2 hover:bg-primary-700 text-white font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CATEGORY MODAL DIALOG --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-4 py-2 hover:bg-primary-700 text-white font-bold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

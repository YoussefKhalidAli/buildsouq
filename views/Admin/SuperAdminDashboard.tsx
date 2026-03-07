
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../../components/ui/Button';
import { 
  ShieldCheck, 
  Layers, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  FileText, 
  Search,
  Building2,
  Truck,
  UserCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { User } from '../../types';
import { formatDate } from '../../utils';

export const SuperAdminDashboard = () => {
  const { categories, suppliers, users, verifyUser, addCategory, updateCategory, toggleSupplierStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'users' | 'catalog' | 'suppliers'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const RoleBadge = ({ role }: { role: string }) => {
    const configs: Record<string, any> = {
      superadmin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: ShieldCheck, label: 'Admin' },
      'supplier-admin': { bg: 'bg-green-100', text: 'text-green-700', icon: Building2, label: 'Supplier' },
      delivery: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Truck, label: 'Logistics' },
      user: { bg: 'bg-blue-100', text: 'text-blue-700', icon: UserCircle, label: 'Customer' }
    };
    const config = configs[role] || configs.user;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${config.bg} ${config.text}`}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const StatusBadge = ({ verified }: { verified: boolean }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
      {verified ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {verified ? 'Verified' : 'Pending'}
    </span>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Console</h1>
            <p className="text-slate-500 font-medium">Platform Operations & Compliance</p>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
          >
            User Verification
          </button>
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'catalog' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Catalog
          </button>
          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'suppliers' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Partners
          </button>
        </div>
      </header>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or role..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Account Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${user.verified ? 'bg-slate-900' : 'bg-slate-400'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {formatDate(user.registrationDate)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                      {user.businessName && (
                        <div className="text-[10px] font-medium text-slate-500 mt-1 italic">
                          @{user.businessName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{user.email}</div>
                      <div className="text-xs text-slate-400">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge verified={user.verified} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedUser(user)}
                          className="px-3 hover:border-slate-900"
                        >
                          <Eye className="w-4 h-4 mr-2" /> Review
                        </Button>
                        {!user.verified ? (
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => verifyUser(user.id, true)}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="danger" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => verifyUser(user.id, false)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <Layers className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-900">Taxonomy Management</h2>
          </div>
          
          <div className="flex gap-4 mb-8">
            <input 
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Add new product category..."
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            />
            <Button onClick={async () => { await addCategory(newCategory); setNewCategory(''); }} disabled={!newCategory.trim()}>
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-400 hover:bg-white transition-all">
                <span className="font-bold text-slate-700">{cat.name}</span>
                <button 
                  className="text-[10px] font-black uppercase text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={async () => {
                    const newName = prompt('Rename category:', cat.name);
                    if (newName) await updateCategory(cat.id, newName);
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-slate-900">Partner Directory</h2>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Company</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-800 text-base">{supplier.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${supplier.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {supplier.active ? 'Operational' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant={supplier.active ? 'danger' : 'primary'}
                      size="sm"
                      onClick={async () => await toggleSupplierStatus(supplier.id)}
                    >
                      {supplier.active ? 'Suspend' : 'Reinstate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Review Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Compliance Review"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-8">
            <div className="flex items-start gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black">
                {selectedUser.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-black text-slate-900">{selectedUser.name}</h3>
                  <RoleBadge role={selectedUser.role} />
                </div>
                <div className="text-slate-500 text-sm font-medium">{selectedUser.email}</div>
                <div className="text-slate-400 text-xs mt-1">ID: {selectedUser.id}</div>
              </div>
              <div className="text-right">
                <StatusBadge verified={selectedUser.verified} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Documents</h4>
              
              {(selectedUser.role === 'supplier-admin' || selectedUser.role === 'delivery') ? (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedUser.documents || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 rounded-2xl">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black uppercase text-slate-900 tracking-tight">
                          {key.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Securely Attached
                        </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-12 rounded-2xl text-center border-2 border-dashed border-slate-200">
                  <UserCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium italic">Basic Customer Account: No corporate documents required.</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              {!selectedUser.verified ? (
                <Button 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-4 shadow-emerald-200"
                  onClick={async () => { await verifyUser(selectedUser.id, true); setSelectedUser(null); }}
                >
                  Approve Application
                </Button>
              ) : (
                <Button 
                  variant="danger" 
                  className="flex-1 py-4 shadow-red-200"
                  onClick={async () => { await verifyUser(selectedUser.id, false); setSelectedUser(null); }}
                >
                  Suspend Account
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>
                Close Review
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

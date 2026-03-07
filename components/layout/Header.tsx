import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { LogOut, User } from 'lucide-react';

export const Header = () => {
  const { currentUser, logout } = useStore();

  if (!currentUser) return null;

  const roleLabels = {
    user: 'Customer',
    supplier: 'Supplier',
    'supplier-admin': 'Supplier Admin',
    superadmin: 'Super Admin',
    delivery: 'Delivery Driver'
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-xl tracking-tight text-slate-900">BuildSouq</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-900">{currentUser.name}</div>
            <div className="text-xs text-slate-500">{roleLabels[currentUser.role]}</div>
          </div>
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
            <User className="w-4 h-4" />
          </div>
          <Button variant="ghost" size="sm" onClick={logout} title="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

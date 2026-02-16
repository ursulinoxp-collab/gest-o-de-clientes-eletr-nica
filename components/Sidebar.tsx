
import React from 'react';
import { ViewMode, ServiceStatus } from '../types';
import { LayoutDashboard, ClipboardList, FileSignature, History, ClipboardCheck, FilePlus } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  onCreateNew: (status: ServiceStatus) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onCreateNew }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Ordens de Serviço', icon: ClipboardList },
    { id: 'budgets', label: 'Orçamentos', icon: FileSignature },
    { id: 'history', label: 'Histórico Total', icon: History },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white">P</div>
          <span className="text-white">Ponto da Eletrônica</span>
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewMode)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === item.id 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
        
        <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => onCreateNew(ServiceStatus.PENDENTE)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all active:scale-95"
          >
            <ClipboardCheck size={20} />
            <span className="font-medium">Nova OS</span>
          </button>
          
          <button
            onClick={() => onCreateNew(ServiceStatus.ORCAMENTO)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
          >
            <FilePlus size={20} />
            <span className="font-medium">Novo Orçamento</span>
          </button>
        </div>
      </nav>

      <div className="p-4 bg-slate-800 text-xs text-slate-500 text-center">
        v1.0.1 &copy; 2024 Ponto da Eletrônica
      </div>
    </div>
  );
};

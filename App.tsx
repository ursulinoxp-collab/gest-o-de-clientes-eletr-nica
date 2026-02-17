import React, { useState, useEffect, useMemo } from 'react';
import { ServiceOrder, ViewMode, ServiceStatus } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ServiceOrderForm } from './components/ServiceOrderForm';
import { StatusBadge } from './components/StatusBadge';
import { generateOrderPDF } from './services/pdfService';
import { Search, Download, Edit2, Trash2, Filter, Menu, X, PlusCircle, Calendar } from 'lucide-react';

const DB_KEY = 'ponto_eletronica_v3_stable';

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const generateId = () => {
  return Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [defaultCreateStatus, setDefaultCreateStatus] = useState<ServiceStatus>(ServiceStatus.PENDENTE);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Carregar dados
  useEffect(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar banco de dados", e);
      }
    }
  }, []);

  // Salvar dados
  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(orders));
  }, [orders]);

  const handleCreateNew = (status: ServiceStatus) => {
    setEditingOrder(null);
    setDefaultCreateStatus(status);
    setView('create');
    setMobileMenuOpen(false);
  };

  const handleSubmit = (data: Partial<ServiceOrder>) => {
    if (editingOrder) {
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...o, ...data } as ServiceOrder : o));
    } else {
      const newOrder: ServiceOrder = {
        ...(data as ServiceOrder),
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      setOrders(prev => [...prev, newOrder]);
    }
    setView('dashboard');
    setEditingOrder(null);
  };

  // Função de exclusão aprimorada
  const deleteOrder = (id: string) => {
    const isConfirmed = window.confirm('Deseja excluir permanentemente este registro?');
    if (isConfirmed) {
      setOrders(prev => prev.filter(order => order.id !== id));
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        (o.customerName || '').toLowerCase().includes(search) ||
        (o.equipmentBrand || '').toLowerCase().includes(search) ||
        (o.id || '').toLowerCase().includes(search);
      
      const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
      
      if (view === 'orders') return matchesSearch && matchesStatus && o.status !== ServiceStatus.ORCAMENTO;
      if (view === 'budgets') return matchesSearch && matchesStatus && o.status === ServiceStatus.ORCAMENTO;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm, statusFilter, view]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar currentView={view} setView={setView} onCreateNew={handleCreateNew} />
      
      <div className="flex-1 flex flex-col md:ml-64 transition-all">
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold">P</div>
            <h1 className="font-bold tracking-tight text-white">Ponto da Eletrônica</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-slate-800 rounded-xl">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-md flex flex-col p-8 pt-24 space-y-4 animate-in">
             {['dashboard', 'orders', 'budgets', 'history'].map((m: any) => (
               <button 
                 key={m}
                 onClick={() => { setView(m); setMobileMenuOpen(false); }} 
                 className={`p-4 rounded-2xl font-bold text-left transition-all ${view === m ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300'}`}
               >
                 {m.replace('dashboard', 'Painel').replace('orders', 'Ordens de Serviço').replace('budgets', 'Orçamentos').replace('history', 'Histórico')}
               </button>
             ))}
          </div>
        )}

        <main className="p-4 md:p-10 flex-1 animate-in">
          {view === 'dashboard' ? (
            <Dashboard orders={orders} setView={setView} onCreateNew={handleCreateNew} />
          ) : view === 'create' ? (
            <ServiceOrderForm 
              onSubmit={handleSubmit} 
              onCancel={() => setView('dashboard')} 
              initialData={editingOrder} 
              defaultStatus={defaultCreateStatus}
            />
          ) : (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-black text-slate-800">
                  {view === 'orders' ? 'Ordens de Serviço' : view === 'budgets' ? 'Orçamentos' : 'Histórico Completo'}
                </h2>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleCreateNew(view === 'budgets' ? ServiceStatus.ORCAMENTO : ServiceStatus.PENDENTE)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                  >
                    <PlusCircle size={20} />
                    Novo Registro
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar por cliente, marca ou modelo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <Filter size={16} className="text-slate-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent py-3 outline-none font-bold text-slate-600 text-sm"
                  >
                    <option value="todos">Todos Status</option>
                    {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row justify-between items-center gap-4 group">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                        {order.equipmentType === 'TV' ? '📺' : '⚙️'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-black text-lg text-slate-800">{order.customerName}</h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-xs font-medium text-slate-500 mt-1">
                           <span>{order.equipmentType} {order.equipmentBrand}</span>
                           <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(order.arrivalDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900">
                          {Number(order.serviceValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{order.id.split('-')[0]}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          title="Baixar PDF"
                          onClick={(e) => { e.stopPropagation(); generateOrderPDF(order); }} 
                          className="p-3 text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white rounded-2xl transition-all"
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          title="Editar"
                          onClick={(e) => { e.stopPropagation(); setEditingOrder(order); setView('create'); }} 
                          className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          title="Excluir"
                          onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }} 
                          className="p-3 text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-2xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
                    <Search size={40} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">Nenhum registro encontrado</h3>
                    <p className="text-slate-400 mt-1">Tente mudar o filtro ou pesquisar por outro termo.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
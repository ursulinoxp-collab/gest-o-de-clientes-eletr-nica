
import React from 'react';
import { ServiceOrder, ServiceStatus } from '../types';
import { TrendingUp, Clock, CheckCircle2, ClipboardCheck, FilePlus, DollarSign, ArrowRight } from 'lucide-react';

// Helper local para formatar data sem bug de fuso horário
const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

interface DashboardProps {
  orders: ServiceOrder[];
  setView: (view: any) => void;
  onCreateNew: (status: ServiceStatus) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, setView, onCreateNew }) => {
  const stats = {
    pending: orders.filter(o => o.status === ServiceStatus.PENDENTE).length,
    completed: orders.filter(o => o.status === ServiceStatus.CONCLUIDO).length,
    budgets: orders.filter(o => o.status === ServiceStatus.ORCAMENTO).length,
    revenue: orders
      .filter(o => o.status === ServiceStatus.CONCLUIDO)
      .reduce((acc, curr) => acc + Number(curr.serviceValue || 0), 0),
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Controle</h2>
          <p className="text-slate-500 font-medium mt-1">Bem-vindo ao Ponto da Eletrônica!</p>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumo de Hoje</p>
           <p className="text-slate-900 font-black">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Pendentes" 
          value={stats.pending} 
          icon={<Clock size={28} />} 
          color="amber"
          onClick={() => setView('orders')}
        />
        <StatCard 
          label="Finalizados" 
          value={stats.completed} 
          icon={<CheckCircle2 size={28} />} 
          color="emerald"
          onClick={() => setView('history')}
        />
        <StatCard 
          label="Orçamentos" 
          value={stats.budgets} 
          icon={<TrendingUp size={28} />} 
          color="blue"
          onClick={() => setView('budgets')}
        />
        <StatCard 
          label="Faturamento" 
          value={stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={<DollarSign size={28} />} 
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900">Últimos Atendimentos</h3>
            <button onClick={() => setView('history')} className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all">
              Ver histórico completo <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="space-y-6">
            {orders.slice(-5).reverse().map(order => (
              <div key={order.id} className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:scale-[1.01] rounded-3xl transition-all border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-400 font-black shadow-sm group-hover:text-orange-500 transition-colors">
                    {order.equipmentType === 'TV' ? '📺' : '⚙️'}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg leading-tight">{order.customerName}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {order.equipmentType} {order.equipmentBrand}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">
                    {Number(order.serviceValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                    {formatDateDisplay(order.arrivalDate)}
                  </p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-6">
                  <ClipboardCheck size={40} />
                </div>
                <p className="text-slate-400 font-bold text-lg">Ainda não há registros hoje.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <h3 className="text-2xl font-black text-slate-900">Ações Rápidas</h3>
           
           <div 
             onClick={() => onCreateNew(ServiceStatus.PENDENTE)}
             className="group bg-orange-600 p-8 rounded-[40px] text-white cursor-pointer hover:shadow-2xl hover:shadow-orange-200 transition-all active:scale-95"
           >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ClipboardCheck size={32} />
              </div>
              <h4 className="text-2xl font-black">Abrir Nova OS</h4>
              <p className="text-orange-100 font-medium mt-2">Clique para iniciar um novo atendimento oficial.</p>
           </div>

           <div 
             onClick={() => onCreateNew(ServiceStatus.ORCAMENTO)}
             className="group bg-white p-8 rounded-[40px] border border-slate-200 cursor-pointer hover:shadow-xl hover:border-emerald-200 transition-all active:scale-95"
           >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FilePlus size={32} />
              </div>
              <h4 className="text-2xl font-black text-slate-900">Criar Orçamento</h4>
              <p className="text-slate-500 font-medium mt-2">Avaliação técnica rápida para o cliente.</p>
           </div>

           <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-orange-500" /> Dica do Dia
              </h4>
              <p className="text-slate-400 font-medium leading-relaxed">
                Fotos dos aparelhos no ato da entrada evitam reclamações sobre riscos ou danos pré-existentes. <b>Sempre fotografe!</b>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, onClick }: any) => {
  const colorMap: any = {
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-100 text-slate-800"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 flex flex-col justify-between h-52 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${colorMap[color]} group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-900 mt-1 truncate">{value}</p>
      </div>
    </div>
  );
};

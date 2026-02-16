
import React, { useState } from 'react';
import { ServiceOrder, ServiceStatus, EquipmentType } from '../types';
import { EQUIPMENT_OPTIONS, GUARANTEE_OPTIONS } from '../constants';
import { Camera, X, Save, ArrowLeft, Trash2 } from 'lucide-react';

interface ServiceOrderFormProps {
  onSubmit: (order: Partial<ServiceOrder>) => void;
  initialData?: ServiceOrder | null;
  onCancel: () => void;
  defaultStatus?: ServiceStatus;
}

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ 
  onSubmit, 
  initialData, 
  onCancel,
  defaultStatus 
}) => {
  const [formData, setFormData] = useState<Partial<ServiceOrder>>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    equipmentType: EquipmentType.TV,
    equipmentBrand: '',
    reportedDefect: '',
    servicePerformed: '',
    serviceValue: 0,
    guaranteeDays: 30,
    arrivalDate: new Date().toISOString().split('T')[0],
    status: defaultStatus || ServiceStatus.PENDENTE,
    images: [],
    ...initialData
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (parseFloat(value) || 0) : value 
    }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Explicitly type 'file' as 'File' to avoid 'unknown' type errors when accessing 'size' 
      // or passing it to 'readAsDataURL' which expects a Blob/File.
      Array.from(files).forEach((file: File) => {
        if (file.size > 2 * 1024 * 1024) {
          alert('Imagem muito grande! Máximo 2MB.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const inputStyle = "w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800 font-medium placeholder:text-slate-400";
  const labelStyle = "text-xs font-black text-slate-500 uppercase tracking-widest ml-1";

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
      className="bg-white p-6 md:p-12 rounded-[40px] shadow-2xl border border-slate-100 max-w-5xl mx-auto space-y-12 animate-in"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-8 border-slate-50">
        <div>
          <button type="button" onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-orange-600 font-bold mb-4 transition-colors">
            <ArrowLeft size={18} /> Voltar para o Dashboard
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            {initialData ? 'Editar Registro' : 'Novo Atendimento'}
          </h2>
          <p className="text-slate-400 font-medium mt-1">Preencha os campos para gerar o documento profissional.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button type="submit" className="flex-1 md:px-10 py-5 bg-orange-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-orange-700 shadow-xl shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95">
            <Save size={24} /> Salvar Tudo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Lado Esquerdo: Cliente & Equipamento */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-8 h-1 bg-orange-500 rounded-full"></span> Cliente
            </h3>
            <div>
              <label className={labelStyle}>Nome Completo *</label>
              <input required name="customerName" placeholder="Ex: Maria das Graças" value={formData.customerName} onChange={handleInputChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>WhatsApp / Telefone</label>
              <input name="customerPhone" placeholder="(00) 00000-0000" value={formData.customerPhone} onChange={handleInputChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Endereço</label>
              <input name="customerAddress" placeholder="Rua, Número, Bairro..." value={formData.customerAddress} onChange={handleInputChange} className={inputStyle} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-8 h-1 bg-blue-500 rounded-full"></span> Equipamento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Tipo</label>
                <select name="equipmentType" value={formData.equipmentType} onChange={handleInputChange} className={inputStyle}>
                  {EQUIPMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Marca / Modelo</label>
                <input required name="equipmentBrand" placeholder="Ex: Samsung / Philco" value={formData.equipmentBrand} onChange={handleInputChange} className={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Defeito Relatado pelo Cliente</label>
              <textarea name="reportedDefect" placeholder="Descreva o problema aqui..." value={formData.reportedDefect} onChange={handleInputChange} className={`${inputStyle} h-24 resize-none`} />
            </div>
          </div>
        </div>

        {/* Lado Direito: Serviço & Fotos */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Financeiro & Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Status Atual</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className={`${inputStyle} font-bold ${formData.status === ServiceStatus.CONCLUIDO ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Valor do Serviço (R$)</label>
                <input type="number" step="0.01" name="serviceValue" value={formData.serviceValue} onChange={handleInputChange} className={`${inputStyle} font-black text-xl text-emerald-600`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Garantia</label>
                <select name="guaranteeDays" value={formData.guaranteeDays} onChange={handleInputChange} className={inputStyle}>
                  {GUARANTEE_OPTIONS.map(g => <option key={g} value={g}>{g === 0 ? 'Sem Garantia' : `${g} Dias`}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Data de Entrada</label>
                <input type="date" name="arrivalDate" value={formData.arrivalDate} onChange={handleInputChange} className={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Serviço Realizado / Peças</label>
              <textarea name="servicePerformed" placeholder="O que foi feito no aparelho?" value={formData.servicePerformed} onChange={handleInputChange} className={`${inputStyle} h-24 resize-none`} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800">Galeria de Fotos</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {formData.images?.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-slate-100 shadow-sm">
                  <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))} 
                    className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
              <label className="aspect-square flex flex-col items-center justify-center border-3 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-orange-500 transition-all text-slate-300 hover:text-orange-500 group">
                <Camera size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black mt-2 uppercase tracking-tighter">Add Foto</span>
                <input type="file" multiple accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

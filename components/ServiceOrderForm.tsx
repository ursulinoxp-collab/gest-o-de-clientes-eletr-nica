import React, { useState } from 'react';
import { ServiceOrder, ServiceStatus, EquipmentType } from '../types';
import { EQUIPMENT_OPTIONS, GUARANTEE_OPTIONS } from '../constants';
import { Camera, Save, ArrowLeft, Trash2 } from 'lucide-react';

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
  const getLocalDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<Partial<ServiceOrder>>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    equipmentType: EquipmentType.TV,
    equipmentBrand: '',
    equipmentCustomType: '',
    reportedDefect: '',
    servicePerformed: '',
    serviceValue: 0,
    guaranteeDays: 30,
    arrivalDate: getLocalDateStr(),
    deliveryDate: '',
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
      className="bg-white p-6 md:p-12 rounded-[40px] shadow-2xl border border-slate-100 max-w-5xl mx-auto space-y-10 animate-in"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-8 border-slate-50">
        <div>
          <button type="button" onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-orange-600 font-bold mb-4 transition-colors">
            <ArrowLeft size={18} /> Voltar
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            {initialData ? 'Editar Registro' : 'Novo Atendimento'}
          </h2>
        </div>
        <button type="submit" className="px-10 py-5 bg-orange-600 text-white rounded-3xl font-black flex items-center gap-3 hover:bg-orange-700 shadow-xl transition-all active:scale-95">
          <Save size={24} /> Salvar Registro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-8 h-1 bg-orange-500 rounded-full"></span> Dados do Cliente
            </h3>
            <div>
              <label className={labelStyle}>Nome Completo *</label>
              <input required name="customerName" value={formData.customerName} onChange={handleInputChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>WhatsApp / Telefone</label>
              <input name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} className={inputStyle} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className={labelStyle}>Endereço Completo</label>
              <textarea name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} className={`${inputStyle} h-24 resize-none`} placeholder="Rua, Número, Bairro..." />
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
                <input required name="equipmentBrand" value={formData.equipmentBrand} onChange={handleInputChange} className={inputStyle} placeholder="Ex: Samsung 50 pol" />
              </div>
            </div>
            {formData.equipmentType === EquipmentType.OUTROS && (
              <div>
                <label className={labelStyle}>Especifique o Aparelho</label>
                <input name="equipmentCustomType" value={formData.equipmentCustomType} onChange={handleInputChange} className={inputStyle} placeholder="Que tipo de aparelho é este?" />
              </div>
            )}
            <div>
              <label className={labelStyle}>Defeito Relatado</label>
              <textarea name="reportedDefect" value={formData.reportedDefect} onChange={handleInputChange} className={`${inputStyle} h-24 resize-none`} placeholder="O que o cliente disse?" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Detalhes do Serviço
            </h3>
            
            <div>
              <label className={labelStyle}>Serviço Realizado / Observações</label>
              <textarea 
                name="servicePerformed" 
                value={formData.servicePerformed} 
                onChange={handleInputChange} 
                className={`${inputStyle} h-32 resize-none bg-emerald-50/30 border-emerald-100`} 
                placeholder="Descreva o que foi feito no aparelho..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Data de Entrada</label>
                <input type="date" name="arrivalDate" value={formData.arrivalDate} onChange={handleInputChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Data de Saída</label>
                <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} className={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Valor Total (R$)</label>
                <input type="number" step="0.01" name="serviceValue" value={formData.serviceValue} onChange={handleInputChange} className={`${inputStyle} font-bold text-emerald-600`} />
              </div>
              <div>
                <label className={labelStyle}>Garantia</label>
                <select name="guaranteeDays" value={formData.guaranteeDays} onChange={handleInputChange} className={inputStyle}>
                  {GUARANTEE_OPTIONS.map(g => <option key={g} value={g}>{g === 0 ? 'Sem Garantia' : `${g} Dias`}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Status do Atendimento</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className={`${inputStyle} font-bold`}>
                {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800">Galeria de Fotos</h3>
            <div className="grid grid-cols-3 gap-4">
              {formData.images?.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-200 shadow-sm">
                  <img src={img} className="w-full h-full object-cover" alt="Equipamento" />
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all text-slate-300 hover:text-orange-500">
                <Camera size={32} />
                <span className="text-[10px] font-bold mt-1 uppercase">Adicionar</span>
                <input type="file" multiple accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Recomendado: Até 6 fotos por OS.</p>
          </div>
        </div>
      </div>
    </form>
  );
};
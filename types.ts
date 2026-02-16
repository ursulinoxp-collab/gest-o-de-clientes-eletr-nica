
export enum ServiceStatus {
  PENDENTE = 'Pendente',
  CONCLUIDO = 'Concluído',
  DESISTENCIA = 'Desistência',
  ORCAMENTO = 'Orçamento'
}

export enum EquipmentType {
  TV = 'TV',
  MICROONDAS = 'Micro-ondas',
  SECADOR = 'Secador',
  VENTILADOR = 'Ventilador',
  SOM = 'Som',
  FURADEIRA = 'Furadeira',
  OUTROS = 'Outros'
}

export interface ServiceOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  equipmentType: EquipmentType;
  equipmentBrand: string;
  equipmentCustomType?: string;
  reportedDefect: string;
  servicePerformed: string;
  serviceValue: number;
  estimatedValue?: number;
  guaranteeDays: 30 | 60 | 90 | 0;
  arrivalDate: string;
  deliveryDate: string;
  status: ServiceStatus;
  images: string[]; // Base64 strings
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'orders' | 'budgets' | 'create' | 'history';

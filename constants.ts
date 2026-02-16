
import { EquipmentType, ServiceStatus } from './types';

export const EQUIPMENT_OPTIONS = Object.values(EquipmentType);
export const STATUS_OPTIONS = Object.values(ServiceStatus);
export const GUARANTEE_OPTIONS = [0, 30, 60, 90];

export const STATUS_COLORS = {
  [ServiceStatus.PENDENTE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ServiceStatus.CONCLUIDO]: 'bg-green-100 text-green-800 border-green-200',
  [ServiceStatus.DESISTENCIA]: 'bg-red-100 text-red-800 border-red-200',
  [ServiceStatus.ORCAMENTO]: 'bg-blue-100 text-blue-800 border-blue-200',
};

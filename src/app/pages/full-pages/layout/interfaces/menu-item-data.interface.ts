import { Seccion, Subseccion } from './MenuResponse';

export interface SeccionMenuData extends Seccion {
  sistema_id: number;
  sistema_nombre: string;
}

export interface SubseccionMenuData extends Subseccion {
  parent_seccion_id: number;
  sistema_id: number;
}

export interface MenuItemData {
  seccion?: SeccionMenuData;
  subseccion?: SubseccionMenuData;
  parentId?: number;  // Id of the parent section for subsections
}

import { MessageResponse } from "../../../../core/interfaces/message.interfaces";

export interface MenuResponse extends MessageResponse  {
  data:            MenuData[];
  meta:            MenuMeta;
  _cacheTimestamp: number;
  _userId:         string;
}

export interface MenuData {
  sistema_id:     number;
  sistema_nombre: string;
  secciones:      Seccion[];
}

export interface Seccion {
  id:            number;
  codigo:        string;
  nombre:        string;
  orden:         number;
  total_modulos: number;
  subsecciones:  Subseccion[];
}

export interface Subseccion {
  id:            number;
  codigo:        string;
  nombre:        string;
  orden:         number;
  ruta:          string | null;
  total_modulos: number;
}

export interface MenuMeta {
  total:         number;
  sistemaFiltro: string;
  timestamp:     Date;
}

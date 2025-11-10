import * as global from '../../../../environment/global';


// URL base para todos los endpoints de cotizaciones
const COTIZAR_BASE_URL = `${global.url}api/cotizar/`;

// URLs principales por funcionalidad
const COTIZAR_GESTION_URL = `${COTIZAR_BASE_URL}gestion/`;           // Gestión de cotizaciones
const COTIZAR_ELEMENTOS_URL = `${COTIZAR_BASE_URL}`;       // Elementos básicos (colores, componentes, etc.)
const COTIZAR_CREACION_URL = `${COTIZAR_BASE_URL}creacion/`;         // Creación de nuevas cotizaciones
const COTIZAR_CALCULO_URL = `${COTIZAR_BASE_URL}calculo/`;           // Cálculos y fórmulas
const COTIZAR_PASAR_CONFIRMAR_URL = `${COTIZAR_BASE_URL}pasar-confirmar/`; // Pasar a confirmación
const COTIZAR_REVERTIR_URL = `${COTIZAR_BASE_URL}revertir/`;         // Revertir cotizaciones

// URLs de elementos específicos (colores, componentes, descriptores, etc.)
export const COTIZAR_ELEMENTOS_URLS = {
  colores: `${COTIZAR_ELEMENTOS_URL}colores/`,           // Gestión de colores
  componentes: `${COTIZAR_ELEMENTOS_URL}componentes/`,   // Gestión de componentes
  descriptores: `${COTIZAR_ELEMENTOS_URL}descriptores/`, // Gestión de descriptores
  dimensiones: `${COTIZAR_ELEMENTOS_URL}dimensiones/`,   // Gestión de dimensiones
  minutajes: `${COTIZAR_ELEMENTOS_URL}minutajes/`,       // Gestión de minutajes
  extras: `${COTIZAR_ELEMENTOS_URL}extras/`,             // Gestión de extras
  hiladosColor: `${COTIZAR_ELEMENTOS_URL}hilados-color/`, // Gestión de hilados por color
  hiladosEspeciales: `${COTIZAR_ELEMENTOS_URL}hilados-especiales/` // Gestión de hilados especiales
};

// Nuevas URLs organizadas por funcionalidad
export const cotizarGestionUrl = COTIZAR_GESTION_URL;             // Gestión general
export const cotizarCreacionUrl = COTIZAR_CREACION_URL;           // Creación
export const cotizarCalculoUrl = COTIZAR_CALCULO_URL;             // Cálculos
export const cotizarPasarConfirmarUrl = COTIZAR_PASAR_CONFIRMAR_URL; // Confirmación
export const cotizarRevertirUrl = COTIZAR_REVERTIR_URL;           // Reversión

// Exportaciones para compatibilidad con código existente
export const cotizarColoresUrl = COTIZAR_ELEMENTOS_URLS.colores;
export const cotizarComponentesUrl = COTIZAR_ELEMENTOS_URLS.componentes;
export const cotizarDescriptoresUrl = COTIZAR_ELEMENTOS_URLS.descriptores;
export const cotizarDimensionesUrl = COTIZAR_ELEMENTOS_URLS.dimensiones;
export const cotizarMinutajesUrl = COTIZAR_ELEMENTOS_URLS.minutajes;
export const cotizarExtrasUrl = COTIZAR_ELEMENTOS_URLS.extras;
export const cotizarHiladosColorUrl = COTIZAR_ELEMENTOS_URLS.hiladosColor;
export const cotizarHiladoEspecialUrl = COTIZAR_ELEMENTOS_URLS.hiladosEspeciales;




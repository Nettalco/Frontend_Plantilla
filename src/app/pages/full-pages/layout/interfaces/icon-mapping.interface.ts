export interface IconMapping {
  [codigo: string]: string;
}

export interface MenuIconConfig {
  secciones: IconMapping;
  subsecciones: IconMapping;
  default: string;
}

export const MENU_ICON_CONFIG: MenuIconConfig = {
  secciones: {
    'INICIO': 'pi pi-home',
    'COTIZAR': 'pi pi-dollar',
    'HERRAMIENTAS': 'pi pi-cog',
    'REPORTES': 'pi pi-chart-bar',
    'ESTILOS': 'pi pi-palette'
  },
  subsecciones: {
    'ACCESO': 'pi pi-check',
    'COTIZACIONES': 'pi pi-file-pdf',
    'CREAR': 'pi pi-plus',
    'CONSULTA': 'pi pi-search',
    'DETALLE': 'pi pi-eye',
    'CALCULO': 'pi pi-calculator',
    'CONFIRMAR': 'pi pi-check-circle',
    'REVERTIR': 'pi pi-undo',
    'RETIRAR': 'pi pi-trash',
    'VARIABLES': 'pi pi-sliders-h',
    'PRECIO': 'pi pi-money-bill',
    'RUBROS': 'pi pi-list',
    'USUARIOS': 'pi pi-users',
    'PERMISOS': 'pi pi-shield',
    'ROLES': 'pi pi-id-card',
    'BACKUP': 'pi pi-download',
    'LOGS': 'pi pi-file',
    'SISTEMA': 'pi pi-desktop',
    'NOTIFICACIONES': 'pi pi-bell',
    'EMAILS': 'pi pi-envelope',
    'PRODUCTOS': 'pi pi-box',
    'CLIENTES': 'pi pi-user-plus',
    'PROVEEDORES': 'pi pi-building',
    'FACTURAS': 'pi pi-receipt',
    'PAGOS': 'pi pi-credit-card',
    'NOMINA': 'pi pi-wallet',
    'EMPLEADOS': 'pi pi-users',
    'ASISTENCIA': 'pi pi-clock',
    'INVENTARIO_ENTRADA': 'pi pi-plus-circle',
    'INVENTARIO_SALIDA': 'pi pi-minus-circle',
    'CATALOGO': 'pi pi-th-large',
    'DASHBOARD': 'pi pi-chart-pie',
    'CONFIGURACION_GENERAL': 'pi pi-cog',
    'AUDITORIA': 'pi pi-history',
    'REQUERIMIENTO': 'pi pi-file-edit',
    'EJEMPLO': 'pi pi-file-edit',
    'EJEMPLO1': 'pi pi-file-edit'
  },
  default: 'pi pi-circle'
};

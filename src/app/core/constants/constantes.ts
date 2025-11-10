// Interfaces para tipado
interface Modulo {
  id: number;
  codigo: string;
}

interface Subseccion {
  id: number;
  codigo: string;
  modulos?: Modulo[];
}

interface Seccion {
  id: number;
  codigo: string;
  subsecciones: Subseccion[];
}

// Definición jerárquica del sistema de navegación
export const SISTEMA_NAV: Seccion[] = [
  {
    id: 1,
    codigo: 'INICIO',
    subsecciones: [
      {
        id: 1,
        codigo: 'ACCESO'
      }
    ]
  },
  {
    id: 2,
    codigo: 'REPORTES',
    subsecciones: [
      {
        id: 2,
        codigo: 'COTIZACIONES'
      }
    ]
  },
  {
    id: 3,
    codigo: 'COTIZAR',
    subsecciones: [
      {
        id: 3,
        codigo: 'CREAR',
        modulos: [
          {
            id: 19,
            codigo: 'CREACION_INDIVIDUAL'
          },
          {
            id: 18,
            codigo: 'CREACION_MASIVA'
          },
        ]
      },
      {
        id: 4,
        codigo: 'CONSULTA'
      },
      {
        id: 5,
        codigo: 'DETALLE',
        modulos: [
          {
            id: 1,
            codigo: 'GENERAL'
          },
          {
            id: 2,
            codigo: 'COLORES'
          },
          {
            id: 3,
            codigo: 'COMPONENTES'
          },
          {
            id: 4,
            codigo: 'DESCRIPTORES'
          },
          {
            id: 5,
            codigo: 'DIMENSIONES'
          },
          {
            id: 6,
            codigo: 'MINUTAJES'
          },
          {
            id: 7,
            codigo: 'EXTRAS'
          },
          {
            id: 8,
            codigo: 'HILADOS_COLOR'
          },
          {
            id: 9,
            codigo: 'HILADOS_ESPECIALES'
          },
          {
            id: 10,
            codigo: 'RESUMEN'
          }
        ]
      },
      {
        id: 6,
        codigo: 'CALCULO'
      },
      {
        id: 7,
        codigo: 'CONFIRMAR'
      },
      {
        id: 8,
        codigo: 'REVERTIR'
      },
      {
        id: 9,
        codigo: 'RETIRAR'
      }
    ]
  },
  {
    id: 4,
    codigo: 'HERRAMIENTAS',
    subsecciones: [
      {
        id: 10,
        codigo: 'VARIABLES'
      },
      {
        id: 11,
        codigo: 'PRECIO'
      },
      {
        id: 12,
        codigo: 'RUBROS'
      }
    ]
  },

  {
    id: 6,
    codigo: 'ESTILOS',
    subsecciones: [
      {
        id: 14,
        codigo: 'REQUERIMIENTO'
      }
    ]
  },
  {
    id: 19,
    codigo: 'EJEMPLO',
    subsecciones: [
      {
        id: 51,
        codigo: 'EJEMPLO1'
      }
    ]
  }
];

// Funciones de utilidad para navegar la estructura jerárquica

// Obtener todas las subsecciones de una sección
export function getSubseccionesBySeccion(seccionCodigo: string): Subseccion[] {
  const seccion = SISTEMA_NAV.find(s => s.codigo === seccionCodigo);
  return seccion ? seccion.subsecciones : [];
}

// Obtener una subsección específica
export function getSubseccionByCodigo(seccionCodigo: string, subseccionCodigo: string): Subseccion | undefined {
  const seccion = SISTEMA_NAV.find(s => s.codigo === seccionCodigo);
  if (!seccion) return undefined;
  return seccion.subsecciones.find(sub => sub.codigo === subseccionCodigo);
}

// Obtener todos los módulos de una subsección
export function getModulosBySubseccion(seccionCodigo: string, subseccionCodigo: string): Modulo[] {
  const subseccion = getSubseccionByCodigo(seccionCodigo, subseccionCodigo);
  return subseccion?.modulos || [];
}

// Obtener un módulo específico
export function getModuloByCodigo(seccionCodigo: string, subseccionCodigo: string, moduloCodigo: string): Modulo | undefined {
  const modulos = getModulosBySubseccion(seccionCodigo, subseccionCodigo);
  return modulos.find(m => m.codigo === moduloCodigo);
}

// Obtener módulo por ID
export function getModuloById(seccionCodigo: string, subseccionCodigo: string, moduloId: number): Modulo | undefined {
  const modulos = getModulosBySubseccion(seccionCodigo, subseccionCodigo);
  return modulos.find(m => m.id === moduloId);
}

// Obtener sección por código
export function getSeccionByCodigo(seccionCodigo: string): Seccion | undefined {
  return SISTEMA_NAV.find(s => s.codigo === seccionCodigo);
}

// Obtener sección por ID
export function getSeccionById(seccionId: number): Seccion | undefined {
  return SISTEMA_NAV.find(s => s.id === seccionId);
}

// Obtener subsección por ID
export function getSubseccionById(subseccionId: number): Subseccion | undefined {
  for (const seccion of SISTEMA_NAV) {
    const subseccion = seccion.subsecciones.find(sub => sub.id === subseccionId);
    if (subseccion) return subseccion;
  }
  return undefined;
}

// Obtener módulo por ID (busca en toda la estructura)
export function getModuloByIdGlobal(moduloId: number): { modulo: Modulo; seccion: Seccion; subseccion: Subseccion } | undefined {
  for (const seccion of SISTEMA_NAV) {
    for (const subseccion of seccion.subsecciones) {
      if (subseccion.modulos) {
        const modulo = subseccion.modulos.find(m => m.id === moduloId);
        if (modulo) {
          return { modulo, seccion, subseccion };
        }
      }
    }
  }
  return undefined;
}

// Arrays de conveniencia para compatibilidad
export const SECCIONES_ARRAY = SISTEMA_NAV;

export const SUBSECCIONES_ARRAY = SISTEMA_NAV.flatMap(seccion => seccion.subsecciones);

export const MODULOS_DETALLE_ARRAY = (() => {
  const detalleSubseccion = getSubseccionByCodigo('COTIZAR', 'DETALLE');
  return detalleSubseccion?.modulos || [];
})();

// Funciones de compatibilidad con la estructura anterior
export function getModuloDetalleById(id: number) {
  return MODULOS_DETALLE_ARRAY.find(modulo => modulo.id === id);
}

export function getModuloDetalleByCodigo(codigo: string) {
  return MODULOS_DETALLE_ARRAY.find(modulo => modulo.codigo === codigo);
}

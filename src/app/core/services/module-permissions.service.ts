import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, shareReplay, takeUntil, Subject } from 'rxjs';
import { MenuService } from '../../pages/full-pages/layout/services/menu.service';

export interface ModuloPermisos {
  modulo: {
    id: number;
    codigo: string;
  };
  permisos: string[];
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canUpdate: boolean;
}

export interface PermissionsState {
  loading: boolean;
  loaded: boolean;
  modulosPermisos: ModuloPermisos[];
  permisosGenerales: string[];
  error: string | null;
}

interface SectionPermissionsCache {
  [sectionSubsectionKey: string]: Observable<PermissionsState>;
}

@Injectable({
  providedIn: 'root'
})
export class ModulePermissionsService {
  private readonly permissionsCache: SectionPermissionsCache = {};
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly menuService: MenuService) {}

  /**
   * Obtiene los permisos para una sección y subsección específica
   * Implementa cache para evitar múltiples peticiones
   */
  getPermissionsForSection(sectionCode: string, subsectionCode: string): Observable<PermissionsState> {
    const cacheKey = `${sectionCode}_${subsectionCode}`;

    // Si ya existe en cache, devolverlo
    if (this.permissionsCache[cacheKey]) {
      return this.permissionsCache[cacheKey];
    }

    // Crear nuevo observable con cache
    this.permissionsCache[cacheKey] = this.loadPermissionsFromBackend(sectionCode, subsectionCode)
      .pipe(
        shareReplay(1), // Cache el último valor
        takeUntil(this.destroy$)
      );

    return this.permissionsCache[cacheKey];
  }

  /**
   * Carga permisos desde el backend
   */
  private loadPermissionsFromBackend(sectionCode: string, subsectionCode: string): Observable<PermissionsState> {
    const initialState: PermissionsState = {
      loading: true,
      loaded: false,
      modulosPermisos: [],
      permisosGenerales: [],
      error: null
    };

    const loadingSubject = new BehaviorSubject<PermissionsState>(initialState);

    // Obtener IDs de sección y subsección
    this.menuService.getSectionAndSubsectionIds(sectionCode, subsectionCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ sectionId, subsectionId }) => {
          this.loadPermisosForSection(sectionId, subsectionId, loadingSubject);
        },
        error: (error) => {
          console.error('Error obteniendo IDs de sección y subsección:', error);
          loadingSubject.next({
            loading: false,
            loaded: true,
            modulosPermisos: [],
            permisosGenerales: [],
            error: 'Error obteniendo IDs de sección y subsección'
          });
        }
      });

    return loadingSubject.asObservable();
  }

  /**
   * Carga permisos específicos para sección y subsección
   */
  private loadPermisosForSection(
    sectionId: number,
    subsectionId: number,
    subject: BehaviorSubject<PermissionsState>
  ): void {
    this.menuService.getPermisosBySectionAndSubsection(sectionId, subsectionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permisos) => {
          const permisosGenerales = permisos.map(p => p.codigo);
          const modulosPermisos = this.processModulosPermisos(permisos);

          subject.next({
            loading: false,
            loaded: true,
            modulosPermisos,
            permisosGenerales,
            error: null
          });
        },
        error: (error) => {
          console.error('Error cargando permisos:', error);
          subject.next({
            loading: false,
            loaded: true,
            modulosPermisos: [],
            permisosGenerales: [],
            error: 'Error cargando permisos del servidor'
          });
        }
      });
  }

  /**
   * Procesa los permisos del backend en el formato interno
   */
  private processModulosPermisos(permisosBackend: any[] = []): ModuloPermisos[] {
    return permisosBackend.map(permisoModulo => {
      const modulo = {
        id: permisoModulo.id,
        codigo: permisoModulo.codigo
      };

      const permisos = permisoModulo.permisos || {};

      return {
        modulo,
        permisos: [permisoModulo.codigo],
        canRead: permisos.leer || false,
        canWrite: permisos.crear || false,
        canDelete: permisos.eliminar || false,
        canUpdate: permisos.actualizar || false
      };
    });
  }

  /**
   * Verifica si el usuario puede acceder a un módulo específico
   */
  canAccessModulo(modulosPermisos: ModuloPermisos[], moduloCodigo: string): boolean {
    const moduloPermisos = modulosPermisos.find(mp => mp.modulo.codigo === moduloCodigo);

    if (!moduloPermisos) {
      return false;
    }

    return moduloPermisos.canRead || moduloPermisos.canWrite || moduloPermisos.canUpdate;
  }

  /**
   * Verifica si el usuario puede leer un módulo específico
   */
  canReadModulo(modulosPermisos: ModuloPermisos[], moduloCodigo: string): boolean {
    const moduloPermisos = modulosPermisos.find(mp => mp.modulo.codigo === moduloCodigo);
    return moduloPermisos?.canRead || false;
  }

  /**
   * Verifica si el usuario puede escribir en un módulo específico
   */
  canWriteModulo(modulosPermisos: ModuloPermisos[], moduloCodigo: string): boolean {
    const moduloPermisos = modulosPermisos.find(mp => mp.modulo.codigo === moduloCodigo);
    return moduloPermisos?.canWrite || false;
  }

  /**
   * Verifica si el usuario puede actualizar un módulo específico
   */
  canUpdateModulo(modulosPermisos: ModuloPermisos[], moduloCodigo: string): boolean {
    const moduloPermisos = modulosPermisos.find(mp => mp.modulo.codigo === moduloCodigo);
    return moduloPermisos?.canUpdate || false;
  }

  /**
   * Verifica si el usuario puede eliminar en un módulo específico
   */
  canDeleteModulo(modulosPermisos: ModuloPermisos[], moduloCodigo: string): boolean {
    const moduloPermisos = modulosPermisos.find(mp => mp.modulo.codigo === moduloCodigo);
    return moduloPermisos?.canDelete || false;
  }

  /**
   * Obtiene todos los módulos accesibles
   */
  getAccessibleModules(modulosPermisos: ModuloPermisos[]): ModuloPermisos[] {
    return modulosPermisos.filter(mp => this.canAccessModulo(modulosPermisos, mp.modulo.codigo));
  }

  /**
   * Encuentra el primer módulo accesible
   */
  getFirstAccessibleModule(modulosPermisos: ModuloPermisos[]): ModuloPermisos | null {
    const accessible = this.getAccessibleModules(modulosPermisos);
    return accessible.length > 0 ? accessible[0] : null;
  }

  /**
   * Verifica permisos generales (para compatibilidad con código existente)
   */
  hasPermissionForModulo(permisosGenerales: string[], moduloCodigo: string, permiso: string): boolean {
    return permisosGenerales.some(p =>
      p === `${moduloCodigo}_${permiso}` ||
      p === `${moduloCodigo}_${permiso.toUpperCase()}` ||
      p === permiso ||
      p === permiso.toUpperCase()
    );
  }

  /**
   * Limpia el cache de permisos (útil para logout o cambio de usuario)
   */
  clearCache(): void {
    Object.keys(this.permissionsCache).forEach(key => {
      delete this.permissionsCache[key];
    });
  }

  /**
   * Cleanup al destruir el servicio
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearCache();
  }
}

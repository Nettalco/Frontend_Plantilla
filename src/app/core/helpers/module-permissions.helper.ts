import { Subject, takeUntil } from 'rxjs';
import { ModulePermissionsService, ModuloPermisos, PermissionsState } from '../services/module-permissions.service';

/**
 * Helper para manejar permisos de módulos usando composición
 * Este helper se puede usar en cualquier componente sin necesidad de herencia
 */
export class ModulePermissionsHelper {
  // ==================== PROPERTIES ====================
  permisosCargados = false;
  modulosPermisos: ModuloPermisos[] = [];
  permisosGenerales: string[] = [];
  permissionsError: string | null = null;
  permissionsLoading = true;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly modulePermissionsService: ModulePermissionsService,
    private readonly sectionCode: string,
    private readonly subsectionCode: string,
    private readonly onPermissionsLoadedCallback?: () => void,
    private readonly onFirstAccessibleModuleCallback?: (module: ModuloPermisos) => void
  ) { }

  /**
   * Inicializa la carga de permisos
   * Debe ser llamado desde el ngOnInit del componente
   */
  initialize(): void {
    this.loadPermissions();
  }

  /**
   * Limpia recursos
   * Debe ser llamado desde el ngOnDestroy del componente
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== PERMISSIONS LOADING ====================
  private loadPermissions(): void {
    this.modulePermissionsService
      .getPermissionsForSection(this.sectionCode, this.subsectionCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (state: PermissionsState) => {
          this.permissionsLoading = state.loading;
          this.permisosCargados = state.loaded;
          this.modulosPermisos = state.modulosPermisos;
          this.permisosGenerales = state.permisosGenerales;
          this.permissionsError = state.error;

          // Ejecutar callback cuando los permisos se cargan exitosamente
          if (state.loaded && !state.error) {
            this.onPermissionsLoadedCallback?.();
            this.selectFirstAccessibleModule();
          } else if (state.loaded && state.error) {
            this.onPermissionsLoadedCallback?.();
          }
        },
        error: (error) => {
          console.error('Error en ModulePermissionsHelper:', error);
          this.permissionsLoading = false;
          this.permisosCargados = true;
          this.permissionsError = 'Error cargando permisos';
          this.modulosPermisos = [];
          this.permisosGenerales = [];

          // Ejecutar callback también cuando hay error para que el componente pueda manejar la redirección
          this.onPermissionsLoadedCallback?.();
        }
      });
  }

  // ==================== PERMISSION CHECKERS ====================
  canAccessModulo(moduloCodigo: string): boolean {
    if (!this.permisosCargados) return false;
    return this.modulePermissionsService.canAccessModulo(this.modulosPermisos, moduloCodigo);
  }

  canReadModulo(moduloCodigo: string): boolean {
    if (!this.permisosCargados) return false;
    return this.modulePermissionsService.canReadModulo(this.modulosPermisos, moduloCodigo);
  }

  canWriteModulo(moduloCodigo: string): boolean {
    if (!this.permisosCargados) return false;
    return this.modulePermissionsService.canWriteModulo(this.modulosPermisos, moduloCodigo);
  }

  canUpdateModulo(moduloCodigo: string): boolean {
    if (!this.permisosCargados) return false;
    return this.modulePermissionsService.canUpdateModulo(this.modulosPermisos, moduloCodigo);
  }

  canDeleteModulo(moduloCodigo: string): boolean {
    if (!this.permisosCargados) return false;
    return this.modulePermissionsService.canDeleteModulo(this.modulosPermisos, moduloCodigo);
  }

  getAccessibleModules(): ModuloPermisos[] {
    if (!this.permisosCargados) return [];
    return this.modulePermissionsService.getAccessibleModules(this.modulosPermisos);
  }

  getFirstAccessibleModule(): ModuloPermisos | null {
    if (!this.permisosCargados) return null;
    return this.modulePermissionsService.getFirstAccessibleModule(this.modulosPermisos);
  }

  hasPermissionForModulo(moduloCodigo: string, permiso: string): boolean {
    if (!this.permisosCargados) return false;
    return this.modulePermissionsService.hasPermissionForModulo(
      this.permisosGenerales,
      moduloCodigo,
      permiso
    );
  }

  // ==================== UTILITIES ====================
  getPermissionsState(): {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    hasModules: boolean;
  } {
    return {
      loading: this.permissionsLoading,
      loaded: this.permisosCargados,
      error: this.permissionsError,
      hasModules: this.modulosPermisos.length > 0
    };
  }

  selectFirstAccessibleModule(): void {
    const firstAccessible = this.getFirstAccessibleModule();
    if (firstAccessible) {
      this.onFirstAccessibleModuleCallback?.(firstAccessible);
    }
  }

  // ==================== FACTORY METHOD ====================
  /**
   * Factory method para crear instancias de manera más limpia
   */
  static create(
    modulePermissionsService: ModulePermissionsService,
    sectionCode: string,
    subsectionCode: string,
    callbacks?: {
      onPermissionsLoaded?: () => void;
      onFirstAccessibleModule?: (module: ModuloPermisos) => void;
    }
  ): ModulePermissionsHelper {
    return new ModulePermissionsHelper(
      modulePermissionsService,
      sectionCode,
      subsectionCode,
      callbacks?.onPermissionsLoaded,
      callbacks?.onFirstAccessibleModule
    );
  }
}

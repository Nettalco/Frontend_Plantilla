import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Observable, catchError, map, tap, shareReplay, throwError, BehaviorSubject, Subject, finalize, filter, take, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpUtilsService } from '../../../../shared/services/http-utils.service';
import { MessageService as AppMessageService } from '../../../../core/services/message.service';
import * as global from '../../../../../environment/global';
import { MenuResponse, MenuData, Seccion } from '../interfaces/MenuResponse';
import { MENU_ICON_CONFIG } from '../interfaces/icon-mapping.interface';
import { MenuItemData } from '../interfaces/menu-item-data.interface';

@Injectable({ providedIn: 'root' })
export class MenuService implements OnDestroy {

  // ========== CONFIGURACIÓN ==========
  private url = global.urlAcces;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutos

  // ========== CACHE ==========
  private menuCache$?: Observable<MenuItem[]>;
  private permisosCache: Map<string, Observable<any[]>> = new Map();
  private permisosLogCount: Map<string, number> = new Map();
  private readonly PERMISOS_CACHE_TTL = 5 * 60 * 1000; // 5 minutos para permisos
  private cacheTimestamp = 0;
  private loadingMenu$ = new BehaviorSubject<boolean>(false);
  private pendingMenuRequest$?: Observable<MenuItem[]>;

  // ========== ESTADO ==========
  private destroy$ = new Subject<void>();
  private menuSubject$ = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$ = this.menuSubject$.asObservable(); // Observable público para que los componentes se suscriban

  constructor(
    private http: HttpClient,
    private httpUtils: HttpUtilsService,
    private messageService: AppMessageService
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== PERMISOS (acceder  al  MENÚ) ==========


  /**
   * Obtiene los permisos del cache si están disponibles y válidos,
   * si no, los obtiene del servidor
   */
  getPermisosBySectionAndSubsection(section: number, subsection: number): Observable<any[]> {
    const cacheKey = `${section}-${subsection}`;

    // Verificar si ya existe un Observable cacheado y válido
    const cachedObservable = this.permisosCache.get(cacheKey);
    if (cachedObservable) {
      // Solo loguear las primeras 3 veces para cada clave para reducir spam
      const logCount = this.permisosLogCount.get(cacheKey) || 0;
      if (logCount < 3) {
        this.permisosLogCount.set(cacheKey, logCount + 1);
      }
      return cachedObservable;
    }

    // Resetear contador de logs para esta clave
    this.permisosLogCount.set(cacheKey, 0);

    // Crear un nuevo Observable que será cacheado
    const newRequest$ = this.http.get<any>(`${this.url}api/permisos/${section}/${subsection}`).pipe(
      map(response => response.data || []),
      catchError(this.handleTokenError),
      shareReplay({
        bufferSize: 1,
        refCount: false // Mantener el caché incluso sin suscriptores
      }),
      // Programar la limpieza del caché
      tap(() => {
        setTimeout(() => {
          this.permisosCache.delete(cacheKey);
          this.permisosLogCount.delete(cacheKey);
        }, this.PERMISOS_CACHE_TTL);
      })
    );

    // Guardar en caché inmediatamente
    this.permisosCache.set(cacheKey, newRequest$);

    return newRequest$;
  }  /**
   * Verifica si existen permisos específicos para una sección y subsección
   */
  hasPermission(section: number, subsection: number, permisoCodigo: string): Observable<boolean> {
    return this.getPermisosBySectionAndSubsection(section, subsection).pipe(
      map(permisos => permisos.some(permiso => permiso.codigo === permisoCodigo))
    );
  }

  /**
   * Limpia el caché de permisos para una sección y subsección específicas
   */
  clearPermisosCache(section?: number, subsection?: number): void {
    if (section && subsection) {
      const cacheKey = `${section}-${subsection}`;
      this.permisosCache.delete(cacheKey);
      this.permisosLogCount.delete(cacheKey);
    } else {
      // Si no se especifican section y subsection, limpiar todo el caché
      this.permisosCache.clear();
      this.permisosLogCount.clear();
    }
  }

  /**
   * Limpia el caché del menú y fuerza una nueva carga
   */
  clearMenuCache(): void {
    this.menuCache$ = undefined;
    this.pendingMenuRequest$ = undefined;
    this.menuSubject$.next([]);
    this.cacheTimestamp = 0;
  }
  // ========== NAVEGACIÓN (ESTRUCTURA DEL MENÚ) ==========

  /**
   * Obtiene la estructura completa del menú de navegación
   * NOTA: Solo estructura (secciones/subsecciones), NO incluye permisos
   */
  getMenuItems(): Observable<MenuResponse> {
    const url = this.url + 'api/permisos/navegacion';
    console.log('🔍 Obteniendo menú de navegación desde:', url);
    
    return this.http.get<MenuResponse>(url, {
      withCredentials: true // Importante para enviar cookies en requests cross-origin
    }).pipe(
      catchError((error: any) => {
        console.error('❌ Error al obtener menú de navegación:', error);
        console.error('📊 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        return this.handleTokenError(error);
      })
    );
  }
  /**
   * Obtiene la estructura del menú desde el servidor con cache optimizado
   */
  getMenuItemsFromServer(): Observable<MenuItem[]> {
    // Si ya hay datos en el BehaviorSubject y el caché es válido, retornar inmediatamente
    if (this.menuSubject$.value.length > 0 && this.isCacheValid()) {
      return this.menuItems$;
    }

    // Si hay una petición pendiente, retornar esa petición
    if (this.pendingMenuRequest$) {
      return this.pendingMenuRequest$;
    }

    this.loadingMenu$.next(true);

    this.pendingMenuRequest$ = this.getMenuItems().pipe(
      tap(response => this.messageService.handleBackendResponse(response)),
      map(response => this.processMenuResponse(response)),
      tap(menuItems => {
        this.menuSubject$.next(menuItems);
        this.cacheTimestamp = Date.now();
        this.loadingMenu$.next(false);
      }),
      shareReplay(1),
      takeUntil(this.destroy$),
      finalize(() => {
        // Limpiar la petición pendiente cuando termine (exitosa o con error)
        this.pendingMenuRequest$ = undefined;
        this.loadingMenu$.next(false);
      })
    );

    // Guardar en cache para futuras llamadas
    this.menuCache$ = this.pendingMenuRequest$;

    return this.pendingMenuRequest$;
  }

  /**
   * Método simplificado para obtener el menú - usa el BehaviorSubject
   * Los componentes deberían usar este método en lugar de getMenuItemsFromServer
   */
  getMenuItems$(): Observable<MenuItem[]> {
    // Si no hay datos o el caché expiró, cargar desde servidor
    if (this.menuSubject$.value.length === 0 || !this.isCacheValid()) {
      this.getMenuItemsFromServer().subscribe(); // Trigger la carga
    }
    return this.menuItems$;
  }

  /**
   * Obtiene los IDs de sección y subsección por código
   */
  getSectionAndSubsectionIds(sectionCode: string, subsectionCode: string): Observable<{ sectionId: number, subsectionId: number }> {
    // Primero intentar obtener del BehaviorSubject si ya tiene datos
    if (this.menuSubject$.value.length > 0) {
      return this.findSectionAndSubsectionIdsFromMenuItems(this.menuSubject$.value, sectionCode, subsectionCode);
    }

    // Si no hay datos en el BehaviorSubject, usar el método que maneja el caché
    return this.getMenuItems$().pipe(
      filter((menuItems: MenuItem[]) => menuItems.length > 0), // Esperar a que haya datos
      take(1),
      switchMap((menuItems: MenuItem[]) =>
        this.findSectionAndSubsectionIdsFromMenuItems(menuItems, sectionCode, subsectionCode)
      )
    );
  }  /**
   * Método auxiliar para buscar IDs en los datos del menú
   */
  private findSectionAndSubsectionIdsFromMenuItems(
    menuItems: MenuItem[],
    sectionCode: string,
    subsectionCode: string
  ): Observable<{ sectionId: number, subsectionId: number }> {
    return new Observable(observer => {
      let sectionId: number | null = null;
      let subsectionId: number | null = null;

      // Buscar en los MenuItem[]
      for (const menuItem of menuItems) {
        if (menuItem['data']?.seccion?.codigo === sectionCode) {
          sectionId = menuItem['data'].seccion.id;

          // Buscar en las subsecciones
          if (menuItem.items) {
            for (const subItem of menuItem.items) {
              if (subItem['data']?.subseccion?.codigo === subsectionCode) {
                subsectionId = subItem['data'].subseccion.id;
                break;
              }
            }
          }
          break;
        }
      }

      if (!sectionId || !subsectionId) {
        observer.error(new Error(`No se encontró la sección ${sectionCode} o subsección ${subsectionCode}`));
        return;
      }

      observer.next({ sectionId, subsectionId });
      observer.complete();
    });
  }


  // ========== CACHE ==========

  private isCacheValid(): boolean {
    return (Date.now() - this.cacheTimestamp) < this.CACHE_TTL;
  }

  // ========== MÉTODOS PRIVADOS =========

  private handleTokenError = (error: any) => {
    // Manejar errores de token expirado
    if (error.status === 419 && error.error?.error === 'TOKEN_EXPIRED') {
      console.warn('⚠️ Token expirado');
      return throwError(() => error);
    }
    
    // Manejar errores 500 del servidor
    if (error.status === 500) {
      console.error('❌ Error 500 del servidor al obtener menú de navegación');
      const errorMessage = error.error?.message || error.message || 'Error interno del servidor';
      this.messageService.error(errorMessage, 'Error al cargar el menú');
    }
    
    // Manejar errores de autenticación
    if (error.status === 401 || error.status === 403) {
      console.warn('⚠️ Error de autenticación/autorización');
    }
    
    return this.httpUtils.handleError(error);
  }

  private processMenuResponse = (response: MenuResponse): MenuItem[] => {
    if (!response.success) {
      console.warn('Error del servidor:', response.message);
      throw new Error(response.message || 'Error al obtener menú');
    }
    return response.data.flatMap(sistema =>
      this.sortByOrder(sistema.secciones).map(seccion =>
        this.createSeccionMenuItem(seccion, sistema)
      )
    );
  }

  private createSeccionMenuItem(seccion: Seccion, sistema: MenuData): MenuItem {
    return this.createMenuItem({
      label: seccion.nombre,
      codigo: seccion.codigo,
      id: seccion.id,
      type: 'seccion',
      data: {
        seccion: {
          ...seccion,
          subsecciones: seccion.subsecciones || [],
          sistema_id: sistema.sistema_id,
          sistema_nombre: sistema.sistema_nombre
        }
      },
      subsecciones: seccion.subsecciones,
      sistemaId: sistema.sistema_id
    });
  }

  private createSubseccionMenuItems(seccion: Seccion, sistemaId: number): MenuItem[] {
    if (!seccion.subsecciones?.length) return [];

    return this.sortByOrder(seccion.subsecciones).map(subseccion => {
      const menuItem = this.createMenuItem({
        label: subseccion.nombre,
        codigo: subseccion.codigo,
        id: subseccion.id,
        type: 'subseccion',
        data: {
          subseccion: {
            ...subseccion,
            parent_seccion_id: seccion.id,
            sistema_id: sistemaId
          },
          parentId: seccion.id
        }
      });

      // Usar la ruta que viene del backend
      if (subseccion.ruta) {
        // Eliminar el slash inicial si existe y dividir en segmentos
        const rutaLimpia = subseccion.ruta.startsWith('/') ? subseccion.ruta.substring(1) : subseccion.ruta;
        menuItem.routerLink = rutaLimpia.split('/');
      } else {
        menuItem.routerLink = ['inicio'];
      }
      return menuItem;
    });
  }

  private createMenuItem(config: {
    label: string;
    codigo: string;
    id: number;
    type: 'seccion' | 'subseccion';
    data: MenuItemData;
    subsecciones?: any[];
    sistemaId?: number;
  }): MenuItem {
    const baseItem: MenuItem = {
      label: config.label,
      icon: this.getIconByCodigo(config.codigo),
      id: config.id.toString(),
      data: config.data
    };

    if (config.type === 'seccion' && config.subsecciones?.length) {
      baseItem.items = this.createSubseccionMenuItems(
        {
          id: config.id,
          codigo: config.codigo,
          nombre: config.label,
          subsecciones: config.subsecciones
        } as Seccion,
        config.sistemaId!
      );
    }

    return baseItem;
  }

  private sortByOrder<T extends { orden: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.orden - b.orden);
  }

  private getIconByCodigo = (codigo: string): string => {
    if (!codigo) {
      return MENU_ICON_CONFIG.default;
    }
    
    // Normalizar el código: convertir a mayúsculas y eliminar espacios
    const codigoNormalizado = codigo.toUpperCase().trim();
    
    // Buscar en secciones primero
    const iconoSeccion = MENU_ICON_CONFIG.secciones[codigoNormalizado];
    if (iconoSeccion) {
      return iconoSeccion;
    }
    
    // Buscar en subsecciones
    const iconoSubseccion = MENU_ICON_CONFIG.subsecciones[codigoNormalizado];
    if (iconoSubseccion) {
      return iconoSubseccion;
    }
    
    // Si no se encuentra, usar el default
    return MENU_ICON_CONFIG.default;
  };

}

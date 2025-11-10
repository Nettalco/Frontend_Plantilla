import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MenuService } from '../../services/menu.service';
import { MenuItemData } from '../../interfaces/menu-item-data.interface';

@Component({
  selector: 'app-sidebar-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-item.component.html',
  styleUrl: './sidebar-item.component.css'
})
export class SidebarItemComponent implements OnInit, OnDestroy {

  @Input() item!: MenuItem;
  @Input() depth: number = 0; // Para controlar la profundidad
  @Input() index: number = 0; // Índice del ítem en su nivel
  @Input() expanded: boolean = false;
  @Input() sidebarCollapsed: boolean = false; // Nueva entrada para estado del sidebar
  @Output() expandChange = new EventEmitter<{ depth: number, index: number }>(); // Evento para emitir cambios de expansión

  @Input() currentExpandedItemIndex: number[] = [];

  private destroy$ = new Subject<void>();
  private _isActive$ = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeRouterSubscription();
  }

  private initializeRouterSubscription(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(url => {
        this.updateActiveState(url);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // Inicializar estado activo inmediatamente
    this.updateActiveState(this.router.url);

    // Solo cargar permisos si estamos en la ruta actual
    if (this.isCurrentRoute()) {
      this.loadPermisos();
    }

  }

  private isCurrentRoute(): boolean {
    if (!this.item.routerLink) return false;

    const currentPath = this.router.url.split('?')[0].split('#')[0]; // Limpiar URL
    const itemPath = this.buildPath().split('?')[0].split('#')[0]; // Limpiar path del item

    return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
  }

  private loadPermisos(): void {
    const itemData = this.item['data'] as MenuItemData;
    const subseccion = itemData?.subseccion;
    const parentId = itemData?.parentId;

    if (subseccion && parentId) {
      this.menuService.getPermisosBySectionAndSubsection(parentId, subseccion.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(permisos => {
          // Permisos cargados
        });
    }
  }

  toggleExpansion(index: number, event?: Event) {
    // Siempre prevenir el comportamiento por defecto
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Si el sidebar está colapsado, no expandir submenús, solo navegar si tiene ruta
    if (this.sidebarCollapsed) {
      if (this.item.routerLink) {
        this.handleNavigation();
      }
      return;
    }

    // Si es un subitem (depth > 0) y tiene routerLink, navegar directamente
    if (this.depth > 0 && this.item.routerLink) {
      this.handleNavigation();
      return;
    }

    // Si tiene hijos, expandir/colapsar
    if (this.item.items && this.item.items.length > 0) {
      this.expandChange.emit({ depth: this.depth, index: index });
    } else if (this.item.routerLink) {
      // Si no tiene hijos pero tiene routerLink, navegar
      this.handleNavigation();
    }
  }


  private handleNavigation(): void {
    if (this.item.routerLink) {
      const route = Array.isArray(this.item.routerLink) ? this.item.routerLink : [this.item.routerLink];
      const url = '/' + route.join('/');

      this.router.navigateByUrl(url, {
        skipLocationChange: false,
        replaceUrl: false
      })
        .then((success) => {
          if (success) {
            setTimeout(() => {
              this.updateActiveState(this.router.url);
            }, 0);
            this.loadPermisos();
          } else {
            // Si falla, navegar primero a la ruta base para cargar las rutas lazy
            const baseRoute = route[0];
            this.router.navigate([baseRoute]).then(() => {
              setTimeout(() => {
                this.router.navigateByUrl(url).then((success2) => {
                  if (success2) {
                    setTimeout(() => {
                      this.updateActiveState(this.router.url);
                    }, 0);
                    this.loadPermisos();
                  }
                });
              }, 200);
            });
          }
        })
        .catch(() => {
          // Si falla, intentar navegar primero a la ruta base
          const baseRoute = route[0];
          this.router.navigate([baseRoute]).then(() => {
            setTimeout(() => {
              this.router.navigateByUrl(url).then((success) => {
                if (success) {
                  setTimeout(() => {
                    this.updateActiveState(this.router.url);
                  }, 0);
                  this.loadPermisos();
                }
              });
            }, 200);
          });
        });
    }
  }


  handleExpandChange(event: { depth: number, index: number }) {
    this.expandChange.emit(event);
  }

  isExpanded(): boolean {
    return this.expanded;
  }

  private updateActiveState(currentUrl: string): void {
    if (!this.item.routerLink) {
      this._isActive$.next(false);
      this.cdr.markForCheck();
      return;
    }

    const path = this.buildPath();

    // Limpiar URLs para comparación (remover query params y fragments)
    const cleanCurrentUrl = currentUrl.split('?')[0].split('#')[0];
    const cleanPath = path.split('?')[0].split('#')[0];

    // Verificar si la ruta actual coincide con el item
    const isActive = this.checkActiveState(cleanCurrentUrl, cleanPath);

    // Solo actualizar si hay cambio
    if (this._isActive$.value !== isActive) {
      this._isActive$.next(isActive);
      this.cdr.markForCheck(); // Forzar detección de cambios
    }
  }

  private checkActiveState(currentUrl: string, itemPath: string): boolean {
    if (!this.item.routerLink) {
      return false;
    }

    // Normalizar URLs (asegurar que empiecen con /)
    const normalizeUrl = (url: string) => {
      const normalized = url.startsWith('/') ? url : '/' + url;
      return normalized.endsWith('/') && normalized.length > 1
        ? normalized.slice(0, -1)
        : normalized;
    };

    const normalizedCurrentUrl = normalizeUrl(currentUrl);
    const normalizedItemPath = normalizeUrl(itemPath);

    // Verificar coincidencia exacta de ruta
    const pathMatches = normalizedCurrentUrl === normalizedItemPath;

    // Si las rutas coinciden, verificar también el código de la subsección para evitar activar múltiples items
    if (pathMatches && this.depth > 0) {
      const itemData = this.item['data'] as MenuItemData;
      const subseccion = itemData?.subseccion;

      // Si estamos en /cotizaciones/mantenimiento-consulta, solo activar "CONSULTA", no "DETALLE"
      if (normalizedCurrentUrl === '/cotizaciones/mantenimiento-consulta') {
        // Solo activar si el código de la subsección es 'CONSULTA'
        return subseccion?.codigo === 'CONSULTA';
      }

      // Para otras rutas, usar coincidencia exacta
      return true;
    }

    // Si no hay coincidencia exacta, no activar
    if (!pathMatches) {
      return false;
    }

    // Para items principales (depth === 0), verificar si la URL actual comienza con el path del item
    // pero solo si el item tiene hijos (es una sección con subsecciones)
    if (this.item.items && this.item.items.length > 0) {
      // Verificar si alguna de las rutas hijas coincide exactamente
      const hasExactChildMatch = this.item.items.some((child: MenuItem) => {
        if (!child.routerLink) return false;
        const childPath = Array.isArray(child.routerLink)
          ? '/' + child.routerLink.join('/')
          : '/' + child.routerLink;
        const normalizedChildPath = normalizeUrl(childPath);
        return normalizedCurrentUrl === normalizedChildPath;
      });

      // Si hay una coincidencia exacta con un hijo, no marcar el padre como activo
      if (hasExactChildMatch) {
        return false;
      }

      // Solo marcar como activo si la URL actual comienza con el path del item
      return normalizedCurrentUrl.startsWith(normalizedItemPath + '/');
    }

    return false;
  }

  private buildPath(): string {
    return Array.isArray(this.item.routerLink)
      ? '/' + this.item.routerLink.join('/')
      : '/' + this.item.routerLink;
  }

  isActive(): boolean {
    return this._isActive$.value;
  }

  // TrackBy function for better performance in *ngFor
  trackBySubItem: TrackByFunction<MenuItem> = (index: number, item: MenuItem) => {
    return item.id || item.label || index;
  }

  getTooltipText(): string {
    return this.sidebarCollapsed ? (this.item.label || '') : '';
  }

}

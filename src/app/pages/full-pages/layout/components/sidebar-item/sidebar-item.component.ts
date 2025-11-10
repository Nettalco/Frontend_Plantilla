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
  private _currentPath: string = '';

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

    if (this.item.items && this.item.items.length > 0) {
      // Solo emitir expand/collapse si tiene hijos
      this.expandChange.emit({ depth: this.depth, index: index });
    } else if (this.item.routerLink) {
      // Si es un subitem (subsección), navegar
      this.handleNavigation();
    }
  }


  private handleNavigation(): void {
    if (this.item.routerLink) {
      const route = Array.isArray(this.item.routerLink) ? this.item.routerLink : [this.item.routerLink];

      this.router.navigate(route)
        .then((success) => {
          if (success) {
            // Forzar actualización del estado activo
            setTimeout(() => {
              this.updateActiveState(this.router.url);
            }, 0);

            // Cargar permisos después de la navegación exitosa
            this.loadPermisos();
          }
        })
        .catch(error => {
          // Error en navegación
        });
    }
  }

  private logItemInfo(): void {
    const currentItem = this.item as any;
    const data = currentItem.data;

    if (data?.subseccion) {
      // Es una subsección
      const seccionId = data.subseccion.parent_seccion_id;
      const subseccionId = data.subseccion.id;
    } else if (data?.seccion) {
      // Es una sección principal
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
    // Normalizar URLs (asegurar que empiecen con /)
    const normalizeUrl = (url: string) => url.startsWith('/') ? url : '/' + url;

    const normalizedCurrentUrl = normalizeUrl(currentUrl);
    const normalizedItemPath = normalizeUrl(itemPath);

    // Verificar coincidencia exacta
    if (normalizedCurrentUrl === normalizedItemPath) {
      return true;
    }

    // Verificar si la URL actual comienza con el path del item (para rutas hijas)
    if (normalizedCurrentUrl.startsWith(normalizedItemPath + '/')) {
      return true;
    }

    // Usar router.isActive como fallback
    try {
      return this.router.isActive(normalizedItemPath, {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored'
      });
    } catch (error) {
      return false;
    }
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

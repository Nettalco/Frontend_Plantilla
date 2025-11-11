import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { MenuService } from './services/menu.service';
import { MenuItem } from 'primeng/api';

export const layoutResolver: ResolveFn<MenuItem[]> = (
  route,
  state
): Observable<MenuItem[]> => {
  const menuService = inject(MenuService);
  return menuService.getMenuItemsFromServer().pipe(
    catchError((error) => {
      console.error('Error al cargar el menú:', error);
      // Retornar array vacío para no bloquear la navegación
      return of([]);
    })
  );
};


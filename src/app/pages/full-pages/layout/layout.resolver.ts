import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { MenuService } from './services/menu.service';
import { MenuItem } from 'primeng/api';

export const layoutResolver: ResolveFn<MenuItem[]> = (route, state) => {
  const menuService = inject(MenuService);
  return menuService.getMenuItemsFromServer();
};


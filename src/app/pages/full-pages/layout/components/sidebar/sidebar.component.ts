import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuService } from '../../services/menu.service';
import { SidebarItemComponent } from '../sidebar-item/sidebar-item.component';
import * as global from '../../../../../../environment/global';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  providers: [MenuService],
  imports: [CommonModule, SidebarItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  titulo = global.titulo;

  @Input()
  open: boolean = true;

  menuItems: MenuItem[] = [];
  currentExpandedLevel: number = -1; // Nivel de expansión actual, por defecto ninguno
  currentExpandedItemIndex: number[] = [];

  constructor(
    private menuService: MenuService,
    private router: Router
  ) { }

  ngOnInit() {
    this.menuService.getMenuItems$().subscribe({
      next: (menuItems) => {
        this.menuItems = menuItems;
        this.expandMenuToMatchUrl(this.router.url.split('?')[0]);
      },
      error: () => {
        this.expandMenuToMatchUrl(this.router.url.split('?')[0]);
      }
    });
  }

  handleExpandChange(event: { depth: number, index: number }) {
    const { depth, index } = event;

    // Si ya está expandido, colapsamos y eliminamos todos los hijos
    if (this.currentExpandedItemIndex[depth] === index) {
      this.currentExpandedItemIndex[depth] = -1;

      // Limpiar los hijos desde el siguiente nivel
      this.currentExpandedItemIndex = this.currentExpandedItemIndex.slice(0, depth + 1);
      for (let i = depth + 1; i < 20; i++) { // hasta un nivel razonable
        this.currentExpandedItemIndex[i] = -1;
      }

    } else {
      // Expandimos el nuevo ítem y colapsamos otros en el mismo nivel
      this.currentExpandedItemIndex[depth] = index;
      // Limpiar los niveles hijos (si los había abiertos antes)
      this.currentExpandedItemIndex = this.currentExpandedItemIndex.slice(0, depth + 1);
    }

  }

  expandMenuToMatchUrl(url: string) {
    const expandedIndex: number[] = [];

    const findMatch = (items: MenuItem[], depth = 0): boolean => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Normaliza el routerLink a string de URL
        let path = '';
        if (Array.isArray(item.routerLink)) {
          path = '/' + item.routerLink.join('/');
        } else if (typeof item.routerLink === 'string') {
          path = '/' + item.routerLink;
        }

        if (path && url.startsWith(path)) {
          expandedIndex[depth] = i;
          return true;
        }

        if (item.items && findMatch(item.items, depth + 1)) {
          expandedIndex[depth] = i;
          return true;
        }
      }
      return false;
    };

    if (findMatch(this.menuItems)) {
      this.currentExpandedItemIndex = [...expandedIndex];
    }
  }



}

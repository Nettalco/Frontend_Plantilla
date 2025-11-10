import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as global from '../../../../../../environment/global';
import { PRIMENG_MODULES } from '../../../../../prime-ng/prime-ng-modules';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ...PRIMENG_MODULES, BreadcrumbsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() sidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  titulo = global.titulo;
  version = global.version;
  user: any = null;
  isDarkMode: boolean = false;

  menuItems = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => {
        // Navegar a perfil
      }
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => {
        // Navegar a configuración
      }
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => {
        this.logout();
      }
    }
  ];

  constructor(
    private authService: AuthService  ,
    private router: Router
  ) {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    // Verificar estado inicial del modo oscuro
    this.checkDarkMode();

    // Observar cambios en la clase app-dark
    const observer = new MutationObserver(() => {
      this.checkDarkMode();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  onToggleSidebar(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    if (!this.user) return 'U';
    const name = this.user.name || this.user.email || 'Usuario';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getUserName(): string {
    if (!this.user) return 'Usuario';
    return this.user.name || this.user.email || 'Usuario';
  }

  /**
   * Verifica si el modo oscuro está activo
   */
  checkDarkMode(): void {
    this.isDarkMode = document.documentElement.classList.contains('app-dark');
  }

  /**
   * Alterna el modo oscuro agregando/removiendo la clase .app-dark
   * Configurado en app.config.ts con darkModeSelector: '.app-dark'
   */
  toggleDarkMode(): void {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('app-dark');
    this.isDarkMode = htmlElement.classList.contains('app-dark');
  }

  /**
   * Obtiene el color del texto según el modo oscuro
   */
  getTextColor(): string {
    return this.isDarkMode ? '#1c224d' : 'var(--p-primary-inverse-color)';
  }
}

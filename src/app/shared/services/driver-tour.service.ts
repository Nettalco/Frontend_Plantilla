import { Injectable } from '@angular/core';
import { driver, DriveStep, Config } from 'driver.js';

export interface TourConfig extends Omit<Config, 'onPopoverRender'> {
  customButtonClasses?: {
    next?: string[];
    prev?: string[];
    close?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DriverTourService {
  private driverObj: any = null;

  constructor() { }

  /**
   * Configuración común de popoverRender para aplicar clases a los botones
   */
  private getPopoverRenderFunction(customClasses?: TourConfig['customButtonClasses']) {
    return (popover: any) => {
      setTimeout(() => {
        const popoverElement = popover.wrapper || popover;

        // Clases por defecto
        const defaultClasses = {
          next: ['p-button', 'btn-primary', 'btn-md'],
          prev: ['p-button', 'btn-secondary', 'btn-md'],
          close: ['p-button', 'btn-danger', 'btn-sm']
        };

        // Combinar con clases personalizadas si se proporcionan
        const classes = {
          next: customClasses?.next || defaultClasses.next,
          prev: customClasses?.prev || defaultClasses.prev,
        };

        // Aplicar clases a los botones
        const nextBtn = popoverElement.querySelector('.driver-popover-next-btn');
        const prevBtn = popoverElement.querySelector('.driver-popover-prev-btn');

        if (nextBtn) {
          nextBtn.classList.add(...classes.next);
        }
        if (prevBtn) {
          prevBtn.classList.add(...classes.prev);
        }

      }, 0);
    };
  }

  /**
   * Inicia un tour con configuración personalizada
   */
  startTour(config: TourConfig): void {
    this.destroyCurrentTour();

    // Extraer customButtonClasses de la configuración
    const { customButtonClasses, ...driverConfig } = config;

    // Configuración por defecto
    const defaultConfig: Partial<Config> = {
      allowClose: false,
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
      onPopoverRender: this.getPopoverRenderFunction(customButtonClasses),
      onDestroyStarted: (element?: any, step?: any, options?: any) => {
        this.destroyCurrentTour();
        // Ejecutar callback personalizado si existe
        if (driverConfig.onDestroyStarted) {
          driverConfig.onDestroyStarted(element, step, options);
        }
      }
    };

    // Combinar configuraciones
    const finalConfig = {
      ...defaultConfig,
      ...driverConfig,
      onPopoverRender: this.getPopoverRenderFunction(customButtonClasses),
      onDestroyStarted: defaultConfig.onDestroyStarted
    };

    this.driverObj = driver(finalConfig);
    this.driverObj.drive();
  }

  /**
   * Crea un tour rápido con pasos predefinidos
   */
  createQuickTour(steps: DriveStep[], options?: Partial<TourConfig>): void {
    const config: TourConfig = {
      steps,
      ...options,
      onDestroyStarted: (element?: any, step?: any, opts?: any) => {
        this.destroyCurrentTour();
        // Ejecutar callback personalizado si existe
        if (options?.onDestroyStarted) {
          options.onDestroyStarted(element, step, opts);
        }
      }
    };

    this.startTour(config);
  }

  /**
   * Destruye el tour actual si existe
   */
  destroyCurrentTour(): void {
    if (this.driverObj) {
      try {
        this.driverObj.destroy();
      } catch (error) {
        console.warn('Error al destruir el tour:', error);
      } finally {
        this.driverObj = null;
      }
    }
  }

  /**
   * Fuerza el cierre del tour actual
   */
  forceClose(): void {
    this.destroyCurrentTour();

    // Limpiar cualquier elemento del DOM relacionado con driver.js
    const overlays = document.querySelectorAll('.driver-overlay, .driver-popover');
    overlays.forEach(overlay => {
      overlay.remove();
    });
  }

  /**
   * Verifica si hay un tour activo
   */
  isActive(): boolean {
    return this.driverObj !== null;
  }

  /**
   * Métodos de conveniencia para tours comunes
   */

  /**
   * Tour de bienvenida genérico
   */
  startWelcomeTour(title: string = 'Bienvenido', description: string = 'Te guiaremos paso a paso'): void {
    this.createQuickTour([
      {
        popover: {
          title: `🎯 ${title}`,
          description
        }
      }
    ]);
  }

  /**
   * Tour para elementos específicos
   */
  highlightElements(elements: Array<{ selector: string; title: string; description: string; side?: string }>): void {
    const steps: DriveStep[] = elements.map(element => ({
      element: element.selector,
      popover: {
        title: element.title,
        description: element.description,
        side: element.side as any || 'bottom',
        align: 'start'
      }
    }));

    this.createQuickTour(steps);
  }

  /**
   * Tour con clases de botones personalizadas
   */
  startCustomButtonTour(steps: DriveStep[], buttonClasses: TourConfig['customButtonClasses']): void {
    this.createQuickTour(steps, { customButtonClasses: buttonClasses });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  overlay?: boolean;
  fullScreen?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject$ = new BehaviorSubject<LoadingState>({
    isLoading: false
  });

  private activeLoaders = new Set<string>();

  constructor() { }

  /**
   * Obtiene el estado observable del loading
   */
  get loading$(): Observable<LoadingState> {
    return this.loadingSubject$.asObservable();
  }

  /**
   * Obtiene el estado actual del loading
   */
  get isLoading(): boolean {
    return this.loadingSubject$.value.isLoading;
  }

  /**
   * Muestra el loading con configuración personalizada
   */
  show(options: Partial<LoadingState> & { id?: string } = {}): void {
    const { id = 'default', ...loadingOptions } = options;

    this.activeLoaders.add(id);

    const newState: LoadingState = {
      isLoading: true,
      size: 'medium',
      color: 'primary',
      overlay: false,
      fullScreen: false,
      ...loadingOptions
    };

    this.loadingSubject$.next(newState);
  }

  /**
   * Oculta el loading
   */
  hide(id: string = 'default'): void {
    this.activeLoaders.delete(id);

    if (this.activeLoaders.size === 0) {
      this.loadingSubject$.next({
        isLoading: false
      });
    }
  }

  /**
   * Oculta todos los loaders activos
   */
  hideAll(): void {
    this.activeLoaders.clear();
    this.loadingSubject$.next({
      isLoading: false
    });
  }

  /**
   * Muestra loading con overlay para operaciones de fondo
   */
  showOverlay(message?: string): void {
    this.show({
      id: 'overlay',
      message,
      overlay: true,
      fullScreen: false
    });
  }

  /**
   * Muestra loading en pantalla completa para operaciones importantes
   */
  showFullScreen(message?: string): void {
    this.show({
      id: 'fullscreen',
      message,
      overlay: false,
      fullScreen: true,
      size: 'large'
    });
  }

  /**
   * Muestra loading pequeño para operaciones menores
   */
  showSmall(message?: string): void {
    this.show({
      id: 'small',
      message,
      size: 'small',
      overlay: false,
      fullScreen: false
    });
  }

  /**
   * Ejecuta una operación asíncrona con loading automático
   */
  async withLoading<T>(
    operation: () => Promise<T>,
    options?: Partial<LoadingState> & { id?: string }
  ): Promise<T> {
    const id = options?.id || 'operation';

    try {
      this.show({ ...options, id });
      return await operation();
    } finally {
      this.hide(id);
    }
  }

  /**
   * Verifica si un loader específico está activo
   */
  isLoaderActive(id: string): boolean {
    return this.activeLoaders.has(id);
  }

  /**
   * Obtiene la lista de loaders activos
   */
  getActiveLoaders(): string[] {
    return Array.from(this.activeLoaders);
  }
}

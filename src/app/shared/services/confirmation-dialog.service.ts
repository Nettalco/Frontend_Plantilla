import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmationDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'info' | 'warn' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  constructor(private confirmationService: ConfirmationService) { }

  /**
   * Muestra un diálogo de confirmación personalizado
   * @param data Datos del diálogo
   * @returns Promise<boolean> - true si se confirma, false si se cancela
   */
  show(data: ConfirmationDialogData): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: data.message,
        header: data.title || 'Confirmar Acción',
        icon: this.getIconClass(data.severity),
        acceptLabel: data.confirmText || 'Confirmar',
        rejectLabel: data.cancelText || 'Cancelar',
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }

  /**
   * Muestra un diálogo de confirmación para eliminar
   * @param itemName Nombre del elemento a eliminar
   * @param itemType Tipo de elemento (categoría, marca, proveedor, etc.)
   * @returns Promise<boolean>
   */
  showDeleteConfirmation(itemName: string, itemType: string = 'elemento'): Promise<boolean> {
    return this.show({
      title: 'Confirmar Eliminación',
      message: `¿Está seguro de que desea eliminar ${itemType} "${itemName}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      severity: 'error'
    });
  }

  /**
   * Muestra un diálogo de confirmación para cambiar estado
   * @param itemName Nombre del elemento
   * @param action Acción a realizar (activar, desactivar, etc.)
   * @param itemType Tipo de elemento
   * @returns Promise<boolean>
   */
  showStatusChangeConfirmation(itemName: string, action: string, itemType: string = 'elemento'): Promise<boolean> {
    const actionText = action === 'desactivar' ? 'desactivar' : 'activar';
    const severity = action === 'desactivar' ? 'warn' : 'info';

    return this.show({
      title: `Confirmar ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      message: `¿Está seguro de que desea ${actionText} ${itemType} "${itemName}"?`,
      confirmText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
      cancelText: 'Cancelar',
      severity: severity
    });
  }

  /**
   * Muestra un diálogo de confirmación genérico
   * @param message Mensaje a mostrar
   * @param title Título del diálogo
   * @returns Promise<boolean>
   */
  showGenericConfirmation(message: string, title: string = 'Confirmar'): Promise<boolean> {
    return this.show({
      title: title,
      message: message,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      severity: 'info'
    });
  }

  /**
   * Obtiene la clase del icono según la severidad
   * @param severity Nivel de severidad
   * @returns Clase del icono
   */
  private getIconClass(severity?: 'info' | 'warn' | 'error'): string {
    switch (severity) {
      case 'warn':
        return 'pi pi-exclamation-triangle';
      case 'error':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-question-circle';
    }
  }
}

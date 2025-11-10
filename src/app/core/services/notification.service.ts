import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification, NotificationGroup } from '../interfaces/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY = 'cotizaciones_notifications';
  private readonly MAX_NOTIFICATIONS = 50;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadNotifications();
    // Agregar notificaciones de ejemplo solo si no hay ninguna
    if (this.notificationsSubject.value.length === 0) {
      this.addMockNotifications();
    }
  }

  /**
   * Agregar una nueva notificación
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const current = this.notificationsSubject.value;
    const updated = [newNotification, ...current].slice(0, this.MAX_NOTIFICATIONS);

    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  /**
   * Marcar una notificación como leída
   */
  markAsRead(id: string): void {
    const updated = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(): void {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  /**
   * Eliminar una notificación
   */
  deleteNotification(id: string): void {
    const updated = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Agrupar notificaciones por fecha
   */
  groupByDate(notifications: Notification[]): NotificationGroup[] {
    const groups = new Map<string, Notification[]>();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach(notif => {
      const notifDate = new Date(notif.timestamp);
      let dateLabel: string;

      if (this.isSameDay(notifDate, today)) {
        dateLabel = 'Hoy';
      } else if (this.isSameDay(notifDate, yesterday)) {
        dateLabel = 'Ayer';
      } else {
        dateLabel = notifDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: notifDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }

      if (!groups.has(dateLabel)) {
        groups.set(dateLabel, []);
      }
      groups.get(dateLabel)!.push(notif);
    });

    return Array.from(groups.entries()).map(([date, notifications]) => ({
      date,
      notifications
    }));
  }

  /**
   * Actualizar contador de no leídas
   */
  private updateUnreadCount(): void {
    const count = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(count);
  }

  /**
   * Cargar notificaciones desde localStorage
   */
  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  /**
   * Guardar notificaciones en localStorage
   */
  private saveNotifications(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.notificationsSubject.value)
      );
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verificar si dos fechas son el mismo día
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  /**
   * Agregar notificaciones de ejemplo (solo para testing)
   */
  private addMockNotifications(): void {
    const now = new Date();
    const mockNotifications: Notification[] = [
      {
        id: this.generateId(),
        type: 'success',
        title: 'Cotización aprobada',
        message: 'Tu cotización COT-2025-001 ha sido aprobada',
        icon: 'pi pi-check-circle',
        timestamp: new Date(now.getTime() - 5 * 60000), // Hace 5 minutos
        read: false,
        actionUrl: '/home/cotizar',
        metadata: {
          author: 'Juan Pérez',
          module: 'Cotizaciones',
          referenceId: 'COT-2025-001'
        }
      },
      {
        id: this.generateId(),
        type: 'comment',
        title: 'Nuevo comentario',
        message: 'María López comentó en tu cotización',
        icon: 'pi pi-comment',
        timestamp: new Date(now.getTime() - 2 * 3600000), // Hace 2 horas
        read: false,
        actionUrl: '/home/cotizar',
        metadata: {
          author: 'María López',
          module: 'Cotizaciones'
        }
      },
      {
        id: this.generateId(),
        type: 'warning',
        title: 'Cotización próxima a vencer',
        message: 'La cotización COT-2025-045 vence en 2 días',
        icon: 'pi pi-exclamation-triangle',
        timestamp: new Date(now.getTime() - 24 * 3600000), // Hace 1 día
        read: true,
        actionUrl: '/home/cotizar',
        metadata: {
          module: 'Cotizaciones',
          referenceId: 'COT-2025-045'
        }
      },
      {
        id: this.generateId(),
        type: 'info',
        title: 'Reporte generado',
        message: 'Tu reporte mensual está listo para descargar',
        icon: 'pi pi-file-pdf',
        timestamp: new Date(now.getTime() - 48 * 3600000), // Hace 2 días
        read: true,
        actionUrl: '/home/reportes',
        metadata: {
          module: 'Reportes'
        }
      }
    ];

    this.notificationsSubject.next(mockNotifications);
    this.updateUnreadCount();
    this.saveNotifications();
  }
}

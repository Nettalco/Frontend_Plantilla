import { Routes } from '@angular/router';

export const cotizacionesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'mantenimiento-consulta',
    pathMatch: 'full'
  },
  {
    path: 'mantenimiento-consulta',
    loadComponent: () => import('./components/mantenimiento-consulta/mantenimiento-consulta.component').then(m => m.MantenimientoConsultaComponent),
    data: { breadcrumb: 'Mantenimiento y Consulta' }
  }
];


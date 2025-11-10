import { Routes } from '@angular/router';
import { LayoutMainComponent } from './pages/full-pages/layout/components/layout-main/layout-main.component';
import { layoutResolver } from './pages/full-pages/layout/layout.resolver';

export const routes: Routes = [
  {
    path: '',
    component: LayoutMainComponent,
    resolve: { layout: layoutResolver },
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadComponent: () => import('./pages/inicio/inicio.component').then(m => m.InicioComponent),
        data: { breadcrumb: 'Inicio' }
      }
      // Aquí puedes agregar más rutas hijas
      // {
      //   path: 'cotizaciones',
      //   loadComponent: () => import('./pages/cotizaciones/cotizaciones.component').then(m => m.CotizacionesComponent),
      //   data: { breadcrumb: 'Cotizaciones' }
      // }
    ]
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];

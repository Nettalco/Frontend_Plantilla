import { Routes } from '@angular/router';
import { LayoutMainComponent } from './pages/full-pages/layout/components/layout-main/layout-main.component';
import { layoutResolver } from './pages/full-pages/layout/layout.resolver';

export const routes: Routes = [
  {
    path: '',
    component: LayoutMainComponent,
    // Comentado temporalmente para desarrollo local sin backend
    // resolve: { layout: layoutResolver },
    children: [
      {
        path: '',
        redirectTo: 'estilos',
        pathMatch: 'full'
      },
      {
        path: 'estilos',
        loadChildren: () => import('./pages/modules/estilos/estilos.routes').then(m => m.estilosRoutes)
      },
      {
        path: 'cotizaciones',
        loadChildren: () => import('./pages/modules/cotizaciones/cotizaciones.routes').then(m => m.cotizacionesRoutes)
      },
      {
        path: 'herramientas',
        loadChildren: () => import('./pages/modules/herramientas/herramientas.routes').then(m => m.herramientasRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }


];

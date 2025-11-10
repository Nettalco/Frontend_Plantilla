import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withDebugTracing } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { NettalcoPreset } from './theme/nettalco-preset';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
        withInterceptors([
        authInterceptor
      ])
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: NettalcoPreset,
        options: {
          darkModeSelector: '.app-dark', // Selector para modo oscuro
          prefix: 'p' // Prefijo de variables CSS (por defecto 'p')
        }
      }
    }),
    MessageService,
    ConfirmationService
  ]
};

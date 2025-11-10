import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional para agregar el token de autorización a las peticiones HTTP
 * Compatible con Angular standalone
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Obtener token desde cookies del navegador usando AuthService
  const tokens = authService.obtenerTokensDesdeCookies();
  
  // También verificar si hay token en sessionStorage (fallback)
  const sessionToken = authService.getAccessToken();

  // Priorizar token de cookies, si no existe usar el de sessionStorage
  const accessToken = tokens.accessToken || sessionToken;

  // Si hay token, agregarlo al header
  if (accessToken) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el token ha expirado o hay error de autenticación, limpiar la sesión
        if (error.status === 401 || error.status === 419) {
          authService.removeAccessToken();
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

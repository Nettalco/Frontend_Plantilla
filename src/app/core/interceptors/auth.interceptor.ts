import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener token desde cookies del navegador usando AuthService
    const tokens = this.authService.obtenerTokensDesdeCookies();

    // Si hay token en cookies, agregarlo al header
    if (tokens.accessToken) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si el token ha expirado, limpiar la sesión
          if (error.status === 401 || error.status === 419) {
            this.authService.removeAccessToken();
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }
}

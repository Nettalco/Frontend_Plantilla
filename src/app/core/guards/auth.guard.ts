import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    // En modo mock, siempre permitir acceso
    if (environment.useMockAuth) {
      return of(true);
    }

    // Siempre ejecutar login con el SSO para cargar las cookies
    return this.authService.verificarSesion().pipe(
      map(response => {
        // El login SSO siempre debe ejecutarse para cargar cookies
        return true;
      }),
      catchError((error) => {
        console.error('AuthGuard: Error en login SSO:', error);
        this.redirectToSSO();
        return of(false);
      })
    );
  }

  private redirectToSSO(): void {
    window.location.href = 'https://nocb.nettalco.com.pe/intranet/sso/menu';
  }
}

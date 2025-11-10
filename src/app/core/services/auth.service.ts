import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import * as global from '../../../environment/global';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'SSO__accessToken';
  private url = global.urlAuth;
  private urlAccesLogin = global.urlAcces;

  private tokenSubject = new BehaviorSubject<string | null>(this.getAccessToken());
  token$ = this.tokenSubject.asObservable();

  private userSubject = new BehaviorSubject<any | null>(this.getDecodedToken());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) { }



  /**
   * Verifica la sesión del usuario ejecutando login con el SSO
   * Esto carga las cookies necesarias para la autenticación
   */
  verificarSesion(): Observable<any> {
    // Siempre ejecutar login con el SSO para cargar las cookies
    return this.loginSSO();
  }

  /**
   * Ejecuta el login con el SSO
   */
  loginSSO(): Observable<any> {
    const payload = {
      // Payload para el SSO si es necesario
    };

    // Log de cookies antes del login
    console.log('🍪 Cookies ANTES del login SSO:', document.cookie);

    return this.http.post<any>(`${this.urlAccesLogin}api/auth/login`, payload, {
      withCredentials: true
    }).pipe(
      tap(resp => {
        // Log de cookies después del login
        console.log('🍪 Cookies DESPUÉS del login SSO:', document.cookie);

        // Log de los tokens específicos obtenidos
        const tokens = this.obtenerTokensDesdeCookies();
        console.log('🔑 Tokens obtenidos desde cookies:', tokens);

        // El SSO establece las cookies automáticamente
        // Solo guardamos el token si viene en la respuesta
        if (resp.accessToken) {
          this.saveAccessToken(resp.accessToken);
          console.log('💾 Token guardado en sessionStorage:', resp.accessToken);
        }
        console.log('✅ Login SSO exitoso, cookies cargadas');
      }),
      catchError(err => {
        console.error('❌ Error en login SSO:', err);
        console.log('🍪 Cookies al momento del error:', document.cookie);
        this.removeAccessToken();
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene los tokens desde las cookies del navegador
   */
  obtenerTokensDesdeCookies(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: this.getTokenFromCookie('accessToken'),
      refreshToken: this.getTokenFromCookie('refreshToken')
    };
  }

  /**
   * Guarda el token de acceso
   */
  saveAccessToken(token: string): void {
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    this.tokenSubject.next(token);
    this.userSubject.next(this.getDecodedToken());
  }

  /**
   * Elimina el token de acceso
   */
  removeAccessToken(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Decodifica el token JWT
   */
  getDecodedToken(): any | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (e) {
      console.error('Error al decodificar token', e);
      return null;
    }
  }

  /**
   * Verifica si el token ha expirado
   */
  isAccessTokenExpired(): boolean {
    const decoded: any = this.getDecodedToken();
    if (!decoded?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  /**
   * Verifica si el usuario está logueado
   */
  isLoggedIn(): boolean {
    return !!this.getAccessToken() && !this.isAccessTokenExpired();
  }

  /**
   * Obtiene el usuario actual
   */
  getUser(): any | null {
    return this.userSubject.value;
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.removeAccessToken();
    window.location.href = 'https://nocb.nettalco.com.pe/intranet/sso/menu';
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user?.roles?.some((role: string) => roles.includes(role)) || false;
  }

  /**
   * Obtiene un token específico desde las cookies del navegador
   */
  private getTokenFromCookie(cookieName: string): string | null {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }
}

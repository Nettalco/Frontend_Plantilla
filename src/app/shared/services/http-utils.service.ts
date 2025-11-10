import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpUtilsService {

  handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error HTTP:', error);

    const errorMessage = error.error?.message || error.message || 'Error inesperado';
    return throwError(() => ({ message: errorMessage, data: error.error?.data || null }));
  }
}

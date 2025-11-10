import { HttpUtilsService } from '../../../../shared/services/http-utils.service';
import * as global from '../../../../../environment/global';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CotizacionesResponse, Cotizacion } from '../interfaces/interfaces_mantenimiento_consulta/CotizacionesResponse';
import { cotizarGestionUrl } from '../Cotizar-contantes';

@Injectable({
  providedIn: 'root',
})
export class MantenimientoConsultaCotizacionesService {

  url: string = cotizarGestionUrl;

  constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

  /**
   * Lista todas las cotizaciones.
   */
  ListarCotizaciones(): Observable<CotizacionesResponse> {
    return this.http
      .get<CotizacionesResponse>(this.url + 'lista')
      .pipe(catchError(this.httpUtils.handleError));
  }
}

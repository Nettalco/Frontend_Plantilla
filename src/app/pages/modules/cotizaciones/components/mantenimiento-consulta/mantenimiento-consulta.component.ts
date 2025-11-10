import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Cotizacion } from '../../interfaces/interfaces_mantenimiento_consulta/CotizacionesResponse';
import { MessageService } from '../../../../../core/services/message.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModulePermissionsHelper } from '../../../../../core/helpers/module-permissions.helper';
import {
  ModulePermissionsService,
  ModuloPermisos,
} from '../../../../../core/services/module-permissions.service';
import { DriverTourService } from '../../../../../shared/services/driver-tour.service';
import * as XLSX from 'xlsx';
import guiaMantenimiento from './guia-mantenimiento-consulta.json';
import { PRIMENG_MODULES } from '../../../../../prime-ng/prime-ng-modules';
import { MantenimientoConsultaCotizacionesService } from '../../services/mantenimiento-consulta-cotizaciones.service';

@Component({
  selector: 'app-mantenimiento-consulta',
  standalone: true,
  imports: [...PRIMENG_MODULES],
  templateUrl: './mantenimiento-consulta.component.html',
  styleUrl: './mantenimiento-consulta.component.css',
  providers: [MessageService, DialogService],
})
export class MantenimientoConsultaComponent implements OnInit, OnDestroy {
  // ==================== PERMISSIONS HELPER ====================
  permissionsHelper: ModulePermissionsHelper;

  // Datos principales
  cotizaciones: Cotizacion[] = [];
  loading: boolean = false;
  first: number = 0;

  // Control de filtros
  filtrosVisibles: boolean = false;
  filtroGlobalValue: string = '';

  // Valores de los filtros por columna
  filtroTCODICOTI: string = '';
  filtroTESTACOTI: string = '';
  filtroTABRVCLIE: string = '';
  filtroTCODIESTICLIE: string = '';
  filtroTNUMEVERSCLIE: string = '';
  filtroTCODIESTINETT: string = '';
  filtroTNUMEVERSESTINETT: string = '';
  filtroTCODITEMP: string = '';
  filtroTCODITELA: string = '';
  filtroTDESCTELA: string = '';
  filtroTCANTPRENPROY: string = '';
  filtroTFECHCREA: string = '';
  filtroTFECHCALC: string = '';
  filtroTCOSTPOND: string = '';
  filtroTPRECCOTI: string = '';
  filtroTMKUPOBJE: string = '';
  dialogRef?: DynamicDialogRef;
  private driver: any;

  constructor(
    private cotizacionesService: MantenimientoConsultaCotizacionesService,
    private message: MessageService,
    private readonly modulePermissionsService: ModulePermissionsService,
    private router: Router,
    private driverTourService: DriverTourService
  ) {
    // Inicializar helper de permisos
    this.permissionsHelper = ModulePermissionsHelper.create(
      modulePermissionsService,
      'COTIZAR', // SECTION_CODE
      'CONSULTA', // SUBSECTION_CODE
      {
        onPermissionsLoaded: () => this.onPermissionsLoaded(),
        onFirstAccessibleModule: (module) =>
          this.onFirstAccessibleModuleSelected(module),
      }
    );
  }

  ngOnInit(): void {
    this.permissionsHelper.initialize();
  }

  ngOnDestroy(): void {
    this.permissionsHelper.destroy();
    // Asegurar que el tour se cierre al destruir el componente
    this.driverTourService.forceClose();
  }

  // ==================== GESTIÓN DE PERMISOS ====================
  // ==================== PROPIEDADES DELEGADAS DEL HELPER ====================
  get permisosCargados(): boolean {
    return this.permissionsHelper.permisosCargados;
  }
  get modulosPermisos(): ModuloPermisos[] {
    return this.permissionsHelper.modulosPermisos;
  }
  get permisosGenerales(): string[] {
    return this.permissionsHelper.permisosGenerales;
  }

  // ==================== CALLBACKS DE PERMISOS ====================
  private onFirstAccessibleModuleSelected(module: ModuloPermisos): void {
    // Cuando se cargan los permisos, obtener las cotizaciones
    setTimeout(() => {
      this.obtenerCotizaciones();
    }, 100);
  }

  private onPermissionsLoaded(): void {
    // Si hay error de permisos, redirigir a página de error 403
    if (this.permissionsHelper.permissionsError) {
      this.redirectToError403();
      return;
    }

    // Si no hay módulos accesibles, también redirigir a error 403
    if (this.getAccessibleModules().length === 0) {
      this.redirectToError403();
      return;
    }

    // Los datos se cargarán automáticamente en onFirstAccessibleModuleSelected
    // No es necesario llamar selectFirstAccessibleModule() aquí para evitar duplicación
  }

  // ==================== MÉTODOS DE VERIFICACIÓN DE PERMISOS ====================
  canAccessModulo(moduloCodigo: string): boolean {
    return this.permissionsHelper.canAccessModulo(moduloCodigo);
  }
  canReadModulo(moduloCodigo: string): boolean {
    return this.permissionsHelper.canReadModulo(moduloCodigo);
  }
  canWriteModulo(moduloCodigo: string): boolean {
    return this.permissionsHelper.canWriteModulo(moduloCodigo);
  }
  canUpdateModulo(moduloCodigo: string): boolean {
    return this.permissionsHelper.canUpdateModulo(moduloCodigo);
  }
  canDeleteModulo(moduloCodigo: string): boolean {
    return this.permissionsHelper.canDeleteModulo(moduloCodigo);
  }
  getAccessibleModules(): ModuloPermisos[] {
    return this.permissionsHelper.getAccessibleModules();
  }
  getFirstAccessibleModule(): ModuloPermisos | null {
    return this.permissionsHelper.getFirstAccessibleModule();
  }
  hasPermissionForModulo(moduloCodigo: string, permiso: string): boolean {
    return this.permissionsHelper.hasPermissionForModulo(moduloCodigo, permiso);
  }
  selectFirstAccessibleModule(): void {
    this.permissionsHelper.selectFirstAccessibleModule();
  }

  // ==================== REDIRECCIÓN A ERROR ====================
  private redirectToError403(): void {
    this.router.navigate(['/error'], {
      queryParams: {
        type: '403',
      },
    });
  }

  obtenerCotizaciones(): void {
    this.loading = true;
    this.cotizacionesService.ListarCotizaciones()
      .subscribe({
        next: (resp: any) => {
          this.cotizaciones = resp.data;
          this.loading = false;
          // Usar el servicio centralizado para manejar mensajes del backend
          this.message.handleBackendResponse(resp, false, 'Consulta');
        },
        error: (error: any) => {
          this.loading = false;
          // Usar el servicio centralizado para manejar errores HTTP
          this.message.handleHttpError(error);
        },
      });
  }

  mostrarInfoId(id: number): void {
    const baseUrl =
      window.location.origin + window.location.pathname.replace(/\/$/, '');
    const url = `${baseUrl}#/cotizar/detalle/${id}`;
    window.open(url, '_blank');
  }

  pageChange(event: any): void {
    this.first = event.first;
  }

  clear(table: any, searchInput?: HTMLInputElement): void {
    table.clear();
    table.filterGlobal('', 'contains');
    this.filtroGlobalValue = '';

    // Limpiar los valores de los filtros por columna
    this.filtroTCODICOTI = '';
    this.filtroTESTACOTI = '';
    this.filtroTABRVCLIE = '';
    this.filtroTCODIESTICLIE = '';
    this.filtroTNUMEVERSCLIE = '';
    this.filtroTCODIESTINETT = '';
    this.filtroTNUMEVERSESTINETT = '';
    this.filtroTCODITEMP = '';
    this.filtroTCODITELA = '';
    this.filtroTDESCTELA = '';
    this.filtroTCANTPRENPROY = '';
    this.filtroTFECHCREA = '';
    this.filtroTFECHCALC = '';
    this.filtroTCOSTPOND = '';
    this.filtroTPRECCOTI = '';
    this.filtroTMKUPOBJE = '';

    if (searchInput) {
      searchInput.value = '';
    }
  }

  applyGlobalFilter(event: any, table: any): void {
    const target = event.target as HTMLInputElement;
    this.filtroGlobalValue = target.value;
    table.filterGlobal(target.value, 'contains');
  }

  toggleFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  exportarExcel(): void {
    const datosParaExportar = this.cotizaciones.map((cotizacion) => ({
      'ID Cotización': cotizacion.TCODICOTI,
      'Estado Cotización': cotizacion.TESTACOTI,
      'Tipo Cotización': cotizacion.TTIPOCOTI,
      Cliente: cotizacion.TABRVCLIE,
      'Estilo Cliente': cotizacion.TCODIESTICLIE,
      'Versión Cliente': cotizacion.TNUMEVERSCLIE,
      'Estilo Nettalco': cotizacion.TCODIESTINETT,
      'Versión Nettalco': cotizacion.TNUMEVERSESTINETT,
      Temporada: cotizacion.TCODITEMP,
      'ID Tela': cotizacion.TCODITELA,
      'Descripción de Tela': cotizacion.TDESCTELA,
      'Prendas Proyectadas': cotizacion.TCANTPRENPROY,
      'Porcentaje Gasto Comisión': cotizacion.TPORCGASTCOMIAGEN,
      'Fecha de Creación': cotizacion.TFECHCREA,
      'Fecha Cálculo': cotizacion.TFECHCALC,
      'Costo Ponderado (USD)': cotizacion.TCOSTPOND,
      'Precio Cotización (USD)': cotizacion.TPRECCOTI,
      MARKUP: cotizacion.TMKUPOBJE,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cotizaciones');

    const fechaActual = new Date();
    const timestamp = fechaActual
      .toISOString()
      .slice(0, 19)
      .replace(/[-:]/g, '')
      .replace('T', '_');
    const nombreArchivo = `Cotizaciones_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, nombreArchivo);
  }

  tourManteniminetoConsulta(): void {
    // Usar clases personalizadas para este tour
    const customClasses = {
      next: ['p-button', 'btn-primary', 'btn-md'],
      prev: ['p-button', 'btn-secondary', 'btn-md']
    };

    this.driverTourService.createQuickTour(guiaMantenimiento as any, {
      doneBtnText: 'Entendido',
      customButtonClasses: customClasses
    });
  }
}

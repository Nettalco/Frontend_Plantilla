import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoConsultaComponent } from './mantenimiento-consulta.component';

describe('MantenimientoConsultaComponent', () => {
  let component: MantenimientoConsultaComponent;
  let fixture: ComponentFixture<MantenimientoConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MantenimientoConsultaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

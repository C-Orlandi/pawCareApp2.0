import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarMascotaPage } from './gestionar-mascota.page';

describe('GestionarMascotaPage', () => {
  let component: GestionarMascotaPage;
  let fixture: ComponentFixture<GestionarMascotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarMascotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

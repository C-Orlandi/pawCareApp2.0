import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroMascotaPage } from './registro-mascota.page';

describe('RegistroMascotaPage', () => {
  let component: RegistroMascotaPage;
  let fixture: ComponentFixture<RegistroMascotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroMascotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

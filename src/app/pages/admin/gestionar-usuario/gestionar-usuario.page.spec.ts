import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarUsuarioPage } from './gestionar-usuario.page';

describe('GestionarUsuarioPage', () => {
  let component: GestionarUsuarioPage;
  let fixture: ComponentFixture<GestionarUsuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarDuenoPage } from './gestionar-dueno.page';

describe('GestionarDuenoPage', () => {
  let component: GestionarDuenoPage;
  let fixture: ComponentFixture<GestionarDuenoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarDuenoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

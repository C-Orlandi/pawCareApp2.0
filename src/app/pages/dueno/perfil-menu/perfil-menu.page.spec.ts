import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilMenuPage } from './perfil-menu.page';

describe('PerfilMenuPage', () => {
  let component: PerfilMenuPage;
  let fixture: ComponentFixture<PerfilMenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisMascotasPage } from './mis-mascotas.page';

describe('MisMascotasPage', () => {
  let component: MisMascotasPage;
  let fixture: ComponentFixture<MisMascotasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisMascotasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

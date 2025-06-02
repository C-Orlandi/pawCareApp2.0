import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarnetPage } from './carnet.page';

describe('CarnetPage', () => {
  let component: CarnetPage;
  let fixture: ComponentFixture<CarnetPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarnetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

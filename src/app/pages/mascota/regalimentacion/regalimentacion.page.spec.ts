import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegalimentacionPage } from './regalimentacion.page';

describe('RegalimentacionPage', () => {
  let component: RegalimentacionPage;
  let fixture: ComponentFixture<RegalimentacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegalimentacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

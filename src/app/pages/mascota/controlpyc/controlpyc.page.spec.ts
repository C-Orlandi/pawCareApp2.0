import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlpycPage } from './controlpyc.page';

describe('ControlpycPage', () => {
  let component: ControlpycPage;
  let fixture: ComponentFixture<ControlpycPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlpycPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

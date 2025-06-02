import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminhomePage } from './adminhome.page';

describe('AdminhomePage', () => {
  let component: AdminhomePage;
  let fixture: ComponentFixture<AdminhomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminhomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

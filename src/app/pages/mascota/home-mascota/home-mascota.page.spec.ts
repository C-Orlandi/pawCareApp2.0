import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeMascotaPage } from './home-mascota.page';

describe('HomeMascotaPage', () => {
  let component: HomeMascotaPage;
  let fixture: ComponentFixture<HomeMascotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeMascotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

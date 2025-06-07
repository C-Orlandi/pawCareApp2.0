import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HRecordatorioPage } from './h-recordatorio.page';

describe('HRecordatorioPage', () => {
  let component: HRecordatorioPage;
  let fixture: ComponentFixture<HRecordatorioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HRecordatorioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

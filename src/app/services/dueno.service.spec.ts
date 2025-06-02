import { TestBed } from '@angular/core/testing';

import { DuenoService } from './dueno.service';

describe('DuenoService', () => {
  let service: DuenoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DuenoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

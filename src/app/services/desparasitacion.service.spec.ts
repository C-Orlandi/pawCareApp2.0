import { TestBed } from '@angular/core/testing';

import { DesparasitacionService } from './desparasitacion.service';

describe('DesparasitacionService', () => {
  let service: DesparasitacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesparasitacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

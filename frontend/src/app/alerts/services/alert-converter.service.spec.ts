import { TestBed } from '@angular/core/testing';

import { AlertConverterService } from './alert-converter.service';

describe('AlertConverterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AlertConverterService = TestBed.get(AlertConverterService);
    expect(service).toBeTruthy();
  });
});

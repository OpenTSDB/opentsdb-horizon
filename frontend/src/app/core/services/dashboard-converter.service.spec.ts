import { TestBed } from '@angular/core/testing';

import { DashboardConverterService } from './dashboard-converter.service';

describe('DashboardConverterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardConverterService = TestBed.get(DashboardConverterService);
    expect(service).toBeTruthy();
  });
});

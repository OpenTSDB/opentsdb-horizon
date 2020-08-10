import { TestBed } from '@angular/core/testing';

import { TooltipDataService } from './tooltip-data.service';

describe('TooltipDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TooltipDataService = TestBed.get(TooltipDataService);
    expect(service).toBeTruthy();
  });
});

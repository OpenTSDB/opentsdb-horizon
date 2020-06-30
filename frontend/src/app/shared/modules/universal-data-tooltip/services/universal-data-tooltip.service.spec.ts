import { TestBed } from '@angular/core/testing';

import { UniversalDataTooltipService } from './universal-data-tooltip.service';

describe('UniversalDataTooltipService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UniversalDataTooltipService = TestBed.get(UniversalDataTooltipService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { TooltipComponentService } from './tooltip-component.service';

describe('TooltipComponentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TooltipComponentService = TestBed.get(TooltipComponentService);
    expect(service).toBeTruthy();
  });
});

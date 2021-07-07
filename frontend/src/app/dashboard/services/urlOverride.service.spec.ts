import { TestBed, inject } from '@angular/core/testing';

import { URLOverrideService } from './urlOverride.service';

describe('URLOverrideService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [URLOverrideService]
    });
  });

  it('should be created', inject([URLOverrideService], (service: URLOverrideService) => {
    expect(service).toBeTruthy();
  }));
});

import { TestBed } from '@angular/core/testing';

import { InfoIslandService } from './info-island.service';

describe('InfoIslandService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InfoIslandService = TestBed.get(InfoIslandService);
    expect(service).toBeTruthy();
  });
});

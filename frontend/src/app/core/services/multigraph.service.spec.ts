import { TestBed } from '@angular/core/testing';

import { MultigraphService } from './multigraph.service';

describe('MultigraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultigraphService = TestBed.get(MultigraphService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { RightDrawerService } from './right-drawer.service';

describe('RightDrawerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RightDrawerService = TestBed.get(RightDrawerService);
    expect(service).toBeTruthy();
  });
});

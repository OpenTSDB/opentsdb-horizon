import { TestBed } from '@angular/core/testing';

import { OpenTSDBService } from './opentsdb.service';

describe('OpenTSDBService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpenTSDBService = TestBed.get(OpenTSDBService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { YamasService } from './yamas.service';

describe('YamasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YamasService = TestBed.get(YamasService);
    expect(service).toBeTruthy();
  });
});

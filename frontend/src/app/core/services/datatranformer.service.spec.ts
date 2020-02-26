import { TestBed, inject } from '@angular/core/testing';

import { DatatranformerService } from './datatranformer.service';

describe('DatatranformerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatatranformerService]
    });
  });

  it('should be created', inject([DatatranformerService], (service: DatatranformerService) => {
    expect(service).toBeTruthy();
  }));
});

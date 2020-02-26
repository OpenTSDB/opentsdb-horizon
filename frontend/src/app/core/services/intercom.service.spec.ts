import { TestBed, inject } from '@angular/core/testing';

import { IntercomService } from './intercom.service';

describe('IntercomService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntercomService]
    });
  });

  it('should be created', inject([IntercomService], (service: IntercomService) => {
    expect(service).toBeTruthy();
  }));
});

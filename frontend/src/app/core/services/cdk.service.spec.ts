import { TestBed, inject } from '@angular/core/testing';

import { CdkService } from './cdk.service';

describe('CdkService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CdkService]
    });
  });

  it('should be created', inject([CdkService], (service: CdkService) => {
    expect(service).toBeTruthy();
  }));
});

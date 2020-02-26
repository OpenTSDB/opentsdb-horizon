import { TestBed } from '@angular/core/testing';

import { AppShellService } from './app-shell.service';

describe('AppShellService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppShellService = TestBed.get(AppShellService);
    expect(service).toBeTruthy();
  });
});

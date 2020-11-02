import { TestBed } from '@angular/core/testing';

import { WidgetClipboardService } from './widget-clipboard.service';

describe('WidgetCopyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WidgetClipboardService = TestBed.get(WidgetClipboardService);
    expect(service).toBeTruthy();
  });
});

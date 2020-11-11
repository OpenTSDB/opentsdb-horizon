import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetClipboardMenuComponent } from './widget-clipboard-menu.component';

describe('WidgetClipboardMenuComponent', () => {
  let component: WidgetClipboardMenuComponent;
  let fixture: ComponentFixture<WidgetClipboardMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetClipboardMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetClipboardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

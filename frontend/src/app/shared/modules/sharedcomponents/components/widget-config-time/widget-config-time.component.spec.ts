import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigTimeComponent } from './widget-config-time.component';

describe('WidgetConfigTimeComponent', () => {
  let component: WidgetConfigTimeComponent;
  let fixture: ComponentFixture<WidgetConfigTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

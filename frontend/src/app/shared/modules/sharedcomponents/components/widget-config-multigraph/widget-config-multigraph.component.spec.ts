import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigMultigraphComponent } from './widget-config-multigraph.component';

describe('WidgetConfigMultigraphComponent', () => {
  let component: WidgetConfigMultigraphComponent;
  let fixture: ComponentFixture<WidgetConfigMultigraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigMultigraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigMultigraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

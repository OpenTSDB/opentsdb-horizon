import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigGeneralComponent } from './widget-config-general.component';

describe('WidgetConfigGeneralComponent', () => {
  let component: WidgetConfigGeneralComponent;
  let fixture: ComponentFixture<WidgetConfigGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

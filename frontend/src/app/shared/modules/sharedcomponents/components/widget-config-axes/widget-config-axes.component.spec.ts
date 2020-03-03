import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigAxesComponent } from './widget-config-axes.component';

describe('WidgetConfigAxesComponent', () => {
  let component: WidgetConfigAxesComponent;
  let fixture: ComponentFixture<WidgetConfigAxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigAxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigAxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

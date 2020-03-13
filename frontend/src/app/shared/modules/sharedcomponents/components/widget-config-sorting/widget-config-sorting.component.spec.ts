import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigSortingComponent } from './widget-config-sorting.component';

describe('WidgetConfigSortingComponent', () => {
  let component: WidgetConfigSortingComponent;
  let fixture: ComponentFixture<WidgetConfigSortingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigSortingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

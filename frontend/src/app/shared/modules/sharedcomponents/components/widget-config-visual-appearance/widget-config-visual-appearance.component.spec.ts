import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigVisualAppearanceComponent } from './widget-config-visual-appearance.component';

describe('BigNumberVisualAppearanceComponent', () => {
  let component: WidgetConfigVisualAppearanceComponent;
  let fixture: ComponentFixture<WidgetConfigVisualAppearanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigVisualAppearanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigVisualAppearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

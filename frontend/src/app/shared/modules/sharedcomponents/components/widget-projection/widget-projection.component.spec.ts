import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetProjectionComponent } from './widget-projection.component';

describe('WidgetProjectionComponent', () => {
  let component: WidgetProjectionComponent;
  let fixture: ComponentFixture<WidgetProjectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetProjectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetProjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

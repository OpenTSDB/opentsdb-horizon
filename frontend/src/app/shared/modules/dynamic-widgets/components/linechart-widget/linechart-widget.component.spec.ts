import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinechartWidgetComponent } from './linechart-widget.component';

describe('LinechartWidgetComponent', () => {
  let component: LinechartWidgetComponent;
  let fixture: ComponentFixture<LinechartWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinechartWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinechartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

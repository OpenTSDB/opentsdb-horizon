import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarchartWidgetComponent } from './barchart-widget.component';

describe('BarchartWidgetComponent', () => {
  let component: BarchartWidgetComponent;
  let fixture: ComponentFixture<BarchartWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarchartWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarchartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

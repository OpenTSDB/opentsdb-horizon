import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetLoaderComponent } from './widget-loader.component';

describe('WidgetLoaderComponent', () => {
  let component: WidgetLoaderComponent;
  let fixture: ComponentFixture<WidgetLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

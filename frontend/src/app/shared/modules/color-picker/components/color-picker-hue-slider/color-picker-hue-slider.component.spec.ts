import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPickerHueSliderComponent } from './color-picker-hue-slider.component';

describe('ColorPickerHueSliderComponent', () => {
  let component: ColorPickerHueSliderComponent;
  let fixture: ComponentFixture<ColorPickerHueSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorPickerHueSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPickerHueSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

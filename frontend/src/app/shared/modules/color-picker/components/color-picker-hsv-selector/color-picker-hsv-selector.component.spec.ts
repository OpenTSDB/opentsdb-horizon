import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPickerHsvSelectorComponent } from './color-picker-hsv-selector.component';

describe('ColorPickerHsvSelectorComponent', () => {
  let component: ColorPickerHsvSelectorComponent;
  let fixture: ComponentFixture<ColorPickerHsvSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorPickerHsvSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPickerHsvSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

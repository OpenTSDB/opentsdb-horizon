import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BignumberVisualAppearanceComponent } from './big-number-visual-appearance.component';

describe('BigNumberVisualAppearanceComponent', () => {
  let component: BignumberVisualAppearanceComponent;
  let fixture: ComponentFixture<BignumberVisualAppearanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BignumberVisualAppearanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BignumberVisualAppearanceComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownWidgetVisualAppearanceComponent } from './markdown-widget-visual-appearance.component';

describe('MarkdownWidgetVisualAppearanceComponent', () => {
  let component: MarkdownWidgetVisualAppearanceComponent;
  let fixture: ComponentFixture<MarkdownWidgetVisualAppearanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkdownWidgetVisualAppearanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownWidgetVisualAppearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

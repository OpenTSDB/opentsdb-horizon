import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownWidgetComponent } from './markdown-widget.component';

describe('MarkdownWidgetComponent', () => {
  let component: MarkdownWidgetComponent;
  let fixture: ComponentFixture<MarkdownWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkdownWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineFilterEditorComponent } from './inline-filter-editor.component';

describe('InlineFilterEditorComponent', () => {
  let component: InlineFilterEditorComponent;
  let fixture: ComponentFixture<InlineFilterEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineFilterEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

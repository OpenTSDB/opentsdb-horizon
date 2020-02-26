import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineEditableComponent } from './inline-editable.component';

describe('InlineEditableComponent', () => {
  let component: InlineEditableComponent;
  let fixture: ComponentFixture<InlineEditableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineEditableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineEditableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationEditorComponent } from './notification-editor.component';

describe('NotificationEditorComponent', () => {
  let component: NotificationEditorComponent;
  let fixture: ComponentFixture<NotificationEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

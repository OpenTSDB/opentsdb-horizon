import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetDeleteDialogComponent } from './widget-delete-dialog.component';

describe('WidgetDeleteDialogComponent', () => {
  let component: WidgetDeleteDialogComponent;
  let fixture: ComponentFixture<WidgetDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

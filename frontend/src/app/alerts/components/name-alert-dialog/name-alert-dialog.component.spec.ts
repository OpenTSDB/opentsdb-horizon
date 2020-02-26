import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NameAlertDialogComponent } from './name-alert-dialog.component';

describe('NameAlertDialogComponent', () => {
  let component: NameAlertDialogComponent;
  let fixture: ComponentFixture<NameAlertDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NameAlertDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NameAlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

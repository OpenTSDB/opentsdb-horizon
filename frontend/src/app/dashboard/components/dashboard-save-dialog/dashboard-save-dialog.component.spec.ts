import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSaveDialogComponent } from './dashboard-save-dialog.component';

describe('DashboardSaveDialogComponent', () => {
  let component: DashboardSaveDialogComponent;
  let fixture: ComponentFixture<DashboardSaveDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardSaveDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSaveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

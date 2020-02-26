import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDeleteDialogComponent } from './dashboard-delete-dialog.component';

describe('DashboardDeleteDialogComponent', () => {
  let component: DashboardDeleteDialogComponent;
  let fixture: ComponentFixture<DashboardDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

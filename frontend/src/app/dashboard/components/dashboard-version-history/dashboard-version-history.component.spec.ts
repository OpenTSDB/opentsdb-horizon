import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVersionHistoryComponent } from './dashboard-version-history.component';

describe('DashboardVersionHistoryComponent', () => {
  let component: DashboardVersionHistoryComponent;
  let fixture: ComponentFixture<DashboardVersionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardVersionHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardVersionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

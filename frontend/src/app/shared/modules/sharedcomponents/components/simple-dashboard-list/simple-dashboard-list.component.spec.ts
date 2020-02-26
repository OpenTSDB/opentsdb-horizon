import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleDashboardListComponent } from './simple-dashboard-list.component';

describe('SimpleDashboardListComponent', () => {
  let component: SimpleDashboardListComponent;
  let fixture: ComponentFixture<SimpleDashboardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleDashboardListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleDashboardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

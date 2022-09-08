import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdminThemesComponent } from './admin-themes.component';

describe('AdminThemesComponent', () => {
  let component: AdminThemesComponent;
  let fixture: ComponentFixture<AdminThemesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminThemesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminThemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

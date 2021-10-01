import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminThemesComponent } from './admin-themes.component';

describe('AdminThemesComponent', () => {
  let component: AdminThemesComponent;
  let fixture: ComponentFixture<AdminThemesComponent>;

  beforeEach(async(() => {
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

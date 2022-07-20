import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdminConfigHelpLinkComponent } from './admin-config-help-link.component';

describe('AdminConfigHelpLinkComponent', () => {
  let component: AdminConfigHelpLinkComponent;
  let fixture: ComponentFixture<AdminConfigHelpLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminConfigHelpLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigHelpLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

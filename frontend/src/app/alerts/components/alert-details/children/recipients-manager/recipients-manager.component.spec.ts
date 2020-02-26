import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertConfigurationContactsComponent } from './recipients-manager.component';

describe('AlertConfigurationContactsComponent', () => {
  let component: AlertConfigurationContactsComponent;
  let fixture: ComponentFixture<AlertConfigurationContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertConfigurationContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertConfigurationContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

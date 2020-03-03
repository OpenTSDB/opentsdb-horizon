import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsThemeComponent } from './settings-theme.component';

describe('SettingsThemeComponent', () => {
  let component: SettingsThemeComponent;
  let fixture: ComponentFixture<SettingsThemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsThemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

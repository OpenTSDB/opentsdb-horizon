import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperWidgetComponent } from './developer-widget.component';

describe('DeveloperWidgetComponent', () => {
  let component: DeveloperWidgetComponent;
  let fixture: ComponentFixture<DeveloperWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeveloperWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeveloperWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

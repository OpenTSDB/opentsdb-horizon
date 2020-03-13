import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopnWidgetComponent } from './topn-widget.component';

describe('TopnWidgetComponent', () => {
  let component: TopnWidgetComponent;
  let fixture: ComponentFixture<TopnWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopnWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopnWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

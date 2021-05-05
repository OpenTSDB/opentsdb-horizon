import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableWidgetComponent } from './table-widget.component';

describe('TableWidgetComponent', () => {
  let component: TableWidgetComponent;
  let fixture: ComponentFixture<TableWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbsVariableItemComponent } from './dbs-variable-item.component';

describe('DbsVariableItemComponent', () => {
  let component: DbsVariableItemComponent;
  let fixture: ComponentFixture<DbsVariableItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbsVariableItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbsVariableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

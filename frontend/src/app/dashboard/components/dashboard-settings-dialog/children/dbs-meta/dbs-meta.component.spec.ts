import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbsMetaComponent } from './dbs-meta.component';

describe('DbsMetaComponent', () => {
  let component: DbsMetaComponent;
  let fixture: ComponentFixture<DbsMetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbsMetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbsMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

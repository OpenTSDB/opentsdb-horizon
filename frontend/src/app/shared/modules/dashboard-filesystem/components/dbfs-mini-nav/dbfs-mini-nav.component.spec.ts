import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbfsMiniNavComponent } from './dbfs-mini-nav.component';

describe('DbfsMiniNavComponent', () => {
  let component: DbfsMiniNavComponent;
  let fixture: ComponentFixture<DbfsMiniNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbfsMiniNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbfsMiniNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

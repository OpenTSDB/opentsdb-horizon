import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleFavoritesListComponent } from './simple-favorites-list.component';

describe('SimpleFavoritesListComponent', () => {
  let component: SimpleFavoritesListComponent;
  let fixture: ComponentFixture<SimpleFavoritesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleFavoritesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleFavoritesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

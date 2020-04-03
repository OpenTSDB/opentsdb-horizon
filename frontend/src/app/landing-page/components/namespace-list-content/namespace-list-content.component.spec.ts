import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NamespaceListContentComponent } from './namespace-list-content.component';

describe('NamespaceListContentComponent', () => {
  let component: NamespaceListContentComponent;
  let fixture: ComponentFixture<NamespaceListContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NamespaceListContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NamespaceListContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

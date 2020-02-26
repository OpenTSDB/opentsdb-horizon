import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateVariablePanelComponent } from './template-variable-panel.component';

describe('TemplateVariablePanelComponent', () => {
  let component: TemplateVariablePanelComponent;
  let fixture: ComponentFixture<TemplateVariablePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateVariablePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateVariablePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

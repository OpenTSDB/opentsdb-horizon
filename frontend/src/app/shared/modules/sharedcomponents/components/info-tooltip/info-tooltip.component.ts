import { Component, OnInit, Input, HostBinding, ViewChild, HostListener } from '@angular/core';
import { MatMenuTrigger, MatMenu } from '@angular/material';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'info-tooltip',
  templateUrl: './info-tooltip.component.html'
})
export class InfoTooltipComponent implements OnInit {

  @HostBinding('class.info-tooltip-component') _hostClass = true;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild(MatMenu) tooltip: MatMenu;

  @Input() fontSet: string = 'denali';
  @Input() fontIcon: string = 'd-information-circle';

  @HostListener('document:keydown.escape', ['$event'])
  private escapeListener(event: KeyboardEvent) {
    this.trigger.closeMenu();
  }

  constructor() { }

  ngOnInit() {
  }

}

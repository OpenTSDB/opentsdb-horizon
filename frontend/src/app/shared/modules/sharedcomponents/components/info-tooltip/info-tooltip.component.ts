/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Component, OnInit, Input, HostBinding, ViewChild, HostListener, ViewEncapsulation } from '@angular/core';
import { MatMenuTrigger, MatMenu } from '@angular/material';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'info-tooltip',
  templateUrl: './info-tooltip.component.html',
  styleUrls: ['./info-tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InfoTooltipComponent implements OnInit {

  @HostBinding('class.info-tooltip-component') _hostClass = true;

  @ViewChild(MatMenuTrigger, { static: true }) trigger: MatMenuTrigger;
  @ViewChild(MatMenu, { static: true }) tooltip: MatMenu;

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

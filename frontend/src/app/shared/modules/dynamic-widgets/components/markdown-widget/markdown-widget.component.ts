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
import { Component, OnInit, HostBinding, Input, OnDestroy, ElementRef } from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { Subscription, BehaviorSubject, of } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'markdown-widget',
  templateUrl: './markdown-widget.component.html',
  styleUrls: []
})
export class MarkdownWidgetComponent implements OnInit, OnDestroy {
  @HostBinding('class.widget-panel-content') private _hostClass = true;
  @HostBinding('class.markdown-widget') private _componentClass = true;

  constructor(
      private interCom: IntercomService,
      private elRef: ElementRef
    ) { }
  /** Inputs */
  @Input() mode = 'view'; // view/edit
  @Input() widget: any;

  isDataRefreshRequired = false;

  displayText$: BehaviorSubject<string>;
  tplVariables: any = {};
  tplMarcos: any = {};
  tplValues = [];
  private subscription: Subscription = new Subscription();

  ngOnInit() {

    this.displayText$ = new BehaviorSubject('');
    this.subscription.add(this.interCom.responseGet().subscribe(message => {
      if (message.action === 'viewTplVariablesValues') {
        this.tplVariables = message.payload.tplVariables;
        this.tplValues = message.payload.tplValues;
        if (this.tplVariables.tvars.length > 0) {
          this.tplVariables.tvars.forEach(tvar => {
            this.tplMarcos['{{'+tvar.alias+'}}'] = tvar.filter;
          });
        }
        this.setDefaults();
      }
    }));
    this.interCom.requestSend({
      action: 'GetResolveViewTplVariables'
    });

    this.subscription.add(this.interCom.responseGet().subscribe((message: IMessage) => {
      if (message && (message.id === this.widget.id)) {
        switch (message.action) {
          case 'getUpdatedWidgetConfig': // called when switching to presentation view
            this.widget = message.payload.widget;
            break;

        }
      }
    }));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setDefaults() {
    if (!this.widget.settings.visual.text) {
      this.widget.settings.visual.text = '';
      this.displayText$.next('');
    } else {
      this.displayText$.next(this.resolveTplMacro(this.tplMarcos, this.tplValues, this.widget.settings.visual.text));
    }

    if (!this.widget.settings.visual.backgroundColor) {
      this.widget.settings.visual.backgroundColor = '#FFFFFF';
    }

    if (!this.widget.settings.visual.font) {
      this.widget.settings.visual.font = 'default';
    }

    if (!this.widget.settings.visual.textColor) {
      this.widget.settings.visual.textColor = '#000000';
    }
  }

  textChanged(txt: string) {
    this.widget.settings.visual.text = txt;
    this.displayText$.next(this.resolveTplMacro(this.tplMarcos, this.tplValues, this.widget.settings.visual.text));
  }

  updateConfig(message) {
    switch (message.action) {
      case 'SetVisualization':
        this.setVisualization(message.payload.data);
        break;
    }
  }

  setVisualization(vconfigs) {
    this.widget.settings.visual = { ...vconfigs };
  }

  applyConfig() {
    const cloneWidget = { ...this.widget };
    cloneWidget.id = cloneWidget.id.replace('__EDIT__', '');
    this.interCom.requestSend({
      action: 'updateWidgetConfig',
      id: cloneWidget.id,
      payload: { widget: cloneWidget, isDataRefreshRequired: this.isDataRefreshRequired }
    });
    this.closeViewEditMode();
  }

  closeViewEditMode() {
    this.interCom.requestSend({
      action: 'closeViewEditMode',
      id: this.widget.id,
      payload: 'dashboard'
    });
  }

  resolveTplMacro(tplMacros: any, tplValues: any[], text: string): string {

    if (this.checkExistMarco(text)) {
      for (let i = 0; i < Object.keys(tplMacros).length; i++) {
        const key = Object.keys(tplMacros)[i];
        tplMacros[key] = tplValues[i] && tplValues[i].length ? tplValues[i][0] : '';
      }
      const regx = new RegExp(Object.keys(tplMacros).join('|'),'gi');
      return text.replace(regx, (matched) => {
        if(tplMacros[matched] !== '') {
          return tplMacros[matched];
        } else {
          return matched;
        }
      });
    } else {
      return text;
    }

  }

  // check if text contains tag filter marcos
  checkExistMarco(text: string): boolean {
    if (Object.keys(this.tplMarcos).length > 0) {
      const regx = new RegExp(Object.keys(this.tplMarcos).join('|'),'gi');
      return regx.test(text);
    }
    return false;
  }
}

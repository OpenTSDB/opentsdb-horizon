import { Component, OnInit, HostBinding, Input, OnDestroy } from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { Observable, Subscription, of, BehaviorSubject } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'markdown-widget',
  templateUrl: './markdown-widget.component.html',
  styleUrls: []
})
export class MarkdownWidgetComponent implements OnInit, OnDestroy {
  @HostBinding('class.widget-panel-content') private _hostClass = true;
  @HostBinding('class.markdown-widget') private _componentClass = true;

  constructor(private interCom: IntercomService) { }
  /** Inputs */
  @Input() mode = 'view'; // view/edit
  @Input() widget: any;

  isDataRefreshRequired = false;

  displayText$: BehaviorSubject<string>;
  tplVariables: any = {};
  tplScopes = [];
  private subscription: Subscription = new Subscription();

  ngOnInit() {

    this.displayText$ = new BehaviorSubject('');
    this.subscription.add(this.interCom.responseGet().subscribe(message => {
      if (message.action === 'TplVariables') {
        this.tplVariables = message.payload.tplVariables;
        this.tplScopes = message.payload.scope;
        this.setDefaults();

      }
    }));
    this.interCom.requestSend({
      action: 'GetTplVariables'
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
    console.log('hill - tplVariables default called', this.tplVariables, this.tplScopes);
    if (!this.widget.settings.visual.text) {
      this.widget.settings.visual.text = '';
      this.displayText$.next('');
    } else {
      this.displayText$.next(this.resolveTplMacro(this.tplVariables, this.widget.settings.visual.text));
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
    this.displayText$.next(this.resolveTplMacro(this.tplVariables, this.widget.settings.visual.text));
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

  resolveTplMacro(tplVariables: any, text: string): string {
    console.log('hill - this is call relveo');
    if (tplVariables.tvars.length) {
      const arr = {};
      tplVariables.tvars.forEach(v => {
        arr['{{'+v.alias+'}}'] = v.filter;
      });
      const reg = new RegExp(Object.keys(arr).join('|'),"g");
      return text.replace(reg, (matched) => {
        return arr[matched] !== '' ? arr[matched] : matched;
      });
    } else {
      return text;
    }
  }
}

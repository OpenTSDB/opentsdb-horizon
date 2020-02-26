import { Component, OnInit, HostBinding, Input, OnDestroy } from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'markdown-widget',
  templateUrl: './markdown-widget.component.html',
  styleUrls: []
})
export class MarkdownWidgetComponent implements OnInit, OnDestroy {
  @HostBinding('class.widget-panel-content') private _hostClass = true;
  @HostBinding('class.markdown-widget') private _componentClass = true;

  constructor( private interCom: IntercomService) {  }
  /** Inputs */
  @Input() editMode: boolean;
  @Input() widget: any;

  isDataRefreshRequired = false;
  private listenSub: Subscription;

  ngOnInit() {
    this.setDefaults();

    this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
      if (message && (message.id === this.widget.id)) {
        switch (message.action) {
          case 'getUpdatedWidgetConfig': // called when switching to presentation view
                this.widget = message.payload.widget;
            break;
        }
      }
    });
  }

  ngOnDestroy() {
    this.listenSub.unsubscribe();
  }

  setDefaults() {
    if (!this.widget.settings.visual.text) {
      this.widget.settings.visual.text = '';
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
  }

  updateConfig(message) {
    switch ( message.action ) {
      case 'SetVisualization':
        this.setVisualization(message.payload.data);
        break;
    }
}

setVisualization( vconfigs ) {
  this.widget.settings.visual = { ...vconfigs};
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
}

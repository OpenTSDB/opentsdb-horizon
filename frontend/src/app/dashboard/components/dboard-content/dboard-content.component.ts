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
import {
  Component, Input, ViewChild, ViewEncapsulation,
  OnChanges, SimpleChanges, ComponentFactoryResolver, Type,
  HostBinding, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, QueryList, ViewChildren
} from '@angular/core';
import { GridsterComponent, GridsterItemComponent, IGridsterOptions, IGridsterDraggableOptions } from 'angular2gridster';
import { WidgetViewDirective } from '../../directives/widgetview.directive';
import { WidgetComponentModel } from '../../widgets/models/widgetcomponent';
import { DashboardService } from '../../services/dashboard.service';
import { WidgetService } from '../../../core/services/widget.service';
import { UtilsService } from '../../../core/services/utils.service';
import { IntercomService, IMessage } from '../../../core/services/intercom.service';
import { WidgetLoaderComponent } from '../widget-loader/widget-loader.component';

@Component({
  selector: 'app-dboard-content',
  templateUrl: './dboard-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DboardContentComponent implements OnChanges {
  @HostBinding('class.app-dboard-content') private _hostClass = true;

  @ViewChild(WidgetViewDirective) widgetViewContainer: WidgetViewDirective;
  @ViewChild(GridsterComponent) gridster: GridsterComponent;

  // widgetLoader Children
  @ViewChildren(WidgetLoaderComponent, {read: WidgetLoaderComponent}) widgetLoaders: QueryList<WidgetLoaderComponent>;

  @Output() widgetsLayoutUpdate = new EventEmitter();
  @Input() widgets: any[];
  @Input() newWidget: any; // new widget when adding from top bar
  @Input() mWidget: any;
  @Input() rerender: any;
  @Input() dashboardMode: string;
  @Input() dbid: any;
  @Input() readonly = true;
  @Input() batchControlsToggle: boolean = false;
  @Input() batchSelectedItems: any = {};

  viewEditMode = false;
  winSize = 'md'; // flag to check if window size change to sm
  gridsterOptions: IGridsterOptions = {
    // core configuration is default one - for smallest view. It has hidden minWidth: 0.
    lanes: 12, // amount of lanes (cells) in the grid
    direction: 'vertical', // floating top - vertical, left - horizontal
    floating: true, // gravity floating
    dragAndDrop: true, // enable/disable drag and drop for all items in grid
    resizable: true, // enable/disable resizing by drag and drop for all items in grid
    resizeHandles: {
      e: true,
      w: true,
      s: true,
      se: true,
      sw: true
    },
    widthHeightRatio: 2, // proportion between item width and height
    lines: {
      visible: false,
      color: '#afafaf',
      width: 1
    },
    shrink: true,
    useCSSTransforms: true,
    responsiveView: true, // turn on adopting items sizes on window resize and enable responsiveOptions
    responsiveDebounce: 50, // window resize debounce time
    responsiveSizes: true,
    responsiveOptions: [
      {
        breakpoint: 'sm',
        lanes: 1,
        minWidth: 100,
        widthHeightRatio: 2,
        resizable: false
      },
      {
        breakpoint: 'md',
        minWidth: 768,
        lanes: 12,
      }
    ]
  };

  gridsterDraggableOptions: IGridsterDraggableOptions = {
    handlerClass: 'panel-heading'
  };

  constructor(
    private dbService: DashboardService,
    private widgetService: WidgetService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private interCom: IntercomService,
    private utils: UtilsService,
    private cdRef: ChangeDetectorRef
  ) { }

  trackByWidget(index: number, widget: any) {
    return widget.id;
  }

  ngOnChanges(changes: SimpleChanges) {
    // need to reload grister view to update the UI
    if (changes.rerender && changes.rerender.currentValue.reload && !this.viewEditMode) {
       this.gridster.reload();
    }

    if (changes.dashboardMode) {
      this.viewEditMode =  changes.dashboardMode.currentValue === 'edit' || changes.dashboardMode.currentValue === 'snap' || changes.dashboardMode.currentValue === 'explore';
      if (!this.viewEditMode && this.widgetViewContainer.viewContainerRef) {
        this.widgetViewContainer.viewContainerRef.clear();
      }
    }

    // check if the new editing widget is needed
    if ( changes.newWidget && changes.newWidget.currentValue ) {
      this.newComponent(changes.newWidget.currentValue);
    }
    if ( changes.mWidget && changes.mWidget.currentValue ) {
      this.newComponent(changes.mWidget.currentValue, true);
    }
  }

  newComponent(widget: any, override= false) {
    if ( !override && this.dashboardMode !== 'snap' ) {
      this.interCom.requestSend(<IMessage> {
        action: 'setDashboardEditMode',
        id: widget.id,
        payload: 'edit'
      });
      widget.settings = { ...widget.settings, ...this.widgetService.getWidgetDefaultSettings(widget.settings.component_type)};
    }
    const component: Type<any> = this.widgetService.getComponentToLoad(widget.settings.component_type);
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    this.editComponent( { 'compFactory': componentFactory, widget: widget, mode : this.dashboardMode });
  }

  // to load selected component factory to edit
  editComponent(comp: any) {
    this.loadComponent(comp);
  }

  deepClone(o) {
    return this.utils.deepClone(o);
  }

  loadComponent(comp: any) {
    const mode = !comp.mode ? 'edit' : comp.mode;
    // get the view container
    const viewContainerRef = this.widgetViewContainer.viewContainerRef;
    viewContainerRef.clear();
    // create component using existing widget factory
    const component = viewContainerRef.createComponent(comp.compFactory);
    // we posfix __EDIT__ to original widget id
    // do not clone if it is from snapshot
    const editWidget = mode !== 'snap' ? JSON.parse(JSON.stringify(comp.widget)) : comp.widget;
    editWidget.id = mode !== 'snap' ? '__EDIT__' + comp.widget.id : comp.widget.id;
    // assign @input widget
    (<WidgetComponentModel>component.instance).widget = editWidget;
    (<WidgetComponentModel>component.instance).mode =  mode;
    (<WidgetComponentModel>component.instance).readonly =  this.readonly;
  }

  // change ratio when breakpoint hits
  // may need to add not resizable and draggable at sm size.
  breakpointChange(event: IGridsterOptions) {
    if (event.lanes === 1) {
      this.winSize = 'sm';
    } else {
      this.winSize = 'md';
    }
  }

  // this event will start first and set values of cellWidth and cellHeight
  // then update the this.widgets reference
  gridsterFlow(event: any) {
    if (this.viewEditMode) { return; }
    // const width = event.gridsterComponent.gridster.cellWidth;
    // const height = event.gridsterComponent.gridster.cellHeight;
    // comment out for now using ResizeSensor
    /* if (!event.isInit) {
       this.interCom.responsePut({
        action: 'WindowResize',
        payload: { width, height, winSize: this.winSize }
      });
    } */
    // this.widgetsLayoutUpdate.emit(this.getWigetPosition(width, height, this.winSize));
  }

  // this event happened when item is dragged or resize end
  gridEventEnd(event: any) {
    if (this.viewEditMode) { return; }
      if (event.action === 'resize' || event.action === 'drag') {
        const width = event.item.itemComponent.gridster.cellWidth;
        const height = event.item.itemComponent.gridster.cellHeight;
        this.widgetsLayoutUpdate.emit(this.getWigetPosition(width, height, this.winSize));
        // once the move of a widget end
        if (event.action === 'drag') {
          for (let i = 0; i < this.widgets.length; i++) {
            this.interCom.responsePut({
              id: this.widgets[i].id,
              action: 'widgetDragDropEnd'
            });
          }
        }
        // comment out for now to use ResizeSensor
        /* if (event.action === 'resize' && this.winSize === 'md') {
          // only deal with resize to care about new size
          const gItem = event.item.itemComponent;
          // with our set up for responsive, only md needed.
          const size = { width, height };
          const gridLayout = {
            xMd: gItem.xMd,
            yMd: gItem.yMd,
            x: gItem.xMd,
            y: gItem.yMd,
            wMd: gItem.wMd,
            hMd: gItem.hMd,
            w: gItem.wMd,
            h: gItem.hMd,
            xSm: gItem.xSm,
            ySm: gItem.ySm,
            wSm: gItem.wSm,
            hSm: gItem.hSm
          };
          this.interCom.responsePut({
            id: gItem.elementRef.nativeElement.id,
            action: 'updateWidgetSize',
            payload: { size, gridLayout }
          });
        } */
      }
  }

  // helper
  getWigetPosition(width: number, height: number, winSize: string): any {
    const gridLayout = {
      clientSize: {
        width: width,
        height: height,
        winSize: winSize
      },
      wgridPos: {}
    };
    // position
    for (let i = 0; i < this.widgets.length; i++) {
      const w = this.widgets[i];
      gridLayout.wgridPos[w.id] = {

        xMd: w.gridPos.xMd, // using responsive size
        yMd: w.gridPos.yMd,
        wMd: w.gridPos.wMd,
        hMd: w.gridPos.hMd,
        xSm: w.gridPos.xSm,
        ySm: w.gridPos.ySm,
        wSm: w.gridPos.wSm,
        hSm: w.gridPos.hSm,
        x: w.gridPos.xMd,
        y: w.gridPos.yMd,
        w: w.gridPos.wMd,
        h: w.gridPos.hMd
      };
    }
    return gridLayout;
  }

}

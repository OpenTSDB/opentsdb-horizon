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
    Type, Component, OnInit, Input, Output, ViewChild,
    ComponentFactoryResolver, EventEmitter,
    OnChanges, SimpleChanges, HostBinding, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, TemplateRef, ViewEncapsulation
} from '@angular/core';
import { WidgetService } from '../../../core/services/widget.service';
import { WidgetDirective } from '../../directives/widget.directive';
import { WidgetComponentModel } from '../../widgets/models/widgetcomponent';
import { IntercomService, IMessage } from '../../../core/services/intercom.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig, MatDialogRef, DialogPosition } from '@angular/material/dialog';
import { WidgetDeleteDialogComponent } from '../widget-delete-dialog/widget-delete-dialog.component';
import { InfoIslandService } from '../../../shared/modules/info-island/services/info-island.service';
import { TemplatePortal, ComponentPortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { UtilsService } from '../../../core/services/utils.service';
import { AppConfigService } from '../../../core/services/config.service';

import domtoimage from 'dom-to-image-more';

@Component({
    selector: 'app-widget-loader',
    templateUrl: './widget-loader.component.html',
    styleUrls: ['./widget-loader.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class WidgetLoaderComponent implements OnInit, OnChanges {
    @HostBinding('class.widget-loader') private hostClass = true;

    @HostBinding('class.linechart-widget-component')
    get isLinechartWidget() {
        return this.widget && this.widget.settings.component_type === 'LinechartWidgetComponent';
    }

    @HostBinding('class.heatmap-widget-component')
    get isHeatmapWidget() {
        return this.widget && this.widget.settings.component_type === 'HeatmapWidgetComponent';
    }

    @HostBinding('class.barchart-widget-component')
    get isBarchartWidget() {
        return this.widget && this.widget.settings.component_type === 'BarchartWidgetComponent';
    }

    @HostBinding('class.donut-widget-component')
    get isDonutWidget() {
        return this.widget && this.widget.settings.component_type === 'DonutWidgetComponent';
    }

    @HostBinding('class.topn-widget-component')
    get isTopnWidget() {
        return this.widget && this.widget.settings.component_type === 'TopnWidgetComponent';
    }

    @HostBinding('class.bignumber-widget-component')
    get isBignumberWidget() {
        return this.widget && this.widget.settings.component_type === 'BignumberWidgetComponent';
    }

    @HostBinding('class.markdown-widget-component')
    get isMarkdownWidget() {
        return this.widget && this.widget.settings.component_type === 'MarkdownWidgetComponent';
    }

    @HostBinding('class.events-widget-component')
    get isEventsWidget() {
        return this.widget && this.widget.settings.component_type === 'EventsWidgetComponent';
    }

    @HostBinding('class.inverse-menu-color')
    get needsInverseMenuColor() {
        if (this.widget && (this.widget.settings.component_type === 'MarkdownWidgetComponent' || this.widget.settings.component_type === 'BignumberWidgetComponent')) {
            const colorInvert: any = this.utils.findContrastColor(this.widget.settings.visual.backgroundColor);
            return colorInvert.type === 'white';
        }
        return false;
    }

    @Input() widget: any;
    @Input() isNewDb: boolean = false;
    @Output() editComponent = new EventEmitter<any>();

    @ViewChild(WidgetDirective, { static: true }) widgetContainer: WidgetDirective;
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    @ViewChild('islandPortalTest', { static: true }) islandPortalTest: TemplateRef<any>;

    _component: any = null;
    componentFactory: any = null;
    viewContainerRef: any;
    widgetDeleteDialog: MatDialogRef<WidgetDeleteDialogComponent> | null;
    multiLimitMessage = '';
    userHasWriteAccessToNamespace = false;
    canOverrideTime = true;

    private subscription: Subscription = new Subscription();

    // this is a toggle switched by dashboard when
    // dashboard batch operations are turned on
    @Input() batchSelector: boolean = false;

    @Input() batchSelected: boolean = false;
    @Input() readonly = true;

    constructor(
        private widgetService: WidgetService,
        private interCom: IntercomService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private dialog: MatDialog,
        private infoIslandService: InfoIslandService,
        private hostElRef: ElementRef,
        private utils: UtilsService,
        private cdRef: ChangeDetectorRef,
        private appConfig: AppConfigService
    ) { }

    ngOnInit() {

        setTimeout(() => {
            this.loadComponent();
            this.cdRef.markForCheck();
        });

        this.subscription.add(this.interCom.requestListen().subscribe((message: IMessage) => {
            if (message.action) {
                switch (message.action) {
                    case 'WriteAccessToNamespace':
                        this.userHasWriteAccessToNamespace = message.payload.userHasWriteAccessToNamespace;
                        break;
                    case 'batchCopyWidget':
                        if (message.payload.includes(this.widget.id)) {
                            this.widgetCopy();
                        }
                        break;
                }
            }

            if (message.action && this.widget.id === message.id) {
                switch (message.action) {
                    case 'InfoIslandOpen':
                        const dataToInject = {
                            widget: this.widget,
                            originId: message.id,
                            data: message.payload.data
                        };
                        const portalDef = message.payload.portalDef;
                        let componentOrTemplateRef;

                        let options: any = { };
                        if (message.payload.options) {
                            Object.assign(options, message.payload.options);
                        }
                        options.originId = message.id;

                        let overlayOriginRef;
                        if (options.overlayRefEl) {
                            // CUSTOM ORIGIN REF
                            overlayOriginRef = options.overlayRefEl;
                        } else if (options.positionStrategy && options.positionStrategy === 'global') {
                            // GLOBAL USES DASHBOARD CONTENT WRAPPER
                            overlayOriginRef = this.hostElRef.nativeElement.closest('.app-dboard-content');
                        } else {
                            // OTHERWISE USE THE WIDGET HOST
                            overlayOriginRef = this.hostElRef.nativeElement;
                        }

                        if (portalDef.type === 'component') {
                            // component based
                            // tslint:disable-next-line: max-line-length
                            const compRef = (portalDef.name) ? this.infoIslandService.getComponentToLoad(portalDef.name) : portalDef.reference;
                            componentOrTemplateRef = new ComponentPortal(compRef, null, this.infoIslandService.createInjector(dataToInject));
                        } else {
                            // template based
                            const tplRef = (portalDef.templateName) ? this[portalDef.name] : portalDef.reference;
                            componentOrTemplateRef = new TemplatePortal(tplRef, null, dataToInject);
                        }
                        this.infoIslandService.openIsland(
                            overlayOriginRef,
                            componentOrTemplateRef,
                            options
                        );
                        break;
                    default:
                        break;
                }
            }
        }));
        const config = this.appConfig.getConfig();
        this.canOverrideTime = config.modules && config.modules.dashboard && config.modules.dashboard.widget && config.modules.dashboard.widget.overrideTime  !== undefined  ? config.modules.dashboard.widget.overrideTime : true;

    }

    ngOnChanges(changes: SimpleChanges) {
        // mainly to load new dynamic widget from selecting type in PlaceholderWidget
        if (changes.widget) {

            if ( changes.widget.previousValue !== undefined && changes.widget.currentValue ) {
                const oldConfig = changes.widget.previousValue;
                const newConfig = changes.widget.currentValue;
                if ( oldConfig.settings.component_type !== newConfig.settings.component_type ) {
                    this.loadComponent();
                }
            }
        }
    }

    /* EXAMPLE FUNCTION */
    openIsland() {

        const portalDef: any = {
            type: 'component',
            name: 'IslandTestComponent'
        };
        // EXAMPLE ONLY
        // USING template portal for now, but it could be a component portal. just for reference
        // Component portal mildly more complicated if you want to pass data. Needs Injector

        // if (portalType === 'component') {
        //     const compRef = new ComponentPortal(IslandTestComponent, undefined, {});
        // } else {
            // template portal
            // figure out way to load template
            // const portalRef = new TemplatePortal(this.islandPortalTest, undefined, {});
        // }

        const dataToInject = { widget: this.widget };

        let componentOrTemplateRef;
        if (portalDef.type === 'component') {
            // component based
            /*
                to load component from infoIslandModule using lookup for pre-selected components
                portalDef = {
                    componentName: 'IslandTestComponent'
                }

                to load component using an imported component type
                portalDef = {
                    componentRef: IslandTestComponent
                }
            */
            const compRef = (portalDef.componentName) ? this.infoIslandService.getComponentToLoad(portalDef.name) : portalDef.reference;
            componentOrTemplateRef = new ComponentPortal(compRef, null, this.infoIslandService.createInjector(dataToInject));
        } else {
            // template based
            /*
                to load component from template ref name
                portalDef = {
                    templateName: 'islandPortalTest'
                }

                to load component using an imported component type
                portalDef = {
                    templateRef: this.islandPortalTest
                }
            */
            const tplRef = (portalDef.templateName) ? this[portalDef.name] : portalDef.reference;
            componentOrTemplateRef = new TemplatePortal(tplRef, null, dataToInject);
        }

        const options = {
            originId: this.widget.id,
            title: 'TEST INFO ISLAND COMPONENT'
        };
        // this.island = is infoIslandService
        this.infoIslandService.openIsland(this.hostElRef, componentOrTemplateRef, options);
    }

    loadComponent() {
        let componentName = '__notfound__';
        if (this.widget.settings.component_type) {
            componentName = this.widget.settings.component_type;
        }
        const componentToLoad: Type<any> = this.widgetService.getComponentToLoad(componentName);
        this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentToLoad);
        this.viewContainerRef = this.widgetContainer.viewContainerRef;
        this.viewContainerRef.clear();
        this._component = this.viewContainerRef.createComponent(this.componentFactory);

        if ( componentName === 'PlaceholderWidgetComponent' ) {
            this._component.instance.loadNewWidget.subscribe( wConfig => {
                const component: Type<any> = this.widgetService.getComponentToLoad(wConfig.type);
                const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
                const widget = JSON.parse(JSON.stringify(this.widget)); // copy the widget config
                widget.settings = { ...widget.settings, ...this.widgetService.getWidgetDefaultSettings(wConfig.type)};

                widget.settings.component_type = wConfig.type;
                this.editComponent.emit({
                    'compFactory': componentFactory,
                    'widget': widget
                });
                // intercom to container to update state
               this.interCom.requestSend(<IMessage> {
                    action: 'setDashboardEditMode',
                    id: widget.id,
                    payload: 'edit'
                });
            });
        }

        (<WidgetComponentModel>this._component.instance).widget = this.widget;
        (<WidgetComponentModel>this._component.instance).editMode = false;
        if (this._component.instance.widgetOut) {
            this._component.instance.widgetOut.subscribe(event => {
                this.multiLimitMessage = event.message;
            });
        }
    }

    // when user clicks on view-edit
    // emit component factory and config for edit/view full mode
    loadWidget(mode = 'edit') {
        this.editComponent.emit({
            'compFactory': this.componentFactory,
            'widget': this.widget,
            'mode': mode
        });
        // intercom to container to update state
        this.interCom.requestSend(<IMessage> {
            action: 'setDashboardEditMode',
            id: this.widget.id,
            payload: mode
        });

        // if island open, close island
        this.infoIslandService.closeIsland();
    }

    widgetClone() {
        this.interCom.requestSend(<IMessage> {
            action: 'cloneWidget',
            id: this.widget.id,
            payload: this.widget
        });
    }

    saveSnapshot() {
        this.interCom.requestSend(<IMessage> {
            action: 'SaveSnapshot',
            id: this.widget.id,
            payload: { widget: this.utils.deepClone(this.widget) }
        });
    }
    createAlert() {
        this.interCom.requestSend(<IMessage> {
            action: 'createAlertFromWidget',
            id: this.widget.id,
            payload: this.widget
        });
    }

    downloadDataQuery() {
        this.interCom.requestSend(<IMessage> {
            action: 'downloadDataQuery',
            id: this.widget.id,
            payload: this.widget
        });
    }

    downloadJSON() {
        this.interCom.requestSend(<IMessage> {
            action: 'downloadWidgetData',
            id: this.widget.id,
            payload: this.widget
        });
    }

    widgetExportImage() {
        let componentEl: any = this._component.instance.elRef.nativeElement;
        componentEl.style.backgroundColor = '#ffffff';
        domtoimage.toJpeg(componentEl)
            .then((dataUrl: any) => {
                var link = document.createElement('a');
                link.download = (this.widget.settins.title.toLowercase().replace(' ','-')) + '.jpeg';
                link.href = dataUrl;
                link.click();
            });
    }

    widgetRemove() {
        this.openDeleteDialog();
    }

    openDeleteDialog() {
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        dialogConf.backdropClass = 'widget-delete-dialog-backdrop';
        dialogConf.hasBackdrop = true;
        dialogConf.panelClass = 'widget-delete-dialog-panel';

        dialogConf.autoFocus = true;
        dialogConf.data = {};
        this.widgetDeleteDialog = this.dialog.open(WidgetDeleteDialogComponent, dialogConf);
        this.widgetDeleteDialog.afterClosed().subscribe((dialog_out: any) => {
            if ( dialog_out && dialog_out.delete  ) {
                this.interCom.requestSend(<IMessage> {
                    action: 'removeWidget',
                    payload: { widgetId: this.widget.id }
                });
            }
        });
    }

    /** WIDGET COPY */

    widgetCopy() {
        // get the dom element
        let componentEl: any = this._component.instance.elRef.nativeElement;

        // adding white to background so it is easier to see graph when capturing image
        componentEl.style.backgroundColor = '#ffffff';

        let widget = JSON.parse(JSON.stringify(this.widget));

        domtoimage.toJpeg(componentEl)
            .then((dataUrl: any) => {
                // remove the background style
                delete componentEl.style.backgroundColor;

                // send the package through intercom so dashboard finish the request
                this.interCom.requestSend(<IMessage> {
                    action: 'copyWidgetToClipboard',
                    id: widget.id,
                    payload: {
                        widget: widget,
                        preview: dataUrl
                    }
                });
            });
    }

    toggleSelectItem(event: any) {
        // need to emit something up to dashboard
        // in order to keep track of what is selected
        this.batchSelected = event.checked;
        this.interCom.requestSend({
            action: 'batchItemUpdated',
            id: this.widget.id,
            payload: {
                selected: this.batchSelected
            }
        });
    }
}

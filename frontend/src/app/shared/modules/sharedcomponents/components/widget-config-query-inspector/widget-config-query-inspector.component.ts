import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'widget-config-query-inspector',
    templateUrl: './widget-config-query-inspector.component.html',
    styleUrls: []
})
export class WidgetConfigQueryInspectorComponent implements OnInit {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.query-inspector-configuration') private _tabClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;

    /** Local variables */

    constructor() { }

    ngOnInit() {
    }

}

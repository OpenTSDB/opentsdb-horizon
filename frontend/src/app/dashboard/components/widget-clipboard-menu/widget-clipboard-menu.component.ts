import { Component, HostBinding, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'widget-clipboard-menu',
    templateUrl: './widget-clipboard-menu.component.html'
})
export class WidgetClipboardMenuComponent implements OnInit {

    @HostBinding('class.widget-clipboard-menu') private _hostClass = true;

    // Subscriptions

    constructor(
        private store: Store,

    ) { }

    ngOnInit() {
    }

}

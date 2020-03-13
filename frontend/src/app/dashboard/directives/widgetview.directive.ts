import { Directive, ViewContainerRef } from '@angular/core';

@Directive ({
    // tslint:disable-next-line:directive-selector
    selector: '[widget-view-container]'
})

export class WidgetViewDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

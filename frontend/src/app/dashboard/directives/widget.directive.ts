import { Directive, ViewContainerRef } from '@angular/core';

@Directive ({
    // tslint:disable-next-line:directive-selector
    selector: '[widget-container]'
})

export class WidgetDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

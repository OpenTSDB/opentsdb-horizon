import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'navbar-timezone-toggle',
    templateUrl: './navbar-timezone-toggle.component.html',
    styleUrls: []
})
export class NavbarTimezoneToggleComponent {

    @HostBinding('class.navbar-timezone-toggle') private _hostClass = true;

    // tslint:disable-next-line:no-inferrable-types
    @Input() timezone: string = 'local';

    @Output() change = new EventEmitter;

    constructor() {}

    changeTimezone(tz: string) {
        if (this.timezone !== tz) {
            this.change.emit(tz);
        }
    }

}

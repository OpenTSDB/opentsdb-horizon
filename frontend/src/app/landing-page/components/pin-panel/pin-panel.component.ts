import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'pin-panel',
    templateUrl: './pin-panel.component.html',
    styleUrls: ['./pin-panel.component.scss']
})
export class PinPanelComponent implements OnInit {
    @HostBinding('class.pin-panel') private _hostClass = true;

    constructor() { }

    ngOnInit() {
    }

}

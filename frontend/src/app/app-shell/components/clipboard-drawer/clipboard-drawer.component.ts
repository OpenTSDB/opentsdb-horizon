import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'clipboard-drawer',
    templateUrl: './clipboard-drawer.component.html',
    styleUrls: ['./clipboard-drawer.component.scss']
})
export class ClipboardDrawerComponent implements OnInit {

    @HostBinding('class.clipboard-drawer') private _hostClass = true;

    constructor() { }

    ngOnInit() {
    }

}

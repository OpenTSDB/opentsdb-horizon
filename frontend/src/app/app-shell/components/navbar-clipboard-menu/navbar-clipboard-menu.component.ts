import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'navbar-clipboard-menu',
    templateUrl: './navbar-clipboard-menu.component.html',
    styleUrls: ['./navbar-clipboard-menu.component.scss']
})
export class NavbarClipboardMenuComponent implements OnInit {

    @HostBinding('class.navbar-clipboard-menu') private _hostClass = true;

    constructor() { }

    ngOnInit() {
    }

}

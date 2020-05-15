import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
    selector: 'app-notification-list',
    templateUrl: './notification-list.component.html'
})
export class NotificationListComponent implements OnInit {
    @HostBinding('class.notification-list') private _hostClass = true;

    constructor() { }

    ngOnInit() {
    }

}

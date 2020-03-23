import {
    Component,
    OnInit,
    HostBinding,
    Input
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'widget-projection',
    templateUrl: './widget-projection.component.html'
})
export class WidgetProjectionComponent implements OnInit {

    @HostBinding('class.widget-projection') private hostClass = true;

    @Input() title: any;

    constructor() { }

    ngOnInit() {
    }

}

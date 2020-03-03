import {
    Component,
    OnInit,
    HostBinding,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dbs-json',
    templateUrl: './dbs-json.component.html',
    styleUrls: ['./dbs-json.component.scss']
})
export class DbsJsonComponent implements OnInit {

    @HostBinding('class.dbs-json-component') private _hostClass = true;
    @HostBinding('class.dbs-settings-tab') private _tabClass = true;

    /** Inputs */
    @Input() dbData: any = {};

    /** Outputs */
    @Output() dataUpdated: any = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}

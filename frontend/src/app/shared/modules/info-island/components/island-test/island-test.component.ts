import { Component, OnInit, Input, Output, Inject } from '@angular/core';
import { ISLAND_DATA } from '../../info-island.tokens';

@Component({
// tslint:disable-next-line: component-selector
    selector: 'island-test',
    templateUrl: './island-test.component.html',
    styleUrls: []
})
export class IslandTestComponent implements OnInit {

    @Input() data: any = {};

    constructor(
        @Inject(ISLAND_DATA) private _data: any // injection as private, to give you opportunity to do whatever you want first
    ) {
        if (_data) {
            this.data = _data;
        }
    }

    ngOnInit() {
    }

}

import { Component, OnInit, HostBinding, Output, EventEmitter, Input } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'keypad',
    templateUrl: './keypad.component.html',
    styleUrls: []
})
export class KeypadComponent implements OnInit {
    @HostBinding('class.dtp-keypad') private _hostClass = true;

    @Output() amountSelected = new EventEmitter<String>();
    // tslint:disable-next-line:no-inferrable-types
    @Input() disableKeysAt3: boolean = false;
    // tslint:disable-next-line:no-inferrable-types
    @Input() disableKeysAt9: boolean = false;

    @Input() preset: any;

    constructor() { }

    ngOnInit() {
    }

    clicked(amount: string) {
        this.amountSelected.emit(amount);
    }
}

import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnInit,
    Output, ViewChild, ElementRef
} from '@angular/core';

import { NavigatorPanelComponent } from '../navigator-panel/navigator-panel.component';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'settings-panel',
    templateUrl: './settings-panel.component.html'
})
export class SettingsPanelComponent implements OnInit {
    @HostBinding('class.settings-navigator') private _hostClass = true;

    @ViewChild(NavigatorPanelComponent) private navPanel: NavigatorPanelComponent;

    @Input() activeNavSection: any = '';
    @Input() drawerMode: any = 'over';

    @Output() toggleDrawer: EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    closeDrawer() {
        this.toggleDrawer.emit({
            closeNavigator: true
        });
    }

    toggleDrawerMode() {
        // console.log('TOGGLE 1');
        this.toggleDrawer.emit(true);
    }

}

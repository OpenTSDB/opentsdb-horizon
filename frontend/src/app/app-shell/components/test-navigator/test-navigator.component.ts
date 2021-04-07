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
    // tslint:disable-next-line:component-selector
    selector: 'test-navigator',
    templateUrl: './test-navigator.component.html',
    styleUrls: ['./test-navigator.component.scss']
})
export class TestNavigatorComponent implements OnInit {

    @HostBinding('class.test-navigator') private _hostClass = true;

    @ViewChild(NavigatorPanelComponent) private navPanel: NavigatorPanelComponent;

    @Input() activeNavSection: any = '';
    @Input() drawerMode: any = 'over';

    @Input() panelTitle: any = '';
    @Input() panelText: any = '';

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
        this.toggleDrawer.emit(true);
    }

}

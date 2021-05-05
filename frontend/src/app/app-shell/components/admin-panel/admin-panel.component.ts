import { Component, OnInit, HostBinding, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NavigatorPanelComponent } from '../navigator-panel/navigator-panel.component';

@Component({
  selector: 'admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
  host: {
      '[class.admin-navigator]': 'true',
      '[class.panel-content]': 'true'
  }
})
export class AdminPanelComponent implements OnInit {
    //@HostBinding('class.admin-navigator') private _hostClass = true;

    @ViewChild(NavigatorPanelComponent) private navPanel: NavigatorPanelComponent;

    @Input() activeNavSection: any = '';
    @Input() drawerMode: any = 'over';
    @Input() yamasMember: boolean = false;

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

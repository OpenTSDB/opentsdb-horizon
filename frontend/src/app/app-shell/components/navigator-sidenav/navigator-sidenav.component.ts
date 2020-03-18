import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    HostBinding
} from '@angular/core';

@Component({
    selector: 'app-navigator-sidenav',
    templateUrl: './navigator-sidenav.component.html',
    styleUrls: []
})
export class NavigatorSidenavComponent implements OnInit {

    @HostBinding('class.app-navigator-sidenav') private _hostClass = true;

    @Input() yamasMember: boolean = false;
    @Input() activeNav: any = {};
    @Output() activeNavChange: EventEmitter<any> = new EventEmitter();

    // tslint:disable-next-line:no-inferrable-types
    @Input() drawerOpen: boolean = false;

    // tslint:disable-next-line:no-inferrable-types
    @Input() mediaQuery: string = '';

    navItems: object[] = [
        { section: 'dashboard',         label: 'Dashboards',        icon: 'd-dashboard-tile' },
        // { section: 'metric-explorer',   label: 'Metric Explorer',   icon: 'd-chart-line' },
        { section: 'alerts',            label: 'Alerts',            icon: 'd-notification', spacerAfter: true},
        /*{ section: 'status',          label: 'Status',            icon: 'd-heart-health' },
        { section: 'annotations',       label: 'Annotations',       icon: 'd-flag' },
        { section: 'admin',             label: 'Admin',             icon: 'd-user-secure', requiresUserAdmin: true },
        { section: 'favorites',         label: 'Favorites',         icon: 'd-star' },
        { section: 'namespaces',        label: 'Namespaces',        icon: 'd-briefcase' },
        { section: 'resources',         label: 'Resources',         icon: 'd-information-circle', spacerAfter: true },
        { section: 'test',              label: 'Toggle Test',       icon: 'd-setting' }*/
        { section: 'settings',          label: 'Settings',          icon: 'd-setting' },
        { section: 'admin',             label: 'Admin',             icon: 'd-user-secure', requiresUserAdmin: true }
    ];

    constructor() { }

    ngOnInit() {}

    navigationClicked(obj: any) {
        if (this.activeNav === obj) {
            this.activeNav = { reset: true };
        } else {
            this.activeNav = obj;
        }
        this.activeNavChange.emit(this.activeNav);
    }

    resetActiveNav() {
        this.activeNav = {};
    }

}

import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    HostBinding
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-navigator-sidenav',
    templateUrl: './navigator-sidenav.component.html',
    styleUrls: [ './navigator-sidenav.component.scss' ]
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

    navItems: any[] = [
        { section: 'dashboard', label: 'Dashboards', icon: 'd-dashboard-tile' },
        // { section: 'metric-explorer',   label: 'Metric Explorer',   icon: 'd-chart-line' },
        { section: 'alerts',            label: 'Alerts',            icon: 'd-notification'},
        // { section: 'test',              label: 'Toggle Test',       icon: 'd-setting' },
        { section: 'settings',          label: 'Settings',          icon: 'd-setting', spacerAfter: true},
        { section: 'admin',             label: 'Admin',             icon: 'd-user-secure', requiresUserAdmin: true }
    ];

    constructor(
        private router: Router
    ) { }

    ngOnInit() { }

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

    gotoMain() {
        this.router.navigate(['/main']);
    }

}

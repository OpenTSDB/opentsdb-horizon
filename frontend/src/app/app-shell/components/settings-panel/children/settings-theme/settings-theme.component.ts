import { Component, OnInit, HostBinding } from '@angular/core';
import { ThemeService } from '../../../../services/theme.service';
import { take } from 'rxjs/operators';
import { ConsoleService } from '../../../../../core/services/console.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'settings-theme',
    templateUrl: './settings-theme.component.html'
})
export class SettingsThemeComponent implements OnInit {

    @HostBinding('class.settings-theme') private _hostClass = true;

    themeOptions: any[] = [];

    activeTheme: string = '';

    get activeThemeLabel(): string {
        const idx = this.themeOptions.findIndex(item => item.value === this.activeTheme);
        return (idx >= 0) ? this.themeOptions[idx].label : '';
    }

    constructor(
        private themeService: ThemeService,
        private console: ConsoleService
    ) {
        this.themeOptions = ThemeService.themeOptions;
        this.themeService.getActiveTheme().pipe(take(1)).subscribe( theme => {
            this.activeTheme = theme;
        });
    }

    ngOnInit() {}

    selectTheme(item) {
        this.activeTheme = item.value;
        this.themeService.setActiveTheme(item.value);
    }

}

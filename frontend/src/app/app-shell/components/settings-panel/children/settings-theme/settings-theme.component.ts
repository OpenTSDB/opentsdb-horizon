import { Component, OnInit, HostBinding } from '@angular/core';
import { ThemeService } from '../../../../services/theme.service';
import { take } from 'rxjs/operators';
import { LoggerService } from '../../../../../core/services/logger.service';

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
        private logger: LoggerService
    ) {
        this.themeOptions = ThemeService.themeOptions;
        this.themeService.getActiveTheme().pipe(take(1)).subscribe( theme => {
            this.activeTheme = theme;
        });
    }

    ngOnInit() {
        this.logger.log('SETTING THEMES', {
            options: this.themeOptions,
            active: this.activeTheme
        });
    }

    selectTheme(item) {
        this.activeTheme = item.value;
        this.themeService.setActiveTheme(item.value);
    }

}

import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LocalStorageService } from '../../../../core/services/local-storage.service';

import styles from '../../../../../scss/app-styles.scss';
import { pairwise, startWith } from 'rxjs/operators';

const DEFAULT_THEME = 'horizon';
const DEFAULT_THEME_VARIANT = 'light';

const THEME_OPTIONS: any[] = [
    /* {
        label: 'Default',
        value: 'default'
    },*/
    {
        label: 'Horizon',
        value: 'horizon',
    },
    /* {
        label: 'Vespa',
        value: 'vespa'
    }*/
];

const THEME_VARIANT_OPTIONS: any[] = [
    {
        label: 'Light',
        value: 'light',
    },
    {
        label: 'Dark',
        value: 'dark',
    },
];

@Injectable({
    providedIn: 'root',
})
export class ThemeService implements OnInit, OnDestroy {
    private _theme: any = new BehaviorSubject('');
    private _variant: any = new BehaviorSubject('');

    private _themeClass: any;
    private _variantClass: any;

    static get themeOptions(): any[] {
        return THEME_OPTIONS;
    }

    static get themeVariantOptions(): any[] {
        return THEME_VARIANT_OPTIONS;
    }

    get themeClass(): string {
        return this._themeClass;
    }

    get variantClass(): string {
        return this._variantClass;
    }

    private DocumentBody: HTMLElement;

    private subscription: Subscription = new Subscription();

    constructor(
        private overlayContainer: OverlayContainer,
        private localStorage$: LocalStorageService,
    ) {
        const OC = this.overlayContainer.getContainerElement();
        this.DocumentBody = OC.closest('body');

        if (
            this.localStorage$.hasKey('settings.theme') &&
            this.localStorage$.hasKey('settings.variant')
        ) {
            const themeCheck = this.localStorage$.getLocal('settings.theme');
            const variantCheck =
                this.localStorage$.getLocal('settings.variant');
            // console.log('%cTHEME/VARIANT CHECK', 'background: red; color: white; padding: 2px;', themeCheck, variantCheck);
            this.setActiveTheme(
                this.themeOption(this.localStorage$.getLocal('settings.theme'))
                    .value,
                themeCheck === 'default' ? false : true,
            );
            this.setActiveVariant(
                this.variantOption(
                    this.localStorage$.getLocal('settings.variant'),
                ).value,
                true,
            );
        } else {
            this.setActiveTheme(DEFAULT_THEME);
            this.setActiveVariant(DEFAULT_THEME_VARIANT);
        }
    }

    ngOnInit() {
        // do nothing
    }

    public getActiveTheme() {
        return this._theme.asObservable();
    }

    public getActiveVariant() {
        return this._variant.asObservable();
    }

    public getThemeType() {
        return this.getActiveVariant();
    }

    public setActiveTheme($theme: string, ignoreLocal: boolean = false) {
        // console.log('%cSET ACTIVE THEME', 'color: white; background: purple;', $theme );
        if (!ignoreLocal) {
            this.localStorage$.setLocal('settings.theme', $theme);
        }

        if (this._themeClass !== 'null') {
            const oldThemeClass = this._themeClass;
            this.DocumentBody.classList.remove(oldThemeClass);
        }

        this._theme.next($theme);
        this._themeClass = $theme + '-theme';

        this.DocumentBody.classList.add(this.themeClass);

        // NOTE: this is for backwards compatibility.
        // TODO: remove once all styles are refactored for using class on body
        this.DocumentBody.setAttribute('theme', $theme);
    }

    public setActiveVariant($variant: string, ignoreLocal: boolean = false) {
        // console.log('%cSET ACTIVE VARIANT', 'color: white; background: purple;', $variant );
        if (!ignoreLocal) {
            this.localStorage$.setLocal('settings.variant', $variant);
        }

        if (this._variantClass !== 'null') {
            const oldVariantClass = this._variantClass;
            this.DocumentBody.classList.remove(oldVariantClass);
        }
        this._variant.next($variant);
        this._variantClass = $variant + '-variant';

        this.DocumentBody.classList.add(this.variantClass);

        // NOTE: this is for backwards compatibility.
        // TODO: remove once all styles are refactored for using class on body
        this.DocumentBody.setAttribute('variant', $variant);
    }

    private themeOption(name: any) {
        // console.log('%cTHEME OPTION', 'color: white; background: purple;', name );
        if (name === 'default') {
            name = 'horizon';
        }
        let idx = THEME_OPTIONS.findIndex((item) => item.value === name);
        if (idx === -1) {
            // can't find... use default
            idx = THEME_OPTIONS.findIndex((item) => item.value === 'default');
        }
        return THEME_OPTIONS[idx];
    }

    private variantOption(name: any) {
        // console.log('%cVARIANT OPTION', 'color: white; background: purple;', name );
        if (name !== 'light' && name !== 'dark') {
            name = 'light';
        }
        let idx = THEME_VARIANT_OPTIONS.findIndex(
            (item) => item.value === name,
        );
        if (idx === -1) {
            // can't find... use default (aka light)
            idx = THEME_VARIANT_OPTIONS.findIndex(
                (item) => item.value === 'light',
            );
        }
        return THEME_VARIANT_OPTIONS[idx];
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}

import { Injectable } from '@angular/core';
import { AppConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class ConsoleService {

    constructor(private appConfig: AppConfigService) { }

    consoleOutput(type: string, label: string, params?: any) {
        if (!this.appConfig.getConfig().production) {
            let color;
            let colorInverse = '#ffffff';

            switch (type) {
                case 'api':
                    color = '#800080'; // purple
                    break;
                case 'state':
                case 'action':
                    color = '#008b8b'; // darkCyan
                    break;
                case 'success':
                    color = '#008000'; // green
                    break;
                case 'ng':
                    color = '#64b5f6'; // angular blue
                    colorInverse = '#c51162'; // angular red
                    break;
                case 'log':
                    color = '#1e90ff'; // dodgerBlue
                    break;
                case 'intercom':
                    color = '#006064'; // dark teal
                    break;
                case 'event':
                    color = '#6A5ACD'; // slate blue
                    colorInverse = '#ADFF2F'; // green yellow
                    break;
                default:
                    color = '#ffa500'; // orange
                    colorInverse = 'black';
                    break;
            }

            if (params) {
                console.group(
                    '%c' + type.toUpperCase() + '%c' + label,
                    'color: ' + colorInverse + '; background-color: ' + color + '; padding: 6px 8px; font-weight: bold;',
                    'color: black; padding: 4px 8px; font-weight: bold; border: 2px solid ' + color + ';'
                );
                if (type === 'log' || type === 'ng' || type === 'intercom') {
                    const keys = Object.keys(params);
                    for (const key of keys) {
                        console.log('%c' + key, 'font-weight: bold;', params[key]);
                    }
                 } else {
                    console.log('%cParams', 'font-weight: bold;', params);
                }
                console.groupEnd();
            } else {
                console.log(
                    '%c' + type.toUpperCase() + '%c' + label,
                    'color: ' + colorInverse + '; background-color: ' + color + '; padding: 6px 8px; font-weight: bold;',
                    'color: black; padding: 4px 8px; font-weight: bold; border: 2px solid ' + color + ';'
                );
            }
        }
    }

    api(label: string, params?: any) {
        this.consoleOutput('api', label, params);
    }

    ng(label: string, params?: any) {
        this.consoleOutput('ng', label, params);
    }

    log(label: string, params?: any) {
        this.consoleOutput('log', label, params);
    }

    state(label: string, params?: any) {
        this.consoleOutput('state', label, params);
    }

    action(label: string, params?: any) {
        this.consoleOutput('action', label, params);
    }

    success(label: string, params?: any) {
        this.consoleOutput('success', label, params);
    }

    intercom(label: string, params?: any) {
        this.consoleOutput('intercom', label, params);
    }

    event(label: string, params?: any) {
        this.consoleOutput('event', label, params);
    }

    error(label: string, errorMsg: any) {
        console.group(
            '%cERROR%c' + label,
            'color: #ffffff; background-color: #ff0000; padding: 4px 8px; font-weight: bold;',
            'color: #ff0000; padding: 4px 8px; font-weight: bold'
        );
        console.log('%cErrorMsg', 'font-weight: bold;', errorMsg);
        console.groupEnd();
    }

}

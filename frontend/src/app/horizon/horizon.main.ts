import { HorizonModule } from './horizon.module';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../../environments/environment';

if (environment.production) {
    enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(HorizonModule);
bootstrap().catch((err) => console.error(err));

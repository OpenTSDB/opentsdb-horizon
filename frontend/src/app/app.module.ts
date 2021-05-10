import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';

// components
import { AppComponent } from './app.component';

// custom modules
import { CoreModule } from './core/core.module';
import { MaterialModule } from './shared/modules/material/material.module';
import { AppRoutingModule } from './app-routing.module';

// store
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';
// import { AppState } from './store/app.state';
// our
import { AdminModule } from './admin/admin.module';
import { AdhocModule } from './adhoc/adhoc.module';
import { UniversalDataTooltipModule } from './shared/modules/universal-data-tooltip/universal-data-tooltip.module';

import { AuthInterceptor } from './core/http/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { AuthState } from './shared/state/auth.state';

import { AppShellModule } from './app-shell/app-shell.module';
import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

@Injectable()
export class CustomHammerConfig extends HammerGestureConfig {
  buildHammer(elem: HTMLElement) {
    let mconf = new Hammer(elem, {
      touchAction: 'auto'
    });
    return mconf;
  }
}

export class CustomUrlSerializer implements UrlSerializer {
  private _defaultUrlSerializer: DefaultUrlSerializer = new DefaultUrlSerializer();

  parse(url: string): UrlTree {
     // Encode parentheses
     url = url.replace(/\(/g, '%28').replace(/\)/g, '%29');
     // Use the default serializer.
     return this._defaultUrlSerializer.parse(url)
  }

  serialize(tree: UrlTree): string {
     return this._defaultUrlSerializer.serialize(tree).replace(/%28/g, '(').replace(/%29/g, ')');
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    MaterialModule,
    // ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule,
    NgxsModule.forRoot([AuthState], { developmentMode: !environment.production }),
    NgxsLoggerPluginModule.forRoot(),
    AdminModule,
    AdhocModule,
    AppShellModule,
    UniversalDataTooltipModule.forRoot()
  ],
  providers: [
    AuthService,
    /*{
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true
    }*/
    {
      provide: UrlSerializer,
      useClass: CustomUrlSerializer
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: CustomHammerConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

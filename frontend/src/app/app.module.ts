import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

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
  ],
  providers: [
    AuthService,
    /*{
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true
    }*/
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

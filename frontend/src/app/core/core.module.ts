import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LoginExpireDialogComponent } from './components/login-expire-dialog/login-expire-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: [
    LoginExpireDialogComponent
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    LoginExpireDialogComponent
  ],
  providers: [
    // set in service itself already
  ],
  entryComponents: [
    LoginExpireDialogComponent
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(`CoreModule has already been loaded. Import Core modules in the AppModule only.`);
    }
  }
}

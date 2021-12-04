import { BrowserModule } from '@angular/platform-browser';
import { NgModule, DoBootstrap, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorizonComponent } from './horizon.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule
  ],
  declarations: [HorizonComponent],
  entryComponents: [HorizonComponent],
  providers: []
})
export class HorizonModule implements DoBootstrap {
  
  constructor( private injector: Injector) {
    const el = createCustomElement(HorizonComponent, { injector : this.injector});
    customElements.define('horizon-chart', el);
  }
  ngDoBootstrap() {}
}

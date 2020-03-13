import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartjsDirective } from './components/chartjs.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [ChartjsDirective],
  exports: [ChartjsDirective]
})
export class ChartjsModule { }

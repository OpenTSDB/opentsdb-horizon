import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DygraphsChartDirective } from './components/dygraphs-chart.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [DygraphsChartDirective],
  exports: [DygraphsChartDirective]
})
export class DygraphsModule { }

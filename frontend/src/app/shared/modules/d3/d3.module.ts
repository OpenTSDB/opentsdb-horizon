import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3PieChartDirective } from './components/d3-pie-chart.directive';
import { D3BarChartDirective } from './components/d3-bar-chart.directive';

@NgModule({
  declarations: [D3PieChartDirective, D3BarChartDirective],
  imports: [
    CommonModule
  ],
  exports: [D3PieChartDirective, D3BarChartDirective]
})
export class D3Module { }

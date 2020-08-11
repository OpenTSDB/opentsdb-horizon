import { D3BarChartDirective } from './d3-bar-chart.directive';

describe('D3BarChartDirective', () => {
  it('should create an instance', () => {
    const directive = new D3BarChartDirective(null,null, null, null);
    expect(directive).toBeTruthy();
  });
});

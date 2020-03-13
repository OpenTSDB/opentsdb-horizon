import { ChartjsModule } from './chartjs.module';

describe('ChartjsModule', () => {
  let chartjsModule: ChartjsModule;

  beforeEach(() => {
    chartjsModule = new ChartjsModule();
  });

  it('should create an instance', () => {
    expect(chartjsModule).toBeTruthy();
  });
});

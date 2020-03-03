import { DynamicWidgetsModule } from './dynamic-widgets.module';

describe('DynamicWidgetsModule', () => {
  let dynamicWidgetsModule: DynamicWidgetsModule;

  beforeEach(() => {
    dynamicWidgetsModule = new DynamicWidgetsModule();
  });

  it('should create an instance', () => {
    expect(dynamicWidgetsModule).toBeTruthy();
  });
});

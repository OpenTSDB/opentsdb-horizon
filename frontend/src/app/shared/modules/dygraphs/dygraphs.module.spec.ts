import { DygraphsModule } from './dygraphs.module';

describe('DygraphsModule', () => {
  let dygraphsModule: DygraphsModule;

  beforeEach(() => {
    dygraphsModule = new DygraphsModule();
  });

  it('should create an instance', () => {
    expect(dygraphsModule).toBeTruthy();
  });
});

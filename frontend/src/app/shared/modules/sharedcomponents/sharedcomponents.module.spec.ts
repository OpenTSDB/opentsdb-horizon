import { SharedcomponentsModule } from './sharedcomponents.module';

describe('SharedcomponentsModule', () => {
  let sharedcomponentsModule: SharedcomponentsModule;

  beforeEach(() => {
    sharedcomponentsModule = new SharedcomponentsModule();
  });

  it('should create an instance', () => {
    expect(sharedcomponentsModule).toBeTruthy();
  });
});

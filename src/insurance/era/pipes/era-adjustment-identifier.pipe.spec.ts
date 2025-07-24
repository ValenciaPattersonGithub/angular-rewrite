import { EraAdjustmentIdentifierPipe } from './era-adjustment-identifier.pipe';

describe('EraAdjustmentIdentifierPipe', () => {
  it('create an instance', () => {
    const pipe = new EraAdjustmentIdentifierPipe();

    expect(pipe).toBeTruthy();
  });
  it('returns second portion of identifier if it exists', () => {
    expect(new EraAdjustmentIdentifierPipe().transform('12:what')).toEqual('what');
  });
  it('returns nothing if second portion doesn\t exist', () => {
    expect(new EraAdjustmentIdentifierPipe().transform('12')).toEqual('');
  });
  it('returns nothing if undefined', () => {
    expect(new EraAdjustmentIdentifierPipe().transform(undefined)).toEqual(undefined);
  });
});

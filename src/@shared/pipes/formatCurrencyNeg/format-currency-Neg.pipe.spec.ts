import { formatCurrencyIfNegPipe } from './format-currency-Neg.pipe';

describe('formatCurrencyIfNegPipe', () => {
  it('create an instance', () => {
    const pipe = new formatCurrencyIfNegPipe();
    expect(pipe).toBeTruthy();
  });
});

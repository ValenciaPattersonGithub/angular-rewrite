import { ZipCodePipe } from './zip-code.pipe';
describe('ZipCodePipe', () => {
  it('create an instance', () => {
    const pipe = new ZipCodePipe();
    expect(pipe).toBeTruthy();
  });
  it('should handle formatting for 9 digit zip code', () => {
    const pipe = new ZipCodePipe();
    const formattedValue = pipe.transform('235011254');
    expect(formattedValue).toEqual('23501-1254');
  });
  it('should handle formatting for 5 digit zip code', () => {
    const pipe = new ZipCodePipe();
    const formattedValue = pipe.transform('23501');
    expect(formattedValue).toEqual('23501');
  });
  it('should handle formatting for other lengths of zip code', () => {
    const pipe = new ZipCodePipe();
    const formattedValue = pipe.transform('2350112');
    expect(formattedValue).toEqual('23501-12');
  });
});
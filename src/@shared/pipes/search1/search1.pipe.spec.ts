import { Search1Pipe } from './search1.pipe';
const mockuparray = [{
  PaymentTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false,
  Description: 'AccoountPaymentType', PaymentTypeCategory: 1, IsActive: true
},
{
  PaymentTypeId: '00000000-0000-0000-0000-000000000002', IsSystemType: false,
  Description: 'InsurancePaymentType1', PaymentTypeCategory: 2, IsActive: false
}]
describe('Search1Pipe', () => {
  it('create an instance', () => {
    const pipe = new Search1Pipe();
    expect(pipe).toBeTruthy();
  });

  it('providing array and filter as undefind returns array', () => {
    const pipe = new Search1Pipe();
    expect(pipe.transform(mockuparray, '')).toEqual(mockuparray);
  });

  it('providing value as string returns string', () => {
    const pipe = new Search1Pipe();
    expect(pipe.transform('NonArray', '1')).toEqual('NonArray');
  });

  it('providing array and filter as value with key and value returns array', () => {
    const pipe = new Search1Pipe();
    const [first] = mockuparray;
    expect(pipe.transform(mockuparray, { Description: 'AccoountPaymentType' })).toEqual([first]);
  });

  it('providing empty filter with valid array', () => {
    const pipe = new Search1Pipe();
    const [first] = mockuparray;
    expect(pipe.transform(mockuparray, { Description: null })).toEqual(mockuparray);
  });

});

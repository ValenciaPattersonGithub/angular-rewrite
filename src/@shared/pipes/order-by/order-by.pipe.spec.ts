import { OrderByPipe } from './order-by.pipe';
const mockuparray = [{
  PaymentTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false,
  Description: 'AccoountPaymentType', PaymentTypeCategory: 1, IsActive: true
},
{
  PaymentTypeId: '00000000-0000-0000-0000-000000000002', IsSystemType: false,
  Description: 'InsurancePaymentType1', PaymentTypeCategory: 2, IsActive: false
}];

const mockupReversearray = [
  {
    PaymentTypeId: '00000000-0000-0000-0000-000000000002', IsSystemType: false,
    Description: 'InsurancePaymentType1', PaymentTypeCategory: 2, IsActive: false
  },
  {
    PaymentTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false,
    Description: 'AccoountPaymentType', PaymentTypeCategory: 1, IsActive: true
  }
];

const mockNumberArray = [
  {
    PaymentTypeId: '00000000-0000-0000-0000-000000000002', IsSystemType: false,
    Description: 4, PaymentTypeCategory: 2, IsActive: false
  },
  {
    PaymentTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false,
    Description: 5, PaymentTypeCategory: 1, IsActive: true
  }
];
const mockDescNumberArray = [
  {
    PaymentTypeId: '00000000-0000-0000-0000-000000000002', IsSystemType: false,
    Description: 5, PaymentTypeCategory: 2, IsActive: false
  },
  {
    PaymentTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false,
    Description: 4, PaymentTypeCategory: 1, IsActive: true
  }
];
describe('OrderBy Pipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByPipe();
    expect(pipe).toBeTruthy();
  });

  it('providing array and filter as undefind returns array', () => {
    const pipe = new OrderByPipe();
    expect(pipe.transform(mockuparray, '')).toEqual(mockuparray);
  });


  it('providing array and sort Direction as descending', () => {
    const pipe = new OrderByPipe();
    expect(pipe.transform(mockuparray, { sortColumnName: 'Description', sortDirection: -1 }))
      .toEqual(mockupReversearray);
  });
  it('providing array and sort Direction as ascending', () => {
    const pipe = new OrderByPipe();
    expect(pipe.transform(mockuparray, { sortColumnName: 'Description', sortDirection: -1 })).toEqual(mockuparray);
  });

  it('providing numaric array and sort Direction as ascending', () => {
    const pipe = new OrderByPipe();
    expect(pipe.transform(mockNumberArray, { sortColumnName: 'Description', sortDirection: -1 })).toEqual(mockNumberArray);
  });
  it('providing decending numaric array and sort Direction as ascending', () => {
    const pipe = new OrderByPipe();
    expect(pipe.transform(mockDescNumberArray, { sortColumnName: 'Description', sortDirection: -1 }))
    .toEqual(mockDescNumberArray.reverse());
  });

});

import { ClaimStatusTextPipe } from './claim-status-text.pipe';

describe('ClaimStatusTextPipe', () => {
  let pipe = new ClaimStatusTextPipe();
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('should return properly with status 1', () => {
    expect(pipe.transform(1)).toEqual('Unsubmitted Paper');
  });
  it('should return properly with status 2', () => {
    expect(pipe.transform(2)).toEqual('Printed');
  });
  it('should return properly with status 3', () => {
    expect(pipe.transform(3)).toEqual('Unsubmitted Electronic');
  });
  it('should return properly with status 4', () => {
    expect(pipe.transform(4)).toEqual('In Process');
  });
  it('should return properly with status 5', () => {
    expect(pipe.transform(5)).toEqual('Accepted Electronic');
  });
  it('should return properly with status 6', () => {
    expect(pipe.transform(6)).toEqual('Rejected');
  });
  it('should return properly with status 7', () => {
    expect(pipe.transform(7)).toEqual('Closed');
  });
  it('should return properly with status 8', () => {
    expect(pipe.transform(8)).toEqual('Closed - Paid');
  });
  it('should return properly with status 9', () => {
    expect(pipe.transform(9)).toEqual('In Process');
  });
  it('should return properly with default', () => {
    expect(pipe.transform(99)).toEqual('');
  });
});

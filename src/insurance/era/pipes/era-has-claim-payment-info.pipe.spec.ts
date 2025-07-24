import { EraHasClaimPaymentInfoPipe } from './era-has-claim-payment-info.pipe';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

describe('EraHasClaimPaymentInfoPipe', () => {
  it('create an instance', () => {
    const pipe = new EraHasClaimPaymentInfoPipe();

    expect(pipe).toBeTruthy();
  });
  it('should return true when PatientLastName', function () {
    let claim:EraClaimPaymentInfo = { PatientLastName: "value" };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when PatientFirstName', function () {
    let claim:EraClaimPaymentInfo = { PatientFirstName: "value" };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when PatientMiddleName', function () {
    let claim:EraClaimPaymentInfo = { PatientMiddleName: "value" };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when PatientNameSuffix', function () {
    let claim:EraClaimPaymentInfo = { PatientNameSuffix: "value" };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when StatementDates have value', function () {
    let claim:EraClaimPaymentInfo = { StatementDates: [{ Date: '', DateTimeQualifier: '223' }] };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when PatientId', function () {
    let claim:EraClaimPaymentInfo = { PatientId: 'value'};

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when TotalClaimChargeAmount', function () {
    let claim:EraClaimPaymentInfo = { TotalClaimChargeAmount: 12 };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when PayerClaimControlNumber', function () {
    let claim:EraClaimPaymentInfo = { PayerClaimControlNumber: "value" };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when ClaimPaymentAmount', function () {
    let claim:EraClaimPaymentInfo = { ClaimPaymentAmount: 12 };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when ClaimStatusCode', function () {
    let claim:EraClaimPaymentInfo = { ClaimStatusCode: "value" };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when TreatingDentistId', function () {
    let claim:EraClaimPaymentInfo = { TreatingDentistId: "value" };

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return undefined when none', function () {
    let claim:EraClaimPaymentInfo = {};

    expect(new EraHasClaimPaymentInfoPipe().transform(claim)).toEqual(undefined);
  });
});

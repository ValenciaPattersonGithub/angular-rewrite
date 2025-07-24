import { EraHasOutpatientAdjudicationInfoPipe } from './era-has-outpatient-adjudication-info.pipe';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

describe('EraHasOutpatientAdjudicationInfoPipe', () => {
  it('create an instance', () => {
    const pipe = new EraHasOutpatientAdjudicationInfoPipe();

    expect(pipe).toBeTruthy();
  });
  it('should return true when OutpatientReimbursementRate', function () {
    let claim:EraClaimPaymentInfo = { OutpatientReimbursementRate: 1 };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when OutpatientClaimHCSPCSPayableAmount', function () {
    let claim:EraClaimPaymentInfo = { OutpatientClaimHCSPCSPayableAmount: 1 };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when OutpatientClaimPaymentRemarkCode1', function () {
    let claim:EraClaimPaymentInfo = { OutpatientClaimPaymentRemarkCode1: '1' };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when OutpatientClaimPaymentRemarkCode2', function () {
    let claim:EraClaimPaymentInfo = { OutpatientClaimPaymentRemarkCode2: '1' };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when OutpatientClaimPaymentRemarkCode3', function () {
    let claim:EraClaimPaymentInfo = { OutpatientClaimPaymentRemarkCode3: '1' };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when OutpatientClaimPaymentRemarkCode4', function () {
    let claim:EraClaimPaymentInfo = { OutpatientClaimPaymentRemarkCode4: '1' };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when OutpatientClaimPaymentRemarkCode5', function () {
    let claim:EraClaimPaymentInfo = { OutpatientClaimPaymentRemarkCode5: '1' };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when OutpatientClaimESRDPaymentAmount', function () {
    let claim:EraClaimPaymentInfo = { OutpatientClaimESRDPaymentAmount: 1 };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when OutpatientNonpayableProfessionalComponentAmount', function () {
    let claim:EraClaimPaymentInfo = { OutpatientNonpayableProfessionalComponentAmount: 1 };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return undefined when none', function () {
    let claim:EraClaimPaymentInfo = { };

    expect(new EraHasOutpatientAdjudicationInfoPipe().transform(claim)).toEqual(undefined);
  });

});

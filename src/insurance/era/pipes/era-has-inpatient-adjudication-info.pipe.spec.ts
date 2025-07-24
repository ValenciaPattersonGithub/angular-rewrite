import { EraHasInpatientAdjudicationInfoPipe } from './era-has-inpatient-adjudication-info.pipe';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

describe('EraHasInpatientAdjudicationInfoPipe', () => {
  it('create an instance', () => {
    const pipe = new EraHasInpatientAdjudicationInfoPipe();

    expect(pipe).toBeTruthy();
  });
  it('should return true when InpatientCoveredDaysOrVisitsCount', function () {
    let claim:EraClaimPaymentInfo = { InpatientCoveredDaysOrVisitsCount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientPPSOperatingOutlierAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientPPSOperatingOutlierAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientLifetimePsychiatricDaysCount', function () {
    let claim:EraClaimPaymentInfo = { InpatientLifetimePsychiatricDaysCount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimDRGAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimDRGAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimPaymentRemarkCode', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimPaymentRemarkCode: '1' };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimDisproportionateShareAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimDisproportionateShareAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimMSPPassthroughAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimMSPPassthroughAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimPPSCapitalAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimPPSCapitalAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientPPSCapitalFSPDRGAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientPPSCapitalFSPDRGAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientPPSCapitalHSPDRGAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientPPSCapitalHSPDRGAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientPPSCapitalDSHDRGAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientPPSCapitalDSHDRGAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientOldCapitalAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientOldCapitalAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientPPSCapitalIMEAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientPPSCapitalIMEAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientPPSOperatingHospitalSpecificDRGAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientPPSOperatingHospitalSpecificDRGAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientCostReportDayCount', function () {
    let claim:EraClaimPaymentInfo = { InpatientCostReportDayCount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientPPSOperatingFederalSpecificDRGAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientPPSOperatingFederalSpecificDRGAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimPPSCapitalOutlierAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimPPSCapitalOutlierAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimIndirectTeachingAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimIndirectTeachingAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientNonpayableProfessionalComponentAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientNonpayableProfessionalComponentAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimPaymentRemarkCode1', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimPaymentRemarkCode1: '1' };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimPaymentRemarkCode2', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimPaymentRemarkCode2: '1' };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimPaymentRemarkCode3', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimPaymentRemarkCode3: '1' };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientClaimPaymentRemarkCode4', function () {
    let claim:EraClaimPaymentInfo = { InpatientClaimPaymentRemarkCode4: '1' };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return true when InpatientPPSCapitalExceptionAmount', function () {
    let claim:EraClaimPaymentInfo = { InpatientPPSCapitalExceptionAmount: 1 };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).not.toEqual(undefined);
  });
  it('should return undefined when none', function () {
    let claim:EraClaimPaymentInfo = { };

    expect(new EraHasInpatientAdjudicationInfoPipe().transform(claim)).toEqual(undefined);
  });
});

import { EraCorrectedInsuredNamePipe } from './era-corrected-insured-name.pipe';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

describe('EraCorrectedInsuredNamePipe', () => {
  it('create an instance', () => {
    const pipe = new EraCorrectedInsuredNamePipe();

    expect(pipe).toBeTruthy();
  });
  it('should return correctly formatted payee name', function () {
    let claim:EraClaimPaymentInfo = { CorrectedFirstName: "John", CorrectedMiddleName: "A", CorrectedLastName: "Doe", CorrectedNameSuffix: "Jr" };
    var result = new EraCorrectedInsuredNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, John A");
  });

  it('should return correctly formatted payee name when missing last name', function () {
    let claim:EraClaimPaymentInfo = { CorrectedFirstName: "John", CorrectedMiddleName: "A", CorrectedNameSuffix: "Jr" };
    var result = new EraCorrectedInsuredNamePipe().transform(claim);

    expect(result).toEqual("Jr, John A");
  });

  it('should return correctly formatted payee name when missing suffix', function () {
    let claim:EraClaimPaymentInfo = { CorrectedFirstName: "John", CorrectedMiddleName: "A", CorrectedLastName: "Doe" };
    var result = new EraCorrectedInsuredNamePipe().transform(claim);

    expect(result).toEqual("Doe, John A");
  });

  it('should return correctly formatted payee name when missing first name', function () {
    let claim:EraClaimPaymentInfo = {  CorrectedMiddleName: "A", CorrectedLastName: "Doe", CorrectedNameSuffix: "Jr" };
    var result = new EraCorrectedInsuredNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, A");
  });

  it('should return correctly formatted payee name when missing middle name', function () {
    let claim:EraClaimPaymentInfo = { CorrectedFirstName: "John", CorrectedLastName: "Doe", CorrectedNameSuffix: "Jr" };
    var result = new EraCorrectedInsuredNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, John");
  }); 
});

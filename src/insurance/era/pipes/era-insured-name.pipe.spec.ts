import { EraInsuredNamePipe } from './era-insured-name.pipe';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

describe('EraPolicyHolderNamePipe', () => {
  it('create an instance', () => {
    const pipe = new EraInsuredNamePipe();

    expect(pipe).toBeTruthy();
  });
  it('should return correctly formatted payee name', function () {
    let claim:EraClaimPaymentInfo = { PolicyHolderFirstName: "John", PolicyHolderMiddleName: "A", PolicyHolderLastName: "Doe", PolicyHolderNameSuffix: "Jr" };
    var result = new EraInsuredNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, John A");
  });

  it('should return correctly formatted payee name when missing last name', function () {
    let claim:EraClaimPaymentInfo = { PolicyHolderFirstName: "John", PolicyHolderMiddleName: "A", PolicyHolderNameSuffix: "Jr" };
    var result = new EraInsuredNamePipe().transform(claim);

    expect(result).toEqual("Jr, John A");
  });

  it('should return correctly formatted payee name when missing suffix', function () {
    let claim:EraClaimPaymentInfo = { PolicyHolderFirstName: "John", PolicyHolderMiddleName: "A", PolicyHolderLastName: "Doe" };
    var result = new EraInsuredNamePipe().transform(claim);

    expect(result).toEqual("Doe, John A");
  });

  it('should return correctly formatted payee name when missing first name', function () {
    let claim:EraClaimPaymentInfo = {  PolicyHolderMiddleName: "A", PolicyHolderLastName: "Doe", PolicyHolderNameSuffix: "Jr" };
    var result = new EraInsuredNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, A");
  });

  it('should return correctly formatted payee name when missing middle name', function () {
    let claim:EraClaimPaymentInfo = { PolicyHolderFirstName: "John", PolicyHolderLastName: "Doe", PolicyHolderNameSuffix: "Jr" };
    var result = new EraInsuredNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, John");
  }); 
});

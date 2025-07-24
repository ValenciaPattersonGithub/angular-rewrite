import { EraPatientNamePipe } from './era-patient-name.pipe';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

describe('EraPatientNamePipe', () => {
  it('create an instance', () => {
    const pipe = new EraPatientNamePipe();

    expect(pipe).toBeTruthy();
  });

  it('should return correctly formatted payee name', function () {
    let claim:EraClaimPaymentInfo = { PatientFirstName: "John", PatientMiddleName: "A", PatientLastName: "Doe", PatientNameSuffix: "Jr" };
    var result = new EraPatientNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, John A");
  });

  it('should return correctly formatted payee name when missing last name', function () {
    let claim:EraClaimPaymentInfo = { PatientFirstName: "John", PatientMiddleName: "A", PatientNameSuffix: "Jr" };
    var result = new EraPatientNamePipe().transform(claim);

    expect(result).toEqual("Jr, John A");
  });

  it('should return correctly formatted payee name when missing suffix', function () {
    let claim:EraClaimPaymentInfo = { PatientFirstName: "John", PatientMiddleName: "A", PatientLastName: "Doe" };
    var result = new EraPatientNamePipe().transform(claim);

    expect(result).toEqual("Doe, John A");
  });

  it('should return correctly formatted payee name when missing first name', function () {
    let claim:EraClaimPaymentInfo = {  PatientMiddleName: "A", PatientLastName: "Doe", PatientNameSuffix: "Jr" };
    var result = new EraPatientNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, A");
  });

  it('should return correctly formatted payee name when missing middle name', function () {
    let claim:EraClaimPaymentInfo = { PatientFirstName: "John", PatientLastName: "Doe", PatientNameSuffix: "Jr" };
    var result = new EraPatientNamePipe().transform(claim);

    expect(result).toEqual("Doe Jr, John");
  }); 
});

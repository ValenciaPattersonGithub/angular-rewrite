import { BestPracticePatientNamePipe } from './best-practice-patient-name.pipe';

describe('BestPracticePatientNamePipe', () => {
  const pipe = new BestPracticePatientNamePipe();
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return patient name according to best practice', () => {
    const patient = {FirstName: 'Bob', LastName: 'Johnson', PreferredName: 'Bobby', Suffix: 'Jr', MiddleName: 'K'};
    expect(pipe.transform(patient)).toEqual('Bob (Bobby) K. Johnson, Jr');
  });

  it('should return patient name according to best practice if Suffix is null or undefined', () => {
    const patient = {FirstName: 'Bob', LastName: 'Johnson', PreferredName: 'Bobby', MiddleName: 'K'};
    expect(pipe.transform(patient)).toEqual('Bob (Bobby) K. Johnson');

    const patientWithNullSuffix = {FirstName: 'Bob', LastName: 'Johnson', PreferredName: 'Bobby', Suffix: null, MiddleName: 'K'};
    expect(pipe.transform(patientWithNullSuffix)).toEqual('Bob (Bobby) K. Johnson');
  });

  it('should return patient name according to best practice if PreferredName is null or undefined', () => {
    const patient = {FirstName: 'Bob', LastName: 'Johnson',  Suffix: 'Jr', MiddleName: 'K'};
    expect(pipe.transform(patient)).toEqual('Bob K. Johnson, Jr');

    const patientWithNullPreferredName = {FirstName: 'Bob', LastName: 'Johnson', PreferredName: null, Suffix: 'Jr', MiddleName: 'K'};
    expect(pipe.transform(patientWithNullPreferredName)).toEqual('Bob K. Johnson, Jr');
  });

  it('should return patient name according to best practice if MiddleName is null or undefined', () => {
    const patient = {FirstName: 'Bob', LastName: 'Johnson',  Suffix: 'Jr'};
    expect(pipe.transform(patient)).toEqual('Bob Johnson, Jr');

    const patientWithNullMiddleName = {FirstName: 'Bob', LastName: 'Johnson', PreferredName: null, Suffix: 'Jr', MiddleName: null};
    expect(pipe.transform(patientWithNullMiddleName)).toEqual('Bob Johnson, Jr');
  });

  it('should return patient name according to best practice if SuffixName is present, null, or undefined', () => {
    const patient = {FirstName: 'Bob', LastName: 'Johnson', PreferredName: 'Bobby', MiddleName: 'K', SuffixName: 'Jr'};
    expect(pipe.transform(patient)).toEqual('Bob (Bobby) K. Johnson, Jr');

    const patientWithNullSuffixName = {FirstName: 'Bob', LastName: 'Johnson', PreferredName: 'Bobby', SuffixName: null, MiddleName: 'K'};
    expect(pipe.transform(patientWithNullSuffixName)).toEqual('Bob (Bobby) K. Johnson');

    const patientWithNoSuffixName = {FirstName: 'Bob', LastName: 'Johnson', PreferredName: 'Bobby', SuffixName: null, MiddleName: 'K'};
    expect(pipe.transform(patientWithNoSuffixName)).toEqual('Bob (Bobby) K. Johnson');
  });
});

import { TestBed } from '@angular/core/testing';

import { PatSharedService } from './pat-shared.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('PatSharedService', () => {

  let service: PatSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatSharedService,DomSanitizer],
    });
    service = TestBed.get(PatSharedService);
  }
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Format.PatientName should return a correctly formatted full name', () => {
    const patientMock = {
      FirstName: 'Jonathan',
      PreferredName: 'Jon',
      MiddleInitial: 'G',
      MiddleName: 'Gordon',
      LastName: 'Smith',
      SuffixName: 'Mr.'
    };

    const patientNameFormatted = 'Jonathan (Jon) G. Smith Mr.';
    const result = service.Format.PatientName(patientMock);
    expect(result).toEqual(patientNameFormatted);
  });

  it('Format.ProviderName should return a correctly formatted provider name', () => {
    const providerMock = {
      ProfessionalDesignation: 'DDS',
      FirstName: 'Jon',
      LastName: 'Smith'
    };

    const providerNameFormatted = 'Jon Smith, DDS';
    const result = service.Format.ProviderName(providerMock);
    expect(result).toEqual(providerNameFormatted);
  });

  it('Time.isWithinWeek returns true when provided date is within the week', () => {
    const newDateMock = new Date('January 1, 2019');
    const oldDateMock = new Date('January 4, 2019');
    const result = service.Time.isWithinWeek(newDateMock, oldDateMock);
    expect(result).toBe(true);
  });

  it('Time.isWithinWeek returns false when provided date is not within the week', () => {
    const newDateMock = new Date('January 1, 2019');
    const oldDateMock = new Date('January 10, 2019');
    const result = service.Time.isWithinWeek(newDateMock, oldDateMock);
    expect(result).toBe(false);
  });

  it('Time.GetDuration returns correct minute duration between two given times', () => {
    const fromTimeMock = new Date('January 1, 2019 00:00:00');
    const toTimeMock = new Date('January 1, 2019 01:30:00');
    const result = service.Time.getDuration(fromTimeMock, toTimeMock);
    expect(result).toEqual(90);
  });

  it('should return result according to input', () => {
    let result = service.compareValues(1,5);
    expect(result).toEqual(-1);

    result = service.compareValues(5,1);
    expect(result).toEqual(1);

    result = service.compareValues(1,1);
    expect(result).toEqual(0);
  });

  describe('sanitizeInput', () => {
    //Test case not added as showing tslib error while evaluating sanitize method
  });
});

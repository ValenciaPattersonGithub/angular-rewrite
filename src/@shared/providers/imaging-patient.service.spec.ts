import { TestBed } from '@angular/core/testing';
import { ImagingPatientService } from './imaging-patient.service';
import { ImagingPatient } from '../models/imaging-patient';

describe('ImagingPatientService', () => {

  let service: ImagingPatientService;
  let imagingService;
  let mockImagingProviderFactory;
  let mockToastrFactory;
  let imagingPatient;
  let updatedPatient;

  beforeEach(() => {
    imagingService = {
      updatePatientData: jasmine.createSpy(),
      getPatientByPDCOPatientId: jasmine.createSpy(),
      seeIfProviderIsReady: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({})
      }),
    };

    mockImagingProviderFactory = {
      resolve: jasmine.createSpy().and.returnValue(imagingService),
      updatePatientData: jasmine.createSpy()
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    imagingPatient = {
      Id: 1234,
      PrimaryId: '123456',
      Gender: 'M',
      FirstName: 'Bob',
      LastName: 'Frapples',
      Birthdate: new Date('1996-09-23'),
      comments: ''
    };

    updatedPatient = {
      Profile: {
        DateOfBirth: new Date('1996-09-23'),
        Sex: 'M',
        FirstName: 'Bob',
        LastName: 'Frapples',
        MiddleName: '',
        Prefix: '',
        Suffix: ''
      }
    };

    TestBed.configureTestingModule({
      providers: [ImagingPatientService,
        { provide: 'imagingProviderFactory', useValue: mockImagingProviderFactory },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
      ],
    });
    service = TestBed.get(ImagingPatientService);
  });

  describe('compareImagingPatient', () => {
    beforeEach(() => {
    });

    it('should compare selected columns on updatedPatient object to imagingPatientData and return true if values differ', () => {
      imagingPatient.Birthdate = new Date();
      let hasChanges = service.compareImagingPatient(updatedPatient, imagingPatient);
      expect(hasChanges).toBe(true);

      imagingPatient.Birthdate = new Date('1996-09-23'),
        imagingPatient.FirstName = 'Bobby';
      hasChanges = service.compareImagingPatient(updatedPatient, imagingPatient);
      expect(hasChanges).toBe(true);

      imagingPatient.Birthdate = new Date('1996-09-23'),
        imagingPatient.FirstName = 'Bob';
      imagingPatient.LastName = 'Frapple';
      hasChanges = service.compareImagingPatient(updatedPatient, imagingPatient);
      expect(hasChanges).toBe(true);

      imagingPatient.Birthdate = new Date('1996-09-23'),
        imagingPatient.FirstName = 'Bob';
      imagingPatient.LastName = 'Frapples';
      imagingPatient.Gender = 'F';
      hasChanges = service.compareImagingPatient(updatedPatient, imagingPatient);
      expect(hasChanges).toBe(true);
    });

    it('should compare selected columns on updatedPatient object to imagingPatientData and return false if values are same', () => {
      imagingPatient.Birthdate = new Date('1996-09-23'),
        imagingPatient.FirstName = 'Bob';
      imagingPatient.LastName = 'Frapples';
      imagingPatient.Gender = 'M';
      const hasChanges = service.compareImagingPatient(updatedPatient, imagingPatient);
      expect(hasChanges).toBe(false);
    });

    it('should compare selected columns on updatedPatient object to imagingPatientData and handle null gender in imagingpatient', () => {
      imagingPatient.Gender = null;

      const hasChanges = service.compareImagingPatient(updatedPatient, imagingPatient);
      expect(hasChanges).toBe(true);
    });

    it('should compare selected columns on updatedPatient object to imagingPatientData and handle null gender in updatedpatient', () => {
      imagingPatient.Gender = 'M';
      updatedPatient.Profile.Sex = null;

      const hasChanges = service.compareImagingPatient(updatedPatient, imagingPatient);
      expect(hasChanges).toBe(true);
    });

    it('should compare selected columns on updatedPatient object to imagingPatientData and handle null gender in both patients', () => {
      imagingPatient.Gender = null;
      updatedPatient.Profile.Sex = null;

      const hasChanges = service.compareImagingPatient(updatedPatient, imagingPatient);
      expect(hasChanges).toBe(false);
    });
  });

  describe('createImagingPatient', () => {

    beforeEach(() => {

    });

    it('should return ImagingPatient object for updating patientData', () => {
      const newObj = new ImagingPatient();
      const newPatientData = service.createImagingPatient(updatedPatient, imagingPatient);
      expect(newPatientData.id).toEqual(imagingPatient.Id);
      expect(newPatientData.primaryId).toEqual(imagingPatient.PrimaryId);
      expect(newPatientData.name).toEqual('Frapples^Bob^');
      expect(newPatientData.gender).toEqual(updatedPatient.Profile.Sex);
      expect(newPatientData.birthDate).toEqual(updatedPatient.Profile.DateOfBirth);
    });

    it('should have name in dicom format ( family name, first name) with delimiter between each', () => {

      let newPatientData = service.createImagingPatient(updatedPatient, imagingPatient);
      expect(newPatientData.name).toEqual('Frapples^Bob^');
      updatedPatient.Profile.MiddleName = 'M';
      newPatientData = service.createImagingPatient(updatedPatient, imagingPatient);
      expect(newPatientData.name).toEqual('Frapples^Bob^');
      updatedPatient.Profile.Suffix = 'Sr';
      newPatientData = service.createImagingPatient(updatedPatient, imagingPatient);
      expect(newPatientData.name).toEqual('Frapples^Bob^');

    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PatientLookupComponent } from './patient-lookup.component';
import moment from 'moment';

describe('PatientLookupComponent', () => {
  let component: PatientLookupComponent;
  let fixture: ComponentFixture<PatientLookupComponent>;
  let mockPatientServices = {
    Patients: {
      search: jasmine.createSpy().and.returnValue({}),
      get: jasmine.createSpy().and.returnValue({}),
    },
  };
  let mockSearchFactory = {
    CreateSearch: jasmine.createSpy().and.returnValue({ Results: [] }),
  };
  let mockValidationFactory = {
    PatientSearchValidation: jasmine
      .createSpy()
      .and.returnValue({ Results: [] }),
    LaunchPatientLocationErrorModal: jasmine
      .createSpy()
      .and.returnValue({ Results: [] }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientLookupComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: 'SearchFactory', useValue: mockSearchFactory },
        {
          provide: 'PatientValidationFactory',
          useValue: mockValidationFactory,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('closeModal ->', () => {
    beforeEach(() => {
      component.modalinstance = {
        close: jasmine.createSpy(),
      };
    });

    it('should call modalinstance close', () => {
      component.closeModal();

      expect(component.modalinstance.close).toHaveBeenCalled();
    });
  });

  describe('submit ->', () => {
    beforeEach(() => {
      component.modalinstance = {
        close: jasmine.createSpy(),
      };
    });

    it('should call modalinstance close', () => {
      component.closeModal();

      expect(component.modalinstance.close).toHaveBeenCalled();
    });
  });

  describe('input ->', () => {
    it('should reset the index and patient if value is empty', async () => {
      component.selectedIndex = 5;
      component.selectedPatient = 'Hi Mom!';
      component.subject.next = jasmine.createSpy();
      await component.input(null);

      expect(component.subject.next).not.toHaveBeenCalledWith(null);
      expect(component.selectedIndex).toBeNull();
      expect(component.selectedPatient).toBeNull();
    });

    it('should call subject.next if value is valid', async () => {
      component.subject.next = jasmine.createSpy();
      await component.input('abc');

      expect(component.subject.next).toHaveBeenCalledWith('abc');
    });
  });

  describe('executePatientSearch ->', () => {
    beforeEach(() => {
      component.patientSearch = {
        Execute: jasmine.createSpy(),
      };

      component.patientSearchParams = {
        searchFor: 'Hi Mom!',
        skip: 0,
        take: 45,
        sortyBy: 'LastName',
        includeInactive: false,
      };
    });

    it('should not execute search if no params supplied', () => {
      component.patientSearchParams = null;

      component.executePatientSearch(false);

      expect(component.patientSearch.Execute).not.toHaveBeenCalled();
    });

    it('should call Execute with valid params', () => {
      component.executePatientSearch(false);

      expect(component.patientSearch.Execute).toHaveBeenCalled();
    });

    it('should reset patient index and patient', () => {
      component.executePatientSearch(false);

      expect(component.selectedIndex).toBeNull();
      expect(component.selectedPatient).toBeNull();
    });
  });

  describe('selectPatient ->', () => {
    it('should set component properties', () => {
      component.selectedIndex = -1;
      component.selectedPatient = 'Hi Mom!';

      component.selectPatient('Hello', 2);

      expect(component.selectedIndex).toBe(2);
      expect(component.selectedPatient).toBe('Hello');
    });
  });

  describe('displayGender ->', () => {
    it('should default when not valid', () => {
      var result = component.displayGender(null);

      expect(result).toBe('--');
    });

    it('should handle M', () => {
      var result = component.displayGender('M');

      expect(result).toBe('Male');
    });

    it('should handle F', () => {
      var result = component.displayGender('F');

      expect(result).toBe('Female');
    });

    it('should handle anything else', () => {
      var result = component.displayGender('Hi Mom!');

      expect(result).toBe('Hi Mom!');
    });
  });

  describe('calculateAge ->', () => {
    it('should handle null parameters', () => {
      var result = component.calculateAge(null);

      expect(result).toBe('--');
    });

    it('should calculate valid age', () => {
      var age = moment().diff('2-2-2000', 'years');
      var result = component.calculateAge('2-2-2000');

      expect(result).toBe(age);
    });

    it('should handle invalid age', () => {
      var result = component.calculateAge('Hi Mom!');

      expect(result).toBeNaN();
    });
  });
});

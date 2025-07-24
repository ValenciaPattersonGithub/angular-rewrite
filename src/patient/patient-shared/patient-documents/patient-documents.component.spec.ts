import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { PatientDocumentsComponent } from './patient-documents.component';
import { OverlayModule } from '@angular/cdk/overlay';

describe('PatientDocumentsComponent', () => {
  let component: PatientDocumentsComponent;
  let fixture: ComponentFixture<PatientDocumentsComponent>;
  let patSecurityService: any;
  let toastrFactory: any;
  const mockpatSecurityService = {
    IsAuthorizedByAbbreviation: (authtype: string) => {},
    generateMessage: (authtype: string) => {},
  };
  const mockTostarfactory: any = {
    error: jasmine.createSpy().and.returnValue('Error Message'),
    success: jasmine.createSpy().and.returnValue('Success Message'),
  };
  const mockservice = {
    patientId: '4321',
    getAll: (a: any) => {},
    CreatePatientDirectory: (a: any, b: any, c: any) => {},
    getByDocumentId: (a: any) => {},
    get: (a: any) => {},
  };
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [PatientDocumentsComponent, AppButtonComponent],
      imports: [TranslateModule.forRoot(), OverlayModule],
      providers: [
        { provide: 'tabLauncher', useValue: mockservice },
        { provide: 'DocumentService', useValue: mockservice },
        { provide: 'toastrFactory', useValue: mockTostarfactory },
        { provide: 'DocumentGroupsService', useValue: mockservice },
        { provide: 'ListHelper', useValue: mockservice },
        { provide: 'ModalFactory', useValue: mockservice },
        { provide: 'InformedConsentFactory', useValue: mockservice },
        { provide: 'TreatmentPlanDocumentFactory', useValue: mockservice },
        { provide: '$window', useValue: mockservice },
        { provide: 'DocumentsLoadingService', useValue: mockservice },
        { provide: 'FileUploadFactory', useValue: mockservice },
        { provide: 'patSecurityService', useValue: mockpatSecurityService },
        { provide: '$routeParams', useValue: mockservice },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDocumentsComponent);
    component = fixture.componentInstance;
    patSecurityService = TestBed.get('patSecurityService');
    toastrFactory = fixture.debugElement.injector.get('toastrFactory');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('authAccess', () => {
    it('should call authAccess and set value true to hasClinicalDocumentsViewAccess', () => {
      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(
        true
      );
      component.authAccess();
      expect(component.hasClinicalDocumentsViewAccess).toEqual(true);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(component.soarAuthClinicalDocumentsViewKey);
      expect(component.soarAuthClinicalDocumentsViewKey).toEqual(
        'soar-doc-docimp-view'
      );
    });
    it('should call authAccess and set value false to hasClinicalDocumentsViewAccess', () => {
      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(
        false
      );
      component.authAccess();
      expect(component.hasClinicalDocumentsViewAccess).toEqual(false);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(component.soarAuthClinicalDocumentsViewKey);
      expect(component.soarAuthClinicalDocumentsViewKey).toEqual(
        'soar-doc-docimp-view'
      );
    });
    it('should call authAccess and set value true to hasClinicalDocumentsEditAccess', () => {
      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(
        true
      );
      component.authAccess();
      expect(component.hasClinicalDocumentsEditAccess).toEqual(true);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(component.soarAuthClinicalDocumentsEditKey);
      expect(component.soarAuthClinicalDocumentsEditKey).toEqual(
        'soar-doc-docimp-edit'
      );
    });
    it('should call authAccess and set value false to hasClinicalDocumentsEditAccess', () => {
      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(
        false
      );
      component.authAccess();
      expect(component.hasClinicalDocumentsEditAccess).toEqual(false);
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(component.soarAuthClinicalDocumentsEditKey);
      expect(component.soarAuthClinicalDocumentsEditKey).toEqual(
        'soar-doc-docimp-edit'
      );
    });
    it('should call authAccess and set value true to hasClinicalDocumentsAddAccess', () => {
      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(
        true
      );
      component.authAccess();
      expect(component.hasClinicalDocumentsAddAccess).toEqual(true);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(component.soarAuthClinicalDocumentsAddKey);
      expect(component.soarAuthClinicalDocumentsAddKey).toEqual(
        'soar-doc-docimp-add'
      );
    });
    it('should call authAccess and set value false to hasClinicalDocumentsAddAccess', () => {
      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(
        false
      );
      spyOn(patSecurityService, 'generateMessage').and.returnValue(
        "'Not Authorized'"
      );
      component.authAccess();
      expect(component.hasClinicalDocumentsAddAccess).toEqual(false);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(component.soarAuthClinicalDocumentsAddKey);
      expect(component.soarAuthClinicalDocumentsAddKey).toEqual(
        'soar-doc-docimp-add'
      );
    });
    it('should call authAccess and set value true to hasClinicalDocumentsDeleteAccess', () => {
      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(
        true
      );
      component.authAccess();
      expect(component.hasClinicalDocumentsDeleteAccess).toEqual(true);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(component.soarAuthClinicalDocumentsDeleteKey);
      expect(component.soarAuthClinicalDocumentsDeleteKey).toEqual(
        'soar-doc-docimp-delete'
      );
    });
    it('should call authAccess and set value false to hasClinicalDocumentsDeleteAccess', () => {
      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(
        false
      );
      component.authAccess();
      expect(component.hasClinicalDocumentsDeleteAccess).toEqual(false);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(component.soarAuthClinicalDocumentsDeleteKey);
      expect(component.soarAuthClinicalDocumentsDeleteKey).toEqual(
        'soar-doc-docimp-delete'
      );
    });
  });
});

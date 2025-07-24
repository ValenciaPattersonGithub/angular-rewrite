import {
  ComponentFixture,
  TestBed,
  ComponentFixtureAutoDetect,
  waitForAsync,
} from '@angular/core/testing';

import { DocUploaderComponent } from './doc-uploader.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DocUploadService } from 'src/@shared/providers/doc-upload.service';
import { DocScanControlService } from '../doc-scanner/doc-scan-control.service';
import { FileValidationEnum } from 'src/@shared/models/file-validation-enum';
import { configureTestSuite } from 'src/configure-test-suite';

describe('DocUploaderComponent', () => {
  let component: DocUploaderComponent;
  let fixture: ComponentFixture<DocUploaderComponent>;
  let controlService: DocScanControlService;
  let localize: any;
  let toastrFactory: any;
  const mockSelectedFilter = 'DocumentGroup1234';
  let mockPatientDocumentsFactory: any;
  const mockAllocateFileResult = { data: {} };
  const returnedExtension = 'txt';

  // mocks

  const groups = { Value: [] };
  const teethDefinitions = { Value: [] };
  const patientLocations = { Value: [] };
  const res = { groups, teethDefinitions, patientLocations };
  const mock$q = {
    all: jasmine.createSpy('q.all').and.callFake(() => {
      return {
        then(callback) {
          callback(res);
        },
      };
    }),
  };

  mockPatientDocumentsFactory = {
    selectedFilter: mockSelectedFilter,
  };

  const mockDocumentGroupsService = {
    get: jasmine.createSpy().and.callFake(array => {
      return {
        $promise: {
          then(callback) {
            callback(array);
          },
        },
      };
    }),
  };

  const mockPatientServices = {
    PatientLocations: {
      get: jasmine.createSpy().and.callFake(array => {
        return {
          then(callback) {
            callback(array);
          },
        };
      }),
    },
  };

  const mockPatientValidationFactory = {
    GetPatientData: jasmine.createSpy(),
  };

  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text',
  };

  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error'),
  };

  const returnedPromise = Promise.resolve({ result: 'success' });
  let returnedValidation = FileValidationEnum.Valid;
  // mock DocUploadService (necessary due to mix of angularjs and angular dependancies in this service)
  const mockDocUploadService = {
    forbiddenExtensionsList: jasmine.createSpy(),
    forbiddenExtensions: jasmine.createSpy(),
    getFileExtension: jasmine.createSpy().and.callFake(() => {
      return returnedExtension;
    }),
    isInvalidFileForUpload: jasmine.createSpy().and.callFake(() => {
      return returnedValidation;
    }),
    getValidationMessage: jasmine.createSpy(),
    createPatientDirectory: jasmine.createSpy().and.callFake((any: any) => {
      return {
        then(callback) {
          callback(any);
        },
      };
    }),
    allocateFile: jasmine.createSpy().and.callFake(() => {
      return {
        then(callback) {
          callback(mockAllocateFileResult);
        },
      };
    }),
    addDocument: jasmine.createSpy().and.callFake(() => {
      return {
        then(callback) {
          callback(returnedPromise);
        },
      };
    }),
    addTreatmentPlanDocument: jasmine.createSpy().and.callFake(() => {
      return {
        then(callback) {
          callback(returnedPromise);
        },
      };
    }),
    addRecentDocument: jasmine.createSpy(),
    uploadFile: jasmine.createSpy(),
  };

  const mockStaticDataService: any = {
    TeethDefinitions: () => new Promise((resolve, reject) => {}),
  };

  // mock doc-scanner
  @Component({
    // tslint:disable-next-line: component-selector
    selector: 'doc-scanner',
    template: '',
  })
  class MockDocScannerComponent {}

  // mock doc-paste-image
  @Component({
    // tslint:disable-next-line: component-selector
    selector: 'doc-paste-image',
    template: '',
  })
  class MockDocPasteImageComponent {}

  configureTestSuite(() => {
    const controlServiceStub = {
      retrieveFile: jasmine.createSpy().and.callFake(array => {
        return {
          then(callback) {
            callback(array);
          },
        };
      }),
      reset: jasmine.createSpy(),
      scanSuccess$: {
        subscribe: jasmine
          .createSpy()
          .and.returnValue({ unsubscribe: () => {} }),
      },
      scanFailure$: {
        subscribe: jasmine
          .createSpy()
          .and.returnValue({ unsubscribe: () => {} }),
      },
    };

    TestBed.configureTestingModule({
      declarations: [
        DocUploaderComponent,
        MockDocScannerComponent,
        MockDocPasteImageComponent,
      ],
      imports: [
        FormsModule,
        DropDownsModule,
        TranslateModule.forRoot(), // Required import for componenets that use ngx-translate in the view or componenet code
      ],
      providers: [
        { provide: DocUploadService, useValue: mockDocUploadService },
        { provide: DocScanControlService, useValue: controlServiceStub },
        { provide: 'StaticData', useValue: mockStaticDataService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        {
          provide: 'PatientDocumentsFactory',
          useValue: mockPatientDocumentsFactory,
        },
        {
          provide: 'PatientValidationFactory',
          useValue: mockPatientValidationFactory,
        },
        {
          provide: 'DocumentGroupsService',
          useValue: mockDocumentGroupsService,
        },
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: '$q', useValue: mock$q },
      ],

      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    controlService = TestBed.get(DocScanControlService);
    localize = TestBed.get('localize');
    toastrFactory = TestBed.get('toastrFactory');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(component, 'loadDocumentGroups');
      spyOn(component, 'loadTeethDefinitions');
      component.patientId = '1234';
    });

    it('should call loadDocumentGroups with groups after Promise.all resolves', () => {
      component.ngOnInit();
      // TODO fix this test
      // expect(component.loadDocumentGroups).toHaveBeenCalledWith(groups.Value);
    });

    it('should call loadTeethDefinitions with teethDefinitions after Promise.all resolves', () => {
      component.ngOnInit();
      // TODO fix this test
      // expect(component.loadTeethDefinitions).toHaveBeenCalledWith(teethDefinitions.Value);
    });

    // TODO fix this test
    it('should add patientLocations to Promise.all if no patientData ', () => {
      mockPatientValidationFactory.GetPatientData = jasmine
        .createSpy()
        .and.returnValue({ PatientId: '1234', PatientLocations: [] });
      component.ngOnInit();
      // expect(mockPatientServices.PatientLocations.get).not.toHaveBeenCalled();
    });

    it('should add patientLocations to Promise.all if no patientData ', () => {
      mockPatientValidationFactory.GetPatientData = jasmine
        .createSpy()
        .and.returnValue({ PatientId: '1234', PatientLocations: [{}, {}] });
      component.ngOnInit();
      expect(mockPatientServices.PatientLocations.get).toHaveBeenCalled();
    });
  });

  describe('setInitialDocumentGroup', () => {
    beforeEach(() => {
      mockPatientDocumentsFactory.selectedFilter = 'DocumentGroup1234';
    });

    it('should return selectedFilter.DocumentGroupId if it matches row in documentGroups', () => {
      component.documentGroups = [
        { DocumentGroupId: '1234', Description: 'DocumentGroup1234' },
        { DocumentGroupId: '1235', Description: 'DocumentGroup1235' },
      ];
      const returnedValue =
        component.setInitialDocumentGroup('DocumentGroup1234');
      expect(returnedValue).toEqual('1234');
    });

    it('should return empty string if it does not match row in documentGroups', () => {
      component.documentGroups = [
        { DocumentGroupId: '1234', Description: 'DocumentGroup1236' },
        { DocumentGroupId: '1235', Description: 'DocumentGroup1237' },
      ];
      const returnedValue = component.setInitialDocumentGroup(null);
      expect(returnedValue).toBeNull();
    });
  });

  describe('loadDocumentGroups', () => {
    beforeEach(() => {
      component.documentGroups = [
        { DocumentGroupId: '1234', Description: 'EOB' },
        { DocumentGroupId: '1235', Description: 'Medical History' },
        { DocumentGroupId: '1236', Description: 'Treatment Plans' },
        { DocumentGroupId: '1237', Description: 'Any' },
        { DocumentGroupId: '1238', Description: 'Xtra' },
      ];
      spyOn(component, 'setInitialDocumentGroup');
    });

    it('should sort documentGroups', () => {
      component.isTreatmentPlanDocument = true;
      const returnedValue = component.loadDocumentGroups(
        component.documentGroups
      );
      expect(component.documentGroups[0]).toEqual({
        DocumentGroupId: '1237',
        Description: 'Any',
      });
      expect(component.documentGroups[1]).toEqual({
        DocumentGroupId: '1234',
        Description: 'EOB',
      });
      expect(component.documentGroups[2]).toEqual({
        DocumentGroupId: '1235',
        Description: 'Medical History',
      });
      expect(component.documentGroups[3]).toEqual({
        DocumentGroupId: '1236',
        Description: 'Treatment Plans',
      });
      expect(component.documentGroups[4]).toEqual({
        DocumentGroupId: '1238',
        Description: 'Xtra',
      });
    });

    it('should filter documentGroups to remove Medical History if not a treatment plan or bulk payment EOB document', () => {
      component.isTreatmentPlanDocument = false;
      component.isBulkPaymentEob = false;
      component.loadDocumentGroups(component.documentGroups);
      expect(component.documentGroups.length).toEqual(4);
    });

    it('should not filter documentGroups if a treatment plan document', () => {
      component.isTreatmentPlanDocument = true;
      component.loadDocumentGroups(component.documentGroups);
      expect(component.documentGroups.length).toEqual(5);
    });

    it('should not filter documentGroups if a bulk payment EOB document', () => {
      component.isBulkPaymentEob = true;
      component.loadDocumentGroups(component.documentGroups);
      expect(component.documentGroups.length).toEqual(5);
    });

    it('should call setInitialDocumentGroup', () => {
      component.loadDocumentGroups(component.documentGroups);
      expect(component.setInitialDocumentGroup).toHaveBeenCalled();
    });

    it('should call setInitialDocumentGroup with Treatment Plans parameter if isTreatmentPlanDocument', () => {
      component.isTreatmentPlanDocument = true;
      component.loadDocumentGroups(component.documentGroups);
      expect(component.setInitialDocumentGroup).toHaveBeenCalledWith(
        'Treatment Plans'
      );
    });

    it('should call setInitialDocumentGroup with EOB parameter if isBulkPaymentEob', () => {
      component.isBulkPaymentEob = true;
      component.loadDocumentGroups(component.documentGroups);
      expect(component.setInitialDocumentGroup).toHaveBeenCalledWith('EOB');
    });

    it('should call setInitialDocumentGroup with treatmentPlansDocumentFactory.selectedFilter if isTreatmentPlanDocument and isBulkPaymentEob are false', () => {
      component.isTreatmentPlanDocument = false;
      component.isBulkPaymentEob = false;
      component.loadDocumentGroups(component.documentGroups);
      mockPatientDocumentsFactory.selectedFilter = 'DocumentGroup1234';
      expect(component.setInitialDocumentGroup).toHaveBeenCalledWith(
        'DocumentGroup1234'
      );
    });
  });

  describe('component.loadTeethDefinitions method', () => {
    const definitions = { Value: { Teeth: [] } };
    beforeEach(() => {
      definitions.Value = { Teeth: [{ ToothId: 1 }, { ToothId: 2 }] };
    });

    it('should return selectedFilter.DocumentGroupId if it matches row in documentGroups', () => {
      component.loadTeethDefinitions(definitions.Value);
      expect(component.patTeeth).toEqual(definitions.Value.Teeth);
    });

    it('should set patTeeth to null if originating from a bulk payment EOB upload', () => {
      component.isBulkPaymentEob = true;
      component.loadTeethDefinitions(definitions.Value);
      expect(component.patTeeth).toEqual(null);
    });
  });

  describe('component.validateUpload method', () => {
    beforeEach(() => {
      component.documentName = '';
    });

    it('should call this.setInitialDocumentGroup if no selectedDocumentGroupId', () => {
      spyOn(component, 'setInitialDocumentGroup');
      component.selectedDocumentGroupId.setValue(null);
      component.validateUpload();
      expect(component.setInitialDocumentGroup).toHaveBeenCalled();
    });

    it('should set set enableSave to false and fileValidationMessage if documentName is too long', () => {
      // tslint:disable-next-line: max-line-length
      component.documentName =
        'aaaa127WITHExtdslfkjeoiruwiur21321321321377777213216456546546546546546546546546546546546546fsdfsffsdfsfsdfsfsdfsdfdfssffff1p127.xlsx';
      spyOn(component, 'setInitialDocumentGroup').and.returnValue('1234');
      component.validateUpload();
      expect(component.enableSave).toBe(false);
      expect(component.fileNameValidationMessage).toBe(
        'Document must have same extension as original.'
      );
    });

    it('should set enableSave to false if selectedDocumentGroupId is null or empty after call to selectedDocumentGroupId', () => {
      spyOn(component, 'setInitialDocumentGroup').and.returnValue('');
      component.selectedDocumentGroupId.setValue(null);
      component.validateUpload();
      expect(component.enableSave).toBe(false);
    });

    it('should set enableSave to false if component.fileValidation equals anything other than FileValidationEnum.Valid', () => {
      spyOn(component, 'setInitialDocumentGroup').and.returnValue('1234');
      component.fileValidation = FileValidationEnum.FileNameTooLong;
      component.validateUpload();
      expect(component.enableSave).toBe(false);
    });

    it('should set enableSave to false if component.selectedFile is null', () => {
      spyOn(component, 'setInitialDocumentGroup').and.returnValue('1234');
      component.fileValidation = FileValidationEnum.Valid;
      component.selectedFile = null;
      component.validateUpload();
      expect(component.enableSave).toBe(false);
    });

    it('should set enableSave to true if all conditions are met', () => {
      component.pasteMode = false;
      spyOn(component, 'setInitialDocumentGroup').and.returnValue('1234');
      component.fileNameValidationMessage = '';
      component.fileValidation = FileValidationEnum.Valid;
      component.selectedFile = { name: 'anyfile.txt' };
      component.documentName = 'anyfile2.txt';
      component.selectedFile.scanComplete = true;
      component.validateUpload();
      expect(component.enableSave).toBe(true);
    });

    it('should set enableSave to false if this.documentName is empty if other conditions met', () => {
      spyOn(component, 'setInitialDocumentGroup').and.returnValue('1234');
      component.documentName = '';
      component.fileValidation = FileValidationEnum.Valid;
      component.selectedFile = { name: '' };
      component.validateUpload();
      expect(component.enableSave).toBe(false);
      expect(component.fileNameValidationMessage).toBe(
        'Document must have a name.'
      );
    });

    it('should set enableSave to false if this.documentName does not have extension', () => {
      spyOn(component, 'setInitialDocumentGroup').and.returnValue('1234');
      component.documentName = 'anyfile';
      component.fileValidation = FileValidationEnum.Valid;
      component.selectedFile = { name: 'anyfile.txt' };
      component.validateUpload();
      expect(component.enableSave).toBe(false);
      expect(component.fileNameValidationMessage).toBe(
        'Document must have same extension as original.'
      );
    });

    it('should set enableSave to false if this.documentName does not have extension', () => {
      spyOn(component, 'setInitialDocumentGroup').and.returnValue('1234');
      component.documentName = 'anyfile';
      component.fileValidation = FileValidationEnum.Valid;
      component.selectedFile = { name: 'anyfile.txt' };
      component.validateUpload();
      expect(component.enableSave).toBe(false);
      expect(component.fileNameValidationMessage).toBe(
        'Document must have same extension as original.'
      );
    });
  });

  describe('component.processUpload method if conditions not met', () => {
    let event;
    beforeEach(() => {
      component.patientLocations = [];
      component.patientData = {
        Data: { PatientId: '1234' },
        DirectoryAllocationId: '1234',
      };
      component.patientLocations.push({ LocationId: '1234' });
      component.selectedFile = 'anyFile.txt';
      event = { preventDefault: jasmine.createSpy() };
      spyOn(component, 'createPatientDirectory').and.callFake((any: any) => {
        return {
          then(callback) {
            callback(any);
          },
        };
      });
    });

    it('should do nothing if patientData or selectedFile or patientLocations are null or not defined', () => {
      component.patientLocations.length = 0;
      component.processUpload(event);
      expect(component.createPatientDirectory).not.toHaveBeenCalled();

      component.patientLocations.push({ LocationId: '1234' });
      component.selectedFile = '';
      component.processUpload(event);
      expect(component.createPatientDirectory).not.toHaveBeenCalled();
      expect(component.validationMessage).toEqual(
        'Please select a file to upload.'
      );
    });

    it('should call createPatientDirectory if conditions are met', () => {
      component.processUpload(event);
      expect(component.createPatientDirectory).toHaveBeenCalled();
    });
  });

  describe('component.processUpload method if conditions are met', () => {
    let event;
    beforeEach(() => {
      component.patientLocations = [];
      component.patientData = {
        Data: { PatientId: '1234' },
        DirectoryAllocationId: '1234',
      };
      component.patientLocations.push({ LocationId: '1234' });
      component.selectedFile = 'anyFile.txt';
      event = { preventDefault: jasmine.createSpy() };

      spyOn(component, 'createPatientDirectory').and.callFake(() => {
        return {
          then(callback) {
            callback('1234');
          },
        };
      });

      spyOn(component, 'getFileAllocationId').and.callFake(any => {
        return {
          then(callback) {
            callback('5678');
          },
        };
      });

      spyOn(component, 'getFileForUpload').and.callFake(() => {
        return {
          then(callback) {
            callback({});
          },
        };
      });

      spyOn(component, 'uploadFile').and.callFake((any: any) => {
        return {
          then(callback) {
            callback(any);
          },
        };
      });
    });

    it('should call createPatientDirectory if conditions are met', () => {
      component.processUpload(event);
      expect(component.createPatientDirectory).toHaveBeenCalled();
    });

    it('should return directoryAllocationId if call to createPatientDirectory is successful', () => {
      component.processUpload(event);
      expect(component.getFileAllocationId).toHaveBeenCalledWith('1234');
    });

    it('should return directoryAllocationId if call to getFileAllocationId is successful', () => {
      component.processUpload(event);
      expect(component.getFileForUpload).toHaveBeenCalled();
    });

    it('should return directoryAllocationId if call to getFileForUpload is successful', () => {
      component.processUpload(event);
      expect(component.uploadFile).toHaveBeenCalledWith('5678', {});
    });
  });

  describe('component.createPatientDirectory method', () => {
    beforeEach(() => {
      component.patientId = '1234';
      component.patientData = {
        Data: { PatientId: '1234' },
        DirectoryAllocationId: '1234',
      };
      component.patientLocations = [];
      component.patientLocations.push({ LocationId: '1234' });
    });

    it('should return selectedFilter.DocumentGroupId if it matches row in documentGroups', () => {
      component.createPatientDirectory();
      expect(mockDocUploadService.createPatientDirectory).toHaveBeenCalledWith({
        PatientId: component.patientId,
        LocationIds: ['1234'],
        DirectoryAllocationId: component.patientData.DirectoryAllocationId,
      });
    });
  });

  describe('component.getFileAllocationId method', () => {
    beforeEach(() => {
      component.selectedFile = new File([], 'Test.png', { type: 'png' });
      component.documentName = 'test.png';
    });

    it('should return AllocaitonId if docUploadService.allocateFile returns res.data.Result without Errors ', done => {
      mockAllocateFileResult.data = { Result: { FileAllocationId: '1234' } };
      const result = component.getFileAllocationId('1234').then(result => {
        expect(result).toEqual('1234');
        done();
      });
    });

    it('should set validationMessage if docUploadService.allocateFile returns res.data.Result.Errors ', () => {
      mockAllocateFileResult.data = { Result: { Errors: 'Any Error' } };
      component.getFileAllocationId('1234');
      expect(component.validationMessage).toEqual(
        'A conflict occurred while allocating the file, ' +
          'please contact your system administrator or rename the file and attempt to upload it again.'
      );
    });

    it('should set validationMessage if docUploadService.allocateFile returns res.data with no Result ', () => {
      mockAllocateFileResult.data = {};
      component.getFileAllocationId('1234');
      expect(component.validationMessage).toEqual(
        'A conflict occurred while allocating the file, ' +
          'please contact your system administrator or rename the file and attempt to upload it again.'
      );
    });
  });

  describe('component.getFileForUpload method', () => {
    beforeEach(() => {
      component.selectedFile = { name: '' };
    });

    it('should load selectedFile.name to scan.pdf if this.scanMode is true and selectedFile.scanComplete is true', () => {
      component.scanMode = true;
      component.selectedFile.scanComplete = true;
      component.getFileForUpload();
      expect(component.selectedFile.name).toBe('scan.pdf');
    });

    it('should return this.selectedFile.pasteFile if this.selectedFile.pasteFile', done => {
      component.scanMode = false;
      component.selectedFile.pasteFile = 'pastedFile';
      const promise = component.getFileForUpload().then(result => {
        expect(result).toEqual('pastedFile');
        done();
      });
    });

    it('should return this.selectedFile if not this.selectedFile.pasteFile and scanMode is false', done => {
      component.scanMode = false;
      component.documentName = 'othername';
      component.selectedFile.pasteFile = null;
      component.selectedFile = { name: 'anyFile', type: 'testtype' };
      const promise = component.getFileForUpload().then(result => {
        expect(result).toEqual(
          new File([component.selectedFile], component.documentName, {
            type: component.selectedFile.type,
          })
        );
        done();
      });
    });
  });

  describe('component.createDocumentObject method', () => {
    let fileToUpload = {};
    let res = {};
    let fileAllocated = {};

    beforeEach(() => {
      fileAllocated = {
        FileAllocationId: 1234,
        MimeType: 'MimeType',
        Filename: 'FileName',
      };
      fileToUpload = { name: 'FileName', size: 1024 };
      res = {
        FileAllocationId: 1234,
        DocumentGroupId: 2,
        MimeType: 'MimeType',
        Name: 'FileName',
        NumberOfBytes: 1024,
        ParentId: '1234',
        ParentType: 'Patient',
        ToothNumbers: [1, 2, 3, 4],
      };
    });

    it('should load document from properties in uploaded file and allocated file if document group is selected', done => {
      component.patientId = '1234';
      component.documentName = 'FileName';
      component.selectedDocumentGroupId.setValue(2);
      component.activeTeeth = [1, 2, 3, 4];
      component
        .createDocumentObject(fileAllocated, fileToUpload)
        .then(result => {
          expect(result).toEqual(res);
          done();
        });
    });

    it('should not load document from properties in uploaded file and allocated file if document group is selected', done => {
      component.patientId = '1234';
      component.selectedDocumentGroupId.setValue(null);
      component.activeTeeth = [1, 2, 3, 4];
      component
        .createDocumentObject(fileAllocated, fileToUpload)
        .then(result => {
          expect(result).toEqual(null);
          done();
        });
    });
  });

  describe('component.addTreatmentPlanDocumentRecord method', () => {
    let documentUploaded = {};
    beforeEach(() => {
      documentUploaded = {
        FileAllocationId: 1234,
        DocumentGroupId: 2,
        MimeType: 'MimeType',
        Name: 'FileName',
        NumberOfBytes: 1024,
        ParentId: '1234',
        ParentType: 'Patient',
        ToothNumbers: [1, 2, 3, 4],
      };
    });

    it('should call docUploadService.addDocument', done => {
      component.treatmentPlanId = '1234';
      component
        .addTreatmentPlanDocumentRecord(documentUploaded)
        .then(result => {
          expect(
            mockDocUploadService.addTreatmentPlanDocument
          ).toHaveBeenCalledWith(component.treatmentPlanId, documentUploaded);
          done();
        });
    });

    it('should call docUploadService.addRecentDocument if mockDocUploadService.addDocument is successful', done => {
      component
        .addTreatmentPlanDocumentRecord(documentUploaded)
        .then(result => {
          expect(mockDocUploadService.addRecentDocument).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('component.addDocumentRecord method', () => {
    let documentUploaded = {};
    beforeEach(() => {
      documentUploaded = {
        FileAllocationId: 1234,
        DocumentGroupId: 2,
        MimeType: 'MimeType',
        Name: 'FileName',
        NumberOfBytes: 1024,
        ParentId: '1234',
        ParentType: 'Patient',
        ToothNumbers: [1, 2, 3, 4],
      };
    });

    it('should call docUploadService.addDocument', done => {
      component.addDocumentRecord(documentUploaded).then(result => {
        expect(mockDocUploadService.addDocument).toHaveBeenCalledWith(
          documentUploaded
        );
        done();
      });
    });

    it('should call docUploadService.addRecentDocument if mockDocUploadService.addDocument is successful', done => {
      component.addDocumentRecord(documentUploaded).then(result => {
        expect(mockDocUploadService.addRecentDocument).toHaveBeenCalled();
        done();
      });
    });
  });

  // TODO....
  describe('component.uploadFile method', () => {});

  describe('component.toggleScanMode function ->', () => {
    beforeEach(() => {
      component.scanMode = false;
      controlService.startScan = jasmine.createSpy();
      component.pasteMode = true;
    });

    it('should set values and call functions', () => {
      component.toggleScanMode();
      expect(component.scanMode).toBe(true);
      expect(component.pasteMode).toBe(false);
      expect(controlService.startScan).toHaveBeenCalled();
    });
  });

  describe('component.scanSuccess function ->', () => {
    beforeEach(() => {
      component.selectedFile = null;
      controlService.scrollFix = jasmine.createSpy();
      component.validateUpload = jasmine.createSpy();
    });

    it('should set values and call functions', () => {
      component.clearSelectedFile = jasmine.createSpy();
      component.scanSuccess();
      expect(component.selectedFile).toEqual({
        name: 'scan.pdf',
        scanComplete: true,
      });
      expect(controlService.scrollFix).toHaveBeenCalled();
      expect(component.documentName).toEqual('scan.pdf');
      expect(component.fileValidation).toEqual(0);
      expect(component.validateUpload).toHaveBeenCalled();
      expect(component.clearSelectedFile).toHaveBeenCalled();
    });
  });

  describe('component.scanFailure function ->', () => {
    beforeEach(() => {
      component.scanMode = true;
    });

    it('should take action if component.selectedFile is null', () => {
      component.selectedFile = null;
      component.scanFailure();
      expect(component.scanMode).toBe(false);
    });

    it('should take action if component.selectedFile.scanComplete is not true', () => {
      component.selectedFile = { scanComplete: false };
      component.scanFailure();
      expect(component.scanMode).toBe(false);
    });

    it('should not take action if component.selectedFile.scanComplete is not true', () => {
      component.selectedFile = { scanComplete: true };
      component.scanFailure();
      expect(component.scanMode).toBe(true);
    });
  });

  describe('component.togglePasteMode function ->', () => {
    beforeEach(() => {
      component.pasteMode = false;
      component.pasteComplete = true;
      component.scanMode = true;
      component.selectedFile = 'selectedFile';
      component.documentName = 'FileName';
    });

    it('should set values', () => {
      component.clearSelectedFile = jasmine.createSpy();
      component.togglePasteMode();
      expect(component.documentName).toBe('');
      expect(component.pasteMode).toBe(true);
      expect(component.pasteComplete).toBe(false);
      expect(component.scanMode).toBe(false);
      expect(component.selectedFile).toBeNull();
      expect(component.enableSave).toBe(false);
      expect(component.clearSelectedFile).toHaveBeenCalled();
    });
  });

  describe('component.onPasteSuccess function ->', () => {
    beforeEach(() => {
      component.pasteComplete = false;
      component.selectedFile = null;
      component.validateUpload = jasmine.createSpy();
    });

    it('should set pasteComplete to true', () => {
      const file = {};
      component.onPasteSuccess(file);
      expect(component.pasteComplete).toBe(true);
    });

    it('should set selected file to image.png if not supplied', () => {
      const file = {};
      component.onPasteSuccess(file);
      expect(component.selectedFile).toEqual({
        name: 'image.png',
        pasteFile: file,
      });
    });

    it('should set component.documentName to selectedFile.name', () => {
      const file = {};
      component.onPasteSuccess(file);
      expect(component.documentName).toEqual(component.selectedFile.name);
    });

    it('should not set selected file to image.png if supplied', () => {
      const file = { name: 'filename' };
      component.onPasteSuccess(file);
      expect(component.selectedFile).toEqual({
        name: 'filename',
        pasteFile: file,
      });
    });

    it('should call validateUpload', () => {
      const file = {};
      component.onPasteSuccess(file);
      expect(component.validateUpload).toHaveBeenCalled();
    });
  });

  describe('component.onSelectFile function ->', () => {
    const fileInput = { target: { files: [{ name: 'FileName' }] } };
    beforeEach(() => {
      component.selectedFile = { name: 'FileName' };
      spyOn(component, 'validateUpload');
    });

    // TODO add test for png extension on paste
    it('should set pasteMode and scanMode to false', () => {
      component.pasteMode = true;
      component.scanMode = true;
      component.pasteComplete = true;
      component.selectedFile = { scanComplete: true };
      component.onSelectFile(fileInput);
      expect(component.pasteMode).toBe(false);
      expect(component.scanMode).toBe(false);
      expect(component.pasteComplete).toBe(false);
    });

    it('should call docUploadService.isInvalidFileForUpload', () => {
      component.onSelectFile(fileInput);
      expect(mockDocUploadService.isInvalidFileForUpload).toHaveBeenCalledWith(
        fileInput.target.files[0]
      );
    });

    it('should set selectedFile to null if the fileValidation is Valid and file has invalidFileExtension', () => {
      returnedValidation = FileValidationEnum.InvalidFileExtension;
      component.onSelectFile(fileInput);
      expect(component.selectedFile).toBe(null);
    });

    it('should not call validateUpload if returnedValidation is not 0', () => {
      returnedValidation = FileValidationEnum.InvalidFileExtension;
      component.onSelectFile(fileInput);
      expect(component.validateUpload).not.toHaveBeenCalled();
    });

    it('should call validateUpload if returnedValidation is 0', () => {
      returnedValidation = FileValidationEnum.Valid;
      component.onSelectFile(fileInput);
      expect(component.validateUpload).toHaveBeenCalled();
    });

    it('should set this.documentName equal to selectedFile.name if selectedFile is valid', () => {
      returnedValidation = FileValidationEnum.Valid;
      component.onSelectFile(fileInput);
      expect(component.documentName).toEqual(component.selectedFile.name);
    });

    it('should set this.documentName to empty if selectedFile is not valid', () => {
      returnedValidation = FileValidationEnum.InvalidFileExtension;
      component.onSelectFile(fileInput);
      expect(component.documentName).toEqual('');
    });

    it('should skip the method if there are no selected files', () => {
      component.pasteMode = true;
      var input = { target: { files: [] } };
      component.onSelectFile(input);
      expect(component.pasteMode).toBe(true);
    });

    it('should trim spaces in the filename', () => {
      returnedValidation = FileValidationEnum.Valid;
      fileInput.target.files[0].name = ' Filename.txt ';
      component.onSelectFile(fileInput);
      expect(component.documentName).toEqual('Filename.txt');
    });

    it('should replace spaces with underscores in the filename', () => {
      returnedValidation = FileValidationEnum.Valid;
      fileInput.target.files[0].name = ' File Name.txt ';
      component.onSelectFile(fileInput);
      expect(component.documentName).toEqual('File_Name.txt');
    });
  });

  describe('component.onFileNameChange method', () => {
    const event = {};
    beforeEach(() => {
      component.documentGroups = [
        { DocumentGroupId: '1234', Description: 'DocumentGroup1234' },
        { DocumentGroupId: '1235', Description: 'DocumentGroup1235' },
      ];
      const returnedValue =
        component.setInitialDocumentGroup('DocumentGroup1234');
      expect(returnedValue).toEqual('1234');
    });

    it('should set component.documentName to component.selectedFile.name if scanComplete is true', () => {
      component.selectedFile = { name: 'selectedFile', scanComplete: true };
      component.onFileNameChange(event);
      expect(component.documentName).toEqual(component.selectedFile.name);
    });

    it('should set component.documentName to component.selectedFile.name if pasteComplete is true', () => {
      component.selectedFile = { name: 'selectedFile' };
      component.pasteComplete = true;
      component.onFileNameChange(event);
      expect(component.documentName).toEqual(component.selectedFile.name);
    });
  });

  describe('component.onRemoveFile function ->', () => {
    beforeEach(() => {
      component.selectedFile = { name: 'selectedFile' };
      component.validationMessage = 'validationMessage';
      component.fileValidation = FileValidationEnum.InvalidFileExtension;
      component.scanMode = true;
      component.pasteMode = true;
    });

    it('should reset component properties to initial values', () => {
      component.clearSelectedFile = jasmine.createSpy();
      component.onRemoveFile();
      component.selectedFile = { name: '' };
      component.validationMessage = '';
      component.fileValidation = FileValidationEnum.Valid;
      component.scanMode = false;
      component.pasteMode = false;
      expect(component.enableSave).toBe(false);
      expect(component.clearSelectedFile).toHaveBeenCalled();
    });

    it('should call docScanControlService.reset', () => {
      component.onRemoveFile();
      expect(controlService.reset).toHaveBeenCalled();
    });
  });

  describe('component.clearSelectedFile function ->', () => {
    it('should reset component properties to initial values', () => {
      component.clearSelectedFile();
      expect(component.selectFileInput.nativeElement.value).toBe('');
    });
  });
});

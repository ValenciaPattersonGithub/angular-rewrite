import { TestBed } from '@angular/core/testing';
import { DocUploadService } from './doc-upload.service';
import { DocScanControlService } from '../components/doc-scanner/doc-scan-control.service';
import { FileValidationEnum } from '../models/file-validation-enum';


describe('', () => {
  let docUploadService: DocUploadService;
  let mockDocScanControlService: DocScanControlService;

  beforeEach(() => {

    const mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    const mockFileUploadFactory = {
      AllocateFile: jasmine.createSpy(),
      CreatePatientDirectory: jasmine.createSpy(),
      UploadFile: jasmine.createSpy(),
    };

    const mockPatientServices = {
      Documents: {
        Add: jasmine.createSpy(),
      }
    };

    const mockLocalizeService: any = {
      getLocalizedString: () => 'translated text'
    };

    const mockRecentDocumentsService = {
      update: jasmine.createSpy()
    };

    const controlServiceStub = {
      scanSuccess$: { subscribe: jasmine.createSpy().and.returnValue({ unsubscribe: () => { } }) },
      scanFailure$: { subscribe: jasmine.createSpy().and.returnValue({ unsubscribe: () => { } }) },
  };

    TestBed.configureTestingModule({

      providers: [
        DocUploadService,
        { provide: 'FileUploadFactory', useValue: mockFileUploadFactory },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: 'RecentDocumentsService', useValue: mockRecentDocumentsService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: DocScanControlService, useValue: controlServiceStub }
      ],
    });
    docUploadService = TestBed.get(DocUploadService);
  });

  /*

  */


  it('should be created', () => {
    expect(docUploadService).toBeTruthy();
  });

  describe('allowedExtensions method', () => {

    beforeEach(() => {

    });

    it('should return return false if file extension is not in allowed extensions list (disregard case)', () => {
        expect(docUploadService.allowedExtensions('BAT')).toEqual(false);
        expect(docUploadService.allowedExtensions('cmd')).toEqual(false);
        expect(docUploadService.allowedExtensions('WIZ')).toEqual(false);
        expect(docUploadService.allowedExtensions('exe')).toEqual(false);
    });

    it('should return return true if file extension is in allowed extensions list (disregard case)', () => {
        expect(docUploadService.allowedExtensions('TXT')).toEqual(true);
        expect(docUploadService.allowedExtensions('png')).toEqual(true);
        expect(docUploadService.allowedExtensions('docx')).toEqual(true);
    });

  });

  describe('getFileExtension method', () => {

    beforeEach(() => {

    });

    it('should return file extension from filename if it has one', () => {
      const selectedFile = {name: 'test.txt'};
      expect(docUploadService.getFileExtension(selectedFile)).toEqual('txt');
    });

    it('should return empty string if no extension', () => {
      const selectedFile = {name: 'test'};
      expect(docUploadService.getFileExtension(selectedFile)).toEqual('');
    });

    it('should return file type from filename if filename has more than 1 . in name', () => {
      const selectedFile = {name: 'test.t.exe', type: 'exe'};
      expect(docUploadService.getFileExtension(selectedFile)).toEqual('exe');
    });
  });

  describe('isInvalidFileForUpload method', () => {
    let selectedFile;
    beforeEach(() => {
      selectedFile = {name: 'FileName.txt', size: 1024, };
    });

    it('should return fileValidationEnum.Valid if file meets all conditions', () => {
      expect(docUploadService.isInvalidFileForUpload(selectedFile)).toEqual(FileValidationEnum.Valid);
    });

    it('should return fileValidationEnum.InvalidFileExtension if filename has a forbidden extension', () => {
      selectedFile.name = 'FileName.CMD';
      expect(docUploadService.isInvalidFileForUpload(selectedFile)).toEqual(FileValidationEnum.InvalidFileExtension);
    });

    it('should return fileValidationEnum.InvalidFileExtension if filename has a forbidden extension and extra period (from Bug)', () => {
      selectedFile.name = 'FileName.a.exe';
      expect(docUploadService.isInvalidFileForUpload(selectedFile)).toEqual(FileValidationEnum.InvalidFileExtension);
    });

    it('should return fileValidationEnum.FileSizeEmpty if file is empty', () => {
      selectedFile.size = 0;
      expect(docUploadService.isInvalidFileForUpload(selectedFile)).toEqual(FileValidationEnum.FileSizeEmpty);
    });

    it('should return fileValidationEnum.FileSizeTooLarge if file size is too large', () => {
      selectedFile.size = 104857699;
      expect(docUploadService.isInvalidFileForUpload(selectedFile)).toEqual(FileValidationEnum.FileSizeTooLarge);
    });

    it('should return fileValidationEnum.FileNameTooLong if filename is more than 128 characters', () => {
      // tslint:disable-next-line: max-line-length
      selectedFile.name = 'fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10.txt';
      expect(docUploadService.isInvalidFileForUpload(selectedFile)).toEqual(FileValidationEnum.FileNameTooLong);
    });

    it('should return fileValidationEnum.FileNameTooLong if filename plus file extension is more than 128 characters', () => {
        // tslint:disable-next-line: max-line-length
        selectedFile.name = 'fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileName10fileN.txt';
        expect(docUploadService.isInvalidFileForUpload(selectedFile)).toEqual(FileValidationEnum.FileNameTooLong);
    });

    it('should return fileValidationEnum.InvalidFileNameCharacters if filename has invalid characters', () => {
      // TODO this test isn't working
      selectedFile.name = 'fileNam:*?><,.e=.txt';
      // expect(docUploadService.isInvalidFileForUpload(selectedFile)).toEqual(FileValidationEnum.InvalidFileNameCharacters);
    });

  });
});


import { Injectable, Inject } from '@angular/core';
import { FileValidationEnum } from '../models/file-validation-enum';
import { DocScanControlService } from '../components/doc-scanner/doc-scan-control.service';
@Injectable()
export class DocUploadService {

  fileValidationEnum = FileValidationEnum;
  fileAuthAmfa = 'plapi-files-fsys-write';

  constructor(@Inject('FileUploadFactory') private fileUploadFactory,
              private docScanControlService: DocScanControlService,
              @Inject('PatientServices') private patientServices,
              @Inject('RecentDocumentsService') private recentDocumentsService,
              @Inject('toastrFactory') private toastrFactory,
  ) { }

  allowedExtensionsList = [
        'RTF',
        'TXT',
        'PDF',
        'DOC',
        'DOCX',
        'XLS',
        'XLSX',
        'PPT',
        'PPTX',

        'TIF',
        'TIFF',
        'BMP',
        'GIF',
        'JPG',
        'PNG',
        'JPEG',
        'IMG',
        'CSV',
        'JFF',
        'MPG',
        'MPEG',
        'MP4',
        'MP3',
        'MOV',
        'WMV',
        'AVI',
        'M4A'
  ];

  //#endregion

  allowedExtensions(fileExt: string) {
    if (this.allowedExtensionsList.indexOf(fileExt.toUpperCase()) >= 0) {
      return true;
    }
    return false;
  }

  getFileExtension(selectedFile) {
    if (selectedFile.name.indexOf('.') === -1) {
      return '';
    } else if (selectedFile.name.split('.').length > 1) {
      return selectedFile.name.split('.').pop();
    }
  }


  // file size must be more than 0 bytes
  // file size must be less than 100MB
  // file name must be less than 128 characters
  // file name can only contain valid characters
  isInvalidFileForUpload(selectedFile) {
    const nameWithNoExt = selectedFile.name.substr(0, selectedFile.name.lastIndexOf('.'));
    const fileExt = this.getFileExtension(selectedFile);
    if (!this.allowedExtensions(fileExt)) {
      return this.fileValidationEnum.InvalidFileExtension;
    } else if (!selectedFile.size || selectedFile.size <= 0) {
      return this.fileValidationEnum.FileSizeEmpty;
    } else if (selectedFile.size > 104857600) {
      return this.fileValidationEnum.FileSizeTooLarge;
    } else if (selectedFile.name.length > 128) {
        return this.fileValidationEnum.FileNameTooLong;            
    } else if (!/^([a-zA-Z0-9])([a-zA-Z0-9 ._-])*$/.test(selectedFile.name)) {
      return this.fileValidationEnum.InvalidFileNameCharacters;
    } else {
      return this.fileValidationEnum.Valid;
    }
  }

  getValidationMessage(fileValidationEnum: FileValidationEnum) {
    switch (fileValidationEnum) {
      case FileValidationEnum.FileSizeEmpty:
        return 'File is empty.';
      case FileValidationEnum.FileSizeTooLarge:
        return 'File size exceeded. Limit 100 MB.';
      case FileValidationEnum.FileNameTooLong:
        return 'File name length exceeded. Limited to 128 characters.';
      case FileValidationEnum.InvalidFileExtension:
        return 'File type is restricted. Please choose a different file.';
      case FileValidationEnum.InvalidFileNameCharacters:
            return 'Please use alphanumeric characters for filename.\nAllowed characters are (a-z, A-Z, 0-9, ., -, _)';
      default:
        return '';
    }
  }

  // NOTE these services below call to angular factories which will eventually be refactored when our http strategy is in place
  // the methods should be refactored to make the calls from here
  createPatientDirectory(patientInfo) {
    return new Promise((resolve, reject) => {
      this.fileUploadFactory.CreatePatientDirectory(patientInfo, patientInfo.LocationIds, this.fileAuthAmfa ).then((res) => {
          resolve(res);
        }, (data, status) => {
          reject();
        }
      );
    });
  }

  // allocate file
  allocateFile(directoryId, selectedFile) {
    return new Promise((resolve, reject) => {
      this.fileUploadFactory.AllocateFile(directoryId, selectedFile.name, selectedFile.type, this.fileAuthAmfa, false).then((res) => {
          resolve(res);
        }, (data, status) => {
          reject();
        }
      );
    });
  }

  // adds an uploaded document with special handling for treatment plans
  addTreatmentPlanDocument(txPlanId, documentObject){
    return new Promise((resolve, reject) => {
      this.patientServices.TreatmentPlanDocuments.save({ treatmentPlanId: txPlanId }, documentObject).$promise.then((res) => {
          resolve(res);
        }, (err) => {
          reject();
        }
      );
    });
  }


  // adds uploaded document to patient documents
  addDocument(documentObject)  {
    return new Promise((resolve, reject) => {
      this.patientServices.Documents.Add(documentObject).$promise.then((res) => {
          resolve(res);
        }, (err) => {
          reject();
        }
      );
    });
  }

  addRecentDocument(documentRecord)  {
    return new Promise((resolve, reject) => {
      this.recentDocumentsService.update({ returnList: false }, [documentRecord.DocumentId], (res) => {
          resolve(res);
        }, (err) => {
          reject();
        }
      );
    });
  }

  uploadFile(fileAllocationId, formData) {
    return new Promise((resolve, reject) => {
      this.fileUploadFactory.UploadFile(fileAllocationId, formData, this.fileAuthAmfa, false, null, null, null, true).then((res) => {
          resolve(res);
        }, (err) => {
          this.toastrFactory.error('Failed to add document to recent documents.', 'Server Error');
          reject();
        }
      );
    });
  }
}

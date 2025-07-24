import {
  Component,
  OnInit,
  Inject,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DocUploadService } from 'src/@shared/providers/doc-upload.service';
import { FileValidationEnum } from '../../models/file-validation-enum';
import { DocScanControlService } from '../doc-scanner/doc-scan-control.service';
import { FormControl } from '@angular/forms';
declare let _: any;

@Component({
  selector: 'doc-uploader',
  templateUrl: './doc-uploader.component.html',
  styleUrls: ['./doc-uploader.component.scss'],
})
export class DocUploaderComponent implements OnInit {
  @Input() patientId: any;
  @Input() treatmentPlanId: any;
  @Input() bulkPaymentEob: any;
  @Output() uploadSuccess = new EventEmitter<any>();
  @Output() uploadCancel = new EventEmitter<any>();
  @ViewChild('selectFileInput', { static: false }) selectFileInput;

  // NOTE seems like we are injecting way too many services here
  constructor(
    private docUploadService: DocUploadService,
    private docScanControlService: DocScanControlService,
    @Inject('StaticData') private staticData,
    @Inject('localize') private localize,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('PatientDocumentsFactory') private patientDocumentsFactory,
    @Inject('PatientValidationFactory') private patientValidationFactory,
    @Inject('DocumentGroupsService') private documentGroupsService,
    @Inject('PatientServices') private patientServices
  ) {}

  activeTeeth = [];
  patTeeth = [{ USNumber: null }];
  documentName = '';
  selectedFile = null;
  scanMode = false;
  pasteMode = false;
  pasteComplete = false;

  validationMessage = '';
  fileNameValidationMessage = '';
  fileValidation = FileValidationEnum.Valid;
  showLoading = false;
  allTeeth = [];
  patientData: { Data: any; DirectoryAllocationId: any };

  patientLocations: any;
  loadKendoWidgets = false;
  documentGroups: any;
  currentDirectory: null;
  enableSave = false;
  isTreatmentPlanDocument = false;
  isBulkPaymentEob = false;
  selectedDocumentGroupId = new FormControl('');
  uploadPressed = false;

  ngOnInit() {
    this.showLoading = true;

    if (this.treatmentPlanId) {
      this.isTreatmentPlanDocument = true;
    } else if (this.bulkPaymentEob) {
      this.isBulkPaymentEob = true;
    }

    const promises = [];
    promises.push(Promise.resolve(this.documentGroupsService.get().$promise));
    promises.push(Promise.resolve(this.staticData.TeethDefinitions()));
    // calculate patient data needs
    const patientData = this.patientValidationFactory.GetPatientData();
    const isCorrectPatient =
      patientData && patientData.PatientId === this.patientId;
    // if we have the correct patient then use the patientData from the factory otherwise get
    if (isCorrectPatient) {
      this.patientData = patientData;
    }
    if (
      isCorrectPatient &&
      patientData.PatientLocations &&
      patientData.PatientLocations.length > 0
    ) {
      this.patientLocations = patientData.PatientLocations;
    } else {
      promises.push(
        Promise.resolve(
          this.patientServices.PatientLocations.get({ Id: this.patientId })
            .$promise
        )
      );
    }

    Promise.all(promises)
      .then(([groups, teethDefinitions, patientLocations]) => {
        this.loadDocumentGroups(groups.Value);
        this.loadTeethDefinitions(teethDefinitions.Value);
        if (patientLocations !== undefined) {
          this.patientLocations = patientLocations.Value;
        }
      })
      .catch(error => {
        this.toastrFactory.error(
          'There was an error while attempting to retrieve data.',
          'Server Error'
        );
      });
    this.showLoading = false;
  }

  // on load methods

  setInitialDocumentGroup(documentGroupDescription) {
    const selectedFilter = this.documentGroups.find(
      d => d.Description === documentGroupDescription
    );
    return selectedFilter ? selectedFilter.DocumentGroupId : null;
  }

  loadDocumentGroups(docGroups) {
    const sortedGroups = docGroups.sort((a, b) =>
      a.Description > b.Description ? 1 : -1
    );
    if (this.isTreatmentPlanDocument) {
      // no filtering needed, since Treatment Plans will be selected and dropdown disabled
      this.documentGroups = docGroups;
      // set selected document group to Treatment Plans
      this.selectedDocumentGroupId.setValue(
        this.setInitialDocumentGroup('Treatment Plans')
      );
    } else if (this.isBulkPaymentEob) {
      // no filtering needed, since EOB will be selected and dropdown disabled
      this.documentGroups = docGroups;
      // set selected document group to EOB
      this.selectedDocumentGroupId.setValue(
        this.setInitialDocumentGroup('EOB')
      );
    } else {
      // filter out Medical History, not applicable for regular document upload
      const filteredGroups = sortedGroups.filter(item => {
        return item.Description !== 'Medical History';
      });
      this.documentGroups = filteredGroups;
      const documentGroupDescription = this.patientDocumentsFactory
        .selectedFilter;
      // set selected document group based on selected filter
      this.selectedDocumentGroupId.setValue(
        this.setInitialDocumentGroup(documentGroupDescription)
      );
    }
  }

  loadTeethDefinitions(teethDefinitions) {
    if (this.isBulkPaymentEob) {
      this.patTeeth = null;
    } else {
      this.patTeeth = teethDefinitions.Teeth;
    }
    this.loadKendoWidgets = true;
  }

  // end on load methods

  // event methods

  validateUpload = function () {
    this.validationMessage = '';
    this.fileNameValidationMessage = '';
    if (!this.selectedDocumentGroupId.value) {
      this.selectedDocumentGroupId.setValue(this.setInitialDocumentGroup());
    }
    this.enableSave = false;
    // if pasted image it must have a png extension
    if (this.pasteMode === true) {
      const fileExt = this.docUploadService.getFileExtension(this.selectedFile);
      if (['png'].includes(fileExt) === false) {
        this.fileNameValidationMessage =
          'Pasted images must have a png extension.';
        this.enableSave = false;
        return;
      }
    }

    if (this.documentName === '') {
      this.fileNameValidationMessage = 'Document must have a name.';
      this.enableSave = false;
      return;
    }
    if (this.documentName !== '') {
      this.documentName = this.documentName.trim().replace(/ /g, '_');
      // must have a file extension and file extension must match original file
      const fileExt = this.docUploadService.getFileExtension(this.selectedFile);
      if (this.documentName.indexOf('.') === -1) {
        this.fileNameValidationMessage =
          'Document must have same extension as original.';
        this.enableSave = false;
        return;
      } else if (this.documentName.split('.').length > 1) {
        const newExt = this.documentName.split('.').pop();
        if (newExt.includes(fileExt) === false) {
          this.fileNameValidationMessage =
            'Document must have same extension as original.';
          this.enableSave = false;
          return;
        }
      }
    }
    if (!/^([a-zA-Z0-9])([a-zA-Z0-9 ._-])*$/.test(this.documentName)) {
      this.fileNameValidationMessage =
        'Please use alphanumeric characters for filename.\nAllowed characters are (a-z, A-Z, 0-9, ., -, _)';
      return;
    }

    // must have a selected document group
    if (
      this.selectedDocumentGroupId.value === null ||
      this.selectedDocumentGroupId.value === ''
    ) {
      this.enableSave = false;
      return;
    }
    // must have a selected file
    if (this.selectedFile === null || this.selectedFile === '') {
      this.enableSave = false;
      return;
    }
    // FileName Too Long
    if (this.documentName.length > 128) {
      this.fileNameValidationMessage =
        'File name length exceeded. Limited to 128 characters.';
      return;
    }
    // file must be valid
    if (
      this.fileValidation == FileValidationEnum.FileSizeEmpty ||
      this.fileValidation == FileValidationEnum.InvalidFileExtension ||
      this.fileValidation == FileValidationEnum.FileSizeTooLarge
    ) {
      this.enableSave = false;
      return;
    }
    // check scan and paste properties
    this.enableSave =
      (this.scanMode !== true || this.selectedFile.scanComplete === true) &&
      (this.pasteMode !== true || this.pasteComplete === true)
        ? true
        : false;
  };

  cancelUpload(event: KeyboardEvent) {
    this.uploadCancel.emit();
  }

  processUpload(event: KeyboardEvent) {
    if (
      !this.currentDirectory &&
      this.selectedFile &&
      this.patientLocations.length > 0
    ) {
      this.createPatientDirectory().then(res => {
        if (res) {
          const directoryAllocationId = res;
          this.getFileAllocationId(directoryAllocationId).then(res => {
            const fileAllocationId = res;
            if (fileAllocationId) {
              this.getFileForUpload().then(res => {
                const fileToUpload = res;
                if (res) {
                  this.uploadFile(fileAllocationId, fileToUpload);
                }
              });
            }
          });
        }
      });
    } else {
      this.validationMessage = 'Please select a file to upload.';
    }
  }

  // create or get the patient directory id if it already exists
  createPatientDirectory() {
    return new Promise((resolve, reject) => {
      // get a list of unique patient locationIds
      const directoryAllocationId =
        this.patientData && this.patientData.DirectoryAllocationId
          ? this.patientData.DirectoryAllocationId
          : null;
      const patientLocationIds = this.patientLocations.map(a => a.LocationId);
      // get current or create new directory NOTE this.patientData.DirectoryAllocationId may be empty or null
      const patientInfo = {
        PatientId: this.patientId,
        LocationIds: patientLocationIds,
        DirectoryAllocationId: directoryAllocationId,
      };
      this.docUploadService.createPatientDirectory(patientInfo).then(
        res => {
          resolve(res);
        },
        err => {
          this.validationMessage =
            'An error occurred while trying to upload your file please try again.';
          resolve(null);
        }
      );
    });
  }

  getFileAllocationId(directoryId) {
    return new Promise((resolve, reject) => {
      var tempFile = new File([this.selectedFile], this.documentName, {
        type: this.selectedFile.type,
      });
      this.docUploadService
        .allocateFile(directoryId, tempFile)
        .then((res: any) => {
          // check for errors in result
          if (res && res.data && res.data.Result) {
            if (res.data.Result.Errors) {
              // tslint:disable-next-line: max-line-length
              this.validationMessage =
                'A conflict occurred while allocating the file, please contact your system administrator or rename the file and attempt to upload it again.';
              resolve(null);
            } else {
              const fileAllocationId = res.data.Result.FileAllocationId;
              resolve(fileAllocationId);
            }
          } else {
            // tslint:disable-next-line: max-line-length
            this.validationMessage =
              'A conflict occurred while allocating the file, please contact your system administrator or rename the file and attempt to upload it again.';
            resolve(null);
          }
        });
    });
  }

  // logic for loading the file
  getFileForUpload() {
    return new Promise((resolve, reject) => {
      if (this.scanMode === true && this.selectedFile.scanComplete === true) {
        if (
          this.selectedFile.name == null ||
          this.selectedFile.name.length === 0
        ) {
          this.selectedFile.name = 'scan.pdf';
        }
        this.docScanControlService.retrieveFile().then(
          result => {
            resolve(result);
          },
          () => {
            reject();
          }
        );
      } else if (this.selectedFile.pasteFile) {
        resolve(this.selectedFile.pasteFile);
      } else {
        var tempFile = new File([this.selectedFile], this.documentName, {
          type: this.selectedFile.type,
        });
        resolve(tempFile);
      }
    });
  }

  createDocumentObject(fileAllocated, fileToUpload) {
    return new Promise((resolve, reject) => {
      if (this.selectedDocumentGroupId.value !== null) {
        const document = {
          FileAllocationId: fileAllocated.FileAllocationId,
          DocumentGroupId: this.selectedDocumentGroupId.value,
          MimeType: fileAllocated.MimeType,
          Name: this.documentName,
          NumberOfBytes: fileToUpload.size,
          ParentId: this.patientId,
          ParentType: 'Patient',
          ToothNumbers: this.activeTeeth,
        };
        resolve(document);
      } else {
        this.validationMessage = 'Please select a document group.';
        resolve(null);
      }
    });
  }

  // adds a record to documentRecords and to recent documents
  addDocumentRecord(documentUploaded) {
    return new Promise((resolve, reject) => {
      this.docUploadService.addDocument(documentUploaded).then(
        (res: any) => {
          this.toastrFactory.success(
            this.localize.getLocalizedString('File uploaded successfully.'),
            this.localize.getLocalizedString('Success')
          );
          // add returned document to recent documents
          this.docUploadService.addRecentDocument(res.Value);
          resolve(res);
        },
        () => {
          this.validationMessage =
            'An issue occurred while uploading the file after allocation, please rename your file and try again.';
          reject();
        }
      );
    });
  }

  // special handling if document is attached to a treatment plan
  addTreatmentPlanDocumentRecord(documentUploaded) {
    return new Promise((resolve, reject) => {
      this.docUploadService
        .addTreatmentPlanDocument(this.treatmentPlanId, documentUploaded)
        .then(
          (res: any) => {
            this.toastrFactory.success(
              this.localize.getLocalizedString('File uploaded successfully.'),
              this.localize.getLocalizedString('Success')
            );
            // add returned document to recent documents
            this.docUploadService.addRecentDocument(res.Value);
            resolve(res);
          },
          () => {
            this.toastrFactory.error(
              this.localize.getLocalizedString(
                'Failed to create the {0}. Refresh the page to try again.',
                ['Treatment Plan Document']
              ),
              this.localize.getLocalizedString('Server Error')
            );
            reject();
          }
        );
    });
  }

  uploadFile(fileAllocationId, fileToUpload) {
    this.showLoading = true;
    const reader = new FileReader();
    // on reader loadend upload file
      reader.onloadend = () => {
      // upload file
      const formData = new FormData();
      formData.append('file', fileToUpload);
      this.docUploadService
        .uploadFile(fileAllocationId, formData)
        .then((res: any) => {
          // on success add document record
          if (res && res.data && res.data.Result) {
            this.createDocumentObject(res.data.Result, fileToUpload).then(
              (res: any) => {
                const documentUploaded = res;
                if (this.isTreatmentPlanDocument) {
                  // if isTreatmentPlanDocument load to treatment plan documents
                  this.addTreatmentPlanDocumentRecord(documentUploaded).then(
                    (uploadResult: any) => {
                      this.showLoading = false;
                      this.uploadSuccess.emit(uploadResult.Value);
                    }
                  );
                } else {
                  // otherwise load to documents only
                  this.addDocumentRecord(documentUploaded).then(
                    (uploadResult: any) => {
                      this.showLoading = false;
                      this.uploadSuccess.emit(uploadResult.Value);
                    }
                  );
                }
              }
            );
          } else {
            this.validationMessage =
              'An issue occurred while uploading the file after allocation, please rename your file and try again.';
            this.showLoading = false;
          }
        });
    };
    reader.readAsArrayBuffer(fileToUpload);
  }

  // end upload methods

  // file handling methods

  // handle file selected
  onSelectFile(fileInput: any) {
    if (fileInput.target.files.length > 0) {
      this.pasteMode = false;
      this.scanMode = false;
      this.pasteComplete = false;
      this.pasteComplete = false;
      if (this.selectedFile) {
        this.selectedFile.scanComplete = false;
      }

      // reset validation
      this.validationMessage = '';
      this.fileValidation = FileValidationEnum.Valid;
      this.selectedFile = fileInput.target.files[0];
      this.documentName = this.selectedFile.name.trim().replace(/ /g, '_');
      this.fileValidation = this.docUploadService.isInvalidFileForUpload(
        this.selectedFile
      );
      // validate file selected
      if (this.fileValidation !== FileValidationEnum.Valid) {
        if (this.fileValidation === FileValidationEnum.InvalidFileExtension) {
          this.selectedFile = null;
          this.documentName = '';
          this.clearSelectedFile();
        }
        this.validationMessage = this.docUploadService.getValidationMessage(
          this.fileValidation
        );
      } else {
        this.validateUpload();
      }
    }
  }

  onRemoveFile() {
    this.selectedFile = null;
    this.documentName = '';
    this.clearSelectedFile();
    this.validationMessage = '';
    this.fileValidation = null;
    this.scanMode = false;
    this.docScanControlService.reset();
    this.pasteMode = false;
    this.enableSave = false;
  }

  // end file handling methods

  // scan
  toggleScanMode() {
    this.scanMode = true;
    this.docScanControlService.startScan();
    this.pasteMode = false;
  }

  scanSuccess() {
    this.selectedFile = { name: 'scan.pdf', scanComplete: true };
    this.documentName = this.selectedFile.name;
    this.docScanControlService.scrollFix();
    this.fileValidation = FileValidationEnum.Valid;
    this.validateUpload();
    this.clearSelectedFile();
  }

  scanFailure() {
    if (this.selectedFile === null || this.selectedFile.scanComplete !== true) {
      this.scanMode = false;
    }
  }

  // end scan methods

  // paste methods

  onPasteSuccess(file) {
    this.pasteComplete = true;
    this.fileValidation = FileValidationEnum.Valid;
    this.selectedFile = { name: file.name, pasteFile: file };
    if (!this.selectedFile.name || this.selectedFile.name === '') {
      this.selectedFile.name = 'image.png';
    }
    this.documentName = this.selectedFile.name.trim().replace(/ /g, '_');
    this.validateUpload();
  }

  onFileNameChange(event: any) {
    // if resetting the selectedFile.name set the documentName to match
    if (
      (this.selectedFile && this.selectedFile.scanComplete === true) ||
      (this.selectedFile && this.pasteComplete === true)
    ) {
      this.documentName = this.selectedFile.name.trim().replace(/ /g, '_');
    }
    this.validateUpload();
  }

  togglePasteMode() {
    this.pasteMode = true;
    this.pasteComplete = false;
    this.scanMode = false;
    this.selectedFile = null;
    this.documentName = '';
    this.enableSave = false;
    this.clearSelectedFile();
  }
  // end paste methods

  clearSelectedFile() {
    this.selectFileInput.nativeElement.value = '';
  }
}

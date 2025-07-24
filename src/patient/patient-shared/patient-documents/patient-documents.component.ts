import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal, TemplatePortal } from "@angular/cdk/portal";
import { Component, Inject, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { merge } from "rxjs";
import { SortOrder } from "src/patient/common/models/enums";
import escape from 'lodash/escape';
declare let _: any;
@Component({
  selector: "app-patient-documents",
  templateUrl: "./patient-documents.component.html",
  styleUrls: ["./patient-documents.component.scss"],
})
export class PatientDocumentsComponent implements OnInit {
  gridHeaders: any[];
  patientPath = "#/Patient/";
  patientDocuments: any[];
  documentGroupsList: [];
  soarAuthClinicalDocumentsViewKey = "soar-doc-docimp-view";
  soarAuthClinicalDocumentsAddKey = "soar-doc-docimp-add";
  soarAuthClinicalDocumentsEditKey = "soar-doc-docimp-edit";
  soarAuthClinicalDocumentsDeleteKey = "soar-doc-docimp-delete";
  createDirectoryPromise: any;
  patientId: string;
  patientName: string;
  position: any;
  @Input() patientProfile: any;
  private overlayRef: OverlayRef;
  sortObject = {};
  @ViewChild("templateRef") templateRef: TemplateRef<any>;
  hasClinicalDocumentsViewAccess = false;
  hasClinicalDocumentsAddAccess = false;
  hasClinicalDocumentsEditAccess = false;
  hasClinicalDocumentsDeleteAccess = false;
  constructor(
    @Inject("tabLauncher") private tabLauncher,
    @Inject("DocumentService") private documentService,
    @Inject("toastrFactory") private toastrFactory,
    @Inject("DocumentGroupsService") private documentGroupsService,
    @Inject("ListHelper") private listHelper,
    private translate: TranslateService,
    @Inject("ModalFactory") private modalFactory,
    @Inject("TreatmentPlanDocumentFactory") private treatmentPlanDocumentFactory,
    @Inject("InformedConsentFactory") private informedConsentFactory,
    @Inject("FileUploadFactory") private fileUploadFactory,
    @Inject("$window") private window,
    @Inject("DocumentsLoadingService") private documentsLoadingService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    @Inject("$routeParams") private route,
    @Inject("patSecurityService") private patSecurityService
  ) {}

  ngOnInit(): void {
    if (this.patientProfile ? this.patientProfile.PatientId : this.route.patientId) {
      this.authAccess();
      this.sortObject["DateUploaded"] = SortOrder.Ascending;
      this.gridHeaders = [{ label: "Name" }, { label: "Group" }, { label: "Type" }, { label: "Date", click: "DateUploaded" }, { label: "" }];
      this.patientId = this.patientProfile ? this.patientProfile.PatientId : this.route.patientId;
      this.getAllDocumentGroups();
      this.createDirectoryBeforeDownload();
    }
  }
  generateNewForms = () => {
    const urlPatientRegistrationForm = this.patientPath + "PatientRegistrationForm/";
    this.tabLauncher.launchNewTab(escape(urlPatientRegistrationForm));

    const urlPatientInsuranceForm = this.patientPath + "PatientInsuranceForm/";
    this.tabLauncher.launchNewTab(escape(urlPatientInsuranceForm));
  };
  addDocument = () => {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerVertically().centerHorizontally(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
    });
    const patientDocumentPortal = new TemplatePortal(this.templateRef, this.viewContainerRef);
    this.overlayRef.attach(patientDocumentPortal);
    merge(this.overlayRef.backdropClick(), this.overlayRef.detachments()).subscribe(() => {
      this.closeModal();
    });
  };
  closeModal = () => {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  };
  getDocumentsforPatient = () => {
    this.patientDocuments = null;
    // this.documentService.get({ parentId: this.patientProfile.PatientId, parentType: 'patient' }, (res: any) => {
    this.documentService.get(
      { parentId: this.patientId, parentType: "patient" },
      (res: any) => {
        this.patientName = `${this.patientProfile.LastName} ${this.patientProfile.FirstName}`;

        let docList: any[] = res.Value;
        if (docList.length) {
          docList = docList.sort((x, y) => (y.DateUploaded > x.DateUploaded ? 1 : -1));
        }
        docList.forEach((doc) => {
          if (!doc.DocumentGroupName) {
            const group = this.listHelper.findItemByFieldValue(this.documentGroupsList, "DocumentGroupId", doc.DocumentGroupId);
            if (group) {
              doc.DocumentGroupName = group.Description;
            }
          }
        });
        this.patientDocuments = docList;
      },
      () => {
        this.patientName = `${this.patientProfile.LastName} ${this.patientProfile.FirstName}`;
        this.toastrFactory.error(this.translate.instant("{0} {1}", ["Documents", "failed to load."]), this.translate.instant("Server Error"));
      }
    );
  };
  getAllDocumentGroups = () => {
    this.documentGroupsService.getAll(
      (res: any) => {
        this.documentGroupsList = res.Value;
        this.getDocumentsforPatient();
      },
      (res: any) => {
        this.toastrFactory.error(this.translate.instant("{0} {1}", ["Document Groups", "failed to load."]), this.translate.instant("Server Error"));
      }
    );
  };
  editDocument = (document: any) => {
    this.modalFactory
      .Modal({
        templateUrl: "App/Patient/components/document-properties/document-properties.html",
        backdrop: "static",
        keyboard: false,
        size: "doc",
        windowClass: "center-modal doc-modal",
        controller: "DocumentPropertiesModalController",
        amfa: "soar-doc-docimp-edit",
        resolve: {
          documentId: () => {
            return document.DocumentId;
          },
          formattedPatientName: () => {
            return this.patientName;
          },
        },
      })
      .result.then(this.getDocumentsforPatient);
  };
  openMoveDocsModal = () => {
    if (this.patientDocuments.length > 0) {
      const obj = {
        pData: this.patientProfile,
      };
      this.modalFactory
        .Modal({
          backdrop: "static",
          keyboard: false,
          templateUrl: "App/Patient/patient-documents/patient-move-documents-modal.html",
          controller: "MoveDocumentsController",
          controllerAs: "ctrl",
          amfa: "soar-doc-docimp-edit",
          resolve: {
            patientData: obj,
            documents: () => {
              return this.patientDocuments;
            },
          },
        })
        .result.then(this.getDocumentsforPatient);
    }
  };
  onUploadSuccess = (event: any) => {
    this.getDocumentsforPatient();
    this.closeModal();
  };
  onUploadCancel = (event: any) => {
    this.closeModal();
  };

  viewDocument = (doc: any) => {
    if (doc.MimeType === "Digital") {
      switch (doc.DocumentGroupName) {
        case "Treatment Plans":
          this.viewTxPlanSnapshot(doc);
          break;
        case "Medical History":
          this.viewMedHistForm(doc);
          break;
        case "Consent":
          this.viewInformedConsent(doc);
          break;
      }
    } else {
      this.getDocumentByDocumentId(doc.DocumentId);
    }
  };
  // opening txPlan snapshots
  viewTxPlanSnapshot = (doc: any) => {
    if (this.hasClinicalDocumentsViewAccess) {
      this.treatmentPlanDocumentFactory.GetTreatmentPlanSnapshot(doc.FileAllocationId).then((res: any) => {
        if (res && res.Value) {
          const document = localStorage.setItem(
            "document_" + res.Value.SignatureFileAllocationId,
            JSON.stringify(this.treatmentPlanDocumentFactory.CreateSnapshotObject(res.Value))
          );
          this.tabLauncher.launchNewTab(escape(this.patientPath + this.patientId + "/PrintTreatmentPlan/" + res.Value.SignatureFileAllocationId));
        }
      });
    }
  };
  viewMedHistForm = (doc: any) => {
    if (this.hasClinicalDocumentsViewAccess) {
      this.tabLauncher.launchNewTab(escape(this.patientPath + this.patientId + "/Clinical/MedicalHistoryForm/past?formAnswersId=" + doc.FileAllocationId));
    }
    // ctrl.updateRecentDocuments(doc);
  };
  viewInformedConsent = (item: any) => {
    // if ($scope.access.View) {
    this.informedConsentFactory.view(item).then((res: any) => {
      this.treatmentPlanDocumentFactory.UpdateRecentDocuments(item);
    });
    // } else {
    //     toastrFactory.error(patSecurityService.generateMessage('soar-biz-icmsg-view'), 'Not Authorized');
    // }
  };
  getDocumentByDocumentId = (docId: any) => {
    this.createDirectoryPromise.then(
      () => {
        if (this.hasClinicalDocumentsViewAccess) {
          this.documentService.getByDocumentId(
            { documentId: docId },
            (res: any) => {
              const document = res.Value;
              if (document != null) {
                this.displayDocument(document);
              }
            },
            (res: any) => {
              this.toastrFactory.error(this.translate.instant("{0} {1}", ["Document", "failed to load."]), this.translate.instant("Server Error"));
            }
          );
        }
      },
      () => {
        this.toastrFactory.error(this.translate.instant("{0} {1}", ["Document", "failed to load."]), this.translate.instant("Server Error"));
      }
    );
    // $scope.loading = false;
  };

  createDirectoryBeforeDownload = () => {
    this.createDirectoryPromise = this.fileUploadFactory.CreatePatientDirectory(
      {
        PatientId: this.patientId,
        DirectoryAllocationId: null,
      },
      null,
      this.soarAuthClinicalDocumentsViewKey
    );
  };
  displayDocument = (doc: any) => {
    const filegetUri = "_fileapiurl_/api/files/content/";
    const targetUri = filegetUri + doc.FileAllocationId;
    this.window = {};
    this.documentsLoadingService.executeDownload(targetUri, doc, this.window);
  };

  sortcss = (event: any) => {
    if (this.sortObject) {
      if (this.sortObject[event] === SortOrder.Ascending) {
        return "fa-sort-up";
      } else if (this.sortObject[event] === SortOrder.Descending) {
        return "fa-sort-down";
      } else if (!this.sortObject[event]) {
        return "fa-sort";
      }
    } else {
      return "fa-sort";
    }
  };
  sortColumn = (field: any) => {
    let listOfField: any;
    listOfField = _.filter(this.gridHeaders, (filteredList: any) => {
      if (filteredList.click === field) {
        if (this.sortObject[field]) {
          this.sortObject[field] = this.sortObject[field] === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
          this.patientDocuments = this.patientDocuments.sort((a, b) => {
            if ((a[field] && a[field].toLowerCase()) > (b[field] && b[field].toLowerCase()) || !b[field]) {
              return this.sortObject[field] === SortOrder.Descending ? 1 : -1;
            }
            if ((a[field] && a[field].toLowerCase()) < (b[field] && b[field].toLowerCase()) || !a[field]) {
              return this.sortObject[field] === SortOrder.Descending ? -1 : 1;
            }
            return 0;
          });
        }
      }
    });
  };
  //#region Auth Access
  authAccess = () => {
    this.hasClinicalDocumentsViewAccess = this.authAccessByType(this.soarAuthClinicalDocumentsViewKey);
    this.hasClinicalDocumentsEditAccess = this.authAccessByType(this.soarAuthClinicalDocumentsEditKey);
    this.hasClinicalDocumentsAddAccess = this.authAccessByType(this.soarAuthClinicalDocumentsAddKey);
    this.hasClinicalDocumentsDeleteAccess = this.authAccessByType(this.soarAuthClinicalDocumentsDeleteKey);
    if (this.hasClinicalDocumentsViewAccess === false) {
      this.toastrFactory.error(this.patSecurityService.generateMessage(this.soarAuthClinicalDocumentsViewKey), "Not Authorized");
      setTimeout(() => {
        if (this.hasClinicalDocumentsViewAccess) {
          location.replace("/");
        }
      }, 100);
    }
  };
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };
  //#endregion
}

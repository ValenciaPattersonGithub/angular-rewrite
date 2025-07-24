import {
  Component,
  OnInit,
  Inject,
  ViewContainerRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  CommunicationReason,
  CommunicationType,
  CommunicationCategory,
  CommunicationEvent,
  CommunicationMode,
  FormMode,
  CommunicationTab,
  CommunicationHeader,
} from '../../common/models/enums';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientCommunication } from 'src/patient/common/models/patient-communication.model';
import { PatientCommunicationTemplate } from 'src/patient/common/models/patient-communication-templates.model';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { take, filter, debounceTime } from 'rxjs/operators';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ReferralManagementHttpService } from '../../../@core/http-services/referral-management-http.service';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { FuseFlag } from '../../../@core/feature-flags';
import { CreateReferralCommunicationRequest, UpdateReferralCommunicationRequest } from '../../../business-center/practice-settings/patient-profile/referral-type/referral-type.model';

@Component({
  selector: 'communication-generate-letter',
  templateUrl: './communication-generate-letter.component.html',
  styleUrls: ['./communication-generate-letter.component.scss'],
})
export class CommunicationGenerateLetterComponent implements OnInit, OnDestroy {
  CommunicationType = CommunicationType;
  CommunicationCategory = CommunicationCategory;
  CommunicationReason = CommunicationReason;
  CommunicationMode = CommunicationMode;
  generateLetterCommunication: FormGroup;
  personDetail: any;
  communicationReasons: any;
  communicationTypes: any;
  communicationTemplates: Array<PatientCommunicationTemplate>;
  filteredTemplates: Array<PatientCommunicationTemplate>;
  buttonText: any;
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  accountNoteMaxLength: number;
  oldCategory: any;
  dialog: DialogRef;
  templateOutput: any;
  selectedTemplate: PatientCommunicationTemplate;
  formMode: FormMode;
  selectedTemplateName: string;
  defaultFormValue: any;
  formValuesChanged: boolean;
  isFormChanged = false;
  isResponsiblePerson = true;
  isModified: any;
  editedBy: any;
  soarAuthPCommEditKey = 'soar-per-pcomm-edit';
  hasEditAccess: any;
  PatientCommunicationId: any;
  letterTypeTooltip = this.translate.instant('Letter type cannot be changed.');
  private unsubscribe$: Subject<any> = new Subject<any>();
  @Input() containerRef: ViewContainerRef;
  height: any;
  smallScreenHeight: any = 60;
  bigScreenHeight: any = 130;
  isReferral: boolean;

  constructor(
    private fb: FormBuilder,
    public communicationConstants: CommunicationConstants,
    @Inject('toastrFactory') private toastrFactory,
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    private translate: TranslateService,
    @Inject('$routeParams') private route,
    private confirmationModalService: ConfirmationModalService,
    private dialogService: DialogService,
    private datepipe: DatePipe,
    @Inject('patSecurityService') private patSecurityService,
    private referralManagementHttpService: ReferralManagementHttpService,
    private featureFlagService: FeatureFlagService
  ) {}

  ngOnInit() {
    if (window.innerHeight > 700 && window.innerHeight < 900) {
      this.height = this.smallScreenHeight;
    } else if (window.innerHeight > 900) {
      this.height = this.bigScreenHeight;
    }
    this.formValuesChanged = false;
    this.createFormControls();
    this.subscribeCustomEvents();
    this.setDefaultType();
    this.authAccess();
    const patientDetail = this.patientCommunicationCenterService.patientDetail;
    if (patientDetail.Profile) {
      this.isResponsiblePerson = !!patientDetail.Profile.ResponsiblePersonId;
    }
    this.formMode = FormMode.AddMode;
    this.buttonText = this.translate.instant('Save');
    this.defaultFormValue = this.generateLetterCommunication.value;
    this.handleCachedTab();
    this.featureFlagService.getOnce$(FuseFlag.PatientCommunicationCenterReferral).subscribe((value) => {
        this.isReferral = value;      
    });
      if (this.isReferral) {
          this.communicationConstants.CommunicationReasons?.push({ text: this.translate.instant('Referral'), value: CommunicationReason.Referral, category: CommunicationCategory.PatientCare });
          this.communicationConstants.GenerateLetterCommunicationReasons?.push({ text: this.translate.instant('Referral'), value: CommunicationReason.Referral, category: CommunicationCategory.PatientCare });
      }
      else {
          this.communicationConstants.CommunicationReasons = this.communicationConstants.CommunicationReasons.filter(reason => reason.value !== CommunicationReason.Referral);
          this.communicationConstants.GenerateLetterCommunicationReasons = this.communicationConstants.GenerateLetterCommunicationReasons?.filter(reason => reason.value !== CommunicationReason.Referral);
      }
  }
  handleCachedTab = () => {
    const cachedTab =
      this.patientCommunicationCenterService.cachedCommunicationTab;
    if (cachedTab && cachedTab.activeTab === CommunicationTab.GenerateLetter) {
      if (
        !(
          JSON.stringify(cachedTab.cachedFormData.value) ===
          JSON.stringify(this.defaultFormValue)
        )
      ) {
        const cachedFormValue = cachedTab.cachedFormData.value;
        this.patientCommunicationCenterService.drawerMode =
          cachedTab.cachedFormMode;
        this.communicationReasons =
          this.communicationConstants.CommunicationReasons.filter(
            x => x.category === Number(cachedFormValue.CommunicationCategory)
          );
        this.filterTemplates(cachedFormValue.Reason);
        this.generateLetterCommunication =
          this.patientCommunicationCenterService.cachedCommunicationTab.cachedFormData;
        setTimeout(() => {
          this.patientCommunicationCenterService.formValuesChanged = true;
        }, 300);
      }
    } else {
      this.patientCommunicationCenterService.cachedCommunicationTab = null;
    }
  };
  createFormControls = () => {
    this.generateLetterCommunication = this.fb.group({
      CommunicationType: ['0', [Validators.min(2)]],
      CommunicationCategory: ['0', [Validators.required, Validators.min(1)]],
      Reason: ['0', [Validators.required, Validators.min(1)]],
      CommunicationTemplateId: ['0'],
      Status: ['1'],
      Notes: ['', [Validators.required]],
      LetterTemplate: [''],
      LetterTemplateName: [''],
      PatientId: this.route.patientId,
      CommunicationMode: CommunicationMode.LetterCommunication,
      PatientCommunicationId: 0,
      DataTag: '',
      PersonAccountNoteId: '',
      CommunicationDate: '',
    });
    this.communicationReasons = null;
    this.filteredTemplates = null;
  };
  getCheckedStatus = (value: any) => {
    return this.generateLetterCommunication.get('Status').value === value;
  };
  addGenerateLetterCommunication = (templateRef: any, actionTemplate: any) => {
    if (
      this.communicationConstants.editAccountNoteconfirmationModalData
        .oldFormData
    ) {
      if (
        this.communicationConstants.editAccountNoteconfirmationModalData
          .oldFormData.Communication &&
        this.communicationConstants.editAccountNoteconfirmationModalData
          .oldFormData.Mode === FormMode.EditMode
      ) {
        this.patientCommunicationCenterService.drawerMode = FormMode.EditMode;
      }
    }
    const drawerMode = this.patientCommunicationCenterService.drawerMode;
    if (drawerMode === FormMode.EditMode) {
      if (this.formMode === FormMode.SaveAndPreview) {
        const patientDetail =
          this.patientCommunicationCenterService.patientDetail;
        if (patientDetail) {
          this.personDetail = {
            AccountId: patientDetail.Profile.PersonAccountId,
          };
        }
        if (this.templateOutput) {
          this.generateLetterCommunication.patchValue({
            LetterTemplate: this.templateOutput,
            LetterTemplateName: this.selectedTemplate.TemplateName,
          });
        } else {
          this.generateLetterCommunication.patchValue({
            CommunicationTemplateId: null,
            LetterTemplate: null,
            LetterTemplateName: null,
          });
        }
        this.updateCommunication();
      } else if (this.formMode === FormMode.Preview) {
        this.previewTemplateModal(templateRef, actionTemplate);
      } else {
        this.updateCommunication();
      }
    } else {
      if (
        this.formMode === FormMode.AddMode ||
        this.formMode === FormMode.SaveAndPreview
      ) {
        const patientDetail =
          this.patientCommunicationCenterService.patientDetail;
        if (patientDetail.Profile) {
          this.personDetail = {
            AccountId: patientDetail.Profile.PersonAccountId,
          };
        }
        this.generateLetterCommunication.patchValue({
          Notes: this.generateLetterCommunication.value.Notes,
        });
        if (this.templateOutput) {
          this.generateLetterCommunication.patchValue({
            LetterTemplate: this.templateOutput,
            LetterTemplateName: this.selectedTemplate.TemplateName,
          });
        } else {
          this.generateLetterCommunication.patchValue({
            CommunicationTemplateId: null,
            LetterTemplate: null,
            LetterTemplateName: null,
          });
          }
          if (this.generateLetterCommunication.value['Reason'] == CommunicationReason.Referral) {
              var createReferralCommunicationRequest: CreateReferralCommunicationRequest = {
                  PatientId: this.route.patientId,
                  CommunicationType: this.generateLetterCommunication.controls["CommunicationType"].value,
                  CommunicationCategory: this.generateLetterCommunication.controls["CommunicationCategory"].value,
                  Reason: this.generateLetterCommunication.controls["Reason"].value,
                  Notes: this.generateLetterCommunication.value.Notes,
                  LetterTemplate: this.templateOutput,
                  LetterTemplateName: this.selectedTemplate?.TemplateName,
                  CommunicationMode: CommunicationMode.LetterCommunication,
                  CommunicateTemplateId: 1,
                  Status: this.generateLetterCommunication.get('Status').value
              };
              this.referralManagementHttpService.
                  createReferralCommunication(createReferralCommunicationRequest)
                  .subscribe((data) => {
                      this.referralCommunicationSuccess(data);
                  },
                      error => this.referralCommunicationFailure()
                  );

          }
          else {
              this.patientCommunicationCenterService
                  .createPatientCommunication(
                      this.route.patientId,
                      this.generateLetterCommunication.value,
                      this.personDetail
                  )
                  .subscribe(
                      (data: PatientCommunication) =>
                          this.addGenerateLetterCommunicationSuccess(data),
                      error => this.addGenerateLetterCommunicationFailure()
                  );
          }
      } else if (this.formMode === FormMode.Preview) {
        this.previewTemplateModal(templateRef, actionTemplate);
      }
    }
  };
  openPreviewDialog = (templateRef: any, actionTemplate: any) => {
    this.dialog = this.dialogService.open({
      content: templateRef,
      actions: actionTemplate,
    });
    this.formMode = FormMode.SaveAndPreview;
    this.dialog.result.subscribe((result: any) => {
      if (!result.primary) {
        if (this.formMode === FormMode.SaveAndPreview) {
          this.formMode = FormMode.Preview;
        }
        this.dialog.close();
      }
    });
  };
  printTemplate = () => {
    if (this.formMode === FormMode.SaveAndPreview) {
      const myWindow = window.open('', '', 'width=800,height=500');
      myWindow.document.write(this.templateOutput);
      myWindow.document.close();
      myWindow.focus();
      myWindow.print();
      myWindow.onafterprint = () => {
        myWindow.close();
      };
      this.dialog.close();
    }
  };
  addGenerateLetterCommunicationSuccess = (res: any) => {
    if (res) {
      this.printTemplate();
      this.resetFormValues();
      this.isFormChanged = false;
      this.patientCommunicationCenterService.drawerMode = FormMode.default;
      this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData =
        null;
      this.closeDrawer();
    }
    this.toastrFactory.success(
      this.translate.instant(
        'The record of this communication has been saved.'
      ),
      this.translate.instant('Success')
    );
  };
  addGenerateLetterCommunicationFailure = () => {
    this.toastrFactory.error(
      this.translate.instant(
        'There was an error and this communication was not created.'
      ),
      this.translate.instant('Server Error')
    );
  };
  resetFormValues = () => {
    this.generateLetterCommunication.reset(this.createFormControls());
    this.setDefaultType();
    this.accountNoteMaxLength = null;
  };
  onTemplateSelected = (event: any) => {
    if (event) {
      this.isFormChanged = true;
      const templateId = Number(event.target.value);
      this.selectedTemplate = {};
      if (templateId) {
        this.selectedTemplate =
          this.patientCommunicationCenterService.communicationTemplates.filter(
            x => x.CommunicationTemplateId === Number(templateId)
          )[0];
        this.formMode = FormMode.Preview;
        this.buttonText = this.translate.instant('Preview');
      } else {
        this.formMode = FormMode.AddMode;
        this.buttonText = this.translate.instant('Save');
      }
    }
  };
  onReasonSelected = (event: any) => {
    if (event) {
      let notes = '';
      this.isFormChanged = true;
      this.generateLetterCommunication.patchValue({
        CommunicationTemplateId: '0',
      });
      const selectedReason = Number(event.target.value);
      if (selectedReason) {
        this.filterTemplates(selectedReason);
        this.buttonText = this.translate.instant('Save');
        if (
          selectedReason === CommunicationReason.AccountLetter ||
          selectedReason === CommunicationReason.GeneralLetter ||
          selectedReason === CommunicationReason.InsuranceLetter ||
          selectedReason === CommunicationReason.OtherPatientCare
        ) {
          notes = this.translate.instant(
            'Letter generated from Patient Communication Center.'
          );
        }
        this.generateLetterCommunication.patchValue({
          Notes: this.generateLetterCommunication.value.Notes
            ? this.generateLetterCommunication.value.Notes
            : notes,
        });
      }
    }
  };
  onCategorySelected = (event: any) => {
    this.isFormChanged = true;
    const selectedCategory = Number(event.target.value);
      if (selectedCategory) {         
      this.communicationReasons =
        this.communicationConstants.GenerateLetterCommunicationReasons.filter(
          x => x.category === selectedCategory
            );

      this.generateLetterCommunication.patchValue({
        Reason: this.communicationReasons[0].value,
      });
      this.onReasonSelected({
        target: { value: this.communicationReasons[0].value },
      });
      this.accountNoteMaxLength = null;
      if (selectedCategory === CommunicationCategory.Account) {
        this.accountNoteMaxLength = 500;
        if (
          this.generateLetterCommunication.value.Notes.length >
          this.accountNoteMaxLength
        ) {
          this.openConfirmationModal(
            this.communicationConstants.editAccountNoteconfirmationModalData
          );
        } else {
          this.generateLetterCommunication.patchValue({
            Notes: this.generateLetterCommunication.value.Notes.slice(
              0,
              this.accountNoteMaxLength
            ),
          });
        }
      }
    } else {
      this.communicationReasons = null;
    }
  };
  setDefaultType() {
    this.communicationTypes =
      this.communicationConstants.CommunicationTypes.filter(
        x => x.value === CommunicationType.USMail
      );
    if (this.communicationTypes) {
      this.generateLetterCommunication.patchValue({
        CommunicationType: this.communicationTypes[0].value,
      });
    }
  }
  closeDrawer = () => {
    this.patientCommunicationCenterService.setCommunicationEvent({
      eventtype: CommunicationEvent.CommunicationIconsVisibility,
      data: {
        drawerType: CommunicationHeader.CommunicationDrawer,
        state: false,
      },
    });

    this.patientCommunicationCenterService.setCommunicationEvent({
      eventtype: CommunicationEvent.DrawerVisibility,
      data: {
        drawerType: CommunicationHeader.CommunicationDrawer,
        data: false,
      },
    });
  };
  openConfirmationModal = (data: any) => {
    this.confirmationRef = this.confirmationModalService.open({
      data,
    });
    this.patientCommunicationCenterService.isModalOpen = true;
    this.confirmationModalSubscription = this.confirmationRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type === 'confirm' || event.type === 'close';
        }),
        take(1)
      )
      .subscribe(events => {
        switch (events.type) {
          case 'confirm':
            this.defaultFormValue = null;
            this.patientCommunicationCenterService.isModalOpen = false;
            this.confirmationRef.close();
            if (
              this.patientCommunicationCenterService.drawerMode ===
                FormMode.EditMode &&
              !this.isFormChanged
            ) {
              if (events.data.formdata) {
                this.bindForm(events.data.formdata);
                this.communicationConstants.confirmationModalData.formdata =
                  null;
              }
              this.isFormChanged = false;
            } else if (
              this.patientCommunicationCenterService.drawerMode ===
                FormMode.EditMode &&
              this.isFormChanged &&
              events.data.isAccount
            ) {
              if (
                this.generateLetterCommunication.value.Notes.length >
                  this.accountNoteMaxLength &&
                this.accountNoteMaxLength !== null &&
                String(
                  this.generateLetterCommunication.value.CommunicationCategory
                ) === String(CommunicationCategory.Account)
              ) {
                this.generateLetterCommunication.patchValue({
                  Notes: this.generateLetterCommunication.value.Notes.slice(
                    0,
                    this.accountNoteMaxLength
                  ),
                });
              }
            } else {
              this.isFormChanged = false;
              this.patientCommunicationCenterService.drawerMode =
                FormMode.default;
              this.patientCommunicationCenterService.isModalOpen = false;
              this.closeDrawer();
              this.resetFormValues();
            }
            break;
          case 'close':
            this.confirmationRef.close();
            if (
              this.patientCommunicationCenterService.drawerMode ===
                FormMode.EditMode &&
              this.isFormChanged &&
              this.communicationConstants.editAccountNoteconfirmationModalData
                .oldFormData &&
              this.communicationConstants.editAccountNoteconfirmationModalData
                .oldFormData.Communication
            ) {
              this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData =
                null;
            }
            this.patientCommunicationCenterService.isModalOpen = false;
            break;
        }
      });
  };
  updateNotes(event: any) {
    if (event.target.value) {
      const value = this.generateLetterCommunication.get('Reason').value;
      if (String(value) === String(CommunicationReason.AccountNote)) {
        this.accountNoteMaxLength = 500;
        if (event.target.value.length > this.accountNoteMaxLength) {
          this.generateLetterCommunication.value.Notes =
            event.target.value.slice(0, this.accountNoteMaxLength);
        }
      }
    }
  }
  subscribeCustomEvents = () => {
    this.generateLetterCommunication.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value: any) => {
        if (!this.defaultFormValue) {
          this.defaultFormValue = value;
        }
        if (
          this.defaultFormValue &&
          this.defaultFormValue.CommunicationTemplateId === null &&
          value.CommunicationTemplateId === '0'
        ) {
          this.defaultFormValue.CommunicationTemplateId = '0';
        }
        this.formValuesChanged = !(
          JSON.stringify(value) === JSON.stringify(this.defaultFormValue)
        );
        this.patientCommunicationCenterService.formValuesChanged =
          this.formValuesChanged;
      });
    this.patientCommunicationCenterService
      .getCommunicationEvent()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: CommunicationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case CommunicationEvent.DrawerStatus:
              this.handleDrawerStatusValidityEvent(event);
              break;
            case CommunicationEvent.EditCommunication:
              this.handleEditCommunicationEvent(event);
              break;
          }
        }
      });
  };
  handleEditCommunicationEvent = (customEvent: CommunicationCustomEvent) => {
    if (
      customEvent.data &&
      customEvent.data.Communication &&
      customEvent.data &&
      customEvent.data.Communication.CommunicationMode ===
        CommunicationMode.LetterCommunication
    ) {
      this.patientCommunicationCenterService.drawerMode = FormMode.EditMode;
      if (this.isFormChanged) {
        this.communicationConstants.confirmationModalData.formdata =
          customEvent.data.Communication;
        this.openConfirmationModal(
          this.communicationConstants.confirmationModalData
        );
      } else {
        this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData =
          customEvent.data;
        setTimeout(() => {
          this.bindForm(customEvent.data.Communication);
          const value = this.generateLetterCommunication.get(
            'CommunicationCategory'
          ).value;
          if (String(value) === String(CommunicationCategory.Account)) {
            this.accountNoteMaxLength = 500;
            if (
              this.generateLetterCommunication.value.Notes.length >
              this.accountNoteMaxLength
            ) {
              this.generateLetterCommunication.patchValue({
                Notes: this.generateLetterCommunication.value.Notes.slice(
                  0,
                  this.accountNoteMaxLength
                ),
              });
            }
          }
        }, 200);
        const patientDetail =
          this.patientCommunicationCenterService.patientDetail;
        if (patientDetail) {
          this.isResponsiblePerson =
            !!patientDetail.Profile.ResponsiblePersonId;
        }
        this.editCommunicationUserDetails(customEvent.data.Communication);
      }
      this.patientCommunicationCenterService.formValuesChanged = true;
      this.patientCommunicationCenterService.setCachedTabWithData(
        CommunicationTab.GenerateLetter,
        this.generateLetterCommunication,
        FormMode.EditMode
      );
      this.patientCommunicationCenterService.formValuesChanged = false;
    }
  };
  bindForm = (eventData: any) => {
    this.communicationReasons =
      this.communicationConstants.CommunicationReasons.filter(
        x => x.category === eventData.CommunicationCategory
      );
    this.defaultFormValue = {
      CommunicationType: eventData.CommunicationType,
      CommunicationCategory: eventData.CommunicationCategory,
      Reason: Number(eventData.Reason),
      CommunicationTemplateId: eventData.CommunicationTemplateId,
      Status: String(eventData.Status),
      Notes: eventData.Notes,
      LetterTemplate: eventData.LetterTemplate,
      LetterTemplateName: eventData.LetterTemplateName,
      PatientId: eventData.PatientId,
      CommunicationMode: CommunicationMode.LetterCommunication,
      PatientCommunicationId: eventData.PatientCommunicationId,
      DataTag: eventData.DataTag,
      PersonAccountNoteId: eventData.PersonAccountNoteId,
      CommunicationDate: eventData.CommunicationDate,
    };
    this.generateLetterCommunication.setValue(this.defaultFormValue);
    this.filterTemplates(this.generateLetterCommunication.value.Reason);
  };
  filterTemplates = (reason: any) => {
    if (!this.generateLetterCommunication.value.CommunicationTemplateId) {
      this.generateLetterCommunication.patchValue({
        CommunicationTemplateId: '0',
      });
    }
    if (
      reason === CommunicationReason.AccountLetter ||
      reason === CommunicationReason.AccountNote ||
      reason === CommunicationReason.InsuranceLetter ||
      reason === CommunicationReason.OtherInsurance
    ) {
      reason = CommunicationReason.AccountNote;
    } else if (
      reason === CommunicationReason.GeneralLetter ||
      reason === CommunicationReason.GeneralNote
    ) {
      reason = CommunicationReason.GeneralNote;
    }
    this.filteredTemplates =
      this.patientCommunicationCenterService.communicationTemplates.filter(
        x => x.Reason === reason
      );
  };
  handleDrawerStatusValidityEvent = (custoEvent: CommunicationCustomEvent) => {
    if (this.formValuesChanged) {
      this.openConfirmationModal(
        this.communicationConstants.confirmationModalData
      );
    } else {
      this.resetFormValues();
      this.patientCommunicationCenterService.drawerMode = FormMode.default;
      this.patientCommunicationCenterService.setCommunicationEvent({
        eventtype: CommunicationEvent.DrawerVisibility,
        data: {
          drawerType: CommunicationHeader.CommunicationDrawer,
          data: false,
        },
      });
    }
  };
  onTypeSelected = () => {
    this.patientCommunicationCenterService.formValuesChanged =
      this.isFormChanged = true;
  };
  onNotesChange = () => {
    this.patientCommunicationCenterService.formValuesChanged =
      this.isFormChanged = true;
  };
  onReasonChange = () => {
    this.patientCommunicationCenterService.formValuesChanged =
      this.isFormChanged = true;
  };
  onRbChange = () => {
    this.patientCommunicationCenterService.formValuesChanged =
      this.isFormChanged = true;
  };
  editCommunicationUserDetails = (eventData: any) => {
    const dateModified = this.datepipe.transform(
      eventData.DateModified,
      'MM/dd/yyyy:HH:mm:ss'
    );
    const commDate = this.datepipe.transform(
      eventData.CommunicationDate,
      'MM/dd/yyyy:HH:mm:ss'
    );
    this.isModified = dateModified > commDate;
    if (this.isModified) {
      this.editedBy = this.patientCommunicationCenterService.getUserdetail(
        eventData.UserModified,
        false
      );
      this.editedBy = eventData.EditedBy;
    }
  };
  updateCommunication = () => {
    if (this.hasEditAccess) {
      if (
        this.generateLetterCommunication.value.CommunicationTemplateId === '0'
      ) {
        this.generateLetterCommunication.patchValue({
          CommunicationTemplateId: null,
          LetterTemplate: null,
          LetterTemplateName: null,
        });
      }
      const updatedModel: any = this.generateLetterCommunication.value;
      const patientDetail =
        this.patientCommunicationCenterService.patientDetail;
      if (patientDetail.Profile) {
        updatedModel.AccountId = patientDetail.Profile.PersonAccountId;
      }
      if (updatedModel.Reason == CommunicationReason.Referral) {
          var updateReferralCommunicationRequest: UpdateReferralCommunicationRequest = {
              ReferralCommunicationId: updatedModel.PatientCommunicationId,
              PatientId: this.route.patientId,
              CommunicationType: updatedModel.CommunicationType,
              CommunicationCategory: updatedModel.CommunicationCategory,
              Reason: updatedModel.Reason,
              Notes: updatedModel.Notes,
              LetterTemplate: updatedModel.LetterTemplate,
              LetterTemplateName: updatedModel.LetterTemplateName,
              CommunicationMode: updatedModel.CommunicationMode,
              CommunicateTemplateId: updatedModel.CommunicationTemplateId,
              Status: updatedModel.Status                  
          };
          this.referralManagementHttpService.updateReferralCommunication(updateReferralCommunicationRequest).then((res) => {
            this.updateLetterCommunicationSuccess(res);
            //this.patientCommunicationCenterService.updatePatientCommunications$.next(res);
          }, () => {
              this.updateLetterCommunicationFailure();
          })
      } else {
        this.patientCommunicationCenterService
        .updatePatientCommunication(
          updatedModel.PatientCommunicationId,
          updatedModel
        )
        .subscribe(
          (data: any) => this.updateLetterCommunicationSuccess(data),
          error => this.updateLetterCommunicationFailure()
        );
      }
      
    }
  };

  updateLetterCommunicationSuccess = (res: any) => {
    if (res) {
      this.resetFormValues();
      this.isFormChanged = false;
      this.patientCommunicationCenterService.drawerMode = FormMode.default;
      this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData =
        null;
      this.patientCommunicationCenterService.cachedCommunicationTab = null;
      this.closeDrawer();
    }
    this.toastrFactory.success(
      this.translate.instant(
        'The record of this communication has been updated.'
      ),
      this.translate.instant('Success')
    );
  };
  updateLetterCommunicationFailure = () => {
    this.toastrFactory.error(
      this.translate.instant(
        'There was an error and this communication was not updated.'
      ),
      this.translate.instant('Server Error')
    );
  };
  authAccess = () => {
    this.hasEditAccess = this.authAccessByType(this.soarAuthPCommEditKey);
  };
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };
  previewTemplateModal = (templateRef: any, actionTemplate: any) => {
    const AppointmentId = this.patientCommunicationCenterService.NextAppointment
      ? this.patientCommunicationCenterService.NextAppointment.AppointmentId
      : '00000000-0000-0000-0000-000000000000';
    this.patientCommunicationCenterService
      .GetPatientCommunicationTemplateById(
        this.route.patientId,
        this.selectedTemplate.CommunicationTemplateId,
        AppointmentId
      )
      .subscribe((template: any) => {
        this.templateOutput = template.StringOutput[0];
        this.openPreviewDialog(templateRef, actionTemplate);
      });
  };
  onResize = event => {
    if (event.target.innerHeight > 700 && event.target.innerHeight < 900) {
      this.height = this.smallScreenHeight;
    } else if (event.target.innerHeight > 900) {
      this.height = this.bigScreenHeight;
    }
  };
  ngOnDestroy() {
    this.defaultFormValue = null;
    this.route.withDrawerOpened = this.route.communicationType = null;
    this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData =
      null;
    this.isFormChanged = false;
    this.patientCommunicationCenterService.setCachedTabWithData(
      CommunicationTab.GenerateLetter,
      this.generateLetterCommunication,
      this.patientCommunicationCenterService.drawerMode
    );
    this.patientCommunicationCenterService.resetPatientCommunicationService();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    }

    referralCommunicationSuccess(data) {
        if (data) {
            this.printTemplate();
            this.resetFormValues();
            this.isFormChanged = false;
            this.patientCommunicationCenterService.drawerMode = FormMode.default;
            this.closeDrawer();
        }
        this.toastrFactory.success(
            this.translate.instant(
                'The record of this communication has been saved.'
            ),
            this.translate.instant('Success')
        );

    }

    referralCommunicationFailure()
    {
        this.toastrFactory.error(
            this.translate.instant(
                'There was an error and this communication was not created.'
            ),
            this.translate.instant('Server Error')
        );
    }
}

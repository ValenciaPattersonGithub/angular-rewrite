import { Component, OnInit, OnDestroy, Inject, Renderer2, TemplateRef, ViewContainerRef, ViewChild } from '@angular/core';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { ProviderOnScheduleDropdownService } from 'src/scheduling/providers/provider-on-schedule-dropdown.service';
import { DeleteReferralRequest, GetReferralRequest, GetReferralsResponseDto } from '../referral-type/referral-type.model';
import { map } from 'rxjs/internal/operators/map';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { MedicalHistoryAlert } from "./../../../../patient/common/models/medical-history-alert.model";
import { BlueImagingService } from 'src/patient/imaging/services/blue.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ImagingMasterService } from 'src/patient/imaging/services/imaging-master.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PatientReferralCrudComponent } from '../../../../patient/patient-registration/patient-referrals/patient-referral-crud/patient-referral-crud.component';
import { ReferralPatientDetailsComponent } from '../../../../patient/patient-registration/patient-referrals/referral-patient-details/referral-patient-details.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDragStart,
  CdkDragEnd,
} from '@angular/cdk/drag-drop';
import { Subscription, Observable } from 'rxjs';
import { TreatmentPlanHttpService } from 'src/treatment-plans/http-providers';
import { DrawerNotificationService } from 'src/@shared/providers/drawer-notification.service';
import { PrintPatientReferral } from 'src/patient/patient-registration/patient-referrals/patient-referral-print.model';
import moment from 'moment';
import { PatientReferralPrintService } from 'src/patient/patient-registration/patient-referrals/patient-referral-print.service';
import { ResponseItem } from 'src/patient/patient-registration/patient-referrals/patient-referral-model';
import { dateFieldName } from '@progress/kendo-angular-intl';
import { Provider } from 'src/patient/patient-registration/patient-referrals/patient-referral-model';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';

@Component({
  selector: 'referrals-drawer-view',
  templateUrl: './referrals-drawer-view.component.html',
  styleUrls: ['./referrals-drawer-view.component.scss'],
})
export class ReferralsDrawerViewComponent implements OnInit, OnDestroy {
  @ViewChild('containerReferral', { read: ViewContainerRef, static: false })
  patientId: string;
  providers: any;
  hasAddAccess = false;
  hasEditAccess = false;
  hasDeleteAccess = false;
  addAuthAbbreviation = "soar-per-perref-add";
  editAuthAbbreviation = "soar-per-perref-edit";
  deleteAuthAbbreviation = "soar-per-perref-delete";
  deleteAccessToolTipText = 'You do not have permission to delete this record.';
  editAccessToolTipText = 'You do not have permission to edit this record.';
  imageUrl: SafeHtml;
  hasImage: boolean;
  alerts: string;
  editReferral: any;
  patientReferralsList: GetReferralsResponseDto[];
  dialog: DialogRef;
  public containerRef: ViewContainerRef;
  patientProfile: any = {};
  sourceNames = [];
  plans: Array<{
    text: string;
    value: string;
    availableServices: string[];
    IsDisabled?: boolean;
  }> = [];
  providerList: Provider[];
  profileDetails = {};
  nextAppointment: Date;
  constructor(
    @Inject("$routeParams") private route,
    @Inject("patSecurityService") private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('PatientMedicalHistoryAlertsFactory') private patientMedicalHistoryAlertsFactory,
    @Inject('PersonFactory') private personFactory,
    @Inject('PatientServices') private patientServices,
    private blueImagingService: BlueImagingService,
    private imagingMasterService: ImagingMasterService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private referralManagementHttpService: ReferralManagementHttpService,
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    private providerOnScheduleDropdownService: ProviderOnScheduleDropdownService,
    private dialogService: DialogService,
    private patientReferralPrintService: PatientReferralPrintService,
    private patientHttpService: PatientHttpService,
    @Inject('referenceDataService') private referenceDataService
  ) {
    this.getReferralSources();
  }

  ngOnInit() {
    this.providers = this.providerOnScheduleDropdownService.getProvidersFromCache();
    this.patientId = this.route.patientId;
    this.getAppointments();
    this.getReferrals(this.route.patientId);
    this.getPatientInfo();
    this.authAccess();
    this.getBlueImage();
    this.getMedicalHistoryAlerts();
    this.getTreatmentPlans();
    this.getRefferingProviders();
  }

  getTreatmentPlans() {
    var serviceStatusId;
    if (this.plans.length == 0) {
      this.patientServices.TreatmentPlans.getTreatmentPlansWithServicesByPersonId(
        {
          Id: this.route.patientId,
        }
      ).$promise.then(res => {
        if (res.Value) {
          res.Value.forEach(item => {
            serviceStatusId = item.TreatmentPlanServices.find(service => service.ServiceTransaction.ServiceTransactionStatusId == 2);
            if (serviceStatusId != null)
              this.plans.push({
                value: item.TreatmentPlanHeader.TreatmentPlanId,
                text: item.TreatmentPlanHeader.TreatmentPlanName,
                availableServices: item.TreatmentPlanServices.filter(service => service.ServiceTransaction.ServiceTransactionStatusId == 2).map(service => service.ServiceTransaction.Description)
              });
          });
        }
      });
    }

  }

  getReferralSources = () => {
    this.referralManagementHttpService.getSources().then((res) => {
      this.sourceNames = res;
    });
  }

  getRefferingProviders = () => {
    this.referralManagementHttpService.getPracticeProviders()
      .subscribe({
        next: (data: any) => {
          this.providerList = data.map(item => ({
            ...item.provider,
            text: `${item.provider.firstName} ${item.provider.lastName}`,
            value: item.provider.providerAffiliateId,
            type: 'Provider',
            affiliateDetails: {
              practiceName: item.practice.name,
              address1: `${item.provider.address1} ${item.provider.address2}`,
              address2: `${item.provider.city},${item.provider.state} ${item.provider.zipCode}`,
              phone: item.provider.phone,
              email: item.provider.emailAddress
            }
          }));
        },
        error: (error) => {
          this.toastrFactory.error('Failed to load providers. Refresh the page to try again.', 'Server Error');
        }
      });
  }

  getReferrals = (patientId: any) => {
    let req: GetReferralRequest = { PatientId: patientId, GetAll: true };
    this.referralManagementHttpService
      .getReferral(req)
      .pipe(
        map((data: any[]) => {
          return data.filter(item => {
            item.referralDirectionType = item.referralDirectionType.replace('Referral', '').trim();
            item.referralCategory = item.referralCategory.replace('Provider', '').trim();
            return item;
          });
        })
      )
      .subscribe((data: any[]) => {
        if (data) {
          this.patientReferralsList = data;
        }

        for (let item of this.patientReferralsList) {
          if (item.referralCategoryId === 2) {
            if (item.referralAffiliate.isExternal === true) {
              item.referralAffiliateName = item.referralAffiliate?.firstName + ' ' + item.referralAffiliate?.lastName;
            } else {
              this.patientCommunicationCenterService.getPatientInfoByPatientId(item.referralAffiliate.referralAffiliateId).subscribe((person: any) => {
                  item.referralAffiliateName = `${person.FirstName}  ${person.LastName}`;
                  item.address1 = `${person.AddressLine1 || ''} ${person.AddressLine2 || ''}`;
                  item.address2 = `${person.City || ''}, ${person.State || ''} ${person.ZipCode || ''}`;
                  if (item.address2 == ", ")
                  item.address2 = '';
                  item.patientEmailAddress = `${person.Emails?.find(e => e.IsPrimary)?.Email || ''}`;
              });
            }
            item.referringTo = "";
            item.referringFrom = "";
          } else if (item.referralCategoryId === 3) {
            const sourceItem = this.sourceNames.find(i => i.value.toString().toLowerCase().replace(/-/g, '') === item.otherSource.sourceId.toLowerCase().replace(/-/g, ''))
            item.referralAffiliateName = sourceItem ? sourceItem.text : "";
            item.referringTo = "";
            item.referringFrom = "";
          } else if (item.referralCategoryId === 1) {
            item.referralAffiliateName = item.referralAffiliate?.firstName + ' ' + item.referralAffiliate?.lastName;
          }
          if (item.referralDirectionTypeId == 2) {
            if (this.providers && this.providers.CachedObj == null){
              this.providers.CachedObj = this.referenceDataService.get(
                this.referenceDataService.entityNames.users
              );
            }

            if (this.providers && this.providers.CachedObj && item.referringProviderId) {
              let _provider = this.providers.CachedObj.find(p => p.UserId == item.referringProviderId);
              item.referringFrom = _provider ? `${_provider.FirstName}  ${_provider.LastName}` : "";
              item.referralAffiliateName = item.referralAffiliate?.firstName + ' ' + item.referralAffiliate?.lastName;
            }

            item.referralCategory = "";
            item.referringTo = item.referralAffiliate?.firstName + ' ' + item.referralAffiliate?.lastName;
          }
        }
      });
  };

  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };

  authAccess = () => {
    this.hasAddAccess = this.authAccessByType(this.addAuthAbbreviation);
    this.hasEditAccess = this.authAccessByType(this.editAuthAbbreviation);
    this.hasDeleteAccess = this.authAccessByType(this.deleteAuthAbbreviation);
  };

    deleteReferral = (referral, template: TemplateRef<any>, actionTemplate: TemplateRef<any>) => {
    if (this.hasDeleteAccess) {
        if (referral) {
        this.dialog = this.dialogService.open({
          appendTo: this.containerRef,
          content: template,
          width: '37%',
          actions: actionTemplate
        });
        if (this.dialog.dialog.location.nativeElement.children != undefined && this.dialog.dialog.location.nativeElement.children[1] != undefined) {
          this.dialog.dialog.location.nativeElement.children[1].classList.add('delete-dialog-top');
        }
        this.dialog.result.subscribe((result: any) => {
          if (!result.primary) {
            this.dialog.close();
          } else {
              let req: DeleteReferralRequest = { ReferralId: referral.referralId, PatientId: this.route.patientId };
            this.referralManagementHttpService
              .deleteReferral(req)
              .then((res) => {
                this.dialog.close('1');
                this.onDeleteSuccess(res);
              }, () => {
                this.onDeleteFailure();
              });
          }
        });
      }
    }
  }

  onDeleteSuccess = (res) => {
    if (res?.status == 1) {
      this.toastrFactory.success(
        this.translate.instant("Delete Successful."),
        this.translate.instant('Success'));
      this.dialog.close(res?.data);
      this.getReferrals(this.route.patientId);
    }

  }

  onDeleteFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('There was an error.'),
      this.translate.instant('Server Error'));
  }

  showReferralForm($event, addOrEditReferral) {
    this.dialog = this.dialogService.open
      ({
        appendTo: this.containerRef,
        content: ReferralPatientDetailsComponent
      });
    this.dialog.content.instance.IsFromClinicals = true;
    if (this.dialog.dialog.location.nativeElement.children != undefined && this.dialog.dialog.location.nativeElement.children[1] != undefined) {
      this.dialog.dialog.location.nativeElement.children[1].classList.add('k-add-referral-window');
    }
    if (this.dialog.content?.instance) {
      this.patientProfile['imageUrl'] = this.imageUrl;
      this.patientProfile['hasImage'] = this.hasImage;
      this.patientProfile["alerts"] = this.alerts;
      if (addOrEditReferral == 'editReferral') {
        this.editReferral = {

          referralDirectionId: $event.referralDirectionTypeId,
          referralCategoryId: $event.referralCategoryId,
          referringProviderId: ($event.referralDirectionTypeId == 1 && $event.referralCategoryId == 1) ? $event.referralAffiliate?.referralAffiliateId : '',
          notes: $event.note,
          isPrintTreatmentPlan: $event.isPrintTreatmentPlan ?? false,
          patientId: !$event.referralAffiliate?.isExternal ? $event.referralId : null,
          patientFirstName: $event.referralAffiliate?.isExternal ? $event.referralAffiliate?.firstName : '',
          patientLastName: $event.referralAffiliate?.isExternal ? $event.referralAffiliate?.lastName : '',
          patientEmailAddress: $event.referralAffiliate?.isExternal ? $event.referralAffiliate?.emailAddress : '',
          patientPhone: $event.referralAffiliate?.isExternal ? $event.referralAffiliate?.phone : '',
          sourceNameId: $event.otherSource?.sourceId,
          campaignName: $event.otherSource?.campaignName,
          isPatientExternal: $event.referralAffiliate?.isExternal,
          planId: $event.referralDirectionTypeId == 2 ? $event.treatmentPlanId : '',
          selectedProvider: $event.referralDirectionTypeId == 2 ? $event.referringProviderId : null,
          referringToProviderId: $event.referralDirectionTypeId == 2 ? $event.referralAffiliate?.referralAffiliateId : null,
          referringPatientId: ($event.referralDirectionTypeId == 1 && $event.referralCategoryId == 2) ? $event.referralAffiliate?.referralAffiliateId : '',
          referralId: $event.referralId,
          returnDate: $event.returnDate ? new Date($event.returnDate) : null,
          actualReturnDate: $event.actualReturnDate ? new Date($event.actualReturnDate) : null
        };
        this.dialog.content.instance.EditReferral = this.editReferral;
      }
      this.dialog.content.instance.PatientProfile = this.patientProfile;
      this.dialog.content.instance.AddOrEditReferral = addOrEditReferral;
    }
    this.dialog.result.subscribe((result) => {
      if (this.dialog.dialog.location.nativeElement.children != undefined && this.dialog.dialog.location.nativeElement.children[1] != undefined) {
        this.dialog.dialog.location.nativeElement.children[1].classList.remove('k-add-referral-window');
      }
      if (result == '1') {
        this.getReferralSources();
        this.toastrFactory.success(
          this.translate.instant("New Referral Record Created"),
          this.translate.instant('Success'));
        this.getReferrals(this.route.patientId);
      }
      else if (result == '2') {
        this.toastrFactory.success(
          this.translate.instant("Referral record has been saved."),
          this.translate.instant('Success'));
        this.getReferrals(this.route.patientId);
      }

    });
  }

  getBlueImage = () => {

    this.blueImagingService.getImageThumbnailByPatientId(this.patientProfile.PatientId)
      .then(result => {
        const objectURL = URL.createObjectURL(result);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.hasImage = true;
      })
      .catch(error => {
        console.log("Patient photo not found in Dolphin Blue Imaging")
      });
  }


  getMedicalHistoryAlerts = () => {
    this.alerts = '';
    if (this.personFactory?.PatientAlerts != null && this.personFactory?.PatientAlerts != undefined) {
      this.personFactory?.PatientAlerts.forEach(alert => {
        this.alerts += alert.Description + ', ';
      });
    }
    else {
      this.patientMedicalHistoryAlertsFactory?.PatientMedicalHistoryAlerts(this.patientProfile?.PatientId)
        .then((res: SoarResponse<MedicalHistoryAlert>) => {
          console.log(res);
          this.personFactory?.SetPatientMedicalHistoryAlerts(res?.Value);
        })
    }
    if (this.alerts != undefined)
      this.alerts = this.alerts.substring(0, this.alerts.length - 2);
  }

  getPatientInfo = () => {
    this.patientCommunicationCenterService
      .getPatientInfoByPatientId(this.route.patientId)
      .subscribe(
        (patientInfo: any) => {
          if (patientInfo && patientInfo.FirstName && patientInfo.LastName) {
            this.getPatientInfoByPatientIdSuccess(patientInfo);
          }

        },
        error => this.getPatientInfoByPatientIdFailure()
      );
  };

  getPatientInfoByPatientIdSuccess = (res: any) => {
    if (res) {
      this.patientProfile = res;
      this.patientProfile.PatientId = this.route.patientId;
      this.patientProfile["workphone"] = this.patientProfile.PhoneNumbers != null
        && this.patientProfile.PhoneNumbers?.find(x => x.Type == 'Work') != null ?
        this.patientProfile.PhoneNumbers?.find(x => x.Type == 'Work')?.PhoneNumber : '';
      this.patientProfile["phone"] = this.patientProfile.PhoneNumbers != null
        && this.patientProfile.PhoneNumbers?.find(x => x.IsPrimary) != null ?
        this.patientProfile.PhoneNumbers.find(x => x.IsPrimary)?.PhoneNumber : '';
      this.patientProfile["isMobile"] = this.patientProfile.PhoneNumbers != null
        && this.patientProfile.PhoneNumbers?.find(x => x.IsPrimary && x.Type == 'Mobile') != null ?
        true : false;
      this.patientProfile["email"] = this.patientProfile.Emails?.find(e => e.IsPrimary)?.Email;

      var patientName = '';
      var patientInitials = '';
      if (this.patientProfile.Suffix) {
        patientName += ` ${this.patientProfile.Suffix as string},`;
      }
      if (this.patientProfile.FirstName) {
        patientName += !this.patientProfile.Suffix ? `${this.patientProfile.FirstName as string}` : `${this.patientProfile.FirstName as string}`
      }
      if (this.patientProfile.MiddleName) {
        patientName += ` ${this.patientProfile.MiddleName as string}`;
      }

      if (this.patientProfile.LastName) {
        patientName += ` ${this.patientProfile.LastName as string}`;
      }
      patientInitials = `${this.patientProfile.FirstName[0].toUpperCase() as string}${this.patientProfile.LastName[0].toUpperCase() as string}`;

      this.profileDetails = {
        patientName: patientName,
        patientInitials: patientInitials,
        dateOfBirth: this.patientProfile.DateOfBirth,
        height: this.patientProfile.HeightFeet + "'" + this.patientProfile.HeightInches,
        gender: this.patientProfile.Sex == 'M' ? 'Male' : (this.patientProfile.Sex == 'F' ? 'Female' : ''),
        signatureOnFile: this.patientProfile.IsSignatureOnFile == 0 ? 'No' : 'Yes',
        responsibleParty: this.patientProfile.ResponsiblePersonName,
        status: this.patientProfile.IsActive == 0 ? 'InActive' : 'Active',
        weight: this.patientProfile.Weight,
        imageUrl: this.patientProfile.imageUrl,
        hasImage: this.patientProfile.hasImage,
        alerts: this.patientProfile.alerts,
        phone: this.patientProfile.phone,
        email: this.patientProfile.email,
        workphone: this.patientProfile.workphone,
        isMobile: this.patientProfile.isMobile
      };

    }
  };
  getPatientInfoByPatientIdFailure = () => { };

  ngOnDestroy() {

  }

  printReferral = (dataItem: GetReferralsResponseDto) => {
    var addressParts = this.getProviderDetailsAddress(dataItem);
    var printPatientReferral: PrintPatientReferral = {
      name: this.profileDetails['patientName'],
      dob: this.formatDate(this.profileDetails['dateOfBirth']),
      age: this.calculateAge(this.profileDetails['dateOfBirth']),
      phone: this.formatPhoneNumber(this.profileDetails['phone']),
      workPhone: this.formatPhoneNumber(this.profileDetails['workphone']),
      email: this.profileDetails['email'],
      gender: this.profileDetails['gender'],
      responsibleParty: this.profileDetails['responsibleParty'],
      height: this.profileDetails['height'],
      weight: this.profileDetails['weight'],
      alerts: this.alerts,
      signatureOnFile: this.profileDetails['signatureOnFile'],
      statusPatient: this.profileDetails['status'],
      notes: dataItem.note,
      referringOfficeAddress1: addressParts[0],
      practiceName: JSON.parse(sessionStorage.getItem('userPractice'))?.name,
      referringOfficeName: this.getRefferingOfficeName(dataItem),
      referringDoctorName: this.getReferringDoctorName(dataItem),
      referringPatientEmail:this.getReferringPatientEmail(dataItem),
      treatmentPlan: (this.plans == null || this.plans.length == 0 || !dataItem.isPrintTreatmentPlan) ? '' : this.plans.find(e => e.value == dataItem.treatmentPlanId)?.text,
      services: (this.plans == null || this.plans.length == 0 || dataItem.referralDirectionTypeId == 1) ? [] : this.plans.filter(e => e.value === dataItem.treatmentPlanId)?.map(plan => plan.availableServices).reduce((acc, services) => acc.concat(services), []),
      reportType: dataItem.referralDirectionTypeId == 1 ? 'Referral In' : 'Referral Out',
      referralSource: dataItem.referralAffiliateName,
      campaignName: dataItem.referralDirectionTypeId == 1 && dataItem.referralCategoryId == 3 ? dataItem.otherSource.campaignName : '',
      referralCategory: dataItem.referralCategoryId.toString(),
      referringOfficeAddress2: addressParts[1],
      returnDate: dataItem.returnDate ? this.formatDate(dataItem.returnDate) : '-',
      actualReturnDate: dataItem.actualReturnDate ? this.formatDate(dataItem.actualReturnDate) : '-',
      nextAppointment: this.nextAppointment != null ? this.formatDate(this.nextAppointment) : '-',         
      referringEmail: addressParts.length > 2 ? addressParts[2] : "",
      referringPhone: addressParts.length > 3 ? addressParts[3] : ""
    };
    this.patientReferralPrintService.downloadPatientReferral(printPatientReferral);
  }

  getAppointments = () => {
    this.patientHttpService
      .getAppointmentsByPatientId(
        this.route.patientId,
        false
      )
      .subscribe(
        (data: any) => this.getAppointmentsByPatientIdSuccess(data),
        error => this.getAppointmentsByPatientIdFailure()
      );
};

getAppointmentsByPatientIdSuccess = (res: any) => {
    if (res.length) {
        const date = new Date();
        const nextAppointments = res.filter(
          (x: any) => new Date(x.StartTime) >= date
        );
        if (nextAppointments.length && nextAppointments[0].StartTime) {
          this.nextAppointment = nextAppointments[0].StartTime;
        }
    }
  };
  getAppointmentsByPatientIdFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('Failed to retrieve the appointments.'),
      this.translate.instant('Server Error')
    );
  };

  formatPhoneNumber(phoneNumber: string): string {
    if (phoneNumber) {
      return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return '--';
    }

    getReferringPatientEmail = (dataItem: GetReferralsResponseDto) => {
        if (dataItem.referralAffiliate?.isExternal)
            return dataItem.referralAffiliate?.emailAddress;
        else return dataItem.patientEmailAddress;
    }

  getProviderDetailsAddress = (dataItem: GetReferralsResponseDto) => {
      if (dataItem.referralDirectionTypeId == 2) {
          var referringFromName = this.providerList.find(e => e["value"] == dataItem.referralAffiliate?.referralAffiliateId);
          var address =
          {
              address1: `${referringFromName?.address1} ${referringFromName?.address2}`,
              address2: `${referringFromName?.city},${referringFromName?.state} ${referringFromName?.zipCode}`,
              email: referringFromName?.emailAddress,
              phone: this.formatPhoneNumber(referringFromName?.phone)
          };
          if (address.address2 == ", ")
              address.address2 = "";
          return this.getAddress(address)||[];
    }
    else if (dataItem.referralDirectionTypeId == 1) {
        if (dataItem.referralCategoryId == 1) {
            var referringFromName = this.providerList.find(e => e.value == dataItem.referralAffiliate.referralAffiliateId);
            var address =
            {
                address1: `${referringFromName?.address1} ${referringFromName?.address2}`,
                address2: `${referringFromName?.city},${referringFromName?.state} ${referringFromName?.zipCode}`,
                email: referringFromName?.emailAddress,
                phone: this.formatPhoneNumber(referringFromName?.phone)
            };

            if (address.address2 == ", ")
                address.address2 = "";
            return this.getAddress(address) || [];
        }
        else if (dataItem.referralDirectionTypeId == 1 && dataItem.referralCategoryId == 2) {
            return this.getAddress(dataItem) || [];          
        }
        else {
            const userPractice = JSON.parse(sessionStorage.getItem('userPractice'));
            return this.getAddress(userPractice) || [];
        }
      }
      return [];
  }
  getRefferingOfficeName = (dataItem: GetReferralsResponseDto) => {
    if (dataItem.referralDirectionTypeId == 2 && dataItem.referralCategoryId == 1) {
      return [
          dataItem.referralAffiliate.practiceAffiliateName,
          dataItem.referralAffiliateName
        ].filter(Boolean).join(dataItem.referralAffiliateName.trim() ? ' - ' : '');
    }
    else if (dataItem.referralDirectionTypeId == 1) {
      return JSON.parse(sessionStorage.getItem('userPractice'))?.name;
    }
  } 

  getReferringDoctorName = (dataItem: GetReferralsResponseDto) => {
    if (dataItem.referralDirectionTypeId == 2) {
      return dataItem.referringFrom;
    }
    else if (dataItem.referralDirectionTypeId == 1 && (dataItem.referralCategoryId == 1 || dataItem.referralCategoryId == 2)) {
      return [
        dataItem.referralAffiliate.practiceAffiliateName,
        dataItem.referralAffiliateName
      ].filter(Boolean).join(dataItem.referralAffiliateName.trim() ? ' - ' : '');  
    }
  }

  calculateAge(dateOfBirth: Date): string {
    if (dateOfBirth) {
      return moment().diff(dateOfBirth, 'years').toString();
    }
    return '--';
  }

  formatDate(date: Date): string {
    if (date) {
      return moment(date).format('MM/DD/YYYY');
    }
    return '--';
  }  
  getAddress = (address) => {
    if (!address) return '';

    const { address1, address2, city, state, zipCode, email, phone } = address;
    return [address1, address2, city, state, zipCode, email, phone].filter(part => part);
  }

}

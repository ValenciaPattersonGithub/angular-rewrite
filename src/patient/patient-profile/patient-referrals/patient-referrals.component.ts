import { Component, OnInit, Input, Inject, TemplateRef, ViewContainerRef, ViewChild } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { DialogRef, DialogService } from "@progress/kendo-angular-dialog";
import { ReferralManagementHttpService } from "src/@core/http-services/referral-management-http.service";
import { DeleteReferralRequest, GetReferralRequest, GetReferralsResponseDto } from "src/business-center/practice-settings/patient-profile/referral-type/referral-type.model";
import { PatientCommunicationCenterService } from "src/patient/common/http-providers/patient-communication-center.service";
import { ProviderOnScheduleDropdownService } from "src/scheduling/providers/provider-on-schedule-dropdown.service";
import { SoarResponse } from "../../../@core/models/core/soar-response";
import { MedicalHistoryAlert } from "../../common/models/medical-history-alert.model";
import { BlueImagingService } from "../../imaging/services/blue.service";
import { ImagingMasterService } from "../../imaging/services/imaging-master.service";
import { PatientReferralCrudComponent } from "../../patient-registration/patient-referrals/patient-referral-crud/patient-referral-crud.component";
import { ReferralPatientDetailsComponent } from "../../patient-registration/patient-referrals/referral-patient-details/referral-patient-details.component";
import { map } from "rxjs/operators";

@Component({
  selector: "app-patient-referrals",
  templateUrl: "./patient-referrals.component.html",
  styleUrls: ["./patient-referrals.component.scss"],
})
export class PatientReferralsComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: false })
  patientReferral: any;
  referralType: string;
  referralSource: any;
  referralSourceDescription: string;
  addAuthAbbreviation = "soar-per-perref-add";
  editAuthAbbreviation = "soar-per-perref-edit";
  deleteAuthAbbreviation = "soar-per-perref-delete";
  deleteAccessToolTipText = 'You do not have permission to delete this record.';
  editAccessToolTipText = 'You do not have permission to edit this record.';
  hasAddAccess = false;
  hasEditAccess = false;
  hasDeleteAccess = false;
  patientReferralsList: GetReferralsResponseDto[];
  isDescending: boolean = true;
  sortColumnName: string = "dateCreated";
  sortDirection: number = -1;
  @Input() patientProfile: any;
  @Input() isTabView: boolean = false;
  dialog: DialogRef;
  public containerRef: ViewContainerRef;
  patientId: string;
  providers: any;
  imageUrl: SafeHtml;
  hasImage: boolean;
  alerts: string;
  editReferral: any;
  sourceNames: any[];

  constructor(
    @Inject("$routeParams") private route,
    @Inject("patSecurityService") private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    private referralManagementHttpService: ReferralManagementHttpService,
    private dialogService: DialogService,
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    private providerOnScheduleDropdownService: ProviderOnScheduleDropdownService,
    private blueImagingService: BlueImagingService,
    private sanitizer: DomSanitizer,
    @Inject('PatientMedicalHistoryAlertsFactory') private patientMedicalHistoryAlertsFactory,
    @Inject('PersonFactory') private personFactory,
    private imagingMasterService: ImagingMasterService,
    @Inject('referenceDataService') private referenceDataService
  ) {
    this.getReferralSources();
  }

  ngOnInit(): void {
    this.providers = this.providerOnScheduleDropdownService.getProvidersFromCache();
    this.patientId = this.patientProfile ? this.patientProfile.PatientId : this.route.patientId;
    this.getReferrals(this.patientProfile ? this.patientProfile.PatientId : this.route.patientId);
    this.authAccess();
    this.getMedicalHistoryAlerts();
    this.imagingMasterService.getServiceStatus().then(resstatus => {
      if (resstatus["blue"]["status"] === "ready") {
        this.getBlueImage();
      } else {
        console.log("Blue Imaging is Off");
      }
    }).catch(error => { console.log(error); });
  }

  getReferralSources = () => {
    this.referralManagementHttpService.getSources().then((res) => {
      this.sourceNames = res;
    });
  }

  getReferrals = (patientId: any) => {
    let req: GetReferralRequest = { PatientId: patientId, GetAll: false };
    this.referralManagementHttpService
      .getReferral(req)
      .pipe(
        map((data: any[]) => {
          return data.filter(item => {
            item.referralDirectionType = item.referralDirectionType.replace('Referral', '').trim();
            item.referralCategory = item.referralCategory == "Other" ? "External Sources" : item.referralCategory.replace('Provider', '').trim();
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
              item.referralAffiliateName = item.referralAffiliate.firstName + ' ' + item.referralAffiliate.lastName;
            } else {
              this.patientCommunicationCenterService.getPatientInfoByPatientId(item.referralAffiliate.referralAffiliateId).subscribe((person: any) => {
                item.referralAffiliateName = `${person.FirstName}  ${person.LastName}`;
              });
            }
            item.referringTo = "";
            item.referringFrom = "";
          } else if (item.referralCategoryId === 3) {
            let sourceItem = this.sourceNames.find(i => i.value.toString().toLowerCase().replace(/-/g, '') === item.otherSource.sourceId.toLowerCase().replace(/-/g, ''))
            if (sourceItem == undefined) {
              this.referralManagementHttpService.getSources().then((res) => {
                this.sourceNames = res;
                sourceItem = this.sourceNames.find(i => i.value.toString().toLowerCase().replace(/-/g, '') === item.otherSource.sourceId.toLowerCase().replace(/-/g, ''))
                item.referralAffiliateName = sourceItem ? sourceItem.text : "";
              });
            } else {
              item.referralAffiliateName = sourceItem ? sourceItem.text : "";
            }
              item.referringTo = "";
              item.referringFrom = "";
          } else if (item.referralCategoryId === 1) {
            const practiceName = item.referralAffiliate.practiceAffiliateName;
            const firstName = item.referralAffiliate.firstName;
            const lastName = item.referralAffiliate.lastName;

            item.referralAffiliateName = [
              practiceName,
              (practiceName && (lastName || firstName)) ? ' - ' : '',
              firstName,
              (lastName && firstName) ? ' ' : '',
              lastName
            ].filter(Boolean).join('').trim();
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
              item.referralAffiliateName = "";
            }

            item.referralCategory = "";
            const practiceName = item.referralAffiliate.practiceAffiliateName;
            const firstName = item.referralAffiliate.firstName;
            const lastName = item.referralAffiliate.lastName;

            item.referringTo = [
              practiceName,
              (practiceName && (lastName || firstName)) ? ' - ' : '',
              firstName,
              (lastName && firstName) ? ' ' : '',
              lastName
            ].filter(Boolean).join('').trim();
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

  sortReferrals = (propName: string, direction: number) => {
    this.isDescending = direction == 1 ? true : false;
    this.sortColumnName = propName;
    this.sortDirection = direction;
    this.patientReferralsList.sort((a, b) => {
      const valueA = a[propName] == undefined ? "" : a[propName];
      const valueB = b[propName] == undefined ? "" : b[propName];
      let comparison = 0;
      if (valueA > valueB) {
        comparison = 1;
      } else if (valueA < valueB) {
        comparison = -1;
      }
      return this.isDescending ? comparison * -1 : comparison;
    });
  }

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
              let req: DeleteReferralRequest = { ReferralId: referral.referralId, PatientId: this.patientId };
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
      this.getReferrals(this.patientId);
    }

  }

  onDeleteFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('There was an error.'),
      this.translate.instant('Server Error'));
  }

  viewAllReferrals() {

  }

  showReferralForm($event, addOrEditReferral) {
    this.dialog = this.dialogService.open({
      appendTo: this.containerRef,
      content: ReferralPatientDetailsComponent
    });
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
      if (result == '1') {
        this.toastrFactory.success(
          this.translate.instant("New Referral Record Created"),
          this.translate.instant('Success'));
        this.getReferrals(this.patientId);
      }
      else if (result == '2') {
        this.toastrFactory.success(
          this.translate.instant("Referral record has been saved."),
          this.translate.instant('Success'));
        this.getReferrals(this.patientId);
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
}

import { Component, Inject, Input, OnInit, SecurityContext } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateService } from '@ngx-translate/core';
import { OrderByPipe } from 'src/@shared/pipes';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-patient-preferences',
  templateUrl: './patient-preferences.component.html',
  styleUrls: ['./patient-preferences.component.scss'],
})
export class PatientPreferencesComponent implements OnInit {
  patientDetail: any;
  dentist: any;
  hygenist: any;
  preferedLocation: any;
  alternateLocations: any[];
  patientGroups: any;
  patientDiscount: any;
  receiveStatements: any;
  receiveFinanceCharges: any;
  flags: any;
  symbolList: any;
  defaultFlagOrderKey = 'Description';
  defaultMedicalAlertsOrderKey = 'MedicalHistoryAlertDescription';
  sortDirectionAsce: any = 1;
  medicalAlerts: any;
  @Input() patientProfile: any;
  @Input() isTabView: boolean = false;
  editPersonProfileMFE: boolean;
  editAuthAbbreviation = 'soar-per-perdem-modify';
  hasEditAccess = false;
  constructor(
    @Inject('referenceDataService') private referenceDataService,
    @Inject('$routeParams') private route,
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    private translate: TranslateService,
    @Inject('StaticData') private staticData,
    private patientDetailService: PatientDetailService,
    @Inject('patSecurityService') private patSecurityService,
    private featureFlagService: FeatureFlagService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.symbolList = this.staticData.AlertIcons();
    if (this.patientProfile) {
      const patientInfo = this.patientProfile;
      if (patientInfo) {
        this.patientDetailService.setPatientPreferredDentist(patientInfo);
        this.patientDetailService.setPatientPreferredHygienist(patientInfo);
        this.dentist = patientInfo.preferredDentist;
        this.hygenist = patientInfo.preferredHygienist;
        this.receiveStatements = patientInfo.ReceivesStatements;
        this.receiveFinanceCharges = patientInfo.ReceivesFinanceCharges;
        const locations: any[] = this.referenceDataService.get(
          this.referenceDataService.entityNames.locations
        );
        if (patientInfo.Locations) {
          this.alternateLocations = [];
          const primaryLocation = patientInfo.Locations.filter(
            x => x.IsPrimary
          )[0];
          const locationName = locations.filter(
            x => x.LocationId === primaryLocation.LocationId
          )[0];
          if (locationName) {
            this.preferedLocation = locationName.NameLine1;
          }
          const otherLocations: any[] = patientInfo.Locations.filter(
            x => !x.IsPrimary
          );
          if (otherLocations) {
            otherLocations.forEach(loc => {
              this.alternateLocations.push(
                locations.filter(x => x.LocationId === loc.LocationId)[0]
                  .NameLine1
              );
            });
          }
        }
      }
    }
    this.initializeArrays();
    this.getAdditionalInfo(
      this.patientProfile ? this.patientProfile.PatientId : this.route.patientId
    );
    this.getPatientDiscount(
      this.patientProfile ? this.patientProfile.PatientId : this.route.patientId
    );
    this.getPatientFlagsAndAlert(
      this.patientProfile ? this.patientProfile.PatientId : this.route.patientId
    );
    this.authAccess();
    this.checkFeatureFlags();
  }
  initializeArrays = () => {
    this.patientGroups = [];
    this.flags = [];
    this.medicalAlerts = [];
  };
  getAdditionalInfo = (patientId: any) => {
    this.patientCommunicationCenterService
      .getAdditionalInfoByPatientId(patientId)
      .subscribe(
        (data: any) => this.getAdditionalInfoByPatientIdSuccess(data),
        error => this.getAdditionalInfoByPatientIdFailure()
      );
  };
  getAdditionalInfoByPatientIdSuccess = (additionalInfo: any) => {
    if (additionalInfo) {
      if (additionalInfo.GroupDescription) {
        this.patientGroups = additionalInfo.GroupDescription;
      }
    }
  };
  getAdditionalInfoByPatientIdFailure = () => {};
  getPatientDiscount = (patientId: any) => {
    this.patientCommunicationCenterService
      .getPatientDiscountByPatientId(patientId)
      .subscribe(
        (data: any) => this.getPatientDiscountByPatientIdSuccess(data),
        error => this.getPatientDiscountByPatientIdFailure()
      );
  };
  getPatientDiscountByPatientIdSuccess = (res: any) => {
    if (res) {
      this.patientDiscount = res.DiscountName;
    } else {
      this.patientDiscount = this.translate.instant('N/A');
    }
  };
  getPatientDiscountByPatientIdFailure = () => {};
  getPatientFlagsAndAlert = (patientId: any) => {
    this.patientCommunicationCenterService
      .getPatientFlagsAndAlertsByPatientId(patientId)
      .subscribe(
        (data: any) => this.getPatientFlagsAndAlertsByPatientIdSuccess(data),
        error => this.getPatientFlagsAndAlertsByPatientIdFailure()
      );
  };
  getPatientFlagsAndAlertsByPatientIdSuccess = (res: any) => {
    if (res) {
      if (res.Flags) {
        this.flags = [
          ...this.applyOrderByPipe(
            res.Flags,
            this.sortDirectionAsce,
            this.defaultFlagOrderKey
          ),
        ];
      }
      if (res.MedicalHistoryAlerts) {
        this.medicalAlerts = [
          ...this.applyOrderByPipe(
            res.MedicalHistoryAlerts,
            this.sortDirectionAsce,
            this.defaultMedicalAlertsOrderKey
          ),
        ];
      }
    }
  };
  getPatientFlagsAndAlertsByPatientIdFailure = () => {};
  applyOrderByPipe = (data: any, sortOrder: any, orderKey: any) => {
    const orderPipe = new OrderByPipe();
    return orderPipe.transform(data, {
      sortColumnName: orderKey,
      sortDirection: sortOrder,
    });
  };
  getClass = id => {
    return this.symbolList.getClassById(id);
  };
  updatePerson = () => {
    let urlPerson = `#/Patient/${
      this.patientProfile ? this.patientProfile.PatientId : this.route.patientId
    }/Person/?sectionId=4`;
    let urlPersonTab = `#/Patient/${
      this.patientProfile ? this.patientProfile.PatientId : this.route.patientId
    }/PersonTab/?sectionId=4`;
    if (this.editPersonProfileMFE) {
      urlPerson = urlPerson.replace('#/Patient/', '#/patientv2/');
      urlPersonTab = urlPersonTab.replace('#/Patient/', '#/patientv2/');
    }
    const path = this.isTabView ? urlPersonTab : urlPerson;
    window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);
  };
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };
  authAccess = () => {
    this.hasEditAccess = this.authAccessByType(this.editAuthAbbreviation);
  };
  checkFeatureFlags() {  
    this.featureFlagService.getOnce$(FuseFlag.EnableEditProfileMFEPage).subscribe((value) => {
        this.editPersonProfileMFE = value;
    });
  };
}

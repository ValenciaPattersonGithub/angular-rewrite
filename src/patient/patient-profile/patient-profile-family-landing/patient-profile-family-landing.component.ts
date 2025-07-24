import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  SecurityContext,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { observable, Observable, Subject, Subscription } from 'rxjs';
import { subscribeOn, takeUntil } from 'rxjs/operators';
import { FuseFlag } from 'src/@core/feature-flags';
import { ToastService } from 'src/@shared/components/toaster/toast.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { patientProfileTabs } from 'src/patient/common/models/patientProfileTabs.model';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
declare let _: any;

@Component({
  selector: 'app-patient-profile-family-landing',
  templateUrl: './patient-profile-family-landing.component.html',
  styleUrls: ['./patient-profile-family-landing.component.scss'],
})
export class PatientProfileFamilyLandingComponent implements OnInit, OnDestroy {
  patientInfo: any;
  patientDetail: Observable<any>;
  selectedTab: FormControl;
  tabs: Array<patientProfileTabs>;
  private patientInfoSub: Subscription;
  private patientTabInfoSub: Subscription;
  private unsubscribe$: Subject<any> = new Subject<any>();
  private isTabView: boolean = false;
  patientProfileForReferrals: any;
  @ViewChild('noResponisblePersonContent')
  noResponisblePersonContent: TemplateRef<any>;
  hideReferral: boolean = true;
  editPersonProfileMFE: boolean;
  constructor(
    @Inject('$routeParams') private route,
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    private registrationService: PatientRegistrationService,
    private toastService: ToastService,
    private featureFlagService: FeatureFlagService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // this.isTabView = true;
    this.checkFeatureFlags();
    this.selectedTab = new FormControl(0);
    this.getPatientInfo();
    this.registrationService
      .getRegistrationEvent()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: RegistrationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case RegistrationEvent.PerformNavigation:
              this.navigateToUrl(event.data);
              break;
          }
        }
      });
  }
  getPatientInfo = () => {
    this.patientInfoSub = this.patientCommunicationCenterService
      .getPatientInfoByPatientId(this.route.patientId)
      .subscribe(
        (patientInfo: any) => {
          if (patientInfo && patientInfo.FirstName && patientInfo.LastName) {
            this.tabs = new Array<patientProfileTabs>({
              title: `${patientInfo.FirstName}  ${patientInfo.LastName.charAt(
                0
              )}.`,
              personId: this.route.patientId,
              patientInfo: patientInfo,
              isTabComplete: new FormControl(false),
            });
          }
          this.getPatientInfoByPatientIdSuccess(patientInfo);
        },
        error => this.getPatientInfoByPatientIdFailure()
      );
  };
  getPatientTabInfo = (patientId: any) => {
    this.patientTabInfoSub = this.patientCommunicationCenterService
      .getPatientInfoByPatientId(patientId)
      .subscribe(
        (patientInfo: any) => {
          this.tabs[this.selectedTab.value].patientInfo = patientInfo;
          this.getPatientInfoByPatientIdTabSuccess(patientInfo);
        },
        error => this.getPatientInfoByPatientIdFailure()
      );
  };
  getPatientInfoByPatientIdSuccess = (res: any) => {
      if (res) {
          this.patientInfo = res;
          this.patientInfo.PatientId = this.route.patientId;
          if (!this.patientInfo.ResponsiblePersonName) {
              this.toastService.show(
                  {
                      type: 'error',
                      title:
                          ' A responsible person must be assigned to access the account.',
                      template: this.noResponisblePersonContent,
                  },
                  false
              );
          }
          this.patientProfileForReferrals = this.patientInfo;
          this.patientProfileForReferrals["workphone"] = this.patientInfo.PhoneNumbers != null
              && this.patientInfo.PhoneNumbers?.find(x => x.Type == 'Work') != null ?
              this.patientInfo.PhoneNumbers?.find(x => x.Type == 'Work')?.PhoneNumber : '';
          this.patientProfileForReferrals["phone"] = this.patientInfo.PhoneNumbers != null
              && this.patientInfo.PhoneNumbers?.find(x => x.IsPrimary) != null ?
              this.patientInfo.PhoneNumbers.find(x => x.IsPrimary)?.PhoneNumber : '';
          this.patientProfileForReferrals["isMobile"] = this.patientInfo.PhoneNumbers != null
              && this.patientInfo.PhoneNumbers?.find(x => x.IsPrimary && x.Type=='Mobile') != null ?
              true : false;
          this.patientProfileForReferrals["email"] = this.patientInfo.Emails?.find(e => e.IsPrimary)?.Email;
      }
  };
  getPatientInfoByPatientIdTabSuccess = (res: any) => {
    if (res) {
      this.tabs[this.selectedTab.value].patientInfo = res;
      this.tabs[this.selectedTab.value].patientInfo.PatientId =
        this.tabs[this.selectedTab.value].personId;
      if (
        !this.tabs[this.selectedTab.value].patientInfo.ResponsiblePersonName
      ) {
        this.toastService.show(
          {
            type: 'error',
            title:
              ' A responsible person must be assigned to access the account.',
            template: this.noResponisblePersonContent,
          },
          false
        );
      }
    }
  };
  getPatientInfoByPatientIdFailure = () => {};
  updatePerson = () => {
    let urlPerson = `#/Patient/${
      this.tabs[this.selectedTab.value].personId
    }/Person?sectionId=1`;
    let urlPersonTab = `#/Patient/${
      this.tabs[this.selectedTab.value].personId
    }/PersonTab?sectionId=1`;

    if(this.editPersonProfileMFE) {
      urlPerson = urlPerson.replace('#/Patient/', '#/patientv2/');
      urlPersonTab = urlPersonTab.replace('#/Patient/', '#/patientv2/');
    }
    
    const path = this.isTabView
      ? _.escape(urlPersonTab)
      : _.escape(urlPerson);
    
    window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);
  };

  onAccountMemberFill(data): void {
    if ((this.tabs[0].isTabComplete.value as boolean) == false) {
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (this.tabs[0].personId == data[i].PatientId) {
            this.tabs[0].title = data[i].IsResponsiblePerson
              ? this.tabs[0].title + '(RP)'
              : this.tabs[0].title;
            this.tabs[0].isTabComplete.setValue(true);
            continue;
          }
          this.tabs.push({
            title: data[i].IsResponsiblePerson
              ? `${data[i].FirstName}  ${data[i].LastName.charAt(0)}.(RP)`
              : `${data[i].FirstName}  ${data[i].LastName.charAt(0)}.`,
            personId: data[i].PatientId,
            patientInfo: null,
            isTabComplete: new FormControl(true),
          });
        }
      }
    }
  }

  navigateToUrl = (url: string) => {
    window.location.href = _.escape(url);
  };
  onTabChange(tabIndex: number) {
    this.selectedTab.setValue(tabIndex);
    if (this.selectedTab.value > 0)
      this.getPatientTabInfo(this.tabs[tabIndex].personId);
  }

  ngOnDestroy() {
    this.toastService.close();
    if (this.patientInfoSub) this.patientInfoSub.unsubscribe();
    if (this.patientTabInfoSub) this.patientTabInfoSub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  checkFeatureFlags() {
    this.featureFlagService.getOnce$(FuseFlag.ShowPatientReferralsOnClinical).subscribe((value) => {
        this.hideReferral = !value;
    });

    this.featureFlagService.getOnce$(FuseFlag.EnableEditProfileMFEPage).subscribe((value) => {
        this.editPersonProfileMFE = value;
    });
  };
}

import {
  Component,
  OnInit,
  Inject,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { PatientCommunicationCenterService } from '../../common/http-providers/patient-communication-center.service';
import { PatientCommunication } from 'src/patient/common/models/patient-communication.model';
import { CommunicationSort } from 'src/patient/common/models/enums/communication-sort.enum';
import { CommunicationCardComponent } from '../communication-card/communication-card.component';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import {
  CommunicationEvent,
  CommunicationTab,
  FormMode,
  TabIdentifier,
  CommunicationHeader,
} from 'src/patient/common/models/enums';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { PatientCommunicationTemplate } from 'src/patient/common/models/patient-communication-templates.model';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { GetCommunicationReferralsResponseDto, GetReferralRequest, GetReferralsResponseDto, ReferralAffiliateResponse } from 'src/business-center/practice-settings/patient-profile/referral-type/referral-type.model';
import { ProviderOnScheduleDropdownService } from 'src/scheduling/providers/provider-on-schedule-dropdown.service';
import { Provider } from 'src/patient/patient-registration/patient-referrals/patient-referral-model';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';

@Component({
  selector: 'communication-center-timeline',
  templateUrl: './communication-center-timeline.component.html',
  styleUrls: ['./communication-center-timeline.component.scss'],
})
export class CommunicationCenterTimelineComponent implements OnInit, OnDestroy {
  patientCommunications: Array<{
    GroupId: number;
    GroupName: string;
    Communications: Array<PatientCommunication>;
  }>;
  selectedCommunication: PatientCommunication;
  todayComunications: Array<PatientCommunication>;
  yesterdayComunications: Array<PatientCommunication>;
  currentWeekComunications: Array<PatientCommunication>;
  previousWeekComunications: Array<PatientCommunication>;
  currentYearComunications: Array<PatientCommunication>;
  previousYearComunications: Array<PatientCommunication>;
  currentMonthComunications: Array<PatientCommunication>;
  previousMonthComunications: Array<PatientCommunication>;
  priorYearsComunications: Array<PatientCommunication>;
  filteredCommunications: any;
  defaultFilteredCommunications: any[];
  defaultCommunications: any[];
  communicationsFilterObject: any;
  patientInformation: any;
  checkValue: any;
  CommunicationSort = CommunicationSort;
  filteredTemplates: Array<PatientCommunicationTemplate>;
  @ViewChildren(CommunicationCardComponent)
  cards: QueryList<CommunicationCardComponent>;
  todaysDate: any;
  private unsubscribe$: Subject<any> = new Subject<any>();
  utcstring: any = ' UTC';
  patientReferralsList: GetReferralsResponseDto[];
  sourceNames = [];
  providers: any;
  providerList: Provider[];
  referralsFeatureFlag: boolean = false;
  constructor(
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    private patientDetailService: PatientDetailService,
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    @Inject('$routeParams') private route,
    @Inject('tabLauncher') private tabLauncher,
    private datepipe: DatePipe,
    private referralManagementHttpService: ReferralManagementHttpService,
    private providerOnScheduleDropdownService: ProviderOnScheduleDropdownService,
    private featureFlagService: FeatureFlagService
  ) {
    this.featureFlagService.getOnce$(FuseFlag.PatientCommunicationCenterReferral).subscribe((value) => {
      this.referralsFeatureFlag = value;
      if (this.referralsFeatureFlag){
        this.getRefferingProviders();
        this.referralManagementHttpService.getSources().then((res) => {
          this.sourceNames = res;
        });
      }
    });
  }

  ngOnInit() {
    this.providers = this.providerOnScheduleDropdownService.getProvidersFromCache();
    this.todaysDate = this.truncateTime(new Date());
    if (this.route.tabIdentifier) {
      this.patientCommunicationCenterService.cachedCommunicationTab = null;
      if (Number(this.route.tabIdentifier) === TabIdentifier.OtherToDo) {
        this.patientCommunicationCenterService.activeTab =
          CommunicationTab.ToDo;
      } else if (Number(this.route.tabIdentifier) === TabIdentifier.AddRecord) {
        this.patientCommunicationCenterService.activeTab =
          CommunicationTab.Communication;
      } else if (
        Number(this.route.tabIdentifier) === TabIdentifier.GenerateLetter
      ) {
        this.patientCommunicationCenterService.activeTab =
          CommunicationTab.GenerateLetter;
      }
      this.route.withDrawerOpened = true;
    } else {
      this.patientCommunicationCenterService.setCommunicationEvent({
        eventtype: CommunicationEvent.DrawerVisibility,
        data: {
          drawerType: CommunicationHeader.CommunicationDrawer,
          data: this.route.withDrawerOpened,
        },
      });
    }
    this.initializeArrays();
    this.subscribeInitializations();
    this.patientCommunicationCenterService
      .getCommunicationEvent()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: CommunicationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case CommunicationEvent.CSVExport:
              if (this.patientCommunications.length) {
                this.filteredCommunications.forEach(
                  (communication: PatientCommunication, index: number) => {
                    if (
                      communication.CommunicationTemplateId &&
                      this.patientCommunicationCenterService
                        .communicationTemplates &&
                      this.patientCommunicationCenterService
                        .communicationTemplates.length
                    ) {
                      this.filteredTemplates =
                        this.patientCommunicationCenterService.communicationTemplates.filter(
                          x =>
                            x.CommunicationTemplateId ===
                            communication.CommunicationTemplateId
                        );
                      if (
                        this.filteredTemplates &&
                        this.filteredTemplates.length
                      ) {
                        communication.LetterTemplateName =
                          this.filteredTemplates[0].TemplateName;
                      }
                    }
                  }
                );
                this.patientCommunicationCenterService.exportCSV(
                  this.filteredCommunications,
                  this.patientInformation
                );
              } else {
                this.toastrFactory.error(
                  this.translate.instant('There are no records.'),
                  this.translate.instant('Information')
                );
              }
              break;
            case CommunicationEvent.Print:
              if (this.patientCommunications.length) {
                const patientId = this.route.patientId;
                const printableData = this.getDataforPrint();
                localStorage.setItem(
                  'communications_' + patientId,
                  JSON.stringify(printableData)
                );
                this.tabLauncher.launchNewTab(
                  `#/Patient/${patientId}/PrintCommunications/`
                );
              } else {
                this.toastrFactory.error(
                  this.translate.instant('There are no records.'),
                  this.translate.instant('Information')
                );
              }
              break;
            case CommunicationEvent.UpdateTimeLine:
              if (event.data) {
                this.handleUpdateCommunicationEvent(event.data);
              }
              break;
            case CommunicationEvent.KeyBoard:
              if (event.data) {
                this.handleKeyBoardEvent(event.data);
              }
              break;
            case CommunicationEvent.ApplyCommunicationsFilters:
              if (event.data) {
                this.handleApplyCommunicationsFiltersEvent(event.data);
              }
              break;
            case CommunicationEvent.NewCommunication:
              if (event.data) {
                this.handleNewCommunicationEvent(event.data);
              }
          }
        }
      });
      
  }
  subscribeInitializations = () => {
    this.patientCommunicationCenterService
      .getPatientInfoByPatientId(this.route.patientId)
      .subscribe(
        (patientInfo: any) => {
          if (patientInfo) {
            this.patientInformation = patientInfo;
            this.patientDetailService.setPatientPreferredDentist(patientInfo);
            this.patientDetailService.setPatientPreferredHygienist(patientInfo);
            this.patientCommunicationCenterService.patientDetail = {
              Profile: patientInfo,
            };
            if (this.route.tabIdentifier) {
              this.patientCommunicationCenterService.setCommunicationEvent({
                eventtype: CommunicationEvent.DrawerVisibility,
                data: {
                  drawerType: CommunicationHeader.CommunicationDrawer,
                  data: this.route.withDrawerOpened,
                },
              });
            }
            document.title =
              this.patientCommunicationCenterService.patientDetail.Profile
                .PatientCode +
              ' - ' +
              'Communications';
          }
        },
        (err: any) => {
          this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the patient info.'),
            this.translate.instant('Server Error')
          );
        }
      );
    this.patientCommunicationCenterService
      .getPatientNextAppointment(this.route.patientId)
      .subscribe(nextAppointment => {
        if (
          nextAppointment &&
          nextAppointment.StartTime &&
          nextAppointment.UserId
        ) {
          const nextApptLocalizedStartTime =
            this.patientDetailService.getNextAppointmentStartTimeLocalized(
              nextAppointment
            );
          nextAppointment.$$StartTimeLocal = nextApptLocalizedStartTime;
          this.patientCommunicationCenterService.NextAppointment =
            nextAppointment;
        }
      });

    this.patientCommunicationCenterService.updatePatientCommunications$.subscribe(
      (communication: any) => {
        if (communication) {
          this.patientCommunicationCenterService
            .getPatientCommunicationByPatientId(this.route.patientId)
            .subscribe(
              (communications: any) => {
                if (communications) {
                  this.initializeArrays();
                  communications.forEach(
                    (com: PatientCommunication, index: number) => {
                      com.Index = index;
                      com.CommunicationDate = new Date(
                        new Date(com.CommunicationDate).toLocaleString() +
                          this.utcstring
                      );
                      if (com.PatientCommunicationId != 0)
                        com.DateModified = new Date(
                          new Date(com.DateModified).toLocaleString() +
                            this.utcstring
                        );
                    }
                  );
                  if (this.communicationsFilterObject) {
                    this.defaultCommunications = communications;
                    this.filteredCommunications = [
                      ...this.filterCommunications(
                        this.communicationsFilterObject,
                        communications
                      ),
                    ];
                  }
                  this.applyGlobalFilter();
                  const updatedPatientCommunication =
                    this.defaultCommunications.filter(
                      (x: any) =>
                        x.PatientCommunicationId ===
                        communication.PatientCommunicationId
                    );
                  if (updatedPatientCommunication) {
                    this.setFocusOnCard(updatedPatientCommunication[0].Index);
                  }
                  this.onCardSelection(updatedPatientCommunication[0]);
                }
              },
              (err: any) => {
                this.transformModeltoViewModel(null);
              }
            );
        }
      }
    );
    this.patientCommunicationCenterService
      .getPatientCommunicationByPatientId(this.route.patientId)
      .subscribe(
        (communications: any) => {
          if (communications) {
            this.initializeArrays();
            this.defaultCommunications = communications;

            this.getPatientReferrals(this.route.patientId).subscribe(res => {
              if (res){
                let referrals = res.referrals;
                let referralCommunications = res.referralCommunications;
                this.patientReferralsList = referrals;

                let formattedReferrals = this.formatReferralData(this.patientReferralsList);
                this.defaultCommunications.push(...formattedReferrals);
                
                let formattedReferralCommunications = this.formatReferralCommunications(referralCommunications);
                this.defaultCommunications.push(...formattedReferralCommunications);
              }

              this.defaultCommunications.forEach(
                (com: PatientCommunication, index: number) => {
                  com.Index = index;
                  com.CommunicationDate = new Date(
                    new Date(com.CommunicationDate).toLocaleString() +
                      this.utcstring
                  );
                  if (com.PatientCommunicationId != 0)
                    com.DateModified = new Date(
                      new Date(com.DateModified).toLocaleString() + this.utcstring
                    );
                }
              );
              if (this.communicationsFilterObject) {
                this.filteredCommunications = [
                  ...this.filterCommunications(
                    this.communicationsFilterObject,
                    communications
                  ),
                ];
                this.transformModeltoViewModel(this.filteredCommunications);
                this.onCardSelection(this.filteredCommunications[0]);
              } else {
                this.transformModeltoViewModel(this.defaultCommunications);
                this.onCardSelection(this.defaultCommunications[0]);
              }
            });
          }
        },
        (err: any) => {
          this.transformModeltoViewModel(null);
        }
      );
  };

  formatReferralData(referrals){
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
        if (this.providers && this.providers.CachedObj && item.referringProviderId) {
          let _provider = this.providers.CachedObj.find(p => p.UserId == item.referringProviderId);
          item.referringFrom = _provider ? `${_provider.FirstName}  ${_provider.LastName}` : "";
          item.referralAffiliateName = item.referralAffiliate?.firstName + ' ' + item.referralAffiliate?.lastName;
        }

        item.referralCategory = "";
        item.referringTo = item.referralAffiliate?.firstName + ' ' + item.referralAffiliate?.lastName;
      }
    }

    let formattedReferrals = [];

    formattedReferrals = referrals.map(referral => ({
      PatientCommunicationId: referral.referralId,
      PatientId: this.route.patientId,
      CommunicationType: 5,
      CommunicationCategory: 4,
      Reason: 17,
      Notes: referral.note || '',
      DueDate: null,
      CommunicationDate: referral.dateCreated,
      IsComplete: null,
      LetterTemplate: null,
      CommunicationTemplateId: null,
      Status: 0,
      IsRead: null,
      PatientCommunicationData: null,
      CreatedBy: referral.referringProviderId,
      PersonAccountNoteId: null,
      AccountId: "00000000-0000-0000-0000-000000000000",
      CommunicationMode: 3,
      LetterTemplateName: null,
      DataTag: null,
      UserModified: referral.referringProviderId,
      DateModified: referral.dateCreated,
      Index: this.defaultCommunications.length + formattedReferrals.length,
      AddedBy: referral.referringProviderId,
      ReferralCategory: referral.referralCategory,
      ReferralAffiliate: referral.referralAffiliate,
      ReferralCategoryId: referral.referralCategoryId,
      ReferralDirectionType: referral.referralDirectionType,
      ReferralDirectionTypeId: referral.referralDirectionTypeId,
      TreatmentPlanId: referral.treatmentPlanId,
      IsPrintTreatmentPlan: referral.isPrintTreatmentPlan,
      ReturnDate: referral.returnDate,
      ReferralAffiliateName: referral.referralAffiliateName,
      ReferringFrom: referral.referringFrom,
      PatientInfo: this.patientInformation,
      ReferringOfficeName: this.getRefferingOfficeName(referral),
      ReferringDoctorName: this.getReferringDoctorName(referral),
      ReferringOfficeAddress1: this.getProviderDetailsAddress(referral)[0],
      ReferringOfficeAddress2: this.getProviderDetailsAddress(referral)[1],
      PracticeName: JSON.parse(sessionStorage.getItem('userPractice'))?.name,
    }));

    return formattedReferrals;
  }

  formatReferralCommunications(referralCommunications){
    let formattedReferralCommunications = [];
    formattedReferralCommunications = referralCommunications.map(referral => ({
      PatientCommunicationId: referral.referralCommunicationId,
      PatientId: this.route.patientId,
      CommunicationType: referral.communicationType,
      CommunicationCategory: referral.communicationCategory,
      Reason: referral.reason,
      Notes: referral.notes || '',
      DueDate: null,
      CommunicationDate: referral.communicationDate,
      IsComplete: null,
      LetterTemplate: referral.letterTemplate,
      CommunicationTemplateId: null,
      Status: referral.status,
      IsRead: null,
      PatientCommunicationData: null,
      CreatedBy: referral.createdBy,
      PersonAccountNoteId: null,
      AccountId: "00000000-0000-0000-0000-000000000000",
      CommunicationMode: referral.communicationMode,
      LetterTemplateName: null,
      DataTag: null,
      UserModified: referral.userModified,
      DateModified: referral.dateModified,
      Index: this.defaultCommunications.length + formattedReferralCommunications.length,
      AddedBy: null,
      PatientInfo: this.patientInformation
    }));

    return formattedReferralCommunications;
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

  getProviderDetailsAddress = (dataItem: GetReferralsResponseDto) => {
    if (dataItem.referralDirectionTypeId == 2) {
        var referringFromName = this.providerList.find(e => e["value"] == dataItem.referralAffiliate?.referralAffiliateId);
        var address =
        {
            address1: `${referringFromName?.address1} ${referringFromName?.address2}`,
            address2: `${referringFromName?.city},${referringFromName?.state} ${referringFromName?.zipCode}`
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
                address2: `${referringFromName?.city},${referringFromName?.state} ${referringFromName?.zipCode}`
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
  getAddress = (address) => {
    if (!address) return '';

    const { address1, address2, city, state, zipCode } = address;
    return [address1, address2, city, state, zipCode].filter(part => part);
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

  applyGlobalFilter = () => {
    this.initializeArrays();
    this.filteredCommunications = [
      ...this.filterCommunications(
        this.communicationsFilterObject,
        this.defaultCommunications
      ),
    ];
    this.transformModeltoViewModel(this.filteredCommunications);
    this.onCardSelection(this.filteredCommunications[0]);
    if (
      this.communicationsFilterObject.SortFilter ===
      CommunicationSort.NewestToOldest
    ) {
      this.patientCommunications.sort((a, b) =>
        a.GroupId > b.GroupId ? 1 : -1
      );
    }
    if (
      this.communicationsFilterObject.SortFilter ===
      CommunicationSort.OldestToNewest
    ) {
      this.patientCommunications.sort((a, b) =>
        a.GroupId < b.GroupId ? 1 : -1
      );
    }
  };
  initializeArrays = () => {
    this.patientCommunications = [];
    (this.todayComunications = []),
      (this.yesterdayComunications = []),
      (this.currentWeekComunications = []),
      (this.previousWeekComunications = []),
      (this.currentYearComunications = []),
      (this.previousYearComunications = []),
      (this.previousMonthComunications = []),
      (this.currentMonthComunications = []),
      (this.priorYearsComunications = []);
  };

  getPatientReferrals(patientId: string): Observable<GetCommunicationReferralsResponseDto> {
    if (this.referralsFeatureFlag){
      return this.referralManagementHttpService
      .getCommunicationReferrals(patientId)
      .pipe(
        map((data: any) => {
          return data;
        })
      );
    } else {
      return new Observable<GetCommunicationReferralsResponseDto>(observer => {
        observer.next();
        observer.complete();
      });
    }
  }

  filterCommunications = (
    communicationFiltersObject: any,
    communications: any[]
  ) => {
    if (
      communicationFiltersObject.SortFilter === CommunicationSort.NewestToOldest
    ) {
      this.filteredCommunications = communications.sort((a, b) =>
        a.CommunicationDate < b.CommunicationDate ? 1 : -1
      );
    }
    if (
      communicationFiltersObject.SortFilter === CommunicationSort.OldestToNewest
    ) {
      this.filteredCommunications = communications.sort((a, b) =>
        a.CommunicationDate > b.CommunicationDate ? 1 : -1
      );
    }
    if (
      communicationFiltersObject.CategoryFilter &&
      communicationFiltersObject.CategoryFilter !== -1
    ) {
      this.filteredCommunications = this.filteredCommunications.filter(
        (communication: any) =>
          Number(communication.CommunicationCategory) ===
          communicationFiltersObject.CategoryFilter
      );
    }
    if (communicationFiltersObject.StartDate) {
      this.filteredCommunications = this.filteredCommunications.filter(
        (communication: any) =>
          new Date(new Date(communication.CommunicationDate).toDateString()) >=
          communicationFiltersObject.StartDate
      );
    }
    if (communicationFiltersObject.EndDate) {
      this.filteredCommunications = this.filteredCommunications.filter(
        (communication: any) =>
          new Date(new Date(communication.CommunicationDate).toDateString()) <=
          communicationFiltersObject.EndDate
      );
    }
    return this.filteredCommunications;
  };
  onCardSelection = (communication: PatientCommunication) => {
    this.selectedCommunication = communication;
    this.patientCommunicationCenterService.setCommunicationEvent({
      eventtype: CommunicationEvent.PreviewCommunication,
      data: communication,
    });
  };
  transformModeltoViewModel = (communications: Array<PatientCommunication>) => {
    if (communications) {
      communications.forEach(
        (communication: PatientCommunication, index: number) => {
          communication.Index = index;
          this.buildCommunicationGroups(communication);
        }
      );
      this.appendPatientCommunication();
    }
  };
  appendPatientCommunication = () => {
    if (this.todayComunications.length) {
      this.patientCommunications.push({
        GroupId: 1,
        GroupName: 'Today',
        Communications: this.todayComunications,
      });
    }
    if (this.yesterdayComunications.length) {
      this.patientCommunications.push({
        GroupId: 2,
        GroupName: 'Yesterday',
        Communications: this.yesterdayComunications,
      });
    }
    if (this.currentWeekComunications.length) {
      this.patientCommunications.push({
        GroupId: 3,
        GroupName: 'This Week',
        Communications: this.currentWeekComunications,
      });
    }
    if (this.previousWeekComunications.length) {
      this.patientCommunications.push({
        GroupId: 4,
        GroupName: 'Last Week',
        Communications: this.previousWeekComunications,
      });
    }
    if (this.currentMonthComunications.length) {
      this.patientCommunications.push({
        GroupId: 5,
        GroupName: 'This Month',
        Communications: this.currentMonthComunications,
      });
    }
    if (this.previousMonthComunications.length) {
      this.patientCommunications.push({
        GroupId: 6,
        GroupName: 'Last Month',
        Communications: this.previousMonthComunications,
      });
    }
    if (this.currentYearComunications.length) {
      this.patientCommunications.push({
        GroupId: 7,
        GroupName: 'This Year',
        Communications: this.currentYearComunications,
      });
    }
    if (this.previousYearComunications.length) {
      this.patientCommunications.push({
        GroupId: 8,
        GroupName: 'Last Year',
        Communications: this.previousYearComunications,
      });
    }
    if (this.priorYearsComunications.length) {
      this.patientCommunications.push({
        GroupId: 9,
        GroupName: 'Prior Years',
        Communications: this.priorYearsComunications,
      });
    }
  };
  buildCommunicationGroups = (communication: any) => {
    if (communication) {
      const communicationDate = this.truncateTime(
        new Date(communication.CommunicationDate)
      );
      this.buildCurrentCommunications(
        communicationDate,
        this.todaysDate,
        communication
      );
    }
  };
  buildCurrentCommunications = (
    communicationDate: Date,
    todaysDate: Date,
    communication: PatientCommunication
  ) => {
    const yesterdayDate = this.addDays(new Date(todaysDate), -1);
    const currentWeek: any = this.getWeekStartandEndDate(todaysDate);
    const previousWeek: any = this.getWeekStartandEndDate(
      this.addDays(new Date(currentWeek.startDate), -1)
    );
    if (communicationDate.toDateString() === todaysDate.toDateString()) {
      this.todayComunications.push(communication);
    } else if (
      communicationDate.toDateString() === yesterdayDate.toDateString()
    ) {
      this.yesterdayComunications.push(communication);
    } else if (
      currentWeek &&
      communicationDate >= currentWeek.startDate &&
      communicationDate <= currentWeek.endDate
    ) {
      this.currentWeekComunications.push(communication);
    } else if (
      previousWeek &&
      communicationDate >= previousWeek.startDate &&
      communicationDate <= previousWeek.endDate
    ) {
      this.previousWeekComunications.push(communication);
    } else if (communicationDate <= todaysDate) {
      if (
        communicationDate.getMonth() === todaysDate.getMonth() &&
        communicationDate.getFullYear() === todaysDate.getFullYear()
      ) {
        this.currentMonthComunications.push(communication);
      } else if (
        communicationDate.getMonth() === todaysDate.getMonth() - 1 &&
        communicationDate.getFullYear() === todaysDate.getFullYear()
      ) {
        this.previousMonthComunications.push(communication);
      } else if (communicationDate.getFullYear() === todaysDate.getFullYear()) {
        this.currentYearComunications.push(communication);
      } else if (
        communicationDate.getFullYear() ===
        todaysDate.getFullYear() - 1
      ) {
        this.previousYearComunications.push(communication);
      } else if (
        communicationDate.getFullYear() <=
        todaysDate.getFullYear() - 2
      ) {
        this.priorYearsComunications.push(communication);
      }
    }
  };
  truncateTime = (date: Date): Date => {
    return new Date(date.toDateString());
  };
  getWeekStartandEndDate = (date: Date) => {
    const day = date.getDay();
    const startDate = new Date(date.getTime() - 60 * 60 * 24 * day * 1000);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 24 * 6 * 1000);
    return {
      startDate: this.truncateTime(startDate),
      endDate: this.truncateTime(endDate),
    };
  };
  addDays = (date: Date, days: number): Date => {
    date.setDate(date.getDate() + days);
    return this.truncateTime(date);
  };
  traverseCards = (object: any) => {
    if (this.cards) {
      let index = object.element.index;
      switch (object.action) {
        case 'UP':
          index -= 1;
          break;
        case 'DOWN':
          index += 1;
          break;
      }
      this.setFocusOnCard(index);
    }
  };
  setFocusOnCard = (index: any) => {
    const cardsArray = this.cards.toArray();
    if (index >= 0 && index < this.cards.length) {
      this.selectedCommunication = cardsArray[index].communicationModel;
      cardsArray[index].communicationCard.nativeElement.focus();
      cardsArray[index].communicationCard.nativeElement.children[0].focus();
    }
  };
  handleUpdateCommunicationEvent = (communication: PatientCommunication) => {
    if (communication) {
      if (this.defaultCommunications) {
        const index: number = this.defaultCommunications.indexOf(communication);
        if (index !== -1) {
          this.initializeArrays();
          this.defaultCommunications.splice(index, 1);
          this.applyGlobalFilter();

          this.setFocusOnCard(index + 1);

          if (this.filteredCommunications.length) {
            this.patientCommunicationCenterService.setCommunicationEvent({
              eventtype: CommunicationEvent.PreviewCommunication,
              data: this.defaultCommunications[0],
            });
          }
          this.patientCommunicationCenterService.setCommunicationEvent({
            eventtype: CommunicationEvent.DrawerVisibility,
            data: {
              drawerType: CommunicationHeader.CommunicationDrawer,
              data: false,
            },
          });
          this.patientCommunicationCenterService.drawerMode = FormMode.default;
          this.patientCommunicationCenterService.cachedCommunicationTab = null;
        }
      }
    }
  };
  handleKeyBoardEvent = (res: any) => {
    if (res) {
      this.traverseCards(res);
    }
  };
  handleApplyCommunicationsFiltersEvent = (searchFilters: any) => {
    if (searchFilters) {
      this.communicationsFilterObject = searchFilters;
      if (this.defaultCommunications) {
        this.applyGlobalFilter();
      }
    }
  };
  getDataforPrint = () => {
    const userPractice = JSON.parse(sessionStorage.getItem('userPractice'));
    let practiceName = '';
    if (userPractice) {
      practiceName = userPractice.name;
    }
    let title = 'Patient Communications for ';
    let patientCode = '';
    if (this.patientInformation) {
      if (this.patientInformation.PatientCode) {
        patientCode = this.patientInformation.PatientCode;
      }
      if (this.patientInformation.FirstName) {
        title += `${this.patientInformation.FirstName} `;
      }
      if (this.patientInformation.PreferredName) {
        title += `(${this.patientInformation.PreferredName}) `;
      }
      if (this.patientInformation.MiddleName) {
        title += `${this.patientInformation.MiddleName}. `;
      }
      if (this.patientInformation.LastName) {
        title += `${this.patientInformation.LastName}`;
      }
      if (this.patientInformation.Suffix) {
        title += `, ${this.patientInformation.Suffix}`;
      }
    }
    let subTitle = 'From ';
    if (this.communicationsFilterObject) {
      if (this.communicationsFilterObject.StartDate) {
        subTitle += `${this.datepipe.transform(
          this.communicationsFilterObject.StartDate,
          'MM/dd/yyyy'
        )} - `;
      }
      if (this.communicationsFilterObject.EndDate) {
        subTitle += this.datepipe.transform(
          this.communicationsFilterObject.EndDate,
          'MM/dd/yyyy'
        );
      }
    }
    const todayDate = this.datepipe.transform(new Date(), 'MM/dd/yyyy hh:mm a');
    return {
      ToDayDate: todayDate,
      PracticeName: practiceName,
      Title: title,
      SubTitle: subTitle,
      PatientCode: patientCode,
      Communications: this.filteredCommunications,
    };
  };
  handleNewCommunicationEvent = (communication: PatientCommunication) => {
    if (communication) {
      this.patientCommunicationCenterService
        .getPatientCommunicationByPatientId(this.route.patientId)
        .subscribe(
          (communications: any) => {
            if (communications) {
              this.initializeArrays();
              communications.forEach(
                (com: PatientCommunication, index: number) => {
                  com.Index = index;
                  com.CommunicationDate = new Date(
                    new Date(com.CommunicationDate).toLocaleString() +
                      this.utcstring
                  );
                  if (com.PatientCommunicationId != 0)
                    com.DateModified = new Date(
                      new Date(com.DateModified).toLocaleString() +
                        this.utcstring
                    );
                }
              );
              if (this.communicationsFilterObject) {
                this.defaultCommunications = communications;
                this.applyGlobalFilter();
              }
            }
          },
          (err: any) => {
            this.transformModeltoViewModel(null);
          }
        );
    }
  };
  ngOnDestroy() {
    this.patientCommunicationCenterService.patientDetail = null;
    this.patientCommunications = [];
    this.patientCommunicationCenterService.setCommunicationEvent({
      eventtype: CommunicationEvent.NewCommunication,
      data: null,
    });
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

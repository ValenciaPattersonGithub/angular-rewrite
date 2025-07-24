import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnChanges, OnInit, Output, SecurityContext, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { Email } from 'src/patient/common/models/email.model';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { ActiveTemplateModel, PatientFlags, PatientOverview } from 'src/patient/common/models/patient-overview.model';
import { Phone } from 'src/patient/common/models/phone.model';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import cloneDeep from 'lodash/cloneDeep';
import { PreventiveServicesDue } from 'src/patient/common/models/preventive-services-due.model';
import { ProviderUser } from 'src/practices/common/models/provider-user.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { MedicalHistoryAlert } from 'src/patient/common/models/medical-history-alert.model';
import { ActiveTemplateUrl, CommunicationDrawer } from 'src/patient/common/models/enums/patient.enum';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';
import { BlueImagingService } from '../../imaging/services/blue.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ImagingMasterService } from '../../imaging/services/imaging-master.service';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { FuseFlag } from '../../../@core/feature-flags';

@Component({
    selector: 'registration-header',
    templateUrl: './registration-header.component.html',
    styleUrls: ['./registration-header.component.scss']
})



export class RegistrationHeaderComponent implements OnInit, OnChanges {
    pageTitle: string;
    todaysDate: Date;
    userInformation = '';
    isOpen: boolean;

    viewAuthAbbreviation = 'soar-per-perdem-add';
    createAuthAbbreviation = 'soar-per-perdem-add';
    hasViewAccess: boolean;
    hasCreateAccess: boolean;
    @Input() patientProfile: PatientOverview;
    patientInitials: string;
    patientId: string;
    status: string;
    description: string;
    dateOfBirth: string;
    @Input() isPatientHeader = false;
    displayMoreInfo = false;
    patientDetail: PatientOverview;
    displayPhone: string;
    displayPhoneType: string;
    displayEmail: string;
    displayAddressLine1: string;
    displayAddressLine2: string;
    displayCity: string;
    displayState: string;
    displayZipCode: string;
    isReferredAddress: string;
    primaryInsurance: string;
    secondaryInsurance: string;
    displayProviderNextAppt: string;
    displayDateNextAppt: string;
    showDrawerNav = false
    showCommunicationDrawerNav = false;
    showTreatmentPlanServicesDrawerNav = false;
    displayMoreIcons = false
    soarPerPeraltView = 'soar-per-peralt-view'
    hasMedicalAlertsViewAccess = false;
    prevCareDue: string;
    togglePopover = false
    patientMedicalAlerts = [];
    patientAllergyAlerts = [];
    overFlowAlerts = [];
    patientPremedAlerts = [];
    Alerts = [];
    customAlerts = [];
    masterAlerts = [];

    alertsAndFlags = [];
    allFlags = [];
    allAlerts = [];
    symbolList;
    @Input() useConverted = true;
    drawerChange = CommunicationDrawer.TimelineDrawer; // drawer starts on timeline
    tabs: ActiveTemplateModel[] = [];
    @Output() activeUrl = new EventEmitter();
    editProfileTabLink: string;
    ProfileLink: string;
    getChartExistingModeOn = false;
    drawer = CommunicationDrawer;
    hasImage = false;
    imageUrl: SafeHtml;
    displayFlex: boolean;
    isPatientPhotoEnabled = false;
    displayStatus: string;
    hideReferral = true;
    editPersonProfileMFE: boolean;
    constructor(
        @Inject('referenceDataService') private referenceDataService,
        @Inject('ListHelper') private listHelper,
        private translate: TranslateService,
        private registrationService: PatientRegistrationService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('locationService') private locationService,
        private patientDetailService: PatientDetailService,
        public datePipe: DatePipe,
        @Inject('$routeParams') public routeParams,
        @Inject('PersonFactory') private personFactory,
        @Inject('PatientMedicalHistoryAlertsFactory') private patientMedicalHistoryAlertsFactory,
        @Inject('StaticData') private staticData,
        @Inject('PatientNotesFactory') private patientNotesFactory,
        @Inject('DiscardChangesService') private discardChangesService,
        @Inject('ModalFactory') private modalFactory,
        private noteTemplatesHttpService: NoteTemplatesHttpService,
        @Inject('$rootScope') private $rootScope,
        @Inject('$location') private $location,
        @Inject('FeatureService') private featureService,
        private blueImagingService: BlueImagingService,
        private sanitizer: DomSanitizer,
        private imagingMasterService: ImagingMasterService,
        private featureFlagService: FeatureFlagService
    ) {
    }

    ngOnInit() {
        this.checkFeatureFlags();
        this.editProfileTabLink = '#/Patient/' + this.patientProfile?.PatientId + '/Person/';
        this.ProfileLink = '#/Patient/' + this.patientProfile?.PatientId + '/Summary/?tab=Profile&currentPatientId=' + this.patientProfile?.PatientId;
        if (!this.isPatientHeader) {
            this.pageTitle = this.translate.instant('Add Person');
        }
        this.todaysDate = new Date();
        this.authAccess();
        this.getMedicalHistoryAlerts()
        this.symbolList = this.staticData?.AlertIcons()
        this.getPatientStatusDisplay();
        this.imagingMasterService.getServiceStatus().then(resstatus => {
            if (resstatus["blue"]["status"] === "ready") {
                this.getBlueImage();
            } else {
                console.log("Blue Imaging is Off");
            }
        }).catch(error => { console.log(error); });

        this.$rootScope.$on('soar:medical-history-form-created', () => {
            this.personFactory.PatientAlerts = null;
            this.personFactory.PatientMedicalHistoryAlerts = null;
            this.getMedicalHistoryAlerts()
        });
        this.$rootScope.$on('updatePatientStatus', (event,args) => {
            this.patientProfile.PersonAccount.InCollection = args;
            this.getPatientStatusDisplay();
        });
        this.$rootScope.$on('fuse:initheader', () => {
            // wait until the header information is present (i.e. the old angularJS ui is finished loading) before trying to populate the user info
            this.getUserInfromation();
        });
        this.highlightDrawer();
    }
    
    highlightDrawer = () => {      
        switch (this.routeParams?.activeSubTab) {
            case '0':
                this.drawerChange = this.drawer.TimelineDrawer;
                break;
            case '1':
                this.drawerChange = this.drawer.ChartingDrawer;
                break;
            case '2':
                this.drawerChange = this.drawer.TreatmentPlanDrawer;
                break;
            case '3':
                this.drawerChange = this.drawer.NotesDrawer;
                break;
            case '4':
                this.drawerChange = this.drawer.ReferralDrawer;
                break;
            default:
                this.drawerChange = this.drawer.TimelineDrawer;
                break;
        }
    }

    getPatientStatusDisplay = () => {
        if (this.isPatientHeader && this.patientProfile) {
            if (this.patientProfile?.PersonAccount && this.patientProfile?.PersonAccount.InCollection) {
                this.displayStatus = 'In Collections';
            } else if (this.patientProfile?.IsActive) {
                this.displayStatus = this.patientProfile?.IsPatient ? 'Active Patient' : 'Active Non-Patient';
            } else {
                this.displayStatus = this.patientProfile?.IsPatient ? 'Inactive Patient' : 'Inactive Non-Patient';
            }
        }
    };
    getBlueImage = () => {
        this.blueImagingService.getImageThumbnailByPatientId(this.routeParams.patientId)
            .then(result => {
                const objectURL = URL.createObjectURL(result);
                this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                this.hasImage = true;
                this.displayFlex = false;
            })
            .catch(() => {
                console.log("Patient photo not found in Dolphin Blue Imaging")
            });
    }
    getUserInfromation = () => {
        const userContext = JSON.parse(sessionStorage.getItem('userContext'));
        const userData = userContext.Result.User;
        const userslist = this.referenceDataService.get(this.referenceDataService.entityNames.users);
        const personInfo = this.listHelper.findItemsByFieldValue(userslist, 'UserId', userData.UserId)[0];
        this.buildUserinfromation(personInfo);
    }

    navigateNewProfile = (url: string) => {
        if(this.editPersonProfileMFE) {
            url = url.replace('#/Patient/', '#/patientv2/');
        }
        window.location.href = this.sanitizer.sanitize(SecurityContext.URL, url);
    }

    buildUserinfromation = (personInfo: ProviderUser) => {
        if (personInfo) {
            this.userInformation = '';
            if (personInfo.FirstName) {
                this.userInformation += `${(personInfo.FirstName)} `;
            }
            if (personInfo.MiddleName) {
                this.userInformation += `${personInfo.MiddleName as string} `;
            }
            if (personInfo.LastName) {
                this.userInformation += `${personInfo.LastName} `;
            }
            if (personInfo.UserCode) {
                this.userInformation += `- ${personInfo.UserCode}`;
            }
        }
    }

    toggleMoreInfo = () => {
        if (this.displayMoreInfo == true) {
            return this.displayMoreInfo = false
        }
        if (this.displayMoreInfo == false) {
            this.patientDetailService.getPatientDashboardOverviewByPatientId(this.patientProfile?.PatientId).then((patientOverview: PatientOverview) => {
                this.locationService.getAllLocations().then((results) => {
                    this.displayMoreInfo = true
                    results?.forEach((result) => {
                        if (patientOverview?.Profile?.PreferredLocation == result?.id) {
                            patientOverview.Profile.PreferredLocationName = result?.name;
                        }
                    });
                    this.patientDetail = patientOverview;
                    if (this.patientDetail?.PreventiveServicesDue) {
                        this.patientDetail?.PreventiveServicesDue?.forEach((exam: PreventiveServicesDue) => {
                            if (exam?.IsTrumpService) {
                                this.prevCareDue = exam?.DateServiceDue;
                            }
                        });
                    }

                    //About Info
                    this.displayProviderNextAppt = '';
                    if (this.patientDetail?.Profile?.NextAppointment != undefined) {
                        const nextApptDate = new Date(
                            this.patientDetail.Profile?.NextAppointment?.$$StartTimeLocal
                        );
                        this.displayDateNextAppt = this.datePipe.transform(nextApptDate, 'short')?.replace(',', '');
                        if (this.patientDetail?.Profile?.NextAppointment?.nextAppointmentProviderDisplayName != undefined) {
                            this.displayProviderNextAppt = this.patientDetail?.Profile?.NextAppointment?.nextAppointmentProviderDisplayName;
                        }
                    }

                    //Phones
                    this.patientDetail?.Phones?.forEach((phone: Phone) => {
                        if (phone?.IsPrimary == true) {
                            this.displayPhone = phone?.PhoneNumber ?? phone?.PhoneReferrer?.PhoneNumber
                            this.displayPhoneType = phone?.Type;
                        }
                    });

                    //Email
                    this.patientDetail?.Emails?.forEach((email: Email) => {
                        if (email?.IsPrimary == true) {
                            this.displayEmail = email?.Email;
                        }
                    });

                    //Address
                    if (this.patientDetail?.Profile?.AddressReferrer) {
                        this.displayAddressLine1 = this.patientDetail?.Profile?.AddressReferrer?.AddressLine1;
                        this.displayAddressLine2 = this.patientDetail?.Profile?.AddressReferrer?.AddressLine2;
                        this.displayCity = this.patientDetail?.Profile?.AddressReferrer?.City;
                        this.displayState = this.patientDetail?.Profile?.AddressReferrer?.State;
                        this.displayZipCode = this.patientDetail?.Profile?.AddressReferrer?.ZipCode;
                    } else {
                        if (this.patientHasAddress(this.patientDetail?.Profile)) {
                            this.displayAddressLine1 = this.patientDetail?.Profile?.AddressLine1;
                            this.displayAddressLine2 = this.patientDetail?.Profile?.AddressLine2;
                            this.displayCity = this.patientDetail?.Profile?.City;
                            this.displayState = this.patientDetail?.Profile?.State;
                            this.displayZipCode = this.patientDetail?.Profile?.ZipCode;
                        } else {
                            this.displayAddressLine1 = this.translate.instant('No Address on File');
                        }
                    }

                    //Setup insurance display
                    this.primaryInsurance = 'N/A';
                    this.secondaryInsurance = 'N/A';
                    if (patientOverview?.BenefitPlans && patientOverview?.BenefitPlans?.length > 0) {
                        const sortedBenefitPlans = patientOverview?.BenefitPlans?.sort((a, b) =>
                            a?.Priority - b?.Priority
                        );
                        if (sortedBenefitPlans[0] && sortedBenefitPlans[0]?.PolicyHolderBenefitPlanDto) {
                            this.primaryInsurance =
                                sortedBenefitPlans[0]?.PolicyHolderBenefitPlanDto?.BenefitPlanDto.CarrierName;
                        }

                        if (sortedBenefitPlans[1] && sortedBenefitPlans[1]?.PolicyHolderBenefitPlanDto) {
                            this.secondaryInsurance =
                                sortedBenefitPlans[1]?.PolicyHolderBenefitPlanDto?.BenefitPlanDto?.CarrierName;
                        }
                    }
                })
            })?.catch(() => { })
        }
    }

    patientHasAddress = (profile): boolean => {
        if (profile?.AddressLine1 ||
            profile?.AddressLine2 ||
            profile?.City ||
            profile?.State ||
            profile?.ZipCode) {
            return true;
        }
        return false;
    }

    savePatient = (triggerData, cancelEvent) => {
        if (this.hasCreateAccess) {
            this.registrationService.setRegistrationEvent({
                eventtype: RegistrationEvent.SavePatient,
                data: { triggerData, cancelEvent }
            });
        }
    }

    cancel = () => {
        this.isOpen = !this.isOpen;
    }

    //#region Auth Access
    authAccess = () => {
        this.hasViewAccess = this.authAccessByType(this.viewAuthAbbreviation);
        this.hasCreateAccess = this.authAccessByType(this.createAuthAbbreviation);
        const hasSoarViewAccess = this.authAccessByType(this.soarPerPeraltView);
        if (this.hasViewAccess == false || (!hasSoarViewAccess && this.isPatientHeader)) {
            this.toastrFactory.error(this.patSecurityService.generateMessage(this.createAuthAbbreviation), 'Not Authorized');
            setTimeout(() => {
                if (this.viewAuthAbbreviation) {
                    location.replace('/');
                }
            }, 100);
        } else {
            if (this.isPatientHeader) {
                this.hasMedicalAlertsViewAccess = true
            }
        }
    }
    authAccessByType = (authtype: string) => {
        const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result as boolean;
    }
    //#endregion

    ngOnChanges(changes: SimpleChanges) {
        const profile = changes?.patientProfile?.currentValue;
        if (profile) {
            if (profile.PatientId) {
                this.pageTitle = '';
                if (profile.LastName) {
                    this.pageTitle += !profile.Suffix ? `${profile.LastName as string},` : `${profile.LastName as string}`
                }
                if (profile.Suffix) {
                    this.pageTitle += ` ${profile.Suffix as string},`;
                }
                if (profile.FirstName) {
                    this.pageTitle += ` ${profile.FirstName as string}`;
                }
                if (profile.MiddleName) {
                    this.pageTitle += ` ${profile.MiddleName as string}`;
                }
                if (profile.PreferredName) {
                    this.pageTitle += ` (${profile.PreferredName as string})`;
                }
                this.patientInitials = `${profile.FirstName[0].toUpperCase() as string}${profile.LastName[0].toUpperCase() as string}`;
                this.description = (profile.Sex == 'M') ? 'Male' : 'Female';
                this.dateOfBirth = profile.DateOfBirth;
                this.status = `${profile.IsActive ? 'Active' : 'Inactive'} ${!this.patientProfile?.IsPatient ? 'Non-Patient' : 'Patient'}`;
                this.patientId = profile.PatientCode;
            }

        }

        this.tabs = [
            {
                Area: "Overview",
                Title: this.translate.instant('Overview'),
                Url: "#/Patient/" + String(this.routeParams?.patientId) + "/Overview/",
                TemplateUrl: ActiveTemplateUrl.Overview,
                Selected: true,
                amfa: "soar-per-perdem-view"
            },
            {
                Area: "Appointments",
                Title: this.translate.instant('Appointments'),
                Url: "#/Patient/" + String(this.routeParams?.patientId) + "/Appointments/",
                TemplateUrl: ActiveTemplateUrl.Appointments,
                Selected: false,
                amfa: "soar-sch-sptapt-view"
            },
            {
                Area: "Clinical",
                Title: this.translate.instant('Clinical'),
                Url: "#/Patient/" + String(this.routeParams?.patientId) + "/Clinical/",
                TemplateUrl: ActiveTemplateUrl.Clinical,
                Selected: false,
                amfa: "soar-clin-cpsvc-view"
            },
            {
                Area: "Summary",
                Title: this.translate.instant('Account'),
                Url: "#/Patient/" + String(this.routeParams?.patientId) + "/Summary/?tab=Account%20Summary",
                TemplateUrl: ActiveTemplateUrl.Summary,
                Selected: false,
                ShowIcon: false,
                IconClass: "glyphicon-exclamation-sign",
                IconRight: true,
                amfa: "soar-acct-actsrv-view"
            },
            {
                Area: "Communication",
                Title: this.translate.instant('Communication Center'),
                Url: "#/Patient/" + String(this.routeParams?.patientId) + "/Communication",
                TemplateUrl: ActiveTemplateUrl.Communication,
                Selected: false,
                IconClass: "glyphicon-exclamation-sign",
                IconRight: true,
                amfa: "soar-per-pcomm-view"
            }
        ]

        if (this.routeParams?.Category) {
            this.SelectTab(
                this.listHelper?.findIndexByFieldValue(
                    this.tabs,
                    'Area',
                    this.routeParams?.Category
                )
            );
        } else {
            this.SelectTab(0);
        }

        // Check Secoundary Navigation Tab
        if (this.routeParams?.Category == 'Clinical') {
            this.showDrawerNav = true;
            this.showCommunicationDrawerNav = false;
        } else if (this.routeParams?.Category == 'Communication') {
            this.showDrawerNav = true;
            this.showCommunicationDrawerNav = true;
        } else {
            this.showDrawerNav = false;
        }

    }

    SelectTab = (tabIndex) => {
        if (tabIndex != null) {
            if (tabIndex == 0 && this.patientProfile) {
                document.title = `${this.patientProfile?.PatientCode || ''} - ${this.translate.instant('Overview') as string}`;
            }
            tabIndex = tabIndex < 0 || tabIndex >= this.tabs?.length ? 0 : tabIndex; // If the index is out of the bounds of the array, set the value to 0.
            this.tabs?.forEach(tab => tab.Selected = false)
            if (this.tabs[tabIndex]?.Selected)
                this.tabs[tabIndex].Selected = true;
            this.activeUrl.emit(this.tabs[tabIndex])
        }
    }

    getClass = (id) => {
        return this.symbolList?.getClassById(id) as string;
    }

    getAlertDescription = (alert) => {
        let alertMessage = "";
        if (alert && alert?.length > 0) {
            for (let index = 0; index < alert?.length; index++) {
                alertMessage += alert[index]?.MedicalHistoryAlertDescription as string + "<br/>";
            }
        }
        return this.translate.instant(alertMessage) as string;
    }

    alertsFlagPopover = () => {
        this.togglePopover = !this.togglePopover
    }

    getMedicalHistoryAlerts = () => {
        if (this.hasMedicalAlertsViewAccess) {
            if (this.personFactory?.PatientMedicalHistoryAlerts) {
                this.filterAlertsByType(this.personFactory?.PatientMedicalHistoryAlerts)
            } else {
                this.patientMedicalHistoryAlertsFactory?.PatientMedicalHistoryAlerts(this.patientProfile?.PatientId).then((res: SoarResponse<MedicalHistoryAlert>) => {
                    this.personFactory?.SetPatientMedicalHistoryAlerts(res?.Value);
                    this.filterAlertsByType(res?.Value)
                })
            }
        }
    }

    filterAlertsByType = (alerts) => {
        this.patientAllergyAlerts = [];
        this.patientPremedAlerts = [];
        if (alerts) {
            this.patientAllergyAlerts = alerts?.filter(obj => obj?.MedicalHistoryAlertTypeId == 1)
            this.patientMedicalAlerts = alerts?.filter(obj => obj?.MedicalHistoryAlertTypeId == 2)
            this.patientPremedAlerts = alerts?.filter(obj => obj?.MedicalHistoryAlertTypeId == 3)
        }
        this.getPatientFlags()
    }

    getPatientFlags = () => {
        if (this.hasMedicalAlertsViewAccess) {
            if (this.personFactory?.PatientAlerts) {
                this.patientAlertsServiceGetSuccess({ Value: this.personFactory?.PatientAlerts })
            } else {
                this.personFactory?.getPatientAlerts(this.patientProfile?.PatientId).then((res: SoarResponse<PatientFlags>) => {
                    this.personFactory?.SetPatientAlerts(res?.Value);
                    this.patientAlertsServiceGetSuccess(res);
                });
            }
        }
    }

    patientAlertsServiceGetSuccess = (res) => {
        this.masterAlerts = [];
        this.customAlerts = [];
        this.Alerts = [];
        const alerts: Array<PatientFlags> = cloneDeep(res?.Value);

        this.masterAlerts = alerts?.filter((alert) => alert?.MasterAlertId);
        this.customAlerts = alerts?.filter((alert) => !alert?.MasterAlertId);

        if (this.masterAlerts?.length > 8) {
            this.overFlowAlerts = this.masterAlerts?.slice(8);
            this.Alerts = [...this.masterAlerts];
        } else {
            this.Alerts = [...this.masterAlerts];
        }
        this.concatAlertsAndFlags();
    }

    concatAlertsAndFlags = () => {
        this.alertsAndFlags = [
            ...this.patientMedicalAlerts,
            ...this.patientAllergyAlerts,
            ...this.overFlowAlerts,
            ...this.patientPremedAlerts,
            ...this.Alerts,
            ...this.customAlerts,
        ];
        this.allFlags = [...this.Alerts, ...this.customAlerts];
        this.allAlerts = [
            ...this.patientMedicalAlerts,
            ...this.patientAllergyAlerts,
            ...this.patientPremedAlerts,
        ];
        this.allFlags.forEach(d => {
            if (d.SymbolId == null) {
                d.SymbolId = '0';
            }
        });
    }

    openDrawer = (index) => {
        let promise = null;
        const triggersNoteDiscard = this.patientNotesFactory.DataChanged && index != 1 &&
            index != 4 && !this.showCommunicationDrawerNav;
        if (triggersNoteDiscard) {
            //Display discard warning when switching header tabs when we have an open clinical note with changes
            promise = this.modalFactory.WarningModal(
                this.discardChangesService.currentChangeRegistration.customMessage
            );
        } else {
            //Otherwise, just resolve the promise and continue
            promise = Promise.resolve(true);
        }

        promise.then(result => {
            if (result) {
                if (triggersNoteDiscard) {
                    this.patientNotesFactory.setDataChanged(false);
                    this.noteTemplatesHttpService.SetActiveNoteTemplate(null);
                }

                // discard changes and reroute
                if (this.showCommunicationDrawerNav) {
                    this.drawerChange = index;
                    this.$location
                        .path('/Patient/' + this.patientProfile?.PatientId + '/Clinical/')
                        .search({ drawerIndex: index });
                } else {
                    this.drawerChange = index;
                    this.$rootScope.$broadcast('nav:drawerChange', index);
                }
            }
        });
    };

    //Close the popup if a click occurs outside the popup
    @HostListener('document:click', ['$event'])
    closePopoverOnClickOutside(event: MouseEvent) {
        if (this.togglePopover) {
            const popoverElement = document.querySelector('.customStylingDynamicLinks');
            if (popoverElement && !popoverElement?.contains(event.target as Node)) {
                this.togglePopover = false;
            }
        }
    }

    checkFeatureFlags() {
        this.featureFlagService.getOnce$(FuseFlag.ShowPatientReferralsOnClinical).subscribe((value) => {
            this.hideReferral = !value;
        });
        
        this.featureFlagService.getOnce$(FuseFlag.EnableEditProfileMFEPage).subscribe((value) => {
            this.editPersonProfileMFE = value;
        });
    }
}

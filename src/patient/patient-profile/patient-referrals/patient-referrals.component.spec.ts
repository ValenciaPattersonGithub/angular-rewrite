import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PatientReferralsComponent } from './patient-referrals.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { MockRepository } from 'src/patient/patient-profile/patient-profile-mock-repo';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { HttpClient } from '@microsoft/signalr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DialogContainerService, DialogService } from '@progress/kendo-angular-dialog';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { ProviderOnScheduleDropdownService } from 'src/scheduling/providers/provider-on-schedule-dropdown.service';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { MicroServiceApiService } from 'src/security/providers';
import { BlueImagingService } from '../../imaging/services/blue.service';
import { ImagingMasterService } from '../../imaging/services/imaging-master.service';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';

describe('PatientReferralsComponent', () => {
    let component: PatientReferralsComponent;
    let fixture: ComponentFixture<PatientReferralsComponent>;
    let httpClient: HttpClient;
    let patSecurityService: any;
    let dialogservice: DialogService;
    let patientCommunicationCenterService: PatientCommunicationCenterService;
    let providerOnScheduleDropdownService: ProviderOnScheduleDropdownService;
    let scheduleFactoryPromise: Promise<any> = new Promise<any>((resolve, reject) => { });
    let mockShowOnScheduleFactory: any = {
        getAll: jasmine.createSpy().and.returnValue(scheduleFactoryPromise)
    };
    const mockMicroServiceApiUrlConfig = [{
        enterpriseApiUrl: 'mockEntApiUrl', stsApi: 'mockstsApiUrl', domainApi: 'mockdomainApiUrl',
        claimApi: 'mockclaimApiUrl'
        , eraApi: 'mockeraApiUrl'
        , fileApi: 'mockfileApiUrl'
        , rxApi: 'mockrxApiUrl'
        , schedulingApi: 'mockschedulingApiUrl'
        , practicesApi: 'mockpracticesApiUrl'
        , insuranceApi: 'mockinsuranceApiUrl'
        , treatmentPlansApi: 'mocktreatmentPlansApiUrl'
        , serverlessSignalRApi: 'mockserverlessSignalRApiUrl'
        , reportingApi: 'mockreportingApiUrl'
        , prescriptionsApiUrl: 'prescriptionsApiUrl'
        , blueImagingApiUrl: 'mockblueImagingApiUrl'
        , clinicalApi: 'mockclinicalApiUrl'
        , sapiSchedulingApi: 'mocksapiSchedulingApiUrl'
        , insuranceSapi: 'mockinsuranceSapiUrl'
    }];
    const mockPatientMedicalHistoryAlerts = {
        ExtendedStatusCode: null,
        Value: null,
        Count: null,
        InvalidProperties: null
    };

    const mockreferenceDataService: any = {
        get: function (x) {
          return [];
        },
        entityNames: {
          users: [],
        },
      };

    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    let referralSources = {
        Value: [
            {
                PatientReferralSourceId: "2df3b05f-d2b4-40fd-86fa-44c93cec7425",
                SourceName: "facebook",
                DataTag: "AAAAAAAAyeE=",
                UserModified: "d0be7456-e01b-e811-b7c1-a4db3021bfa0",
                DateModified: "2020-02-20T11:54:55.5081129"
            }
        ]
    }
    const mockReferralSourcesService = {
        get: jasmine.createSpy('ReferralSourcesService.get').and.returnValue({
            $promise: {
                Value: [],
                then: (callback) => {
                    callback({
                        Value:
                            referralSources.Value
                    })
                }
            }
        })
    };
    const mockReferenceDataService = {
        get: jasmine.createSpy().and.returnValue([]),
        entityNames: {
          practiceSettings: 'test',
        },
      };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')

    };
    const blueImagingServiceSpy = jasmine.createSpyObj('BlueImagingService', ['getImage']);

    const mockservice = {
        IsAuthorizedByAbbreviation: (authtype: string) => { },
        getServiceStatus: () =>
            new Promise((resolve, reject) => {
                // the resolve / reject functions control the fate of the promise
            }),
        esCancelEvent: new BehaviorSubject<{}>(undefined),
        isEnabled: () => new Promise((resolve, reject) => { }),
        getCurrentLocation: jasmine
            .createSpy()
            .and.returnValue({ practiceId: 'test' }),
        getPatientResponsiblePartyPhonesAndEmails: (a: any) => of({
        }),
    };

    const patientMedicalHistoryAlertsFactory = {
        PatientMedicalHistoryAlerts: () => {
            return {
                then: (res) => {
                    res(mockPatientMedicalHistoryAlerts)
                }
            }
        }
    };
    var personResult = { Value: '' };
    const mockPersonFactory = {
        SetPatientMedicalHistoryAlerts: jasmine.createSpy(),
        getById: jasmine.createSpy('PersonFactory.getById').and.returnValue({
            then: function (callback) {
                callback(personResult);
            }
        }),
    };

    const mockReferralManagementHttpService = {
        getSources: jasmine.createSpy().and.returnValue({
            then: function (callback) {
                callback({ Value: '' });
            }
        }),
        getReferral(req: any) {
            return of([
                // Mock data here
            ]).pipe(
                map((data: any[]) => {
                    return data.filter(item => {
                        item.referralDirectionType = item.referralDirectionType.replace('Referral', '').trim();
                        item.referralCategory = item.referralCategory.replace('Provider', '').trim();
                        return item;
                    });
                })
            );
        }
    }

    let mockRepo;
    beforeEach(async () => {
        mockRepo = MockRepository();
        await TestBed.configureTestingModule({
            declarations: [PatientReferralsComponent, AppLabelComponent],
            imports: [HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [
                //ReferralManagementHttpService,
                HttpClient,
                DialogService,
                PatientCommunicationCenterService,
                ProviderOnScheduleDropdownService,
                DialogContainerService,
                EnumAsStringPipe,
                MicroServiceApiService,
                { provide: '$routeParams', useValue: mockRepo.mockService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'SoarConfig', useValue: {} },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'ReferralSourcesService', useValue: mockReferralSourcesService },
                { provide: 'MicroServiceApiUrlConfig', useValue: mockMicroServiceApiUrlConfig },
                { provide: 'ProviderShowOnScheduleFactory', useValue: mockShowOnScheduleFactory },
                { provide: 'ReferralSourcesService', useValue: {} },
                { provide: BlueImagingService, useValue: blueImagingServiceSpy },
                { provide: ImagingMasterService, useValue: mockservice },
                { provide: 'PatientMedicalHistoryAlertsFactory', useValue: patientMedicalHistoryAlertsFactory },
                { provide: 'PersonFactory', useValue: mockPersonFactory },
                { provide: ReferralManagementHttpService, useValue: mockReferralManagementHttpService },
                { provide: 'referenceDataService', useValue: mockreferenceDataService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientReferralsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        httpClient = TestBed.inject(HttpClient);
        dialogservice = TestBed.get(DialogService);
        patientCommunicationCenterService = TestBed.get(PatientCommunicationCenterService);
        providerOnScheduleDropdownService = TestBed.get(ProviderOnScheduleDropdownService);
        patSecurityService = TestBed.get('patSecurityService');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

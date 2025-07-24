import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { AppButtonComponent } from "src/@shared/components/form-controls/button/button.component";
import { AppKendoUIModule } from "src/app-kendo-ui/app-kendo-ui.module";
import { configureTestSuite } from "src/configure-test-suite";
import { PatientRegistrationService } from "src/patient/common/http-providers/patient-registration.service";
import { RegistrationHeaderComponent } from "../registration-header/registration-header.component";
import { TableOfContentComponent } from "../table-of-content/table-of-content.component";
import { ResponsiblePartySearchComponent } from "src/@shared/components/responsible-party-search/responsible-party-search.component";
import { RegistrationLandingComponent } from "./registration-landing.component";
import { AppRadioButtonComponent } from "src/@shared/components/form-controls/radio-button/radio-button.component";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PatientHttpService } from "src/patient/common/http-providers/patient-http.service";
import { DatePipe } from "@angular/common";
import { SvgIconComponent } from "src/@shared/components/svg-icons/svg-icon.component";
import { PersonalDetailsComponent } from "../personal-details/personal-details.component";
import { AppDatePickerComponent } from "src/@shared/components/form-controls/date-picker/date-picker.component";
import { HighlightTextIfContainsPipe } from "src/@shared/pipes";
import { AppCheckBoxComponent } from "src/@shared/components/form-controls/check-box/check-box.component";
import { AppLabelComponent } from "src/@shared/components/form-controls/form-label/form-label.component";
import { PatientDuplicateSearchComponent } from "../../patient-duplicate-search/patient-duplicate-search.component";
import { ContactDetailsComponent } from "../contact-details/contact-details.component";
import { AppToggleComponent } from "src/@shared/components/form-controls/toggle/toggle.component";
import { AppSelectComponent } from "src/@shared/components/form-controls/select-list/select-list.component";
import { InsuranceDetailsComponent } from "../insurance-details/insurance-details.component";
import { ReferralsComponent } from "../referrals/referrals.component";
import { PatientAccountMembersComponent } from "../../patient-shared/patient-account-members/patient-account-members.component";
import { AdditionalIdentifiersComponent } from "../additional-identifiers/additional-identifiers.component";
import { DentalRecordsComponent } from "../dental-records/dental-records.component";
import { PreferencesComponent } from "../preferences/preferences.component";
import { SearchBarAutocompleteComponent } from "src/@shared/components/search-bar-autocomplete/search-bar-autocomplete.component";
import { PatientDocumentsComponent } from "../../patient-shared/patient-documents/patient-documents.component";
import { AppMultiselectComponent } from "src/@shared/components/form-controls/multiselect/multiselect.component";
import { PatientCommunicationCenterService } from "src/patient/common/http-providers/patient-communication-center.service";
import { OverlayModule } from "@angular/cdk/overlay";
import { AgePipe } from "src/@shared/pipes/age/age.pipe";
import { PhoneNumberPipe } from "src/@shared/pipes/phone-number/phone-number.pipe";
import { Title } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { ConfirmationModalService } from "src/@shared/components/confirmation-modal/confirmation-modal.service";
import { SearchBarAutocompleteByIdComponent } from '../../../@shared/components/search-bar-autocomplete-by-id/search-bar-autocomplete-by-id.component';
import { PatientAdditionalIdentifierService } from "src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service";
import { GroupTypeService } from "src/@shared/providers/group-type.service";
import { PatientDetailService } from "src/patient/patient-detail/services/patient-detail.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { BlueImagingService } from "../../imaging/services/blue.service";
import { ImagingMasterService } from "../../imaging/services/imaging-master.service";
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

describe("RegistrationLandingComponent", () => {
  let component: RegistrationLandingComponent;
  let patientPreference: PreferencesComponent;
  let registrationService: PatientRegistrationService;
  let PreferenceFixture: ComponentFixture<PreferencesComponent>;
  let fixture: ComponentFixture<RegistrationLandingComponent>;
  let titleService: Title;
  let mockFeatureFlagService;
  mockFeatureFlagService = {
      getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
          of({
              Value: []
          })),
    };
    const mockserviceImage = {
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
    };
  const fb: FormBuilder = new FormBuilder();
  const mockservice = {
    get: jasmine.createSpy().and.returnValue([{}]),
    entityNames: { users: "users" },
    findItemsByFieldValue: jasmine.createSpy().and.returnValue([
      {
        FirstName: "Test",
        MiddleName: "M",
        LastName: "User",
        UserCode: "TST01",
      },
    ]),
    syncBluePatientLocation: (a: any, b: any) => new Promise((resolve, reject) => { }),
    getData: () => new Promise((resolve, reject) => { }),
    updatePerson: (a: any) => of({}),
    getRegistrationEvent: (a: any) => of({}),
    setRegistrationEvent: (a: any) => of({}),
    error: jasmine.createSpy().and.returnValue("Error Message"),
    success: jasmine.createSpy().and.returnValue("Success Message"),
    LaunchPatientLocationErrorModal: (a: any) => {},
    SetCheckingUserPatientAuthorization: (a: any) => {},
    transform: (a: any) => {},
    ConfirmModal: (a: any, b: any, c: any, d: any) => {},
    PatientSearchValidation: (a: any) => {},
    CheckPatientLocation: (a: any, b: any) => {},
    patientSearch: (a: any) => {},
    Patients: {
      get: (a: any) => {},
    },
    Persons: {
      get: (a: any) => {},
    },
    States: () => new Promise((resolve, reject) => {}),
    PhoneTypes: () => new Promise((resolve, reject) => {}),
    getPatientBenefitPlans: () => of({}),
    getCurrentLocation: () => {},
    getCurrentPracticeLocations: () => new Promise((resolve, reject) => {}),
    getAllMasterDiscountTypes: () => of({}),
    getAllMasterPatientAlerts: () => of({}),
    getPatientInfoByPatientId: (a: any) => of({}),
    patientId: "4321",
    accountId: "1234",
    IsAuthorizedByAbbreviation: (authtype: string) => {},
    getPersonByPersonId: (a: any) => of({}),
    getReferralSources: () => of({}),
    getAll: (a: any) => {},
    CreatePatientDirectory: (a: any, b: any, c: any) => {},
    getByDocumentId: (a: any) => {},
    getImagingPatient: () => new Promise((resolve, reject) => {}),
    getPatientDashboardOverviewByPatientId: (a) => new Promise(() => { }),
    PatientMedicalHistoryAlerts: (a) => new Promise(() => { }),
    isEnabled: (a) => new Promise((resolve, reject) => {}),
    AlertIcons: () => { },
    open: () => new Promise((resolve, reject) => {}),
    setDataChanged:jasmine.createSpy(),
    DataChanged:'',
    onRegisterController: jasmine.createSpy(),
    currentChangeRegistration: {customMessage: false, controller: 'ChartCustomColorsController'},
    domainUrl: 'https://localhost:35440',
    getLocalizedString: () => 'translated text',
    PersonObj: {
      Profile: {
        PatientId: null,
        PatientSince: null,
        DataTag: null,
        IsActive: true,
        FirstName: "",
        MiddleName: "",
        LastName: "",
        PreferredName: "",
        Suffix: "",
        DateOfBirth: null,
        Sex: "",
        IsPatient: true,
        ResponsiblePersonType: 0,
        ResponsiblePersonId: "",
        IsSignatureOnFile: true,
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: "",
        ZipCode: null,
        AddressReferrerId: null,
        PreferredDentist: "",
        PreferredHygienist: "",
        PreferredLocation: "",
        HeightFeet: 0,
        HeightInches: 0,
        Weight: "",
        PrimaryDuplicatePatientId: "",
        PersonAccount: {
          ReceivesStatements: true,
          ReceivesFinanceCharges: true,
          PersonId: null,
          AccountId: null,
          DataTag: null,
        },
      },
      Phones: [],
      Emails: [],
      PreviousDentalOffice: null,
      Referral: null,
      patientIdentifierDtos: [],
      Flags: [],
      PatientBenefitPlanDtos: [],
      PatientLocations: [
        {
          value: 35461,
          ObjectState: "None",
          text: "Location D",
          LocationName: "Location D",
          LocationId: 35461,
        },
        {
          value: 35451,
          ObjectState: "None",
          text: "Location F",
          LocationName: "Location F",
          LocationId: 35451,
        },
        {
          value: 35450,
          ObjectState: "None",
          text: "ASWkkrr",
          LocationName: "ASWkkrr",
          LocationId: 35450,
        },
        {
          value: 35460,
          ObjectState: "None",
          text: "Location C",
          LocationName: "Location C",
          LocationId: 35460,
        },
        {
          value: 35462,
          ObjectState: "None",
          text: "Location E",
          LocationName: "Location E",
          LocationId: 35462,
        },
        {
          value: 35489,
          ObjectState: "None",
          text: "Location G",
          LocationName: "Location G",
          LocationId: 35489,
        },
        null,
      ],
      patientDiscountTypeDto: null,
      patientGroupDtos: [],
    },
  };

  const rootScope = {
    patAuthContext: {
      userInfo: { UserId: '1234'}
    },
    $on: jasmine.createSpy().and.returnValue({}),
  }

  const mockGroupTypeService = {
    save: jasmine.createSpy(),
    update: jasmine.createSpy(),
    get: jasmine.createSpy(),
    delete: jasmine.createSpy(),
    groupTypeWithPatients: jasmine.createSpy(),
  };
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, OverlayModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [
        RegistrationLandingComponent,
        RegistrationHeaderComponent,
        AppButtonComponent,
        TableOfContentComponent,
        PersonalDetailsComponent,
        AppRadioButtonComponent,
        SvgIconComponent,
        HighlightTextIfContainsPipe,
        AppDatePickerComponent,
        AppCheckBoxComponent,
        AppLabelComponent,
        ResponsiblePartySearchComponent,
        PatientDuplicateSearchComponent,
        ContactDetailsComponent,
        AppToggleComponent,
        AppSelectComponent,
        InsuranceDetailsComponent,
        ReferralsComponent,
        PatientAccountMembersComponent,
        AdditionalIdentifiersComponent,
        DentalRecordsComponent,
        PreferencesComponent,
        SearchBarAutocompleteComponent,
        PatientDocumentsComponent,
        AppMultiselectComponent,
        SearchBarAutocompleteByIdComponent
      ],
      providers: [
        { provide: "referenceDataService", useValue: mockservice },
        { provide: "ListHelper", useValue: mockservice },
        { provide: "windowObject", useValue: mockservice },
        { provide: PatientRegistrationService, useValue: mockservice },
        { provide: "toastrFactory", useValue: mockservice },
        { provide: "PersonServices", useValue: mockservice },
        { provide: "PatientServices", useValue: mockservice },
        { provide: "ModalFactory", useValue: mockservice },
        { provide: "PatientValidationFactory", useValue: mockservice },
        { provide: DatePipe, useValue: mockservice },
        { provide: PatientHttpService, useValue: mockservice },
        { provide: "StaticData", useValue: mockservice },
        { provide: "locationService", useValue: mockservice },
        { provide: GroupTypeService, useValue: mockGroupTypeService },
        { provide: PatientAdditionalIdentifierService, useValue: mockservice },
        { provide: "tabLauncher", useValue: mockservice },
        { provide: PatientCommunicationCenterService, useValue: mockservice },
        { provide: "$routeParams", useValue: mockservice },
        { provide: "DocumentService", useValue: mockservice },
        { provide: "toastrFactory", useValue: mockservice },
        { provide: "DocumentGroupsService", useValue: mockservice },
        { provide: "ListHelper", useValue: mockservice },
        { provide: "ModalFactory", useValue: mockservice },
        { provide: "InformedConsentFactory", useValue: mockservice },
        { provide: "TreatmentPlanDocumentFactory", useValue: mockservice },
        { provide: "$window", useValue: mockservice },
        { provide: "DocumentsLoadingService", useValue: mockservice },
        { provide: "FileUploadFactory", useValue: mockservice },
        { provide: "patSecurityService", useValue: mockservice },
        { provide: AgePipe, useValue: mockservice },
        { provide: "$uibModal", useValue: mockservice },
        { provide: PhoneNumberPipe, useValue: mockservice },
        { provide: "ImagingPatientService", useValue: mockservice },
        { provide: "PersonFactory", useValue: mockservice },
        { provide: "PatientAppointmentsFactory", useValue: mockservice },
        { provide: ConfirmationModalService, useValue: mockservice },
        { provide: "$location", useValue: mockservice },
        { provide: PatientDetailService, useValue: mockservice },
        { provide: "PatientMedicalHistoryAlertsFactory", useValue: mockservice },
        { provide: "FeatureService", useValue: mockservice },
        { provide: 'PatientNotesFactory', useValue: mockservice },
        { provide: 'DiscardChangesService', useValue: mockservice },
        { provide: 'SoarConfig', useValue: mockservice },
        { provide: 'localize', useValue: mockservice },
        { provide: '$rootScope', useValue: mockservice },
        { provide: BlueImagingService, useValue: mockservice },
        { provide: ImagingMasterService, useValue: mockserviceImage },
        { provide: '$rootScope', useValue: rootScope },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationLandingComponent);
    spyOn(window.sessionStorage, "getItem").and.callFake(() => JSON.stringify({ Result: { User: "1" } }));
    component = fixture.componentInstance;
    titleService = fixture.debugElement.injector.get(Title);
    fixture.detectChanges();
    registrationService = TestBed.inject(PatientRegistrationService);
  });
  beforeEach(() => {
    PreferenceFixture = TestBed.createComponent(PreferencesComponent);
    patientPreference = PreferenceFixture.componentInstance;
    PreferenceFixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  xit("should navigate to patient management page after cancel form Edit Patient", () => {
    const responseParam = "#/Patient/4321/Summary/?tab=Profile&currentPatientId=0";
    component.isCancelled = true;
    const navigateToResponseUrlSpy = spyOn(component, "NavigateToResponseUrl");
    component.initializePersonForm();
    expect(navigateToResponseUrlSpy).toHaveBeenCalledWith(responseParam);
    expect(responseParam).toContain(component.url.toString());
  });
  xit("should navigate to patient management page after cancel form Add New Person screen", () => {
    const data = {
      triggerData: "trigger",
      cancelEvent: true,
    };
    const responseParam = "#/Patient";
    const navigateToResponseUrlSpy = spyOn(component, "NavigateToResponseUrl");
    component.validateandSavePatient(data);
    expect(navigateToResponseUrlSpy).toHaveBeenCalledWith(responseParam);
    expect(responseParam).toEqual("#/Patient");
  });
  it("should create preferences formcontrols and updateperson", () => {
    patientPreference.selectedPrimaryLocation = [
      {
        text: "Location F",
        value: 35451,
      },
    ];

    const prefrence = component.personGroup.controls.preferencesForm;
    prefrence.patchValue({
      PrimaryLocations: [
        {
          text: "Location D",
          value: 35461,
          ObjectState: "None",
          LocationId: 35461,
          LocationName: "Location D",
        },
        {
          text: "Location F",
          value: 35451,
          ObjectState: "None",
          LocationId: 35451,
          LocationName: "Location F",
        },
        {
          text: "ASWkkrr",
          value: 35450,
          ObjectState: "None",
          LocationId: 35450,
          LocationName: "ASWkkrr",
        },
        {
          text: "Location C",
          value: 35460,
          ObjectState: "None",
          LocationId: 35460,
          LocationName: "Location C",
        },
        {
          text: "Location E",
          value: 35462,
          ObjectState: "None",
          LocationId: 35462,
          LocationName: "Location E",
        },
      ],
      AlternateLocations: [
        {
          PatientLocationId: 31581,
          PatientId: "b332f3a0-7a4c-4ffb-92c3-5cf9621b8013",
          LocationId: 35461,
          IsPrimary: false,
          PatientActivity: false,
          ObjectState: "None",
          FailedMessage: null,
          LocationName: "Location D",
          DataTag: "AAAAAAANxWs=",
          UserModified: "d7188401-6ef2-e811-b7f9-8056f25c3d57",
          DateModified: "2021-10-12T12:42:50.0636295",
        },
        {
          PatientLocationId: 31584,
          PatientId: "b332f3a0-7a4c-4ffb-92c3-5cf9621b8013",
          LocationId: 35451,
          IsPrimary: true,
          PatientActivity: false,
          ObjectState: "Add",
          FailedMessage: null,
          LocationName: "Location F",
          DataTag: "AAAAAAANxWw=",
          UserModified: "d7188401-6ef2-e811-b7f9-8056f25c3d57",
          DateModified: "2021-10-12T12:42:50.0636295",
        },
        {
          PatientLocationId: 31619,
          PatientId: "b332f3a0-7a4c-4ffb-92c3-5cf9621b8013",
          LocationId: 35450,
          IsPrimary: false,
          PatientActivity: false,
          ObjectState: "None",
          FailedMessage: null,
          LocationName: "ASWkkrr",
          DataTag: "AAAAAAANxW4=",
          UserModified: "d7188401-6ef2-e811-b7f9-8056f25c3d57",
          DateModified: "2021-10-12T12:42:50.0636295",
        },
        {
          PatientLocationId: 31621,
          PatientId: "b332f3a0-7a4c-4ffb-92c3-5cf9621b8013",
          LocationId: 35460,
          IsPrimary: false,
          PatientActivity: false,
          ObjectState: "None",
          FailedMessage: null,
          LocationName: "Location C",
          DataTag: "AAAAAAANxXA=",
          UserModified: "d7188401-6ef2-e811-b7f9-8056f25c3d57",
          DateModified: "2021-10-12T12:42:50.0636295",
        },
        {
          PatientLocationId: 31622,
          PatientId: "b332f3a0-7a4c-4ffb-92c3-5cf9621b8013",
          LocationId: 35462,
          IsPrimary: false,
          PatientActivity: false,
          ObjectState: "None",
          FailedMessage: null,
          LocationName: "Location E",
          DataTag: "AAAAAAANxXI=",
          UserModified: "d7188401-6ef2-e811-b7f9-8056f25c3d57",
          DateModified: "2021-10-12T12:42:50.0726293",
        },
        {
          PatientLocationId: 31622,
          PatientId: "b332f3a0-7a4c-4ffb-92c3-5cf9621b8013",
          LocationId: 35489,
          IsPrimary: false,
          PatientActivity: false,
          ObjectState: "None",
          FailedMessage: null,
          LocationName: "Location G",
          DataTag: "AAAAAAANxXI=",
          UserModified: "d7188401-6ef2-e811-b7f9-8056f25c3d57",
          DateModified: "2021-10-12T12:42:50.0726293",
        },
      ],
      CurrentPrimaryLocationId: 35489,
      PrimaryDuplicatePatientId: "",
    });

    spyOn(registrationService, "updatePerson").and.returnValue(of(mockservice.PersonObj));
    component.savePerson();
    expect(registrationService.updatePerson).toHaveBeenCalled();
    expect(component.PersonObject.Profile).toEqual(mockservice.PersonObj.Profile);
  });
});

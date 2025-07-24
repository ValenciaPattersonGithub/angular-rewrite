import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Address } from 'src/patient/common/models/address.model';
import cloneDeep from 'lodash/cloneDeep';
import { RxUser, TeamMemberCrud, User, UserLocationsErrors, UserLocationSetup, StateLicense } from '../team-member';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import moment from 'moment';
import { DatePipe } from '@angular/common';
import { OrderByPipe, ZipCodePipe } from 'src/@shared/pipes';
import { TeamMemberLocationsComponent } from './team-member-locations/team-member-locations.component';
import { TeamMemberAdditionalIdentifiersComponent } from './team-member-additional-identifiers/team-member-additional-identifiers.component';
import { MasterAdditionalIdentifier } from '../../models/team-member-identifier.model';
import { Subscription } from 'rxjs';
import { Phones } from 'src/@shared/components/phone-info/phones.model';
import { TeamMemberContactInformationComponent } from './team-member-contact-information/team-member-contact-information.component';
import { TeamMemberFederalIdentificationComponent } from './team-member-federal-identification/team-member-federal-identification.component';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { TeamMemberLocationService } from './team-member-locations/team-member-location.service';
import { LocationTimeService } from 'src/practices/common/providers/location-time.service';
import { SsoDomainResponse, SsoDomainService } from '../../service/sso-domain.service';

@Component({
  selector: 'team-member-crud',
  templateUrl: './team-member-crud.component.html',
  styleUrls: ['./team-member-crud.component.scss']
})
export class TeamMemberCrudComponent implements OnInit, OnChanges, OnDestroy {
  @Input() currentUserData: User;
  @Input() taxonomyDropdownTemplateData;
  frmUserCrud: FormGroup;
  savingUser: boolean = false;
  hasInvalidTimes: boolean = false;
  lastModifiedMessage: string = '';
  invalidDataForRx: boolean = false;
  hasAccess: boolean = false;
  breadCrumbs: { name: string, path: string, title: string }[] = [];
  editMode: boolean = false;
  loginTimePhase2: boolean = false;
  loginTimeEnabled: boolean = false;
  // list of locationids to create rx users with
  rxLocationIds: Array<number>;
  // list of provider types with names and ids
  providerTypes = [];
  formIsValid: boolean = true;
  address: Address = { AddressLine1: null, AddressLine2: null, City: null, State: null, ZipCode: null };
  user: User = new User();
  duplicateEmailAdd: boolean = false;
  hasErrors: boolean = false;
  updatedRxUserType: number;
  // Model initialization
  userCreateDto: TeamMemberCrud = new TeamMemberCrud(this.user, {}, {}, 0);
  practiceId: number;
  practiceRole: { RoleId: string };
  phones: Array<Phones>;  
  rxAccessRequirements: boolean = false;
  userLocationSetups: Array<UserLocationSetup> = new Array<UserLocationSetup>();
  res: [];
  status: {};
  roleByLocationData: [];
  userLoginTimes: string;
  userNameValid: boolean = false;  
  hasChanges: boolean = false;
  originalUser: User;
  statusChange: boolean = false;
  doRxCheckOnPageLoad: boolean = true;
  rxSettings = { isNew: true, locations: [], roles: [], invalid: false };
  previousPath = '';
  locationId: number;
  fromAssignRoles: string;
  validDob: boolean = true;
  maxDateOfBirth: Date = new Date(moment().subtract(1, "day").startOf('day').toDate());
  minDate: Date = new Date('January 1, 1900');
  validStartDate: boolean = true;
  validEndDate: boolean = true;
  personalInfoRegex = '[^a-zA-Z0-9. !""#$%&\'()*+,-/:;<=>?@\[\\\]^_`{|}~\d]$';
  dateOfBirth: Date;
  employeeStartDate: Date;
  employeeEndDate: Date;
  username: string;
  validIds: boolean = true;
  validPhones: boolean = true;
  validTaxId: boolean = true;
  showproviderclaimiderror: boolean = false;
  userLocationSetupsDataChanged: boolean = false;
  datesComparionValidationMessage: string;
  isLoading: boolean = false;
  developmentMode: boolean = false;
  resendVerificationButtonClicked = false;
  usernameMaxLength: number = 255;
  AddPreverifiedUserAccess: boolean = false;
  canViewProviderInfo: boolean = false;
  canEditProviderInfo: boolean = false;
  rxUserCreatePermissions: boolean = false;
  canUpdateUserScheduleLoc: boolean = false;
  activationHistory = [];
  sortedColumn = "-DateModified";
  activationHistorySectionOpen = true;
  sortDirectionActivationGrid = 1;
  userLocationsErrors: UserLocationsErrors = { NoUserLocationsError: false, NoRoleForLocation: false };
  userActivated: boolean = false;
  // Rx Access
  disableRxDD: boolean = false;
  userIsNotAdmin: boolean = false;
  rxMsgDisable: string = '';
  rxAccessProviderRole: { 'Name': string, 'Type': number, 'Info': string };
  rxAccessProviderRoles: Array<{ 'Name': string, 'Type': number, 'Info': string }>;
  isPrescribingUser: boolean = false;
  isRxAdminUser: boolean = false;
  rxUser: RxUser = {};
  rxAccessEnum: string = '';
  doDisplayRxInfo: boolean = true;
  practiceLocations: [{ LocationId: number }];
  rolesStatus = { Loaded: false };
  //End Rx Access
  personalInfoSubscription: Subscription;
  @ViewChild(TeamMemberLocationsComponent) teamMemberLocations: TeamMemberLocationsComponent;
  @ViewChild(TeamMemberAdditionalIdentifiersComponent) additionalIdentifiersSetup: TeamMemberAdditionalIdentifiersComponent;
  @ViewChild(TeamMemberContactInformationComponent) contactInformationSetup: TeamMemberContactInformationComponent;
  @ViewChild(TeamMemberFederalIdentificationComponent) federalIdentification: TeamMemberFederalIdentificationComponent;
  masterAdditionalIdentifiers: MasterAdditionalIdentifier[];
  taxonomyDropdownTemplate: [];
  updatedLicenses: StateLicense[];
  LicenseStates: string = "";
  userIdentificationSectionOpen: boolean = true;
  sendUpdatedLicensesArgs: StateLicense[];
  maxDate = new Date(2099, 11, 31);
  dobChanged: boolean = false;
  startDateChanged: boolean = false;
  endDateChanged: boolean = false;
  defaultEmpty: boolean = false;
  invalidMaxDateOfBirth: boolean = false;
  validEmpStartDateControl: boolean = false;
  validEmpEndDateControl: boolean = false;
  empStartDateChanged: boolean = false;
  empEndDateChanged: boolean = false;
  userIsVerified = true; // assume user is verified until we know otherwise, since this should be the most common case
  ssoDomainOptions: { text: string, value: string }[] = [];
  ssoEnabled: boolean = false;

  constructor(private fb: FormBuilder,
    @Inject('localize') private localize,
    @Inject('$routeParams') private $routeParams,
    @Inject('$location') private $location,
    @Inject('$rootScope') private $rootScope,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('practiceService') private practiceService,
    @Inject('UserServices') private userServices,
    @Inject('SaveStates') private saveStates,
    @Inject('ModalFactory') private modalFactory,
    @Inject('SoarConfig') private soarConfig,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('FeatureService') private featureService,
    @Inject('tabLauncher') private tabLauncher,
    @Inject('RoleNames') public roleNames,
    @Inject('RolesFactory') private rolesFactory,
    @Inject('RxService') private rxService,
    @Inject('UserLoginTimesFactory') private userLoginTimesFactory,
    @Inject('EnterpriseSettingService') public enterpriseSettingService,
    @Inject('RxUserType') public rxUserType,
    @Inject('locationService') private locationService,
    public teamMemberLocationService: TeamMemberLocationService,
    public renderer: Renderer2,
    private datepipe: DatePipe,
    private zipCode: ZipCodePipe,
    private locationTimeService: LocationTimeService,
    private ssoDomainService: SsoDomainService
  ) {
    this.practiceId = this.practiceService?.getCurrentPractice()?.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentUserData) {
      const nv = changes?.currentUserData?.currentValue;
      const ov = changes?.currentUserData?.previousValue;
      if (nv) {
        this.user = cloneDeep(nv);
        this.checkRxAccess();
      }
      if (nv && this.userNameValid === false) {
        this.userNameValid = true;
      }
      if (nv && ov && nv !== ov && this.rolesStatus && this.rolesStatus?.Loaded) {
        this.hasChanges = true;
        this.$rootScope.$broadcast('sendLocationsToValidate', nv);
      }
    }

    // taxonomyDropdownTemplateData
    if (changes.taxonomyDropdownTemplateData) {
      const nv = changes?.taxonomyDropdownTemplateData?.currentValue?.data;
      if (nv) {
        this.taxonomyDropdownTemplate = cloneDeep(nv);
      }
    }
  }


  ngOnInit(): void {    
    this.userAcess();
    this.getPageNavigation();
    this.initUserLoginTimes();
    this.updateModelValues();
    this.hasAccessForSave();
    this.createForm();
    this.getLastModifiedMessage();
    this.getActivationHistory();
    this.setAccessProviderRoles();
    this.getUserScheduleStatus();
    this.getUserVerificationStatus();
    this.editMode = this.$routeParams?.userId ? true : false;
    /** gets set if navigated here from location page */
    this.locationId = this.$routeParams?.locationId;
    /** gets set if navigated here from assign roles page */
    this.fromAssignRoles = this.$routeParams?.fromAssignRoles;
    // if this.locationId is set, they got here from locations, send them back there
    this.previousPath = 'BusinessCenter/Users/';
    if (this.locationId) {
      this.previousPath = 'BusinessCenter/PracticeSettings/Locations/?locationId=' + this.locationId;
    }
    if (this.fromAssignRoles) {
      this.previousPath = 'BusinessCenter/Users/Roles/';
    }
    this.featureService.isEnabled('DevelopmentMode').then((res) => {
      this.developmentMode = res;
    });

    if (this.editMode) {
      this.frmUserCrud.controls['UserName'].disable();
    }

    // Rx Access
    // get all practice locations
    this.practiceLocations = this.referenceDataService.get(this.referenceDataService.entityNames.locations);
    // End Rx Access
    this.practiceId = this.practiceService?.getCurrentPractice()?.id;
    this.originalUser = this.user ? cloneDeep(this.user) : null;
    this.defaultEmpty = true;
  }

  updateModelValues = () => {
    if (this.user?.DateOfBirth) {
      this.user.DateOfBirth = new Date(this.user?.DateOfBirth);
      this.user?.DateOfBirth?.setHours(0, 0, 0);
    }

    if (this.user?.EmployeeStartDate) {
      this.user.EmployeeStartDate = new Date(this.user?.EmployeeStartDate);
    }

    if (this.user?.EmployeeEndDate) {
      this.user.EmployeeEndDate = new Date(this.user?.EmployeeEndDate);
    }

  }

  getUserVerificationStatus = () => {
    if (this.user?.UserName) {
      const enterpriseId = this.locationService.getCurrentLocationEnterpriseId();
      this.userServices.UserVerification(enterpriseId).getADUser({
        email: this.user?.UserName
      }, (res) => {
        this.userIsVerified = res?.UserDetails?.EmailVerified || false;
      });
    }
  }

  setSsoDomainControlsData = (response: SsoDomainResponse, frmUserCrud: FormGroup) => {
    this.ssoDomainOptions = response.domainNames.map(domain => ({
              text: domain,
              value: domain
            }));
    this.ssoEnabled = !this.editMode ? response.isSSOEnabled : false;
    if (this.ssoEnabled && !this.editMode && this.ssoDomainOptions.length === 1) {
      frmUserCrud.get('SsoDomain')?.setValue(this.ssoDomainOptions[0].value);
    }
  }

  setSSOControls = (practiceId: number, frmUserCrud: FormGroup ) => {
    if (practiceId) {
      this.ssoDomainService.getSsoDomainList(practiceId)
        .pipe(take(1))
        .subscribe(
          (response: SsoDomainResponse) => this.setSsoDomainControlsData(response, frmUserCrud),
          (error) => {
            this.ssoEnabled = false;
            this.ssoDomainOptions = [];
          },
          () => {
            this.updateSsoDomainValidation(frmUserCrud, this.ssoEnabled);
          }
        );
    }
  }

  updateSsoDomainValidation = (frmUserCrud: FormGroup, ssoEnabled: boolean) => {
    if (frmUserCrud && frmUserCrud.controls['SsoDomain']) {
      if (ssoEnabled) {
        // Enable SSO domain and make it required
        frmUserCrud.controls['SsoDomain'].enable();
        frmUserCrud.controls['SsoDomain'].setValidators([Validators.required]);
        frmUserCrud.controls['SsoDomain'].updateValueAndValidity();
        // Update username validation to use usernameValidator
        frmUserCrud.controls['UserName'].setValidators([Validators.required, Validators.maxLength(255), this.usernameValidator()]);
        frmUserCrud.controls['UserName'].updateValueAndValidity();
      } else {
        // Disable SSO dropdown and clear validators
        frmUserCrud.controls['SsoDomain'].disable();
        frmUserCrud.controls['SsoDomain'].clearValidators();
        frmUserCrud.controls['SsoDomain'].updateValueAndValidity();
        // Use Validators.email for username when SSO is disabled
        frmUserCrud.controls['UserName'].setValidators([Validators.required, Validators.maxLength(255), Validators.email]);
        frmUserCrud.controls['UserName'].updateValueAndValidity();
      }
    }
  }

  // validator that checks whether we match the regular expression (valid) or not (invalid)
  regexMatchValidator = function (regex: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasMatch = regex.test(control.value);
      return !hasMatch ? {
        regexMatch: {
          value: control.value
        }
      } : null;
    }
  }
  usernameValidator = function(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value === '') {
        return null; // Don't validate empty values, let required validator handle that
      }
      // accept: letters, numbers, underscore, plus sign, and dots/hyphens in the middle
      const usernamePattern = /^[a-zA-Z0-9_+]+([-.][a-zA-Z0-9_+]+)*$/;
      const validLength = (control.value.length <= 256);
      const regMatch = usernamePattern.test(control.value);
      return (validLength && regMatch) ? null : { usernameInvalid: true };
    };
  }

  createForm = () => {
    const nameRegex = /^[\p{L}\p{M}\p{N}' \-.]+$/u;

    this.frmUserCrud = this.fb.group({
      FirstName: [this.user?.FirstName, [Validators.required, this.regexMatchValidator(nameRegex)]],
      MiddleName: [this.user?.MiddleName, null],
      LastName: [this.user?.LastName, [Validators.required, this.regexMatchValidator(nameRegex)]],
      UserName: [this.user?.UserName, [Validators.required, Validators.maxLength(255), Validators.email]], // Default with email validation
      SuffixName: [this.user?.SuffixName, null],
      PreferredName: [this.user?.PreferredName, null],
      DateOfBirth: [this.user?.DateOfBirth, null],
      ProfessionalDesignation: [this.user?.ProfessionalDesignation, null],
      JobTitle: [this.user?.JobTitle, null],
      EmployeeStartDate: [this.user?.EmployeeStartDate, null],
      EmployeeEndDate: [this.user?.EmployeeEndDate, null],
      RxUserType: [this.user?.RxUserType, null],
      SsoDomain: ['', null], // Start without validation, will be added conditionally
    });
    
    this.changeRxUserType(this.user?.RxUserType);

    this.personalInfoSubscription = this.DateOfBirth.valueChanges.pipe(distinctUntilChanged()).subscribe(changes => {
      if (changes) {
        this.frmUserCrud.controls['DateOfBirth'].clearValidators();
        this.frmUserCrud.controls['DateOfBirth'].updateValueAndValidity();
      }
    });

    this.setSSOControls(this.practiceId, this.frmUserCrud);
  }

  get DateOfBirth() {
    return this.frmUserCrud.get('DateOfBirth');
  }
  
  getPageNavigation = () => {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings'
      },
      {
        name: this.localize.getLocalizedString('Add a Team Member'),
        path: '#/BusinessCenter/Users/',
        title: 'Add a Team Member'
      }
    ];
  }

  userAcess = () => {
    this.AddPreverifiedUserAccess = this.hasAddPreverifiedUserAccess();
    this.canViewProviderInfo = this.hasViewProviderInfoAccess();
    this.canEditProviderInfo = this.hasEditProviderInfoAccess();
    this.rxUserCreatePermissions = this.authRxUserCreateAccess();
  }

  initUserLoginTimes = () => {
    let practice = this.practiceService.getCurrentPractice();
    let enableUltPhase2 = this.soarConfig.enableUlt;

    if (enableUltPhase2 == 'true') {
      //If phase2 is enabled, completely ignore whatever is set for phase1                
      this.loginTimePhase2 = true;
      this.enterpriseSettingService.Enterprise.get({ practiceId: practice?.id }).$promise.then((enterprise) => {
        this.enterpriseSettingService.EnterpriseSettings(enterprise?.id).getById({ enterpriseId: enterprise?.id, enterpriseSettingName: 'PracticeLevelRestrictedUserTimes' }).$promise.then((ultSetting) => {
          if (ultSetting?.settingValue === 'true') {
            this.loginTimeEnabled = true;
          }
          else {
            this.loginTimeEnabled = false;
          }
        }, (error) => {
          //If this call fails, let's assume that they don't have an enterprise setting set up
          this.loginTimeEnabled = false;
        });
      }, (error) => {
        //EnterpriseGetFailed
        this.loginTimeEnabled = false;
      });
    }
  }

  // enabling/disabling save button based on access
  hasAccessForSave = () => {
    if (!this.editMode && this.authUserCreateAccess) {
      this.hasAccess = true;
    }
    else if (this.editMode && this.authUserEditAccess()) {
      this.hasAccess = true;
    }
  }

  loginTimesChange = (loginTimeList) => {
    this.userLoginTimes = loginTimeList;

    if (loginTimeList?.length > 0 && loginTimeList?.some((time) => { return time?.IsValid == false })) {
      this.hasInvalidTimes = true;
    }
    else {
      this.hasInvalidTimes = false;
    }
  }


  //#region Authorization
  authUserCreateAccess = () => {
    return this.checkAuthorization('soar-biz-bizusr-add');
  }

  authUserEditAccess = () => {
    return this.checkAuthorization('soar-biz-bizusr-edit');
  }

  checkAuthorization = (amfa) => {
    return this.patSecurityService.IsAuthorizedByAbbreviation(amfa);
  }

  hasViewProviderInfoAccess = () => {
    return this.checkAuthorization("soar-biz-bizusr-vwprov");
  }

  hasEditProviderInfoAccess = () => {
    return this.checkAuthorization("soar-biz-bizusr-etprov");
  }

  hasAddPreverifiedUserAccess = () => {
    return this.checkAuthorization("soar-biz-bizusr-addpv");
  }

  authRxUserCreateAccess = () => {
    if (!this.patSecurityService.IsAuthorizedByAbbreviationAtPractice('plapi-user-usrrol-create')) {
      this.userIsNotAdmin = true;
      this.rxMsgDisable = this.localize.getLocalizedString('You must have the role of Practice Admin / Executive Dentist to modify ePrescriptions.');
      return false;
    }
    return this.patSecurityService.IsAuthorizedByAbbreviation('rxapi-rx-rxuser-create');
  }

  cancelChanges = () => {
    let deleteLocationChanged = this.teamMemberLocations?.deleteLocation;
    let editLocationChanged = this.teamMemberLocations?.editLocation;

    if (this.user?.ProviderOnClaimsRelationship == 0 && this.originalUser?.ProviderOnClaimsRelationship == null && this.user?.ProviderTypeId == 4 && this.originalUser?.ProviderTypeId == null) {
      this.user.ProviderOnClaimsRelationship = this.originalUser?.ProviderOnClaimsRelationship;
      this.user.ProviderTypeId = this.originalUser?.ProviderTypeId;
    }
    if (this.userLocationSetupsDataChanged === true) {
      this.hasChanges = true;
    }

    if (this.hasChanges ||
      (this.frmUserCrud?.dirty) ||
      (this.contactInformationSetup?.contactForm?.dirty) ||
      (this.contactInformationSetup?.phoneInfoSetup?.phoneInfoSetupItem?.frmContactInfo?.dirty) ||
      (this.federalIdentification?.userIdentificationFrm?.dirty) ||
      (this.teamMemberLocations?.frmUserLocations?.dirty) ||
      (this.teamMemberLocations?.viewLocationSetupCrudModal?.teamMemberLocationSetup?.dirty) ||
      this.dobChanged ||
      this.startDateChanged ||
      this.endDateChanged ||
      deleteLocationChanged ||
      editLocationChanged
    ) {
      this.modalFactory.CancelModal().then(this.confirmCancel);
    } else {
      this.confirmCancel();
    }

  }

  confirmCancel = () => {
    this.user = this.originalUser;
    window.location.href = '#/BusinessCenter/Users';
  }

  saveUser = (status: boolean = false) => {
    this.duplicateEmailAdd = false;
    this.savingUser = true;
    if (this.invalidMaxDateOfBirth || (!this.validEmpStartDateControl && this.empStartDateChanged) || (!this.validEmpEndDateControl && this.empEndDateChanged)) {
      this.savingUser = false;
      return;
    }
    this.user.DateOfBirth = (this.dateOfBirth != undefined || this.dateOfBirth != null ? this.dateOfBirth : this.frmUserCrud.controls['DateOfBirth']?.value);
    this.user.EmployeeStartDate = (this.employeeStartDate != undefined || this.employeeStartDate != null ? this.employeeStartDate : this.frmUserCrud.controls['EmployeeStartDate']?.value);
    this.user.EmployeeEndDate = (this.employeeEndDate != undefined || this.employeeEndDate != null ? this.employeeEndDate : this.frmUserCrud.controls['EmployeeEndDate']?.value);
    this.user.DateOfBirth = this.locationTimeService.toUTCDateKeepLocalTime(this.user?.DateOfBirth);
    this.user.EmployeeStartDate = this.locationTimeService.toUTCDateKeepLocalTime(this.user?.EmployeeStartDate);
    this.user.EmployeeEndDate = this.locationTimeService.toUTCDateKeepLocalTime(this.user?.EmployeeEndDate);
    this.user.FirstName = this.frmUserCrud.controls['FirstName']?.value;
    this.user.LastName = this.frmUserCrud.controls['LastName']?.value;
    this.user.MiddleName = this.frmUserCrud.controls['MiddleName']?.value;
    this.user.SuffixName = this.frmUserCrud.controls['SuffixName']?.value;
    this.user.PreferredName = this.frmUserCrud.controls['PreferredName']?.value;
    this.user.ProfessionalDesignation = this.frmUserCrud.controls['ProfessionalDesignation']?.value;
    this.user.JobTitle = this.frmUserCrud.controls['JobTitle']?.value;
    this.user.UserName = (this.username != undefined || this.username != null ? this.username : this.frmUserCrud.controls['UserName']?.value);
    // Handle SSO domain if enabled
    if (this.ssoEnabled) {
      const selectedSsoDomain = this.frmUserCrud.controls['SsoDomain']?.value;
      this.user.UserName = `${this.user.UserName}${selectedSsoDomain}`;
    }
    
    // Read control values from team-member-federal-identification component
    this.user.TaxId = this.federalIdentification?.userIdentificationFrm?.controls['TaxId']?.value;
    this.user.FederalLicense = this.federalIdentification?.userIdentificationFrm?.controls['FederalLicense']?.value;
    this.user.DeaNumber = this.federalIdentification?.userIdentificationFrm?.controls['DeaNumber']?.value;
    this.user.NpiTypeOne = this.federalIdentification?.userIdentificationFrm?.controls['NpiTypeOne']?.value;
    this.user.PrimaryTaxonomyId = this.federalIdentification?.userIdentificationFrm?.controls['PrimaryTaxonomyId']?.value;
    this.user.SecondaryTaxonomyId = this.federalIdentification?.userIdentificationFrm?.controls['SecondaryTaxonomyId']?.value;
    this.user.DentiCalPin = this.federalIdentification?.userIdentificationFrm?.controls['DentiCalPin']?.value;
    if (this.user?.PrimaryTaxonomyId == null) {
      this.user.SecondaryTaxonomyId = null;
    }
    // check for contact information form is valid
    if (this.contactInformationSetup) {
      this.formIsValid = this.contactInformationSetup?.contactForm?.valid;
      if (!this.formIsValid) {
        this.hasErrors = !this.formIsValid;
        this.contactInformationSetup.formIsValid = this.formIsValid;
        this.savingUser = false;
        return;
      }
      else {
        this.user.Address = this.contactInformationSetup?.address;
      }
    }

    // check for team member contact info phone is valid
    if (this.contactInformationSetup) {
      let phoneInfoSetup = this.contactInformationSetup?.phoneInfoSetup;
      let phones = phoneInfoSetup?.phones;
      let duplicateNumberExists = phones?.some(phone => phone?.duplicateNumber);
      let InCorrectPhone = phones?.some(p => (p?.PhoneNumber?.length && p?.PhoneNumber?.length == 10 && !p?.Type) || (p?.Type && !p?.PhoneNumber?.length));
      if (InCorrectPhone || duplicateNumberExists) {
        this.contactInformationSetup?.phoneInfoSetup?.btnAddPhone?.nativeElement?.focus();
        this.savingUser = false;
        this.hasErrors = true;
        return
      }
    }

    // check for team member location form is valid
    if (this.teamMemberLocations) {
      this.formIsValid = this.teamMemberLocations?.frmUserLocations?.valid;
      if (!this.formIsValid) {
        this.hasErrors = !this.formIsValid;
        this.savingUser = false;
        if (this.teamMemberLocations?.frmUserLocations?.controls["StatusChangeNote"]?.invalid) {
          this.teamMemberLocations?.reasonBox?.nativeElement?.focus();
        }
        return;
      }
    }

    this.validatePanel(this.user);
    this.validateDateofBirth();
    // validate presribing user if formIsValid
    if (this.formIsValid) {
      this.validatePrescribingUser(this.user);
    }
    if (this.formIsValid) {
      this.validateContactRxAccessRequiredProperties();
    }
    // validate roles if formIsValid
    if (this.formIsValid) {
      this.validateUserLocationSetups();
    }

    this.hasErrors = !this.formIsValid;
    // Get a copy of the user to pass to update functions for roles and selected locations
    var roleByLocationData = cloneDeep(this.user);
    if (this.formIsValid && this.federalIdentification?.userIdentificationFrm?.valid) {
      this.copyUser();

      if (this.editMode) {
        // Edit user
        if (this.user?.RxUserType !== this.originalUser?.RxUserType) {
          // Save new rx user type and only update AFTER rxApi call is successful
          this.updatedRxUserType = this.user?.RxUserType;
        }

        this.userServices.Users.update(this.user, (res) => {
          // store a copy of user for updating locations, roles, and rx
          // @ts-ignore
          this.roleByLocationData = roleByLocationData;
          this.duplicateEmailAdd = false;
          // saving the userLocationsSetups before continuing
          this.userLocationSetups = cloneDeep(this.userLocationSetups);
          // setup rx location ids based on userLocationSetups                            
          this.rxLocationIds = [];
          this.userLocationSetups.forEach((location) => {
            this.rxLocationIds.push(location.LocationId);
            location.UserId = this.user?.UserId;
          });
          // if user has been been marked No Access (user.IsActive = false), 
          // call this.setInactiveRoles to populate the userAssignedRolesDto
          let userAssignedRolesDto = null;
          if (this.originalUser?.IsActive == true && this.user?.IsActive === false) {
            userAssignedRolesDto = this.setInactiveRoles(this.userLocationSetups, this.user);
          }
          // save userLocationSetups, roles before processing success                        
          var updatePromises = [];
          updatePromises.push(this.teamMemberLocationService.saveUserLocationSetups(this.userLocationSetups));

          // if user has been been marked No Access (user.IsActive = false), 
          // call rolesFactory.AddInactiveUserAssignedRoles to store the inactive roles
          if (userAssignedRolesDto != null) {
            updatePromises.push(this.rolesFactory.AddInactiveUserAssignedRoles(this.user?.UserId, userAssignedRolesDto));
          }
          updatePromises.push(this.rolesFactory.ProcessUserLocationRoles(this.userLocationSetups, this.user?.UserId));
          updatePromises.push(this.rolesFactory.ProcessUserPracticeRoles(this.user));
          updatePromises.push(this.userLoginTimesFactory.UpdateLoginTime(this.user?.UserId, this.userLoginTimes));

          if (updatePromises?.length > 0) {
            Promise.all(updatePromises).then(() => {
              this.usersSaveSuccess(res, 'Update successful.', status, roleByLocationData);
            }, (error) => {
              if (error && typeof error === 'string') {
                if (error.includes("UserLocationSaveApi")) {
                  this.toastrFactory.error(this.localize.getLocalizedString('Failed to save the User Location Setups. Refresh the page and try again'), 'Error');
                }
                if (error.includes("UserLocationUpdateApi")) {
                  this.toastrFactory.error(this.localize.getLocalizedString('Failed to update the User Location Setups. Refresh the page and try again'), 'Error');
                }
                if (error.includes("UserLocationDeleteApi")) {
                  this.toastrFactory.error(this.localize.getLocalizedString('Failed to delete the User Location Setups. Refresh the page and try again'), 'Error');
                }
              }
            });
          } else {
            this.usersSaveSuccess(res, 'Update successful.', status, roleByLocationData);
          }
        }, (error) => {
          this.usersSaveFailure(error, 'Update was unsuccessful. Please retry your save.');
          this.savingUser = false;
        });
      } else {
        // Create user  
        this.userCreateDto.User = cloneDeep(this.user);
        this.createUser();

        // Add new user practice roles
        this.practiceRoles();

        // Add new user location roles
        this.locationRoles();

        if (this.ssoEnabled) {
          this.userCreateDto.UserVerificationType = 5;
        } else {
          this.userCreateDto.UserVerificationType = 0;
        }

        this.userServices.Users.save(this.userCreateDto).$promise.then(userServiceResponse => {

          this.res = userServiceResponse;
          this.status = status;
          // store a copy of user for updating locations, roles, and rx
          // @ts-ignore
          this.roleByLocationData = roleByLocationData;

          // get and set the userId in userLocationsSetups
          var userId = userServiceResponse?.Value?.UserId;
          this.userLocationSetups?.forEach(userLocationSetup => {
            userLocationSetup.UserId = userId;
          });

          // storing then saving the userLocationsSetups before continuing
          this.userLocationSetups = cloneDeep(this.userLocationSetups);
          this.teamMemberLocationService.saveUserLocationSetups(this.userLocationSetups).then(_ => {
            this.usersSaveSuccess(userServiceResponse, 'Update successful.', status, roleByLocationData);
          }, (error) => {
            if (error && typeof error === 'string') {
              if (error.includes("UserLocationSaveApi")) {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to save the User Location Setups. Refresh the page and try again'), 'Error');
              }
              if (error.includes("UserLocationUpdateApi")) {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to update the User Location Setups. Refresh the page and try again'), 'Error');
              }
              if (error.includes("UserLocationDeleteApi")) {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to delete the User Location Setups. Refresh the page and try again'), 'Error');
              }
            }
          });
          this.userLoginTimesFactory.UpdateLoginTime(userId, this.userLoginTimes);

          // setup rx location ids based on userLocationSetups                            
          this.rxLocationIds = [];
          this.userLocationSetups?.forEach(location => {
            this.rxLocationIds?.push(location?.LocationId);
          });
        }, (error) => {
          let errDisplayed = false;
          let foundItem = error?.data?.InvalidProperties?.filter(item => item.PropertyName === 'EmailAddressMustUnique');
          if (foundItem) {
            if (foundItem?.length > 0) {
              errDisplayed = true;
              this.duplicateEmailAdd = true;
              this.usersSaveFailure(error, error?.data?.InvalidProperties[0]?.ValidationMessage);
            }
          }

          if (!errDisplayed) {
            this.usersSaveFailure(error, 'There was an error and your user was not created.');
          }
        });
      }
    } else {
      this.savingUser = false;
    }
  }

  confirmReverification = () => {
    var title = this.localize.getLocalizedString("Resend New User Verification");
    var message = this.localize.getLocalizedString("An email will be sent in the next 24 hours to verify this user. Please have the user follow the instructions to setup their personal security settings and password before they can use Fuse.");
    var buttonText = this.localize.getLocalizedString("Close");
    this.modalFactory.ConfirmModal(title, message, buttonText).then(this.resendVerificationEmail);
    this.resendVerificationButtonClicked = true;
  }

  resendVerificationEmail = () => {
    this.isLoading = true;
    var params = { userId: this.user?.UserId };
    this.userServices.UserVerification().resendUserVerificationEmail(params, (res) => {
        this.isLoading = false;
        this.resendVerificationButtonClicked = false;
        this.toastrFactory.success(res, 'Success');
      }, () => {
        this.isLoading = false;
        this.resendVerificationButtonClicked = false;
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to resend user verification email', 'Error'));
      });
  }

  copyUser = () => {
    if (this.user?.Address?.ZipCode) {
      this.user.Address.ZipCode = this.user?.Address?.ZipCode?.replace('-', '');
    }
  }

  createUser = () => {
    if (this.user?.RxUserType > 0) {
      this.updatedRxUserType = this.user?.RxUserType;
    }

    if (!this.userCreateDto?.User?.UserId)
      delete this.userCreateDto.User.UserId;

    if (!this.userCreateDto?.User?.RxUserType)
      this.userCreateDto.User.RxUserType = 0;
  }

  practiceRoles = () => {
    if (this.user?.$$UserPracticeRoles?.length > 0) {
      this.userCreateDto.PracticeRoles[this.practiceId] = [];
      this.user?.$$UserPracticeRoles?.forEach(practiceRole => {
        this.userCreateDto?.PracticeRoles[this.practiceId]?.push(practiceRole?.RoleId);
      })
    }
  }

  locationRoles = () => {
    if (this.userLocationSetups?.length > 0) {
      this.userLocationSetups?.forEach(userLocationSetup => {
        this.userCreateDto.LocationRoles[userLocationSetup?.LocationId] = [];
        if (userLocationSetup?.$$UserLocationRoles?.length > 0) {
          userLocationSetup.$$UserLocationRoles.forEach(role => {
            this.userCreateDto?.LocationRoles[userLocationSetup?.LocationId].push(role?.RoleId);
          });
        }
      });
    }
  }

  usersSaveSuccess = (res, msg, status, roleByLocationData) => {

    // invalidate the data to nuke the cache, then add a promise to get the data again before we can navigate back to the team members page
    this.referenceDataService.invalidate(this.referenceDataService.entityNames.users);
    var savingPromises = [this.referenceDataService.getData(this.referenceDataService.entityNames.users)];
    if (!res && !msg && !roleByLocationData) {
      res = this.res;
      status = this.status;
      roleByLocationData = this.roleByLocationData;
    }

    this.hasChanges = false;
    res.Value.StatusChangeNote = this.user?.StatusChangeNote;
    this.user = res?.Value;
    if (this.user?.DateOfBirth) {
      this.user.DateOfBirth = new Date(this.user?.DateOfBirth);
    }
    if (this.user?.EmployeeStartDate) {
      this.user.EmployeeStartDate = new Date(this.user?.EmployeeStartDate);
    }
    if (this.user?.EmployeeEndDate) {
      this.user.EmployeeEndDate = new Date(this.user?.EmployeeEndDate);
    }
    this.originalUser = cloneDeep(this.user);
    roleByLocationData.UserId = this.user?.UserId;

    if (!status) {
    } else {
      this.statusChange = true;
    }
    let additionalIdentifierPromises = this.additionalIdentifiersSetup?.saveAdditionalIdentifiers(this.user);
    if (additionalIdentifierPromises && additionalIdentifierPromises?.length) {
      for (let i = 0; i < additionalIdentifierPromises?.length; i++) {
        savingPromises?.push(additionalIdentifierPromises[i]);
      }
    }

    // save phones
    let savePhonePromise = this.contactInformationSetup?.savePhones(this.user);
    if (savePhonePromise) {
      savingPromises.push(savePhonePromise);
    }

    //save licenses
    let saveLicensesPromise = this.saveLicenses();
    if (saveLicensesPromise) {
      savingPromises.push(saveLicensesPromise);
    }

    Promise.all(savingPromises).then(savingPromisesSuccess => {
      this.savingUser = false;
      // set to false if saving user
      this.doRxCheckOnPageLoad = false;

      // added to capture save and responses after user save completes 
        if (this.rxSettings?.isNew === false || (this.rxSettings?.roles?.length > 0 && this.rxSettings?.locations?.length > 0))
        {
            this.saveRxUser().then(() => {
                this.finishUp(res, msg);
            });
        } else {
            this.finishUp(res, msg);
        }
    }, (error) => {
      this.savingUser = false;
      this.toastrFactory.error(error, 'Failure ' + error);
    }
    );
  }

  finishUp = (res, msg) => {
    this.res = null;
    this.status = null;
    this.roleByLocationData = null;
    this.toastrFactory.success(this.localize.getLocalizedString(msg), this.localize.getLocalizedString('Success'));
    window.location.href = '#/BusinessCenter/Users/';
    this.$rootScope.$broadcast('user-updated', res);
  }

  usersSaveFailure = (error, msg) => {
    error?.data?.InvalidProperties?.forEach(prop => {
      // finding the object in the string
      let index = prop?.ValidationMessage.indexOf('Result');
      let validationError;
      try {
        validationError = JSON.parse(prop?.ValidationMessage?.substring(index - 2));
      }
      catch (e) {
        validationError = {};
      }
      if (validationError?.Result) {
        validationError?.Result?.Errors.forEach(error => {
          // TODO : ugly? yes. only way to do it until we have a better error handling solution
          if (error?.PropertyName == 'UserName' && error?.ValidationMessage == 'Name must be unique') {
            this.userNameValid = false;
          }
        });
      }
    });
    this.savingUser = false;
    this.toastrFactory.error(this.localize.getLocalizedString(msg), this.localize.getLocalizedString('Error'));
  }

  validateDateofBirth = () => {
    if (this.dateOfBirth && this.rxAccessRequirements) {
      this.frmUserCrud.controls['DateOfBirth'].clearValidators();
      this.frmUserCrud.controls['DateOfBirth'].updateValueAndValidity();
    }
  }

  validatePanel = (user) => {
    if (user) {
      this.formIsValid = this.frmUserCrud?.valid && this.datesValidaion()
        && this.frmUserCrud.controls['FirstName']?.valid
        && this.frmUserCrud.controls['LastName']?.valid
        && this.validDob
        && this.validStartDate
        && this.validEndDate
        && this.validIds
        && this.validPhones
        && this.validTaxId
        && !this.showproviderclaimiderror;

      // set focus if not valid
      if (this.formIsValid == false) {
        if (!$("#personalInfo").hasClass("in")) {
          $("#personalInfo").addClass("in");
        }

        if (!$("#contactInfo").hasClass("in")) {
          $("#contactInfo").addClass("in");
        }

        if (!$("#addtionalIdentifiers").hasClass("in")) {
          $("#addtionalIdentifiers").addClass("in");
        }

        $('input.ng-invalid').first().focus();
      }
    }
  }

  // Below function is to validate Employement Start Date and Employement End Date
  datesValidaion = () => {
    if (!this.editMode) {
      this.datesComparionValidationMessage = null;
      return true;
    }
    else {
      this.datesComparionValidationMessage = "Employment Start Date should be prior to Employment End Date";
      if (this.user.EmployeeStartDate == null && this.user.EmployeeEndDate == null) {
        this.datesComparionValidationMessage = null;
        return true;
      }
      else {
        if (this.user.EmployeeStartDate == null && this.user.EmployeeEndDate != null) {
          this.datesComparionValidationMessage = "Employment Start Date should not be empty";
          return false;
        }
        if (this.user.EmployeeStartDate != null && this.user.EmployeeEndDate == null) {
          this.datesComparionValidationMessage = null;
          return true;
        }
        if (this.user.EmployeeStartDate != null && this.user.EmployeeEndDate != null) {
          var startDate = new Date(this.user?.EmployeeStartDate)
          var endDate = new Date(this.user?.EmployeeEndDate)
          if (startDate > endDate) {
            return false;
          }
          else {
            this.datesComparionValidationMessage = null;
            return true;
          }
        }
      }
    }
  }

  validateUserLocationSetups = () => {
    let activeUserLocationSetups = this.userLocationSetups?.filter(userLocationSetup => {
      return userLocationSetup?.ObjectState != this.saveStates?.Delete;
    });

    if (activeUserLocationSetups?.length === 0) {
      this.formIsValid = false;
      this.userLocationsErrors.NoUserLocationsError = true;
      this.teamMemberLocations?.btnAddUserLocationSetup?.nativeElement?.focus();
    } else {
      // validate Location roles 
      // only required if user has IsActive = true
      this.userLocationsErrors.NoUserLocationsError = false;
      if (!this.user?.$$isPracticeAdmin && this.user?.IsActive === true && this.userLocationSetups?.length > 0) {
        this.userLocationSetups.forEach(userLocationSetup => {
          if (!userLocationSetup?.$$UserLocationRoles || userLocationSetup?.$$UserLocationRoles?.length === 0) {
            this.formIsValid = false;
            this.userLocationsErrors.NoRoleForLocation = true;
            this.teamMemberLocations?.btnAddUserLocationSetup?.nativeElement?.focus();
          }
        });
      }
    }
  }

  onUserLocationSetupsDataChanged(updateUserLocation: Array<UserLocationSetup>) {
    this.userLocationSetups = new Array<UserLocationSetup>();
    this.userLocationSetups = updateUserLocation;
    if (this.federalIdentification) {
      this.federalIdentification.userLocationSetups = this.userLocationSetups;
      this.federalIdentification.setProviderOfService();
    }
  }

  validatePrescribingUser = (user) => {    
      if (this.rxSettings && this.rxSettings?.invalid) {
        this.formIsValid = false;
      }
      if (this.rxSettings && this.rxSettings.roles && this.rxSettings.roles.length > 0) {
        var index = this.rxSettings.roles.findIndex(role => role.value === 1);

        if (index > -1) {
          if (!user.DeaNumber || !user.NpiTypeOne || !user.TaxId) {
            this.formIsValid = false;
          }
        }
      }    
  }  

  validateContactRxAccessRequiredProperties = () => {
    if (this.rxAccessRequirements && this.contactInformationSetup?.contactForm?.invalid) {
      this.formIsValid = false;
      this.renderer?.selectRootElement('input.ng-invalid')?.focus()
    }
  }


  onDateOfBirthChanged = (date) => {
    this.dobChanged = true;
    this.dateOfBirth = date;
    this.user.DateOfBirth = new Date(date);
    if (this.dateOfBirth) {
      this.frmUserCrud.controls['DateOfBirth'].setValue(this.user?.DateOfBirth);
      this.frmUserCrud.controls['DateOfBirth'].clearValidators();
      this.frmUserCrud.controls['DateOfBirth'].updateValueAndValidity();
    }
    if ((this.user?.DateOfBirth >= this.maxDateOfBirth) || (this.user?.DateOfBirth < this.minDate)) {
      this.invalidMaxDateOfBirth = true;
      return;
    } else if (this.invalidMaxDateOfBirth && this.user?.DateOfBirth < this.maxDateOfBirth) {
      this.invalidMaxDateOfBirth = false;
    }
  }

  onStartDateChanged = (date) => {
    this.startDateChanged = true;
    this.employeeStartDate = date;
  }

  onEndDateChanged = (date) => {
    this.endDateChanged = true;
    this.employeeEndDate = date;
  }

  // this method marks the current roles objectState to Delete
  setInactiveRoles = (userLocationSetups, user) => {
    // This object used to persist inactive roles if user is set to No Access
    let userAssignedRolesDto = {
      UserLocationDtos: [],
      IsSetToInactive: true,
      UserRoleLocationInactiveDtos: [],
      UserRolePracticeInactiveDtos: [],
      UserPracticeRoles: [],
      UserId: null,
    };

    userAssignedRolesDto.UserId = this.user?.UserId;
    if (this.originalUser?.IsActive === true && this.user?.IsActive === false) {
      // add each locationSetup.$$UserLocationRole to inactiveRole object  (unless its ObjectState is Add)
      userLocationSetups?.forEach((userLocationSetup) => {
        userLocationSetup?.$$UserLocationRoles.forEach((userLocationRole) => {
          // remove role if ObjectState is Add, hasn't been persisted, otherwise store as inactive
          userLocationRole.$$ObjectState = userLocationRole?.$$ObjectState === this.saveStates.Add ? this.saveStates.None : this.saveStates.Delete;
          // add current roles to inactive roles object
          if (userLocationRole?.$$ObjectState === this.saveStates.Delete) {
            var inactiveRole = {
              UserId: this.user?.UserId,
              RoleId: userLocationRole?.RoleId,
              LocationId: userLocationSetup?.LocationId,
            };
            userAssignedRolesDto?.UserRoleLocationInactiveDtos?.push(inactiveRole);
          }
        });
      });
      // add each user.$$UserPracticeRole to inactiveRole object (unless its ObjectState is Add)
      user?.$$UserPracticeRoles?.forEach((userPracticeRole) => {
        // remove role if ObjectState is Add, hasn't been persisted, otherwise store as inactive
        userPracticeRole.$$ObjectState = userPracticeRole?.$$ObjectState === this.saveStates.Add ? this.saveStates.None : this.saveStates.Delete;
        // add current roles to inactive roles object
        if (userPracticeRole.$$ObjectState === this.saveStates.Delete) {
          var inactiveRole = {
            UserId: this.user?.UserId,
            RoleId: userPracticeRole?.RoleId,
            PracticeId: this.practiceId,
          };
          userAssignedRolesDto?.UserRolePracticeInactiveDtos?.push(inactiveRole);
        }
      });
    }
    return userAssignedRolesDto;
  };

  getLastModifiedMessage = () => {
    this.lastModifiedMessage = "";
    let userLocation = this.userLocation();
    let abbr = userLocation ? this.locationTimeService.getTimeZoneAbbr(userLocation?.timezone, this.user?.DateModified) : '';
    let time = userLocation ? this.locationTimeService.convertDateTZ(this.user?.DateModified, userLocation?.timezone) : this.user?.DateModified;
    let filteredDateTime = this.datepipe.transform(time, 'M/d/yyyy h:mm a');
    if (this.user?.UserModified && this.user?.UserModified != '00000000-0000-0000-0000-000000000000') {
      let users = this.referenceDataService.get(this.referenceDataService?.entityNames?.users);
      let user = users.find(x => x.UserId == this.user?.UserModified);
      if (user) {
        var lastModifiedUser = user.FirstName + " " + user.LastName;
        this.lastModifiedMessage = lastModifiedUser + " on " + filteredDateTime + " (" + abbr + ")";
      } else {
          var lastModifiedUser = "External User (" + this.user?.UserModified + ")";
          var lastMod = new Date(this.user.DateModified);
          this.lastModifiedMessage = lastModifiedUser + " on " + lastMod.toDateString();
      }
    }
  }

  userLocation = () => {
    return JSON.parse(sessionStorage.getItem('userLocation'));
  }

  updateAddress = (updatedAddress: Address) => {
    this.user.Address = updatedAddress;
  }

  // #region User Verification
  clearValidation = () => {
    this.duplicateEmailAdd = false;
  }

  changePassword = () => {
    var forgetPasswordUrl = this.soarConfig.resetPasswordUrl;
    this.tabLauncher.launchNewTab(forgetPasswordUrl);
  }

  // get activation history
  getActivationHistory = () => {
    if (this.user?.UserId) {
      this.userServices?.ActivationHistory?.get({ Id: this.user?.UserId, }, this.userActivationHistoryGetSuccess, this.userActivationHistoryGetFailure);
    } else {
      this.activationHistory = [];
    }
    this.statusChange = false;
  };

  userActivationHistoryGetSuccess = (res) => {

    if (!res?.Value?.isEmpty) {
      this.activationHistory = res?.Value;

      this.activationHistory?.forEach((history) => {
        if (history?.IsActive) {
          history.StatusName = "Active";
        } else {
          history.StatusName = "Inactive";
        }
        history.DateModified = history?.DateModified?.endsWith('Z') ? history?.DateModified : history?.DateModified + 'Z';

      });


      var activationHistory = cloneDeep(this.activationHistory);
      activationHistory.forEach((history) => {
        if (!history?.IsActive) {
          var userDisabledHistory = cloneDeep(history);
          userDisabledHistory.StatusName = 'User Access Disabled';
          var dateModified = new Date(history?.DateModified);
          dateModified?.setSeconds(dateModified?.getSeconds() - 1);
          userDisabledHistory.DateModified = dateModified?.toISOString();
          this.activationHistory?.push(userDisabledHistory);
        }
      });

      const orderPipe = new OrderByPipe();
      this.activationHistory = orderPipe.transform(this.activationHistory, { sortColumnName: "DateModified", sortDirection: -1 });

      if (!(this.activationHistory?.length > 0)) {
        this.activationHistory = [];
      }
    }
  };

  userActivationHistoryGetFailure = () => {
    this.toastrFactory?.error(this.localize?.getLocalizedString('Failed to get') + ' ' + this.localize?.getLocalizedString('Activation History'), this.localize?.getLocalizedString('Server Error'));
  };


  header = [
    {
      label: "Date",
      filters: false,
      sortable: true,
      sorted: false,
      prop: "DateModified"
    },
    {
      label: "Status",
      filters: false,
      sortable: true,
      sorted: false,
      prop: "StatusName"
    },
    {
      label: "Reason",
      filters: false,
      sortable: true,
      sorted: false,
      prop: "Note"
    },
    {
      label: "Changed By",
      filters: false,
      sortable: true,
      sorted: false,
      prop: "UserModifiedName"
    }
  ];

  getColumnSize = (header) => {
    let size: string;
    if (header?.prop === "DateModified") {
      size = "col-sm-2 fuseGrid_cell date-column";
    }
    if (header?.prop === "StatusName") {
      size = "col-sm-2 fuseGrid_cell status-column";
    }
    if (header?.prop === "Note") {
      size = "col-sm-5 fuseGrid_cell reason-column";
    }
    if (header?.prop === "UserModifiedName") {
      size = "col-sm-3 fuseGrid_cell";
    }
    return size;
  };

  sort = (column) => {

    this.header?.forEach((value) => {
      if (value?.prop === column?.prop) {
        value.sorted = true;
      } else {
        value.sorted = false;
      }
    });

    column = column?.prop;
    if (column === this.sortedColumn) {
      this.sortedColumn = "-" + this.sortedColumn;
      this.sortDirectionActivationGrid = -1
    } else {
      this.sortedColumn = column;
      this.sortDirectionActivationGrid = 1
    }
    const orderPipe = new OrderByPipe();
    if (this.activationHistory?.length > 0) {
      this.activationHistory = orderPipe.transform(this.activationHistory, { sortColumnName: this.sortedColumn, sortDirection: this.sortDirectionActivationGrid });
    }
  };

  toggleHistory = () => {
    this.activationHistorySectionOpen = !this.activationHistorySectionOpen
    if (this.statusChange) {
      this.getActivationHistory();
    }
  }
  // #endregion


  // Rx Access
  rxSettingsChanged = (rxSettings) => {
    this.rxAccessRequirements = rxSettings
      && rxSettings?.roles && rxSettings?.roles?.length > 0
      && rxSettings?.locations && rxSettings?.locations.length > 0;
    this.$rootScope.$broadcast('fuse:user-rx-changed', rxSettings);
    // Add required validator to DOB if rxAccessRequirements is true
    if (this.rxAccessRequirements) {
      this.frmUserCrud.controls['DateOfBirth'].setValidators(Validators.required);
      this.frmUserCrud.controls['DateOfBirth'].updateValueAndValidity();
    } else {
      this.frmUserCrud.controls['DateOfBirth'].clearValidators();
      this.frmUserCrud.controls['DateOfBirth'].updateValueAndValidity();
    }
    this.contactInformationSetup?.rxSettingsChanged(this.rxAccessRequirements);
    // RxV2
    if (rxSettings) {
      if (this.teamMemberLocations) {
        this.teamMemberLocations?.rxSettingChanges(rxSettings, this.user);
      }
      if (rxSettings?.roles && rxSettings?.roles?.length > 0) {
        let index = rxSettings?.roles.findIndex(x => x?.value === 1);
        if (index > -1) {
          this.isPrescribingUser = true;
        }
        else {
          this.isPrescribingUser = false;
        }
      }

    }
  }

  setAccessProviderRoles = () => {
    this.rxAccessProviderRoles = [{ Name: this.localize.getLocalizedString('No Rx Access'), Type: 0, Info: this.localize.getLocalizedString("{0} - This user type will not be able to access any e-prescription related data for patients.", ['No Rx Access']) },
    { Name: this.localize.getLocalizedString('Prescribing User'), Type: 1, Info: this.localize.getLocalizedString("{0} - This user type may create and submit e-prescriptions for patients.", ['Prescribing User']) },
    { Name: this.localize.getLocalizedString('Proxy User'), Type: 2, Info: this.localize.getLocalizedString("{0} - This user type may access and create prescription related data, but may not submit e-prescriptions for patients.", ['Proxy User']) },
    {
      Name: this.localize.getLocalizedString('Rx Admin'), Type: 3, Info: this.localize.getLocalizedString("{0} - This user type is for the administration of DoseSpot (needed to validate providers' controlled substance registration) and is also a Proxy User.", ['Rx Admin'])
    }]
  }

  changeRxUserType = (rxAccessType) => {
    if (rxAccessType == 1) {
      this.isPrescribingUser = true;
      this.isRxAdminUser = false;
    }
    if (rxAccessType == 3) {
      this.isRxAdminUser = true;
      this.isPrescribingUser = false;
    }
    // grab selected object to get info   
    this.rxAccessProviderRole = this.rxAccessProviderRoles?.filter(x => x.Type == rxAccessType)[0];
    if (this.teamMemberLocations) {
      this.teamMemberLocations?.rxRxUserTypeChanges(this.user);
    }
  }

  // Save function to fire after other saves / updates
  saveRxUser = () => {
    let userContext = JSON.parse(sessionStorage.getItem('userContext'));
    let applicationId = userContext?.Result?.Application?.ApplicationId;

    // set npi
    var npiNumber = null;
    if (this.user?.NpiTypeOne !== '') {
      npiNumber = this.user?.NpiTypeOne;
    }

    // set dea
    var deaNumber = null;
    if (this.user?.DeaNumber !== '') {
      deaNumber = this.user?.DeaNumber;
    }

    let formattedZipCode = this.zipCode.transform(this.user?.Address?.ZipCode);
    this.phones = this.contactInformationSetup?.phones
    this.rxUser = new RxUser(this.user?.UserId, this.rxAccessEnum, this.user?.FirstName, this.user?.MiddleName,
      this.user?.LastName, this.user?.SuffixName, 'Unknown', this.user?.Address?.AddressLine1,
      this.user?.Address?.AddressLine2, this.user?.Address.City, this.user?.Address?.State, formattedZipCode,
      applicationId, deaNumber, this.user?.DateOfBirth, this.user?.UserName, this.phones[0]?.PhoneNumber,
      npiNumber, this.phones[0]?.PhoneNumber, []);

    this.rxUser.LocationIds = this.rxLocationIds;
    return new Promise((resolve) => {
      // userServices.RxAccess.save add / updates all location for this user to have Rx Access
      // with most current information for that user. 
      const userForRxUpdate = cloneDeep(this.user);
      this.rxService.saveRxClinician(userForRxUpdate, this.rxUser, this.rxSettings).then(
        (res) => {
          this.rxAccessSuccess(res);
          resolve(res);
        },
        (err) => {
          this.rxAccessFailed(err);
          // call resolve so that promise is resolved and the page will close
          resolve(err);
        }
      );

    });
  }

  getInvalidRxDataMessage = () => {
    let rxAccessFailedInfo = this.localize.getLocalizedString('Unable to add/update your team member for e-prescriptions, please verify the following:') + '<br/><br/>';
    rxAccessFailedInfo += this.localize.getLocalizedString('Must have a valid {0}.', ['phone number']) + '<br/>';
    rxAccessFailedInfo += this.localize.getLocalizedString('Must have a valid {0}.', ['address']) + '<br/>';
    if (this.user.RxUserType == 1) {
      rxAccessFailedInfo += this.localize.getLocalizedString('Must have a valid {0}.', ['NPI Number']) + '<br/>';
    }
    return rxAccessFailedInfo;
  }

  checkRxAccess = () => {
    if (this.user && this.phones && this.rolesStatus?.Loaded === true && this.doRxCheckOnPageLoad && this.formIsValid && (this.user.RxUserType == 1 || this.user.RxUserType == 2)) {
      // get location ids for individual calls to rx access (practice roles)
      this.user?.$$selectedPracticeRoles.forEach(role => {
        if ((role?.RoleName).toLowerCase().trim() == this.roleNames?.PracticeAdmin?.toLowerCase().trim()) {
          // if we're assigning a practice admin role, we need to setup rx for all locations for this user
          this.setRxLocationIdsForPracticeRole();
        };
      });
      // get location ids for individual calls to rx access (location roles)
      this.setRxLocationIdsForLocationRoles(this.user?.$$locations);
      this.setRxAccessEnum();
      this.updateRxAccess();
    }
  }

  // if user has location access, userLocations includes only the locations for this user
  setRxLocationIdsForLocationRoles = (locations) => {
    locations.forEach(location => {
      this.rxLocationIds.push(location?.Location?.LocationId)
    });
  }

  // if user has practice roles, userLocations includes all locations in practice
  setRxLocationIdsForPracticeRole = () => {
    this.rxLocationIds = [];
    this.practiceLocations.forEach(location => {
      this.rxLocationIds.push(location?.LocationId)
    });
  }

  setRxAccessEnum = () => {
    if (this.user?.RxUserType != 0) {
      switch (this.user?.RxUserType) {
        case 1:
          this.rxAccessEnum = this.rxUserType?.PrescribingUser;
          break;
        case 2:
          this.rxAccessEnum = this.rxUserType?.ProxyUser;
          break;
        case 3:
          this.rxAccessEnum = this.rxUserType?.RxAdminUser;
          break;
        default:
          this.rxAccessEnum = null;
          break;
      }
    }
  }

  updateRxAccess = () => {
    if (this.rxAccessEnum == this.rxUserType?.PrescribingUser ||
      this.rxAccessEnum == this.rxUserType?.RxAdminUser ||
      this.rxAccessEnum == this.rxUserType?.ProxyUser) {
      return this.createRxUser();
    }
    return [];
  }

  createRxUser = () => {
    let responsePromises = [];
    // get the application id
    let userContext = JSON.parse(sessionStorage.getItem('userContext'));
    let applicationId = userContext?.Result?.Application?.ApplicationId;
    // set npi
    let npiNumber = null;
    if (this.user?.NpiTypeOne !== '') {
      npiNumber = this.user?.NpiTypeOne;
    }
    // set dea
    var deaNumber = null;
    if (this.user.DeaNumber !== '') {
      deaNumber = this.user?.DeaNumber;
    }

    let formattedZipCode = this.zipCode.transform(this.user?.Address?.ZipCode);
    this.rxUser = new RxUser(this.user.UserId, this.rxAccessEnum, this.user?.FirstName, this.user?.MiddleName
      , this.user?.LastName, this.user?.SuffixName, 'Unknown', this.user?.Address?.AddressLine1,
      this.user?.Address?.AddressLine2, this.user?.Address?.City, this.user?.Address?.State,
      formattedZipCode, applicationId, deaNumber, this.user?.DateOfBirth, this.user?.UserName,
      this.phones[0]?.PhoneNumber, npiNumber, this.phones[0]?.PhoneNumber, []);
    this.rxUser.LocationIds = this.rxLocationIds;
    responsePromises.push(this.userServices.RxAccess.save({ practiceId: this.practiceId }, this.rxUser,
      this.rxAccessSuccess, this.rxAccessFailed));
    return responsePromises;
  }

  rxAccessSuccess = (res) => {
    // don't show success on page load, and only once on save
    if (this.doRxCheckOnPageLoad == false && this.doDisplayRxInfo === true) {
      var message = this.localize.getLocalizedString('Successfully added {0}.', ['e-prescriptions']);
      this.toastrFactory.success(message, 'Success');
      this.doDisplayRxInfo = false;
      this.updatedRxUserType = undefined;
    } else {
      this.doRxCheckOnPageLoad = false;
    }
    return;
  }

  rxAccessFailed = (res) => {
    let error = 'Unknown error';    
      error = this.getInvalidRxDataMessage();    
    var title = this.localize.getLocalizedString('e-prescriptions');
    if (this.doRxCheckOnPageLoad == false && this.doDisplayRxInfo === true) {
      // show toastr message      
      this.toastrFactory.error(error, title);
      this.doDisplayRxInfo = false;
    } else {
      // display in header
      this.invalidDataForRx = true;
      // only do this once on page load
      this.doRxCheckOnPageLoad = false;
    }
    return;
  }
  // End Rx Access

  //Start State Licenses 
  setLicenseData = (event) => {
    this.updatedLicenses = cloneDeep(event);
  }

  saveLicenses = () => {
    let stateLicenseDto = [];
    const saveLicencesPromise = new Promise((resolve, reject) => {
      this.updatedLicenses?.forEach((license) => {
        const item = {
          UserId: this.user?.UserId,
          StateId: license?.StateId,
          StateLicenseNumber: license?.StateLicenseNumber,
          AnesthesiaId: license?.AnesthesiaId,
          IsActive: true,
          IsDeleted: false,
          ObjectState: license?.ObjectState,
          StateLicenseId: license?.StateLicenseId,
          DataTag: license?.DataTag
        };
        stateLicenseDto.push(item);
      });

      if (stateLicenseDto?.length > 0) {
        this.userServices.Licenses.update(stateLicenseDto).$promise.then((res) => {
          this.userLicensesSaveSuccess(res);
          resolve(res);
        }, () => {
          this.userLicensesSaveFailure();
          reject('saving licenses');
        });

      } else {
        resolve({});
      }
    });

    return saveLicencesPromise;
  }

  userLicensesSaveSuccess = (res) => {
    let result = res;
  };

  userLicensesSaveFailure = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('{0} {1} {2}', ['There was an error while saving', 'User', 'State Licenses']),
      this.localize.getLocalizedString('Error'));
  };

  setLicenseStates = (event) => {
    this.LicenseStates = event;
  }

  sendLicensesToValidateArgs = (event) => {
    this.sendUpdatedLicensesArgs = event;
  }
  //End State Licenses 

  sendStatusChangeNote = (event) => {
    this.user.StatusChangeNote = event;
  }

  getUserScheduleStatus = () => {
    if (this.user && this.user.UserId) {
      this.userServices.UsersScheduleStatus.get({ userId: this.user?.UserId }).$promise.then((res) => {
        this.user.$$scheduleStatuses = res?.Value;
        this.user = { ...this.user };
      });
    }
  }

  updateUserInfo = (event: User) => {
    this.user = event;
  }

  onStartDateStateChange = (event) => {
    this.validEmpStartDateControl = event;
    this.empStartDateChanged = true;
  }

  onEndDateStateChange = (event) => {
    this.validEmpEndDateControl = event;
    this.empEndDateChanged = true;
  }

  ngOnDestroy() {
    this.personalInfoSubscription.unsubscribe();
  }
}
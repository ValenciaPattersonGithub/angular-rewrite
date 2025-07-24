import {
  Directive,
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { filter, refCount, take, takeUntil } from 'rxjs/operators';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
import { MatTabsModule } from '@angular/material/tabs';
import { FormControl } from '@angular/forms';
import { memberTabs } from '../common/models/memberTabs.model';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FuseFlag } from 'src/@core/feature-flags';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
declare let _: any;
@Component({
  selector: 'patient-family-registration',
  templateUrl: './patient-family-registration.component.html',
  styleUrls: ['./patient-family-registration.component.scss'],
})
export class PatientFamilyRegistrationComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  selectedTab: FormControl = new FormControl(0);
  tabs: Array<memberTabs>;
  @ViewChild('patientTabs', { static: true }) patientTabs: MatTabsModule;
  @ViewChildren('personalDetail') personalDetail: QueryList<ElementRef>;
  @ViewChildren('contactDetail') contactDetail: QueryList<ElementRef>;
  @ViewChildren('insurance') insurance: QueryList<ElementRef>;
  @ViewChildren('prefrence') prefrence: QueryList<ElementRef>;
  @ViewChildren('dentalRecord') dentalRecord: QueryList<ElementRef>;
  @ViewChildren('referrals') referrals: QueryList<ElementRef>;
  @ViewChildren('identifiers') identifiers: QueryList<ElementRef>;
  @ViewChildren('documents') documents: QueryList<ElementRef>;
  @ViewChildren('accountMembers') accountMembers: QueryList<ElementRef>;
  selectedMenuItem: any = 1;
  fromTocEvent = false;
  personGroup: FormGroup;
  isOpen: boolean;
  triggerOrigin: any;
  fieldList: any[];
  phoneTypes: any[];
  states: any[];
  isCancelled = false;
  patientIdentifiers: any[];
  profile: any;
  personInfo: any;
  loadingModal: any;
  PersonObject: any;
  baseUrl = `#/Patient/${this.route.patientId}`;
  url = 'Summary/?tab=Profile&currentPatientId=0';
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  private getPersonSub: Subscription;
  @HostListener('scroll', ['$event'])
  hideOldReferral: boolean = true;
  onScroll($event: any): void {
    const divs = $event.srcElement.childNodes;
    for (let i = 0; i < divs.length - 1; i++) {
      const containerHeight = $event.srcElement.clientHeight;
      // Gets the amount of pixels currently visible within the container
      const visiblePageHeight = this.getVisibleHeight(
        divs[i],
        $event.srcElement
      );
      // If the amount of visible pixels is bigger or equal to half the container size, set page
      if (visiblePageHeight >= containerHeight / 5) {
        this.selectedMenuItem = i;
      }
    }
    if (!this.fromTocEvent) {
      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.SelectedMenu,
        data: this.selectedMenuItem,
      });
    }
  }

  constructor(
    private titleService: Title,
    private registrationService: PatientRegistrationService,
    private fb: FormBuilder,
    @Inject('StaticData') private staticData,
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    @Inject('windowObject') private window,
    @Inject('$routeParams') public route,
    @Inject('$uibModal') private uibModal,
    @Inject('ImagingPatientService') private imagingPatientService,
    @Inject('PersonFactory') private personFactory,
    private confirmationModalService: ConfirmationModalService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private featureFlagService: FeatureFlagService
  ) {
    this.matIconRegistry.addSvgIcon(
      'add',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../v1.0/images/add_icon.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../v1.0/images/close_icon.svg'
      )
    );
  }

  ngOnInit(): void {
    this.initializeComponent();
  }
  ngAfterContentInit() {
    if (this.route.patientId) {
      this.loadingModal = this.getLoadingModal();
      this.getPersonSub = this.registrationService
        .getPersonByPersonId(this.route.patientId)
        .subscribe((person: any) => {
          this.personInfo = person;
          this.titleService.setTitle(
            `${person.Profile.PatientCode} - Edit Person`
          );
          this.handlePatchForms();
        });
    } else {
      this.patientIdentifiers = [];
      this.profile = null;
    }
  }

  initializeComponent = () => {
    this.checkFeatureFlags();
    this.initializePersonForm();
    this.registrationService
      .getRegistrationEvent()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: RegistrationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case RegistrationEvent.FocusSection:
              this.setFocusOnSection(event.data);
              break;
            case RegistrationEvent.SavePatient:
              this.validateandSavePatient(event.data);
              break;
            case RegistrationEvent.PerformNavigation:
              this.validateAndNavigate(event.data);
              break;
          }
        }
      });
    this.staticData.PhoneTypes().then(this.phoneTypesOnSuccess);
    this.staticData.States().then(this.StatesOnSuccess);
    this.personInfo = {
      Profile: {},
      patientIdentifierDtos: [],
    };
  };

  initializePersonForm = () => {
    this.personGroup = this.fb.group({
      personalDetailsForm: this.personalDetailsControls(),
      contactDetailsForm: this.contactDetailControls(),
      insuranceDetailsForm: this.insuranceDetailsControls(),
      preferencesForm: this.prefrencesControls(),
      dentalRecordsForm: this.dentalRecordControls(),
      referralsForm: this.referralsControls(),
      identifiresForm: this.additionalIdenitfiersControls(),
    });

    if (!this.tabs) {
      this.tabs = new Array<memberTabs>({
        title: 'Member 1',
        personGroup: this.personGroup,
        personId: '',
        isResponsiblePerson: false,
        cachePatientSearchList: new FormControl({}),
        isTabComplete: new FormControl(false),
        isTabCanDelete: true,
      });
    }
    if (this.isCancelled) {
      this.isCancelled = false;
      this.closeModal();
      if (this.route.patientId) {
        this.NavigateToResponseUrl(this.baseUrl + '/' + this.url);
      } else {
        this.window.location.href = _.escape('#/');
      }
    }
  };
  //#region  operations
  getVisibleHeight = (element: any, container: any) => {
    const scrollTop = container.scrollTop;
    const scrollBot = scrollTop + container.clientHeight;
    const containerRect = container.getBoundingClientRect();
    const eleRect = element.getBoundingClientRect();
    const rect: any = {};
    (rect.top = eleRect.top - containerRect.top),
      (rect.right = eleRect.right - containerRect.right),
      (rect.bottom = eleRect.bottom - containerRect.bottom),
      (rect.left = eleRect.left - containerRect.left);
    const eleTop = rect.top + scrollTop;
    const eleBot = eleTop + element.offsetHeight;
    const visibleTop = eleTop < scrollTop ? scrollTop : eleTop;
    const visibleBot = eleBot > scrollBot ? scrollBot : eleBot;

    return visibleBot - visibleTop;
  };
  phoneTypesOnSuccess = (res: any) => {
    this.phoneTypes = [];
    res.Value.forEach((item: any) => {
      this.phoneTypes.push({ text: item.Name, value: item.PhoneTypeId });
    });
  };
  StatesOnSuccess = res => {
    this.states = [];
    res.Value.forEach((state: any) => {
      this.states.push({
        text: state.Name,
        value: state.Abbreviation,
      });
    });
  };
  public NavigateToResponseUrl(url: string): void {
    window.location.href = _.escape(url);
  }
  setFocusOnSection = (eventData: any) => {
    this.fromTocEvent = true;
    switch (eventData.id) {
      case 1: {
        let personalDetails = this.personalDetail.toArray();
        if (personalDetails.length > 0) {
          this.setscrollIntoView(personalDetails[0]);
        }
        break;
      }
      case 2: {
        let contactDetails = this.contactDetail.toArray();
        if (contactDetails.length > 0) {
          this.setscrollIntoView(contactDetails[0]);
        }
        break;
      }
      case 3: {
        let insurances = this.insurance.toArray();
        if (insurances.length > 0) {
          this.setscrollIntoView(insurances[0]);
        }
        break;
      }
      case 4: {
        let prefrences = this.prefrence.toArray();
        if (prefrences.length > 0) {
          this.setscrollIntoView(prefrences[0]);
        }
        break;
      }
      case 5: {
        let dentalRecords = this.dentalRecord.toArray();
        if (dentalRecords.length > 0) {
          this.setscrollIntoView(dentalRecords[0]);
        }
        break;
      }
      case 6: {
        let referralsList = this.referrals.toArray();
        if (referralsList.length > 0) {
          this.setscrollIntoView(referralsList[0]);
        }
        break;
      }
      case 7: {
        let identifiersList = this.identifiers.toArray();
        if (identifiersList.length > 0) {
          this.setscrollIntoView(identifiersList[0]);
        }
        break;
      }
      case 8: {
        let documentsList = this.documents.toArray();
        if (documentsList.length > 0) {
          this.setscrollIntoView(documentsList[0]);
        }
        break;
      }
      case 9: {
        let accountMembersList = this.accountMembers.toArray();
        if (accountMembersList.length > 0) {
          this.setscrollIntoView(accountMembersList[0]);
        }
        // for (let i = 0; i <= accountMembersList.length; i++) {
        //   if (i === this.selectedTab.value) {
        //     this.setscrollIntoView(accountMembersList[i]);
        //     break;
        //   }
        // }
        break;
      }
      default: {
        let personalDetails = this.personalDetail.toArray();
        if (personalDetails.length > 0) {
          this.setscrollIntoView(personalDetails[0]);
        }
        break;
      }
    }
    setTimeout(() => {
      this.fromTocEvent = false;
      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.SelectedMenu,
        data: eventData.id - 1,
      });
    }, 1000);
  };
  setscrollIntoView = (element: any) => {
    element.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  };

  validateandSavePatient = (data: any) => {
    const personaldetail = this.personGroup.get('personalDetailsForm');
    const preferences = this.personGroup.get('preferencesForm').value;
    const policies = this.personGroup
      .get('insuranceDetailsForm')
      .get('Policies') as FormArray;
    const phones = this.personGroup
      .get('contactDetailsForm')
      .get('Phones') as FormArray;
    const emails = this.personGroup
      .get('contactDetailsForm')
      .get('Emails') as FormArray;
    this.isCancelled = data.cancelEvent;
    const referrals = this.personGroup.get('referralsForm');
    if (data.cancelEvent) {
      if (personaldetail.valid) {
        this.triggerOrigin = data.triggerData;
        this.BuildFieldList();
        this.openModal();
      } else {
        this.isCancelled = false;
        this.NavigateToResponseUrl('#/Patient');
      }
    } else {
      let isValidPhones = true;
      if (phones.length > 1) {
        isValidPhones = phones.valid;
      } else if (phones.length) {
        const value = phones.value[0];
        isValidPhones =
          (value.PhoneNumber && value.PhoneType) ||
          (!value.PhoneNumber && !value.PhoneType);
      }
      let isValidEmails = true;
      if (emails.length > 1) {
        isValidEmails = emails.valid;
      } else if (emails.length) {
        const value = emails.value[0];
        isValidEmails = !value.EmailAddress || emails.controls[0].valid;
      }
      policies.controls.forEach((policyForm, index) => {
        this.ValidateInsuracePolicy(policyForm, policies.length === 1);
      });

      if (
        personaldetail.valid &&
        preferences.PrimaryLocation &&
        policies.valid &&
        referrals.valid &&
        isValidPhones &&
        isValidEmails
      ) {
        if (
          personaldetail.value.ResponsiblePerson === '2' &&
          !personaldetail.value.ResponsiblePersonId
        ) {
          personaldetail
            .get('ResponsiblePersonId')
            .setErrors(Validators.required);
          this.setscrollIntoView(this.personalDetail);
        } else if (
          referrals.value.ReferralType &&
          !referrals.value.SourceDescription1
        ) {
          referrals.get('SourceDescription1').setErrors(Validators.required);
          this.setscrollIntoView(this.referrals);
        } else {
          this.triggerOrigin = data.triggerData;
          this.BuildFieldList();
          this.openModal();
        }
      } else {
        if (!personaldetail.valid) {
          this.setscrollIntoView(this.personalDetail);
        } else if (!isValidPhones || !isValidEmails) {
          this.setscrollIntoView(this.contactDetail);
        } else if (!preferences.PrimaryLocation) {
          this.setscrollIntoView(this.prefrence);
        } else if (!policies.valid) {
          this.setscrollIntoView(this.insurance);
        } else if (!referrals.valid) {
          this.setscrollIntoView(this.referrals);
        }

        this.toastrFactory.error('Unable to Save', 'Missing Information');
      }
    }
  };
  ValidateInsuracePolicy = (policyForm: any, skipPolicyHolderId: boolean) => {
    const policy = policyForm.value;
    if (!skipPolicyHolderId) {
      if (!policy.PolicyHolderType) {
        policyForm.get('PolicyHolderType').setErrors(Validators.required);
      }
    }
    if (policy.PolicyHolderType) {
      if (!policy.PlanName) {
        policyForm.get('PlanName').setErrors(Validators.required);
      }
    }
    if (policy.PlanName) {
      if (
        policy.PolicyHolderType === '2' &&
        !policy.RelationshipToPolicyHolder
      ) {
        policyForm
          .get('RelationshipToPolicyHolder')
          .setErrors(Validators.required);
      }
    }
  };
  validateAndNavigate = (url: any) => {
    const personaldetail = this.personGroup.get('personalDetailsForm');
    const contactDetail = this.personGroup.get('contactDetailsForm');
    const preferences = this.personGroup.get('preferencesForm');
    const dentalRecords = this.personGroup.get('dentalRecordsForm');
    const referrals = this.personGroup.get('referralsForm');
    const identifires = this.personGroup.get('identifiresForm');
    const navigationModal = {
      header: this.translate.instant('Edit Patient'),
      message: this.translate.instant('Do you want to save changes?'),
      confirm: this.translate.instant('Yes'),
      cancel: this.translate.instant('No'),
      height: 160,
      width: 500,
    };
    if (
      !personaldetail.pristine ||
      !contactDetail.pristine ||
      !preferences.pristine ||
      !dentalRecords.pristine ||
      !referrals.pristine ||
      !identifires.pristine
    ) {
      this.openConfirmationModal(navigationModal, url);
    } else {
      this.window.location.href = _.escape(url);
    }
  };
  openConfirmationModal = (data: any, url: any) => {
    this.confirmationRef = this.confirmationModalService.open({
      data,
    });
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
            this.confirmationRef.close();
            this.savePerson(url);
            break;
          case 'close':
            this.confirmationRef.close();
            break;
        }
      });
  };
  BuildFieldList = () => {
    this.fieldList = [];
    this.addToFieldList(this.personGroup.get('personalDetailsForm').value);
    this.addToFieldList(this.personGroup.get('contactDetailsForm').value);
    this.addToFieldList(this.personGroup.get('insuranceDetailsForm').value);
    this.addToFieldList(this.personGroup.get('preferencesForm').value);
    this.addToFieldList(this.personGroup.get('dentalRecordsForm').value);
    this.addToFieldList(this.personGroup.get('referralsForm').value);
    this.addToFieldList(this.personGroup.get('identifiresForm').value);
  };
  addToFieldList = (formgroupValue: any) => {
    Object.keys(formgroupValue).forEach(key => {
      const transformedKey = key.split(/(?=[A-Z])/).join(' ');
      const keysToSkip = [
        'DiscountType',
        'PreferredHygienists',
        'PreferredDentists',
        'CustomFlag',
        'ResponsiblePersonId',
        'PersonAccountId',
        'ReferralSourceId',
        'MemberAddress',
        'PrimaryLocations',
        'PrimaryLocation',
        'EndDate',
        'PatientReferralId',
        'ReferredPatientId',
        'ObjectState',
        'DataTag',
        'PatientId',
        'PatientDiscountTypeId',
        'PatientDiscountDataTag',
        'PreviousDentalOfficeId',
        'updatePatientActive',
        'unscheduleOnly',
        'DiscountTypeObjectState',
        'CloneAlternateLocations',
        'CurrentPrimaryLocation',
        'PrimaryDuplicatePatientId',
      ];
      if (!keysToSkip.includes(key)) {
        if (key === 'Phones') {
          formgroupValue[key].forEach((element: any) => {
            let phoneType = this.getPhoneType(element.PhoneType);
            phoneType = phoneType ? `(${phoneType})` : phoneType;
            this.fieldList.push({
              Field: `${transformedKey} ${this.getPhoneType(
                element.PhoneType
              )}`,
              Value: element.PhoneNumber,
            });
          });
        } else if (key === 'Emails') {
          formgroupValue[key].forEach((element: any) => {
            this.fieldList.push({
              Field: `${transformedKey}`,
              Value: element.EmailAddress,
            });
          });
        } else if (key === 'Policies') {
          formgroupValue[key].forEach((element: any) => {
            this.fieldList.push({
              Field: `${transformedKey} ${element.Priority + 1}`,
              Value: element.PlanName,
            });
          });
        } else if (key === 'PatientIdentifiers') {
          formgroupValue[key].forEach((element: any) => {
            this.fieldList.push({
              Field: `${transformedKey} (${element.Description})`,
              Value: element.Value,
            });
          });
        } else if (key === 'Flags' && formgroupValue[key]) {
          this.fieldList.push({
            Field: `${transformedKey}`,
            Value: formgroupValue[key].map((d: any) => d.Description).join(','),
          });
        } else if (key === 'Groups' && formgroupValue[key]) {
          this.fieldList.push({
            Field: `${transformedKey}`,
            Value: formgroupValue[key].map((d: any) => d.Description).join(','),
          });
        } else if (key === 'AlternateLocations' && formgroupValue[key]) {
          this.fieldList.push({
            Field: `${transformedKey}`,
            Value: formgroupValue[key]
              .map((d: any) => (d.text ? d.text : d.LocationName))
              .join(','),
          });
        } else if (!key.includes('show')) {
          this.applyTransfomation(transformedKey, formgroupValue[key]);
        }
      }
    });
  };

  newPhone = (isPrimary: boolean) => {
    return this.fb.group({
      PhoneNumber: [null, [Validators.required, Validators.minLength(10)]],
      PhoneType: [0, [Validators.required]],
      IsPrimary: [isPrimary],
      PhoneReminder: [true],
      TextReminder: [false],
      ValidPhoneNumber: [true],
      ValidPhoneType: [true],
      ObjectState: ['Add'],
      PhoneOwner: [0],
      ContactId: [null],
      PatientId: [this.route.patientId],
      PhoneReferrerId: [null],
      isDisabled: [false],
    });
  };
  newEmail = (isPrimary: boolean) => {
    return this.fb.group({
      EmailAddress: [
        null,
        [
          Validators.required,
          Validators.pattern(
            "^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$"
          ),
        ],
      ],
      IsPrimary: [isPrimary],
      EmailReminder: [true],
      ValidEmail: [true],
      ObjectState: ['Add'],
      EmailOwner: [0],
      PatientEmailId: [null],
      PatientId: [this.route.patientId],
      AcountEmailId: [null],
      isDisabled: [false],
    });
  };
  insuranceDetailsControls = () => {
    return this.fb.group({
      showPlans: [false],
      showPolicyHolderSearch: [false],
      showRelationships: [false],
      showPersonSearch: [false],
      Policies: this.fb.array([this.newPolicy(0)]),
    });
  };
  newPolicy = (policiesLength: any) => {
    return this.fb.group({
      BenefitPlanId: [''],
      PolicyHolderId: [''],
      PolicyHolderType: [''],
      PolicyHolderStringId: [null],
      RelationshipToPolicyHolder: [''],
      Priority: [policiesLength],
      EffectiveDate: [new Date()],
      PlanName: [''],
      PersonName: [''],
      validPolicy: [true],
      DependentChildOnly: [false],
    });
  };
  newIdentifier = () => {
    return this.fb.group({
      masterPatientIdentifierId: [null],
      value: [null],
    });
  };
  openModal = () => {
    this.isOpen = true;
  };
  closeModal = () => {
    this.isOpen = false;
  };

  savePerson = (url?: any) => {
    const profile = this.route.patientId ? this.personInfo.Profile : null;
    const personaldetail = this.personGroup.get('personalDetailsForm').value;
    const contactDetail = this.personGroup.get('contactDetailsForm').value;
    const preferences = this.personGroup.get('preferencesForm').value;
    const dentalRecords = this.personGroup.get('dentalRecordsForm').value;
    const referrals = this.personGroup.get('referralsForm').value;
    const identifires = this.personGroup.get('identifiresForm').value;
    const phones = this.personGroup.get('contactDetailsForm').get('Phones');
    const emails = this.personGroup.get('contactDetailsForm').get('Emails');
    let policies = this.personGroup
      .get('insuranceDetailsForm')
      .get('Policies').value;
    preferences.AlternateLocations = preferences.AlternateLocations
      ? preferences.AlternateLocations
      : [];
    let patientLocations = preferences.PrimaryLocations.filter(
      (x: any) =>
        x.value === Number(preferences.PrimaryLocation) ||
        preferences.AlternateLocations.map((al: any) =>
          al.value ? al.value : al.LocationId
        ).includes(x.value)
    );
    patientLocations = patientLocations.map((x: any) => ({
      LocationId: x.value,
      IsPrimary: x.value === Number(preferences.PrimaryLocation),
      ObjectState: 'Add',
      LocationName: x.text,
      PatientId: this.route.patientId ? this.route.patientId : null,
    }));
    if (
      preferences.CloneAlternateLocations &&
      preferences.CloneAlternateLocations.length > 0
    )
      preferences.CloneAlternateLocations =
        preferences.CloneAlternateLocations.filter(
          p =>
            (p.value != undefined &&
              p.value != Number(preferences.PrimaryLocation)) ||
            (p.LocationId != undefined &&
              p.LocationId != Number(preferences.PrimaryLocation))
        );
    else preferences.CloneAlternateLocations = [];
    let validatePrimaryLocation = patientLocations.filter(
      p => p.IsPrimary == true
    )[0];
    if (validatePrimaryLocation)
      preferences.CloneAlternateLocations.push(validatePrimaryLocation);
    else
      preferences.CloneAlternateLocations.push(
        preferences.CurrentPrimaryLocation
      );

    const patientPhones = phones.value.map((x: any) => ({
      PhoneNumber:
        !x.PhoneReferrerId || x.PhoneReferrerId === '0' ? x.PhoneNumber : null,
      Type: this.getPhoneType(x.PhoneType),
      TextOk: x.TextReminder,
      ObjectState: x.ObjectState,
      IsPrimary: x.IsPrimary,
      ReminderOK: x.PhoneReminder,
      ContactId: x.ContactId,
      DataTag: x.DataTag,
      PatientId: x.PatientId,
      PhoneReferrerId: personaldetail.ResponsiblePersonId
        ? x.PhoneReferrerId
        : null,
      PhoneReferrerName: personaldetail.ResponsiblePersonId
        ? x.PhoneReferrerName
        : null,
    }));
    const patientEmails = emails.value.map((x: any) => ({
      Email: !x.EmailOwner || x.EmailOwner === '0' ? x.EmailAddress : null,
      ObjectState: x.ObjectState,
      IsPrimary: x.IsPrimary,
      ReminderOK: x.EmailReminder,
      DataTag: x.DataTag,
      PatientId: x.PatientId,
      PatientEmailId: x.PatientEmailId,
      AccountEmailId: personaldetail.ResponsiblePersonId ? x.EmailOwner : null,
    }));
    policies = policies.map((x: any) => ({
      PolicyHolderType: x.PolicyHolderType,
      BenefitPlanId: x.BenefitPlanId,
      PolicyHolderId: x.PolicyHolderId,
      PolicyHolderStringId: x.PolicyHolderStringId,
      RelationshipToPolicyHolder: x.RelationshipToPolicyHolder
        ? x.RelationshipToPolicyHolder
        : null,
      Priority: x.Priority,
      EffectiveDate: x.EffectiveDate,
      DependentChildOnly: x.DependentChildOnly,
    }));
   
    this.PersonObject = {
      Profile: {
        PatientId: personaldetail.PatientId,
        PatientSince: personaldetail.PatientSince,
        DataTag: personaldetail.DataTag,
        IsActive: personaldetail.Status,
        FirstName: personaldetail.FirstName,
        MiddleName: personaldetail.MiddleInitial,
        LastName: personaldetail.LastName,
        PreferredName: personaldetail.PreferredName,
        Suffix: personaldetail.Suffix,
        DateOfBirth: this.getCalculateDOB(personaldetail.DateOfBirth),
        Sex: personaldetail.Gender,
        IsPatient: personaldetail.Patient,
        ResponsiblePersonType: Number(personaldetail.ResponsiblePerson),
        ResponsiblePersonId: personaldetail.ResponsiblePersonId
          ? personaldetail.ResponsiblePersonId
          : '',
        IsSignatureOnFile: personaldetail.SignatureOnFile,
        AddressReferrerId: contactDetail.MemberAddress
          ? contactDetail.MemberAddress
          : null,
        AddressLine1: contactDetail.MemberAddress
          ? null
          : contactDetail.AddressLine1,
        AddressLine2: contactDetail.MemberAddress
          ? null
          : contactDetail.AddressLine2,
        City: contactDetail.MemberAddress ? null : contactDetail.City,
        State: contactDetail.MemberAddress ? null : contactDetail.State,
        ZipCode: contactDetail.MemberAddress ? null : contactDetail.ZipCode,
        PreferredDentist: preferences.PreferredDentists,
        PreferredHygienist: preferences.PreferredHygienists,
        PreferredLocation: preferences.PrimaryLocation,
        HeightFeet: personaldetail.HeightFt,
        HeightInches: personaldetail.HeightIn,
        Weight: personaldetail.Weight,
        PrimaryDuplicatePatientId: personaldetail.PrimaryDuplicatePatientId,
        PersonAccount: {
          ReceivesStatements: preferences.ReceivesStatements,
          ReceivesFinanceCharges: preferences.ReceivesFinanceCharges,
          PersonId: profile ? this.route.patientId : null,
          AccountId:
            profile && profile.PersonAccount
              ? profile.PersonAccount.AccountId
              : null,
          DataTag:
            profile && profile.PersonAccount
              ? profile.PersonAccount.DataTag
              : null,
        },
      },
      Phones: phones.valid ? [...patientPhones] : [],
      Emails: emails.valid ? [...patientEmails] : [],
      PreviousDentalOffice: dentalRecords.PreviousDentist
        ? {
            Name: dentalRecords.PreviousDentist,
            PatientId: dentalRecords.PatientId,
            Address: {
              AddressLine1: dentalRecords.AddressLine1,
              AddressLine2: dentalRecords.AddressLine2,
              City: dentalRecords.City,
              State: dentalRecords.State,
              ZipCode: dentalRecords.ZipCode,
            },
            PhoneNumber: dentalRecords.PhoneNumber,
            Email: dentalRecords.Email,
            Notes: dentalRecords.Notes,
            PreviousDentalOfficeId: dentalRecords.PreviousDentalOfficeId,
            DataTag: dentalRecords.DataTag,
            ObjectState: dentalRecords.ObjectState,
          }
        : null,
      Referral:
        referrals.ReferralType || referrals.ReferredPatientId
          ? referrals
          : null,
      patientIdentifierDtos: identifires.PatientIdentifiers,
      Flags: this.getPersonFlags(preferences.Flags),
      PatientBenefitPlanDtos:
        policies.length === 1 && !policies[0].PolicyHolderType ? [] : policies,
      PatientLocations: this.getPersonLocations(patientLocations),
      patientDiscountTypeDto:
        preferences.PatientDiscountTypeId || preferences.DiscountType
          ? {
              MasterDiscountTypeId: preferences.DiscountType,
              ObjectState: preferences.DiscountTypeObjectState,
              PatientId: this.route.patientId ? this.route.patientId : null,
              PatientDiscountTypeId: preferences.PatientDiscountTypeId,
              DataTag: preferences.PatientDiscountDataTag,
            }
          : null,
      patientGroupDtos: this.getPersonGroups(preferences.Groups),
    };

    this.loadingModal = this.getLoadingModal();
    if (this.route.patientId) {
      if (personaldetail.updatePatientActive) {
        this.PersonObject.Profile.IsActive = profile.IsActive;
      }
      this.registrationService.updatePerson(this.PersonObject).subscribe(
        (updatedPatient: any) => this.syncImagingPatient(updatedPatient, url),
        error => this.savePersonFailure(error)
      );
    } else {
      this.registrationService.addPerson(this.PersonObject).subscribe(
        (data: any) => this.savePersonSuccess(data),
        error => this.savePersonFailure(error)
      );
    }
  };

  syncImagingPatient = (updatedPatient: any, url?: any) => {
    this.imagingPatientService
      .getImagingPatient(updatedPatient)
      .then((res: any) => {
        if (
          res &&
          res.data &&
          res.data.Records &&
          res.data.Records.length > 0
        ) {
          const imagingPatient = res.data.Records[0];
          const hasChanged = this.imagingPatientService.compareImagingPatient(
            updatedPatient,
            imagingPatient
          );
          if (hasChanged) {
            this.imagingPatientService
              .updateImagingPatient(updatedPatient, imagingPatient)
              .then(() => {
                this.setPersonActiveStatus(updatedPatient, url);
              });
          } else {
            this.setPersonActiveStatus(updatedPatient, url);
          }
        } else {
          this.setPersonActiveStatus(updatedPatient, url);
        }
      });
  };
  setPersonActiveStatus = (updatedPatient: any, url?: any) => {
    const personaldetail = this.personGroup.get('personalDetailsForm').value;
    if (personaldetail.updatePatientActive) {
      this.personFactory
        .SetPersonActiveStatus(
          personaldetail.PatientId,
          personaldetail.Status,
          personaldetail.unscheduleOnly
        )
        .then(
          (res: any) => {
            if (res) {
              this.savePersonSuccess(updatedPatient, url);
            }
          },
          () => {}
        );
    } else {
      this.savePersonSuccess(updatedPatient, url);
    }
  };
  savePersonSuccess = (res: any, url?: any) => {
    const mode = this.route.patientId ? 'updated' : 'saved';
    this.toastrFactory.success(
      this.translate.instant(`Patient has been ${mode} successfully.`),
      this.translate.instant('Success')
    );
    this.loadingModal.close();
    if (res && res.Profile) {
      if (url) {
        this.window.location.href = _.escape(url);
      } else {
        const addedPatient = res.Profile.PatientId;
        this.window.location.href = _.escape(
          `#/Patient/${addedPatient}/Summary/?tab=Profile&currentPatientId=0`
        );
      }
    }
  };
  savePersonFailure = (res: any) => {
    const mode = this.route.patientId ? 'update' : 'save';
    if (this.route.patientId) {
      this.toastrFactory.error(
        this.translate.instant(`Unable to ${mode} patient.`),
        this.translate.instant('Server Error')
      );
    }
    this.loadingModal.close();
    };
    getCalculateDOB = (dob: any) => {
        if (!dob) {
            return dob;
        }


        const date = new Date(dob);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        //personaldetail.DateOfBirth
        return new Date(date.getTime() - userTimezoneOffset);

    };
  getPersonGroups = (groups: any[]) => {
    if (
      this.personInfo.patientGroupDtos &&
      this.personInfo.patientGroupDtos.length
    ) {
      const patientGroups = this.personInfo.patientGroupDtos as any[];
      patientGroups.forEach(patientGroup => {
        const group = groups.filter(
          x => x.MasterGroupId === patientGroup.MasterGroupId
        )[0];
        if (!group) {
          patientGroup.ObjectState = 'Delete';
          groups.push(patientGroup);
        } else {
          group.ObjectState = null;
          group.DataTag = patientGroup.DataTag;
          group.PatientGroupId = patientGroup.PatientGroupId;
          group.PatientId = patientGroup.PatientId;
        }
      });
    }
    if (!groups) {
      groups = [];
    }
    return groups;
  };
  getPersonFlags = (flags: any[]) => {
    if (this.personInfo.Flags && this.personInfo.Flags.length) {
      const patientFlags = this.personInfo.Flags as any[];
      patientFlags.forEach(patientFlag => {
        const flag = flags.filter(
          x => x.PatientAlertId === patientFlag.PatientAlertId
        )[0];
        if (!flag) {
          patientFlag.ObjectState = 'Delete';

          flags.push(patientFlag);
        } else {
          flag.ObjectState = null;
          flag.DataTag = patientFlag.DataTag;
          flag.PatientAlertId = patientFlag.PatientAlertId;
          flag.PatientId = patientFlag.PatientId;
        }
      });
    }
    if (!flags) {
      flags = [];
    }
    return flags;
  };

  getPersonLocations = (locations: any[]) => {
    if (
      this.personInfo.PatientLocations &&
      this.personInfo.PatientLocations.length
    ) {
      const patientLocations = this.personInfo.PatientLocations as any[];
      patientLocations.forEach(patientLocation => {
        let location: any;

        location = locations.filter(
          x =>
            (x.LocationId != undefined &&
              x.LocationId === patientLocation.LocationId) ||
            (x.value != undefined && x.value === patientLocation.LocationId)
        )[0];
        if (location != undefined) {
          if (location.ObjectState === 'Add') {
            location.ObjectState = 'Update';
          } else if (location.ObjectState === 'Delete') {
            location.ObjectState = patientLocation.PatientActivity
              ? 'None'
              : 'Delete';
          } else {
            location.ObjectState = location.IsPrimary ? 'Update' : 'None';
          }
          location.DataTag = patientLocation.DataTag;
          location.PatientLocationId = patientLocation.PatientLocationId;
          location.PatientId = patientLocation.PatientId;
          location.LocationName = patientLocation.LocationName;
          location.LocationId = patientLocation.LocationId;
        } else {
          patientLocation.IsPrimary = false;
          patientLocation.ObjectState = patientLocation.PatientActivity
            ? 'Update'
            : 'Delete';
          locations.push(patientLocation);
        }
      });
    }
    return locations;
  };

  getLoadingModal = () => {
    return this.uibModal.open({
      template:
        '<div>' +
        '  <i id="resolveLoadingSpinner" class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
        '</div>',
      size: 'sm',
      windowClass: 'modal-loading',
      backdrop: 'static',
      keyboard: false,
    });
  };
  getPhoneType = (value: any) => {
    const types = this.phoneTypes.filter(x => x.value === Number(value));
    let phoneType = '';
    if (types.length) {
      phoneType = types[0].text;
    }
    return phoneType;
  };
  getPhoneTypeId = (value: any) => {
    const types = this.phoneTypes.filter(x => x.text === value);
    let phoneType = '';
    if (types.length) {
      phoneType = types[0].value;
    }
    return phoneType;
  };
  applyTransfomation = (key: any, value: any) => {
    if (
      key === 'Patient' ||
      key === 'Signature On File' ||
      key === 'Receives Statements' ||
      key === 'Receives Finance Charges'
    ) {
      value = value ? 'Yes' : 'No';
    } else if (key === 'Status') {
      value = value ? 'Active' : 'InActive';
    } else if (value) {
      if (key === 'Gender') {
        value = value === 'M' ? 'Male' : 'Female';
      } else if (key === 'Responsible Person') {
        value = value === '1' ? 'Self' : 'Other';
      } else if (key === 'Referral Type' && value !== '0') {
        value = value === '1' ? 'Other' : 'Person';
      }
    }
    this.fieldList.push({ Field: key, Value: value });
  };

  //#endregion

  //#region forms-contols
  personalDetailsControls = () => {
    return this.fb.group({
      FirstName: [
        '',
        { updateOn: 'blur' },
        [(Validators.required, Validators.maxLength(64))],
      ],
      MiddleInitial: ['', [Validators.maxLength(1)]],
      LastName: [
        '',
        { updateOn: 'blur' },
        [(Validators.required, Validators.maxLength(64))],
      ],
      Suffix: ['', [Validators.maxLength(20)]],
      PreferredName: ['', [Validators.maxLength(64)]],
      DateOfBirth: [null, { updateOn: 'blur' }],
      Gender: [''],
      Patient: [true],
      ResponsiblePerson: ['', { updateOn: 'blur' }],
      SignatureOnFile: [true],
      Status: [true],
      ResponsiblePersonId: [''],
      ResponsiblePersonName: ['', { updateOn: 'blur' }],
      HeightFt: [''],
      HeightIn: [''],
      Weight: [''],
      DataTag: [null],
      PatientId: [null],
      PatientSince: [null],
      unscheduleOnly: [false],
      updatePatientActive: [false],
      PrimaryDuplicatePatientId: [''],
    });
  };
  contactDetailControls = () => {
    return this.fb.group({
      AddressLine1: [null],
      AddressLine2: [null],
      City: [null],
      ZipCode: [
        null,
        [
          Validators.minLength(5),
          Validators.pattern('^[0-9]{5}(?:[0-9]{4})?$'),
        ],
      ],
      State: [''],
      MemberAddress: [''],
      Phones: this.route.patientId
        ? this.fb.array([])
        : this.fb.array([this.newPhone(true)]),
      Emails: this.route.patientId
        ? this.fb.array([])
        : this.fb.array([this.newEmail(true)]),
      optOutPhones: [null],
      optOutEmails: [null],
      showPhoneOwner: [false],
      ResponsiblePersonId: [null],
      RPLastName: [null],
      RPFirstName: [null],
      PersonAccountId: [null],
    });
  };

  prefrencesControls = () => {
    return this.fb.group({
      PrimaryLocation: [''],
      PrimaryLocationName: [''],
      CurrentPrimaryLocation: [''],
      AlternateLocations: [''],
      CloneAlternateLocations: [''],
      DiscountType: [''],
      DiscountTypeObjectState: [''],
      PatientDiscountTypeId: [''],
      PatientDiscountDataTag: [''],
      DiscountName: [''],
      PreferredHygienists: [''],
      PreferredHygienistsName: [''],
      PreferredDentists: [''],
      PreferredDentistsName: [''],
      CustomFlag: ['', [Validators.required]],
      Flags: '',
      EndDate: [''],
      Groups: [''],
      ReceivesStatements: [true],
      ReceivesFinanceCharges: [true],
      PrimaryLocations: [''],
    });
  };
  dentalRecordControls = () => {
    return this.fb.group({
      PreviousDentist: [null],
      PhoneNumber: [null, [Validators.minLength(10)]],
      Email: [
        null,
        [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')],
      ],
      AddressLine1: [null],
      AddressLine2: [null],
      City: [null],
      ZipCode: [
        null,
        [
          Validators.minLength(5),
          Validators.pattern('^[0-9]{5}(?:[0-9]{4})?$'),
        ],
      ],
      State: [''],
      Notes: [''],
      DataTag: [null],
      ObjectState: ['Add'],
      PreviousDentalOfficeId: [null],
      PatientId: [null],
    });
  };
  referralsControls = () => {
    return this.fb.group({
      ReferralType: [''],
      ReferralSourceId: ['0'],
      SourceDescription1: [''],
      ObjectState: ['Add'],
      SourceDescription2: [''],
      PatientReferralId: [''],
      ReferredPatientId: [''],
      DataTag: [null],
    });
  };
  additionalIdenitfiersControls = () => {
    return this.fb.group({
      PatientIdentifiers: this.fb.array([]),
    });
  };

  handlePatchForms = () => {
    this.patchPersonalDetail();
    this.patchContactDetail();
    this.patchPhones();
    this.patchEmails();
    this.patchPreference();
    this.patchDentalRecords();
    this.patchReferral();
    if (this.tabs && this.tabs.length > 0) {
      if (
        this.personInfo.Profile &&
        this.personInfo.Profile.FirstName &&
        this.personInfo.Profile.LastName
      ) {
        if (this.personInfo.Profile.ResponsiblePersonName === 'Self') {
          this.tabs[0].title =
            `${
              this.personInfo.Profile.FirstName
            }  ${this.personInfo.Profile.LastName.charAt(0)}` + '. (RP)';
        } else {
          this.tabs[0].title =
            `${
              this.personInfo.Profile.FirstName
            }  ${this.personInfo.Profile.LastName.charAt(0)}` + '.';
        }
      }
    }
    this.loadingModal.close();
    if (this.route.sectionId) {
      const eventData = { id: Number(this.route.sectionId) };
      setTimeout(() => {
        this.setFocusOnSection(eventData);
      }, 500);
    }
  };
  //#endregion

  //region patchForms
  patchPersonalDetail = () => {
    const profile: any = this.personInfo.Profile;
    if (profile) {
      const personaldetail = this.personGroup.get('personalDetailsForm');
      personaldetail.patchValue({
        FirstName: profile.FirstName,
        MiddleInitial: profile.MiddleName,
        LastName: profile.LastName,
        Suffix: profile.Suffix,
        PreferredName: profile.PreferredName,
        DateOfBirth: profile.DateOfBirth ? new Date(profile.DateOfBirth) : '',
        Gender: profile.Sex,
        Patient: profile.IsPatient,
        ResponsiblePerson: String(profile.ResponsiblePersonType),
        SignatureOnFile: profile.IsSignatureOnFile,
        Status: profile.IsActive,
        ResponsiblePersonId: profile.ResponsiblePersonId,
        ResponsiblePersonName: profile.ResponsiblePersonName,
        PatientId: profile.PatientId,
        DataTag: profile.DataTag,
        IsActive: profile.IsActive,
        PatientSince: profile.PatientSince,
        HeightFt: profile.HeightFeet,
        HeightIn: profile.HeightInches,
        Weight: profile.Weight,
        PrimaryDuplicatePatientId: profile.PrimaryDuplicatePatientId,
      });
      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.CheckedResponsiblePerson,
        data: this.personInfo.Profile.ResponsiblePersonType,
      });
      if (!profile.IsResponsiblePersonEditable) {
        personaldetail.get('ResponsiblePerson').disable();
      }
    }
  };
  patchContactDetail = () => {
    const profile: any = this.personInfo.Profile;
    if (profile) {
      const contactDetail = this.personGroup.get('contactDetailsForm');
      contactDetail.patchValue({
        PersonAccountId: profile.PersonAccount
          ? profile.PersonAccount.AccountId
          : null,
        MemberAddress: profile.AddressReferrerId
          ? profile.AddressReferrerId
          : '',
        AddressLine1: profile.AddressReferrerId
          ? profile.AddressReferrer.AddressLine1
          : profile.AddressLine1,
        AddressLine2: profile.AddressReferrerId
          ? profile.AddressReferrer.AddressLine2
          : profile.AddressLine2,
        City: profile.AddressReferrerId
          ? profile.AddressReferrer.City
          : profile.City,
        ZipCode: profile.AddressReferrerId
          ? profile.AddressReferrer.ZipCode
          : profile.ZipCode,
        State: profile.AddressReferrerId
          ? profile.AddressReferrer.State
          : profile.State,
        optOutPhones: this.personInfo.Phones.every(
          (item: any) => !item.ReminderOK && !item.TextOk
        ),
        optOutEmails: this.personInfo.Emails.every(
          (item: any) => !item.ReminderOK
        ),
        showPhoneOwner: profile.ResponsiblePersonType === 2,
        ResponsiblePersonId:
          profile.ResponsiblePersonType === 2
            ? profile.ResponsiblePersonId
            : null,
        RPLastName:
          profile.ResponsiblePersonType === 2
            ? profile.ResponsiblePersonName.split(',')[0]
            : null,
        RPFirstName:
          profile.ResponsiblePersonType === 2
            ? profile.ResponsiblePersonName.split(',')[1]
            : null,
      });
      if (contactDetail.value.ResponsiblePersonId) {
        const personObject = {
          PersonAccount: profile.PersonAccount,
          FirstName: contactDetail.value.RPFirstName,
          LastName: contactDetail.value.RPLastName,
          PatientId: contactDetail.value.ResponsiblePersonId,
        };
        this.registrationService.setRegistrationEvent({
          eventtype: RegistrationEvent.SelectedResponible,
          data: personObject,
        });
      }
    }
  };
  patchPhones = () => {
    const personPhones: [] = this.personInfo.Phones;
    if (personPhones.length) {
      const phones = this.personGroup
        .get('contactDetailsForm')
        .get('Phones') as FormArray;
      personPhones.map((x: any) =>
        phones.push(
          this.fb.group({
            PhoneNumber: [
              x.PhoneReferrer ? x.PhoneReferrer.PhoneNumber : x.PhoneNumber,
              [Validators.required, Validators.minLength(10)],
            ],
            PhoneType: [
              this.getPhoneTypeId(
                x.PhoneReferrer ? x.PhoneReferrer.Type : x.Type
              ),
            ],
            TextReminder: [x.TextOk],
            ObjectState: [x.ObjectState],
            IsPrimary: [x.IsPrimary],
            PhoneReminder: [x.ReminderOK],
            ValidPhoneNumber: [true],
            ValidPhoneType: [true],
            ContactId: [x.ContactId],
            DataTag: [x.DataTag],
            PatientId: [x.PatientId],
            PhoneOwner: [x.PhoneReferrer ? x.PhoneReferrer.ContactId : '0'],
            PhoneReferrerId: [
              x.PhoneReferrer ? x.PhoneReferrer.ContactId : null,
            ],
            isDisabled: [x.PhoneReferrer ? true : false],
          })
        )
      );
    }
  };
  patchEmails = () => {
    const personEmails: [] = this.personInfo.Emails;
    if (personEmails.length) {
      const emails = this.personGroup
        .get('contactDetailsForm')
        .get('Emails') as FormArray;
      personEmails.map((x: any) =>
        emails.push(
          this.fb.group({
            EmailAddress: [
              x.AccountEMail ? x.AccountEMail.Email : x.Email,
              [
                Validators.required,
                Validators.pattern(
                  "^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$"
                ),
              ],
            ],
            IsPrimary: [x.IsPrimary],
            EmailReminder: [x.ReminderOK],
            ObjectState: [x.ObjectState],
            ValidEmail: [true],
            PatientEmailId: [x.PatientEmailId],
            DataTag: [x.DataTag],
            PatientId: [x.PatientId],
            EmailOwner: [x.AccountEMail ? x.AccountEMail.PatientEmailId : '0'],
            isDisabled: [x.AccountEMail ? true : false],
          })
        )
      );
    }
  };
  patchPreference = () => {
    const prefrence = this.personGroup.get('preferencesForm');
    const locations = this.personInfo.PatientLocations;
    const discounts = this.personInfo.patientDiscountTypeDto;
    const profile = this.personInfo.Profile;
    const CurrentPrimaryLocation = this.personInfo.PatientLocations.filter(
      loc => loc.IsPrimary == true
    )[0];

    prefrence.patchValue({
      PrimaryLocation: locations.length
        ? locations.filter((x: any) => x.IsPrimary)[0].LocationId
        : '',
      PrimaryLocationName: this.personInfo.PatientLocations.length
        ? this.personInfo.PatientLocations.filter(
            loc => loc.IsPrimary == true
          )[0].LocationName
        : [''],
      CurrentPrimaryLocation: CurrentPrimaryLocation,
      AlternateLocations: locations.filter((x: any) => !x.IsPrimary),
      CloneAlternateLocations: this.personInfo.cloneselectedAlternateLocations,
      DiscountType: discounts ? discounts.MasterDiscountTypeId : '',
      DiscountTypeObjectState: discounts ? discounts.ObjectState : 'Add',
      PatientDiscountTypeId: discounts ? discounts.PatientDiscountTypeId : null,
      PatientDiscountDataTag: discounts ? discounts.DataTag : null,
      PreferredHygienists: profile.PreferredHygienist
        ? profile.PreferredHygienist
        : '',
      PreferredDentists: profile.PreferredDentist
        ? profile.PreferredDentist
        : '',
      Flags: this.personInfo.Flags,
      Groups: this.personInfo.patientGroupDtos,
      ReceivesStatements: profile.PersonAccount
        ? profile.PersonAccount.ReceivesStatements
        : true,
      ReceivesFinanceCharges: profile.PersonAccount
        ? profile.PersonAccount.ReceivesFinanceCharges
        : true,
    });

    //Shahzad.ilyas
    //bug: 475002
    //desription: in-case of dentist/Hygienist mark as 'not a provider' system should fetch patient's current location providers
    setTimeout(() => {
      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.CurrentLocation,
        data: CurrentPrimaryLocation,
      });
    }, 500);
  };
  patchDentalRecords = () => {
    const previousDentalOffice = this.personInfo.PreviousDentalOffice;
    if (previousDentalOffice) {
      const dentalRecord = this.personGroup.get('dentalRecordsForm');
      dentalRecord.patchValue({
        PreviousDentist: previousDentalOffice.Name,
        PhoneNumber: previousDentalOffice.PhoneNumber,
        Email: previousDentalOffice.Email,
        AddressLine1: previousDentalOffice.Address.AddressLine1,
        AddressLine2: previousDentalOffice.Address.AddressLine2,
        City: previousDentalOffice.Address.City,
        ZipCode: previousDentalOffice.Address.ZipCode,
        State: previousDentalOffice.Address.State,
        Notes: previousDentalOffice.Notes,
        PreviousDentalOfficeId: previousDentalOffice.PreviousDentalOfficeId,
        DataTag: previousDentalOffice.DataTag,
        ObjectState: 'Update',
        PatientId: previousDentalOffice.PatientId,
      });
    }
  };
  patchReferral = () => {
    const referral: any = this.personInfo.Referral;
    if (referral) {
      const referralForm = this.personGroup.get('referralsForm');
      referralForm.patchValue({
        ReferralType: referral.ReferralType,
        ReferralSourceId: referral.ReferralSourceId,
        SourceDescription1: referral.SourceDescription1,
        SourceDescription2: referral.SourceDescription2,
        PatientReferralId: referral.PatientReferralId,
        ReferredPatientId: referral.ReferredPatientId,
        DataTag: referral.DataTag,
        ObjectState: referral.ReferralType ? 'Update' : 'None',
      });
      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.PatchReferralResponsiblePersonName,
        data: `${referralForm.value.SourceDescription1} ${referralForm.value.SourceDescription2}`,
      });
    }
  };
  //#end region

  //#region Tabs
  onTabChange(tabIndex: number) {
    this.selectedTab.setValue(tabIndex);
    if (this.selectedTab.value > 0) {
    }
    setTimeout(() => {
      this.fromTocEvent = false;
      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.SelectedMenu,
        data: 0,
      });
    }, 1000);
  }
  addTab() {
    let personGroup = this.fb.group({
      personalDetailsForm: this.personalDetailsControls(),
      contactDetailsForm: this.contactDetailControls(),
      insuranceDetailsForm: this.insuranceDetailsControls(),
      preferencesForm: this.prefrencesControls(),
      dentalRecordsForm: this.dentalRecordControls(),
      referralsForm: this.referralsControls(),
      identifiresForm: this.additionalIdenitfiersControls(),
    });
    this.tabs.push({
      title: `Member ${this.tabs.length + 1}`,
      personGroup: personGroup,
      personId: '',
      isResponsiblePerson: false,
      cachePatientSearchList: new FormControl({}),
      isTabComplete: new FormControl(false),
      isTabCanDelete: true,
    });
    if (this.tabs.length == 1) {
      this.selectedTab.setValue(0);
    }
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
    if (this.tabs.length == this.selectedTab.value) {
      this.selectedTab.setValue(this.selectedTab.value - 1);
    }
  }
  onAccountMemberFill(data): void {
    if ((this.tabs[0].isTabComplete.value as boolean) == false) {
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const activePersonDetails = this.tabs[0].personGroup.get(
            'personalDetailsForm'
          ).value;
          if (activePersonDetails.PatientId == data[i].PatientId) {
            // this.tabs[0].title = data[i].IsResponsiblePerson ? this.tabs[0].title + "(RP)" : this.tabs[0].title;
            this.tabs[0].personId = data[i].PatientId;
            this.tabs[0].isResponsiblePerson = data[i].IsResponsiblePerson;
            this.tabs[0].isTabComplete.setValue(true);
            continue;
          }
          let personGroup = this.fb.group({
            personalDetailsForm: this.personalDetailsControls(),
            contactDetailsForm: this.contactDetailControls(),
            insuranceDetailsForm: this.insuranceDetailsControls(),
            preferencesForm: this.prefrencesControls(),
            dentalRecordsForm: this.dentalRecordControls(),
            referralsForm: this.referralsControls(),
            identifiresForm: this.additionalIdenitfiersControls(),
          });
          this.tabs.push({
            title: data[i].IsResponsiblePerson
              ? `${data[i].FirstName}  ${data[i].LastName.charAt(0)}.(RP)`
              : `${data[i].FirstName}  ${data[i].LastName.charAt(0)}.`,
            personGroup: personGroup,
            personId: data[i].PatientId,
            isResponsiblePerson: data[i].IsResponsiblePerson,
            cachePatientSearchList: new FormControl({}),
            isTabComplete: new FormControl(true),
            isTabCanDelete: true,
          });
        }
      }
      this.tabs.sort((a, b) =>
        a.title < b.title ? -1 : a.title > b.title ? 1 : 0
      );
      this.tabs.sort(function (x, y) {
        // true values first
        return x.isResponsiblePerson === y.isResponsiblePerson
          ? 0
          : x.isResponsiblePerson
          ? -1
          : 1;
        // false values first
        // return (x === y)? 0 : x? 1 : -1;
      });
    }
  }

  checkFeatureFlags() {
    this.featureFlagService.getOnce$(FuseFlag.ShowPatientReferrals).subscribe((value) => {
        this.hideOldReferral = false;
    });
  };  

  //endregion
  ngOnDestroy() {
    if (this.getPersonSub) {
      this.getPersonSub.unsubscribe();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isCancelled = false;
  }
}
function ViewChildern(arg0: string, arg1: { static: boolean }) {
  throw new Error('Function not implemented.');
}

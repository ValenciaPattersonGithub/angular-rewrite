import {
  AfterContentInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
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
import { Location } from '@angular/common';
import { FuseFlag } from 'src/@core/feature-flags';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { PatientReferralCrudComponent } from '../patient-referrals/patient-referral-crud/patient-referral-crud.component';
declare let _: any;

declare var angular: any;
@Component({
  selector: 'registration-landing',
  templateUrl: './registration-landing.component.html',
  styleUrls: ['./registration-landing.component.scss'],
})
export class RegistrationLandingComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  personTabs: any[];

  private unsubscribe$: Subject<any> = new Subject<any>();
  @ViewChild('personalDetail', { static: false }) personalDetail: ElementRef;
  @ViewChild('contactDetail', { static: false }) contactDetail: ElementRef;
  @ViewChild('insurance', { static: false }) insurance: ElementRef;
  @ViewChild('prefrence', { static: false }) prefrence: ElementRef;
  @ViewChild('dentalRecord', { static: false }) dentalRecord: ElementRef;
  @ViewChild('referrals', { static: false }) referrals: ElementRef;
  @ViewChild('identifiers', { static: false }) identifiers: ElementRef;
  @ViewChild('documents', { static: false }) documents: ElementRef;
  @ViewChild('accountMembers', { static: false }) accountMembers: ElementRef;
  @ViewChild(PatientReferralCrudComponent) referralsComponent!: PatientReferralCrudComponent;

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
  UrlPath = '';
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  @HostListener('scroll', ['$event'])
  releseOldReferral: boolean = true;
  newPatientId: string = 'C1BE4333-7EC2-42BA-4A5F-08DC8287B11B'; // To be updated
  referralLocationId: string = '26899'; // To be updated
  enableNewReferral: boolean = false;
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
    private location: Location,
    @Inject('$location') public loc,
    private featureFlagService: FeatureFlagService
  ) {}
  ngAfterContentInit() {
    if (this.route.patientId) {
      this.loadingModal = this.getLoadingModal();
      this.registrationService
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
  ngOnInit() {
    this.UrlPath = this.loc.$$path;
    this.initializeComponent();
  }
  handlePatchForms = () => {
    this.patchPersonalDetail();
    this.patchContactDetail();
    this.patchPhones();
    this.patchEmails();
    this.patchPreference();
    this.patchDentalRecords();
    this.patchReferral();
    this.loadingModal.close();
    if (this.route.sectionId) {
      const eventData = { id: Number(this.route.sectionId) };
      setTimeout(() => {
        this.setFocusOnSection(eventData);
      }, 500);
    }
  };

  initializeComponent = () => {
    this.checkFeatureFlags();
    this.titleService.setTitle('Add Person');
    this.personTabs = [{ Title: 'New Person', selected: true }];
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
    if (this.isCancelled) {
      this.isCancelled = false;
      this.closeModal();
      this.location.back();
      // if (this.route.patientId) {
      //   this.NavigateToResponseUrl(this.baseUrl + "/" + this.url);
      // } else {
      //   this.window.location.href = _.escape("#/");
      // }
    }
  };
  public NavigateToResponseUrl(url: string): void {
    window.location.href = _.escape(url);
  }
  getVisibleHeight = (element: any, container: any) => {
    if (!(element instanceof HTMLElement) || !(container instanceof HTMLElement)) {
      return 0;
    }
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
  StatesOnSuccess = res => {
    this.states = [];
    res.Value.forEach((state: any) => {
      this.states.push({
        text: state.Name,
        value: state.Abbreviation,
      });
    });
  };
  phoneTypesOnSuccess = (res: any) => {
    this.phoneTypes = [];
    res.Value.forEach((item: any) => {
      this.phoneTypes.push({ text: item.Name, value: item.PhoneTypeId });
    });
  };
  setFocusOnSection = (eventData: any) => {
    this.fromTocEvent = true;
    if (eventData.id === 1) {
      this.setscrollIntoView(this.personalDetail);
    } else if (eventData.id === 2) {
      this.setscrollIntoView(this.contactDetail);
    } else if (eventData.id === 3) {
      this.setscrollIntoView(this.insurance);
    } else if (eventData.id === 4) {
      this.setscrollIntoView(this.prefrence);
    } else if (eventData.id === 5) {
      this.setscrollIntoView(this.dentalRecord);
    } else if (eventData.id === 6) {
      this.setscrollIntoView(this.referrals);
    } else if (eventData.id === 7) {
      this.setscrollIntoView(this.identifiers);
    } else if (eventData.id === 8) {
      this.setscrollIntoView(this.documents);
    } else if (eventData.id === 9) {
      this.setscrollIntoView(this.accountMembers);
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
    if (element && element.nativeElement instanceof HTMLElement) {
      element.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  };
  addCustomFlag = () => {
    const preferences: FormGroup = this.personGroup.get(
      'preferencesForm'
    ) as FormGroup;
    if (preferences.controls.CustomFlag.valid) {
      preferences.markAsDirty();
      let flagvalue = `${preferences.controls.CustomFlag.value}`;
      let flagArray = flagvalue.split(',');
      let flags: any[] = [];
      if (preferences.get('Flags').value != '') {
        flags = preferences.get('Flags').value;
      }
      if (preferences.controls.EndDate.value) {
        angular.forEach(flagArray, function (value, key) {
          flagArray[key] =
            value +
            ` (${preferences.controls.EndDate.value.toLocaleDateString(
              'en-US'
            )})`;
        });
      }
      for (let i = 0; i <= flagArray.length - 1; i++) {
        const customFlag = {
          text: flagArray[i],
          value: flagArray[i],
          isCustom: true,
          ExpirationDate: preferences.controls.EndDate.value,
          customFlagText: preferences.controls.CustomFlag.value,
        };
        flags.push({
          Description: customFlag.isCustom
            ? customFlag.text
            : customFlag.customFlagText,
          MasterAlertId: undefined,
          SymbolId: '',
          ObjectState: 'Add',
          ExpirationDate: customFlag.ExpirationDate
            ? customFlag.ExpirationDate
            : undefined,
          PatientId: this.route.patientId ? this.route.patientId : undefined,
          PatientAlertId: undefined,
        });
      }
      preferences.patchValue(
        {
          CustomFlag: '',
          EndDate: '',
          Flags: flags,
        },
        { emitEvent: true }
      );
    }
  };
  hasDuplicateEmail = (emailAddresses: string[]): boolean => {
    return emailAddresses.some((emailAddress, index) => { return emailAddresses.slice(index + 1).some(nextEmailAddress => nextEmailAddress.trim().toLowerCase().normalize("NFC") === emailAddress.trim().toLowerCase().normalize("NFC")); });
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
    var referralFormStatus = (this.enableNewReferral == true && this.referralsComponent) ? this.referralsComponent.isValidFromAddPatient() : 'Valid';
    if (preferences.CustomFlag != '') {
      this.addCustomFlag();
    }
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

        if (isValidPhones) {
          let isDuplicatePhone = false;
          const phoneNumbers = phones.controls.filter(phoneControl => phoneControl.get('ObjectState').value !== 'Delete')
            .map(phoneControl => phoneControl.get('PhoneNumber').value);
          isDuplicatePhone = phoneNumbers.some((phoneNumber, index) => phoneNumbers.indexOf(phoneNumber, index + 1) !== -1);
          isValidPhones = isValidPhones && !isDuplicatePhone;
        }
      } else if (phones.length) {
        const value = phones.value[0];
        isValidPhones =
          (value.PhoneNumber && value.PhoneType) ||
          (!value.PhoneNumber && !value.PhoneType);
        isValidPhones = !isValidPhones
          ? false
          : value.PhoneType > 0
          ? phones.valid
          : true;
      }

      phones.controls.forEach(c => {
        if (!c.get('PhoneNumber').value && c.get('PhoneType').value == 0) {
          c.get('PhoneNumber').setErrors(Validators.required);
        }
      });

      let isValidEmails = true;
      if (emails.length > 1) {
        isValidEmails = emails.valid;

        if (isValidEmails) {
          let isDuplicateEmail = false;
          const emailAddresses = emails.controls.filter(emailControl => emailControl.get('ObjectState').value !== 'Delete')
            .map(emailControl => emailControl.get('EmailAddress').value);
          isDuplicateEmail = this.hasDuplicateEmail(emailAddresses);
          isValidEmails = isValidEmails && !isDuplicateEmail;
        }
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
        (referralFormStatus == 'Valid' || referralFormStatus == 'NoReferral') &&
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
        }
        else {
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
        } else if (referralFormStatus == 'Invalid') {
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
        'PrimaryDuplicatePatientId'       
      ];

      if (this.enableNewReferral) {
        keysToSkip.push(...['referralDirection',
        'provider',
        'txPlan',
        'chkPrintTxPlan',
        'notes',
        'referringTo',
        'referringFrom',
        'firstName',
        'lastName',
        'email',
        'phone',
        'sourceName',
        'referralSource',
        'campaignName',
        'patient',
        'returnDate',
        'actualReturnDate']);
      }

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
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isCancelled = false;
  }
  personalDetailsControls = () => {
    return this.fb.group({
      FirstName: ['', [Validators.required, Validators.maxLength(64)]],
      MiddleInitial: ['', [Validators.maxLength(1)]],
      LastName: ['', [Validators.required, Validators.maxLength(64)]],
      Suffix: ['', [Validators.maxLength(20)]],
      PreferredName: ['', [Validators.maxLength(64)]],
      DateOfBirth: [null],
      Gender: [''],
      Patient: [true],
      ResponsiblePerson: [''],
      SignatureOnFile: [true],
      Status: [true],
      ResponsiblePersonId: [''],
      ResponsiblePersonName: [''],
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
      MemberId: [null]
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
      referralDirection: [null],
      referralCategory: ['', Validators.required],
      provider: ['', Validators.required],
      txPlan: [null],
      chkPrintTxPlan: [],
      notes: [],
      referringTo: [null, Validators.required],
      referringFrom: [null],
      firstName: [],
      lastName: [],
      email: [, [Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$')]],
      phone: [, [Validators.minLength(10)]],
      sourceName: [null],
      referralSource: ['', Validators.required],
      campaignName: [],
      patient: [],
      returnDate: [],
      actualReturnDate: []
    });
  };
  
  additionalIdenitfiersControls = () => {
    return this.fb.group({
      PatientIdentifiers: this.fb.array([]),
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
      MemberId: x.MemberId
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
        HeightFeet: personaldetail.HeightFt ? personaldetail.HeightFt : 0,
        HeightInches: personaldetail.HeightIn ? personaldetail.HeightIn : 0,
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
      PreviousDentalOffice: /*dentalRecords.PreviousDentist
        ?*/ {
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
      },
      /*: null*/ Referral:
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

      let personToUpdate = this.removeInvalidDataForAddOrUpdate(
        this.PersonObject
      );
        this.registrationService.updatePerson(personToUpdate).subscribe(
            (updatedPatient: any) => {                
                this.syncBlueLocationIfEnabled(updatedPatient).then((res: any) => {
                    this.syncImagingPatient(updatedPatient, url);
                });                                                
            },
        error => this.savePersonFailure(error)
      );
    } else {
      let personToAdd = this.removeInvalidDataForAddOrUpdate(this.PersonObject);

      this.registrationService.addPerson(personToAdd).subscribe(
        (data: any) => this.savePersonSuccess(data),
        error => this.savePersonFailure(error)
      );
    }
  };
  removeInvalidDataForAddOrUpdate = (person: any) => {
    let personToSave = _.cloneDeep(person);
    if (!personToSave.Profile.PatientId) delete personToSave.Profile.PatientId;
    if (!personToSave.Profile.PersonAccount.PersonId)
      delete personToSave.Profile.PersonAccount.PersonId;
    if (!personToSave.Profile.PersonAccount.AccountId)
      delete personToSave.Profile.PersonAccount.AccountId;
    personToSave.PatientLocations.forEach(patientLocation => {
      if (!patientLocation.PatientId) delete patientLocation.PatientId;
    });
    personToSave.Phones.forEach(phone => {
      if (!phone.ContactId) delete phone.ContactId;
      if (!phone.PatientId) delete phone.PatientId;
    });
    personToSave.Emails.forEach(email => {
      if (!email.PatientEmailId) delete email.PatientEmailId;
      if (!email.PatientId) delete email.PatientId;
    });
    personToSave.PatientBenefitPlanDtos.forEach(benefitPlan => {
      if (!benefitPlan.PolicyHolderId) delete benefitPlan.PolicyHolderId;
    });

    if (personToSave.Referral) {
      if (!personToSave.Referral.PatientReferralId)
        delete personToSave.Referral.PatientReferralId;
      if (!personToSave.Referral.ReferredPatientId)
        delete personToSave.Referral.ReferredPatientId;
    }

    personToSave.patientIdentifierDtos.forEach(identifier => {
      if (!identifier.PatientIdentifierId)
        delete identifier.PatientIdentifierId;
    });

    personToSave.Flags.forEach(flag => {
      if (!flag.PatientId) delete flag.PatientId;
    });

    if (personToSave.patientDiscountTypeDto) {
      if (!personToSave.patientDiscountTypeDto.PatientDiscountTypeId)
        delete personToSave.patientDiscountTypeDto.PatientDiscountTypeId;
      if (!personToSave.patientDiscountTypeDto.PatientId)
        delete personToSave.patientDiscountTypeDto.PatientId;
    }

    return personToSave;
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

  syncBlueLocationIfEnabled = (updatedPatient: any) => {
      return this.imagingPatientService.syncBluePatientLocation(updatedPatient.Profile.PatientId, updatedPatient.Profile.PreferredLocation);
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
        //
        // Save Referral
        if (this.enableNewReferral == true && this.referralsComponent){
          var referralFormStatus = this.referralsComponent.isValidFromAddPatient();
          if (referralFormStatus == 'Valid') {
            this.referralsComponent.saveReferralFromAddPatient(res.Profile.PatientId, res.Profile.PreferredLocation);
          }
        }

        if (this.UrlPath.includes('/Patient/Register/'))
          this.window.location.href = _.escape(
            `#/Patient/${addedPatient}/Summary/?tab=Profile&currentPatientId=0`
          );
        else this.location.back();
      }
    }
  };
  savePersonFailure = (res: any) => {
    const mode = this.route.patientId ? 'update' : 'save';
    if (mode) {
      this.toastrFactory.error(
        this.translate.instant(`Unable to ${mode} patient.`),
        this.translate.instant('Server Error')
      );
    }
    this.loadingModal.close();
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
        if (patientFlag.PatientAlertId) {
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
        }
      });
    }
    if (!flags) {
      flags = [];
    }
    return flags;
    };
  
  getCalculateDOB = (dob: any) => {
        if (!dob) {
            return dob;
        }

       
            const date = new Date(dob);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            //personaldetail.DateOfBirth
          return  new Date(date.getTime() - userTimezoneOffset);
       
    };
  getPersonLocations = (locations: any[]) => {
    if (
      this.personInfo.PatientLocations &&
      this.personInfo.PatientLocations.length
    ) {
      const patientLocations = this.personInfo.PatientLocations as any[];
      patientLocations.forEach(patientLocation => {
        let ofcLocation: any;

        ofcLocation = locations.filter(
          x =>
            (x.LocationId != undefined &&
              x.LocationId === patientLocation.LocationId) ||
            (x.value != undefined && x.value === patientLocation.LocationId)
        )[0];
        if (ofcLocation != undefined) {
          if (ofcLocation.ObjectState === 'Add') {
            ofcLocation.ObjectState = 'Update';
          } else if (ofcLocation.ObjectState === 'Delete') {
            ofcLocation.ObjectState = patientLocation.PatientActivity
              ? 'None'
              : 'Delete';
          } else {
            ofcLocation.ObjectState = ofcLocation.IsPrimary ? 'Update' : 'None';
          }
          ofcLocation.DataTag = patientLocation.DataTag;
          ofcLocation.PatientLocationId = patientLocation.PatientLocationId;
          ofcLocation.PatientId = patientLocation.PatientId;
          ofcLocation.LocationName = patientLocation.LocationName;
          ofcLocation.LocationId = patientLocation.LocationId;
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

  checkFeatureFlags() {
    this.featureFlagService.getOnce$(FuseFlag.ReleseOldReferral).subscribe((value) => {
        this.releseOldReferral = value;
    });
    this.featureFlagService.getOnce$(FuseFlag.ReleseEnableReferralNewPatientSection).subscribe((value) => {
      this.enableNewReferral = value;
    });
  };  
}

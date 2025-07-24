import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { PhoneInfoComponent } from "src/@shared/components/phone-info/phone-info.component";
import { Phones } from "src/@shared/components/phone-info/phones.model";
import { Address } from "src/patient/common/models/address.model";
import { User } from "../../team-member";
import cloneDeep from "lodash/cloneDeep";
import { OrderByPipe } from "../../../../../@shared/pipes";
import { SoarResponse } from "src/@core/models/core/soar-response";
import { SaveStates } from "src/@shared/models/transaction-enum";
@Component({
  selector: 'team-member-contact-information',
  templateUrl: './team-member-contact-information.component.html',
  styleUrls: ['./team-member-contact-information.component.scss']
})
export class TeamMemberContactInformationComponent implements OnInit, OnDestroy {
  backupPhones = null;
  contactIdsToDelete = [];

  constructor(
    private fb: FormBuilder,
    @Inject('localize') private localize,
    @Inject('$rootScope') private $rootScope,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('UserServices') private userServices,
    private changeDetector: ChangeDetectorRef
  ) { }

  address: Address;
  @Input() formIsValid: boolean;
  @Input() rxAccessRequirements: boolean;
  @Input() user: User;
  @Output() onUpdateAddress = new EventEmitter<Address>();
  @ViewChild(PhoneInfoComponent) phoneInfoSetup: PhoneInfoComponent;

  subscription: Subscription;
  contactInfoRegex = "[^a-zA-Z0-9-'.\\\\()# ]$";
  phones: Array<Phones>;
  deletedPhones: Array<Phones> = new Array<Phones>();
  contactForm: FormGroup;
  selectedState?: string;
  rxPhoneIsInvalid = false;
  ngOnInit(): void {
    this.address = this.user?.Address;
    this.getPhones();
    this.contactForm = this.fb.group({
      addressLine1: [this.address?.AddressLine1],
      addressLine2: [this.address?.AddressLine2],
      city: [this.address?.City],
      state: [this.address?.State],
      zipCode: [this.address?.ZipCode],
    });
    this.selectedState = this.address?.State;
    if (this.rxAccessRequirements) {
      this.contactForm?.controls["addressLine1"]?.setValidators([Validators.required, Validators.maxLength(128)]);
      this.contactForm?.controls["addressLine2"]?.setValidators([Validators.maxLength(128)]);
      this.contactForm?.controls["state"]?.setValidators([Validators.required]);
      this.contactForm?.controls["city"]?.setValidators([Validators.required, Validators.maxLength(64)]);
      this.contactForm?.controls["zipCode"]?.setValidators([Validators.required]);
    }
    else {
      this.contactForm?.controls["addressLine1"]?.setValidators([Validators.maxLength(128)]);
      this.contactForm?.controls["addressLine2"]?.setValidators([Validators.maxLength(128)]);
      this.contactForm?.controls["city"]?.setValidators([Validators.maxLength(64)]);
    }
    this.contactForm?.updateValueAndValidity();
    this.subscription = this.contactForm?.valueChanges?.subscribe(val => {
      this.updateAddress(val);
    });
  }

  updateAddress = (val) => {
    if (this.contactForm?.controls && this.address && val) {
      this.address.AddressLine1 = val["addressLine1"];
      this.address.AddressLine2 = val["addressLine2"];
      this.address.City = val["city"];
      this.address.ZipCode = val["zipCode"];
      this.address.State = this.selectedState;
      this.onUpdateAddress.emit(this.address);
    }
  }

  onstatechange = (updatedState) => {
    this.selectedState = updatedState;
  }

  rxSettingsChanged = (rxAccessRequirements) => {
    this.rxAccessRequirements = rxAccessRequirements;
    //Required to add changeDetector as rxAccessRequirements value changing and its showing expression change issue
    this.changeDetector.detectChanges();
    this.checkRxPhoneValid(rxAccessRequirements);
    if (rxAccessRequirements) {
      this.contactForm.controls?.addressLine1?.setValidators(Validators.required);
      this.contactForm.controls?.addressLine1?.updateValueAndValidity();
      this.contactForm.controls?.state?.setValidators(Validators.required);
      this.contactForm.controls?.state?.updateValueAndValidity();
      this.contactForm.controls?.city?.setValidators(Validators.required);
      this.contactForm.controls?.city?.updateValueAndValidity();
      this.contactForm.controls?.zip?.setValidators(Validators.required);
      this.contactForm.controls?.zip?.updateValueAndValidity();
    } else {
      this.contactForm.controls?.addressLine1?.clearValidators();
      this.contactForm.controls?.addressLine1?.updateValueAndValidity();
      this.contactForm.controls?.state?.clearValidators();
      this.contactForm.controls?.state?.updateValueAndValidity();
      this.contactForm.controls?.city?.clearValidators();
      this.contactForm.controls?.city?.updateValueAndValidity();
      this.contactForm.controls?.zip?.clearValidators();
      this.contactForm.controls?.zip?.updateValueAndValidity();
    }
  };

  checkRxPhoneValid = (rxAccessRequirements) => {
    this.phones = this.phoneInfoSetup?.phones;
    if (rxAccessRequirements) {
      this.rxPhoneIsInvalid = !(
        this.phones?.length > 0 &&
        this.phones[0]?.PhoneNumber?.length > 0 &&
        this.phones[0]?.PhoneNumber?.length == 10
      );
    } else {
      this.rxPhoneIsInvalid = false;
    }
    return this.rxPhoneIsInvalid;
  };

  getPhones = () => {
    if (this.user?.UserId) {
      this.userServices?.Contacts?.get({ Id: this.user?.UserId }).$promise.then(
        (res) => {
          this.userContactsGetSuccess(res);
        },
        () => {
          this.userContactsGetFailure();
        }
      );
    }
  };
  userContactsGetSuccess = (res) => {
    if (!res?.Value?.isEmpty) {
      if (res?.Value?.length > 0) {
        const orderPipe = new OrderByPipe();
        this.phones = orderPipe.transform(res?.Value, { sortColumnName: "OrderColumn", sortDirection: "1" });

        this.phones?.forEach((phone) => {
          phone.ObjectState = SaveStates?.None;
        });
        return this.phones?.length > 0 ? true : false;
      } else {
        this.$rootScope.$broadcast("add-empty-phone");
      }
    }
  };

  deletePhonesList = (res) => {
    this.deletedPhones = [];
    this.deletedPhones = cloneDeep(res);
  };

  userContactsGetFailure = () => {
    this.toastrFactory.error(this.localize.getLocalizedString("{0} {1} {2}", ["Failed to get", "User", "Contacts",]),
      this.localize.getLocalizedString("Error")
    );
  };

  savePhones = (user): Promise<SoarResponse<Phones>> => {
    this.phones = this.phoneInfoSetup?.phones;
    const phonesToSend = [];
    return new Promise((resolve, reject) => {
      const tempPhones = [...this.deletedPhones, ...this.phones];
      tempPhones?.forEach((phone) => {
      if (this.checkValidPhone(phone)) {
        phone.UserId = user?.UserId;
        const phoneToSend = cloneDeep(phone);
        if (!phoneToSend?.ContactId) delete phoneToSend?.ContactId;
        phonesToSend?.push(phoneToSend);

        // keeping track of the deletes for easy removal in success callback
        if (phone?.ObjectState === SaveStates?.Delete) {
          this.contactIdsToDelete?.push(phone?.ContactId);
        }
      }
    });
    if (phonesToSend?.length > 0) {
      this.userServices?.Contacts.save({ Id: user?.UserId },phonesToSend,(res) => {
          this.userContactsSaveSuccess(res);
          resolve(res);
        },
        () => {
          this.userContactsSaveFailure();
          reject("saving contacts");
        }
      );
    } else {
      resolve({});
    }
    });

  };

  userContactsSaveSuccess = (res) => {
    res?.Value?.forEach((phoneReturned) => {
      if (phoneReturned?.ObjectState === SaveStates?.Successful) {
        // if contact id already exists in $scope.phones, then we have an update or delete
        // Removed listHelper.findIndexByFieldValue and added findIndex
        let index = this.phones?.findIndex(phone => phone?.ContactId === phoneReturned?.ContactId);
        
        if (index !== -1) {
          if (this.contactIdsToDelete?.indexOf(phoneReturned?.ContactId) !== -1) {
            // delete
            this.phones?.splice(index, 1);
          } else {
            // update
            this.phones[index].ObjectState = SaveStates?.None;
          }
        } else {
          // add
          index = -1;
          this.phones?.forEach((phone, key) => {
            if (
              phone?.PhoneNumber === phoneReturned?.PhoneNumber &&
              phone?.Type === phoneReturned?.Type
            ) {
              index = key;
            }
          });
          if (index !== -1) {
            this.phones[index].ObjectState = SaveStates?.None;
          }
        }
      }
    });
  };

  userContactsSaveFailure = () => {
    this.phones = cloneDeep(this.backupPhones);
  };

  // Build instance
  buildInstance = (currentPhones) => {
    this.backupPhones = JSON.stringify(currentPhones);
  };
  // Only save a phone if the phone state is not NONE and
  // PhoneNumber is not null or empty and
  // PhoneType is not null or empty
  // Unless the ObjectState is Delete
  checkValidPhone = (phone) => {
    return (
      (phone?.ObjectState != null && phone?.ObjectState != SaveStates?.None && phone?.PhoneNumber && phone?.PhoneNumber?.length > 0) || phone?.ObjectState == SaveStates?.Delete
    );
  };

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
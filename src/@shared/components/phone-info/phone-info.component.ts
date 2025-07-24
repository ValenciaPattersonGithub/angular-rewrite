import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Phones, PhoneTypes } from './phones.model';
import { PhoneInfoItemComponent } from './phone-info-item/phone-info-item.component';

@Component({
  selector: 'phone-info',
  templateUrl: './phone-info.component.html',
  styleUrls: ['./phone-info.component.scss']
})
export class PhoneInfoComponent implements OnInit {
  constructor(
    @Inject('SaveStates') private saveStates,
    @Inject('StaticData') private staticData,
    @Inject('localize') private localize,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('patSecurityService') private patSecurityService
  ) {}
  @Input() showLabel: boolean;
  @Input() phones: Array<Phones>;
  @Input() maxLimit: number;
  @Input() validPhones: any;
  @Input() validForm: boolean;
  @Input() hasTexts: boolean;
  @Input() hasNotes: boolean;
  @Input() area: string;
  @Output() onDeletePhoneList = new EventEmitter();
  deletedPhones: Array<Phones> = new Array<Phones>();
  customTypeOnly: boolean;
  phoneTypes: Array<PhoneTypes>;
  ifAddAccess: boolean = false;
  @ViewChild(PhoneInfoItemComponent) phoneInfoSetupItem: PhoneInfoItemComponent;
  @ViewChild('btnAddPhone') btnAddPhone: ElementRef;
  ngOnInit(): void {
    this.phones = new Array<Phones>();
    this.ifAddAccess = this.authAddAccess();
    this.getPhoneTypes();
    this.addPhone();
  }

  authAddAccess = (): boolean => {
    return this.patSecurityService?.IsAuthorizedByAbbreviation('soar-per-perdem-add');
  }

  getPhoneTypes = () => {
    this.staticData?.PhoneTypes()?.then(this.PhoneTypesOnSuccess, this.PhoneTypesOnError);
  }

  PhoneTypesOnSuccess = (res) => {
    this.phoneTypes = new Array<PhoneTypes>();
    if (res?.Value) {
        res.Value?.forEach(phonesType => {
        phonesType.Value = phonesType?.Name;
        this.phoneTypes?.push(phonesType);
      });
      // Order by Name
      let phones = this.phoneTypes?.sort((a, b) => (a?.Name < b?.Name ? -1 : 1));
      this.phoneTypes = phones;
    }
  }

  PhoneTypesOnError = (error) => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to load phone types. Refresh the page to try again.'), this.localize.getLocalizedString('Server Error'));
  }

  addPhone = () => {
    let duplicateNumberExists = this.phones?.some(phone => phone?.duplicateNumber);
    if (this.phones?.length < this.maxLimit && !duplicateNumberExists) {
      let InCorrectPhone = this.phones?.some(p => p.PhoneNumber?.length != 10 || !p.Type);
      if (!InCorrectPhone) {
        this.phones?.push({ PatientInfo: null, ContactId: null, PhoneNumber: "", Type: null, TextOk: true, Notes: null, ObjectState: this.saveStates.Add, IsPrimary: false, ReminderOK: true, CanAddNew: false, NewlyAdded: true });
      }
    }
  };

    removePhone = (phone: Phones) => {
        let index = this.phones?.indexOf(phone);
        if (phone.ObjectState == this.saveStates?.Add) {
            this.phones?.splice(index, 1);
        } else {
            phone.ObjectState = this.saveStates?.Delete;
            this.phones?.splice(index, 1);
            this.deletedPhones?.push(phone);
            this.onDeletePhoneList.emit(this.deletedPhones);
        }
        this.onUpdatePhone();
    };

  onUpdatePhone = () => {
    if (this.phones?.length > 0) {
      this.phones?.map(p => p.duplicateNumber = false);
      this.phones?.forEach(a => {
        this.phones?.forEach(b => {
          let idxA = this.phones.indexOf(a);
          let idxB = this.phones.indexOf(b);
          if (idxA != idxB && b?.PhoneNumber == a?.PhoneNumber) {
            a.duplicateNumber = true;
          }
        })
      })
    }
    };

}

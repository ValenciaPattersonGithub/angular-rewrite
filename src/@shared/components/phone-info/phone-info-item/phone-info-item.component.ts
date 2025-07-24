import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Phones } from '../phones.model';

@Component({
  selector: 'phone-info-item',
  templateUrl: './phone-info-item.component.html',
  styleUrls: ['./phone-info-item.component.scss'],
})
export class PhoneInfoItemComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    @Inject('SaveStates') private saveStates
  ) {}

  @Input() showLabel: boolean;
  @Input() focus: boolean;
  @Input() phoneId: string;
  @Input() phone: Phones;
  @Input() validForm: boolean;
  @Input() phoneTypes: string;
  @Input() disableInput: boolean;
  @Input() editMode: boolean;
  @Input() showRemoveOption: boolean;
  @Input() showIsPrimary: boolean;
  @Output() removeFunction = new EventEmitter<Phones>();
  @Output() onUpdatePhone = new EventEmitter();
  @Input() hasNotes: boolean;
  @Input() hasTexts: boolean;
  @Input() phoneTabindex: boolean;
  @Input() hidePhoneTypes: boolean;

  // Only the non patient area is migrated for this component, so isPatient value is hardcorded false here
  isPatient: boolean = false;
  showRemoveMsg: boolean = false;
  public frmContactInfo: FormGroup;
  noteCollapsed: boolean = true;
  subscription: Subscription;

  ngOnInit(): void {
    this.frmContactInfo = this.fb.group({
      phoneNumber: [
        this.phone?.PhoneNumber,
        [Validators.minLength(10), Validators.maxLength(10)],
      ],
      inpPhoneType: [this.phone?.Type, [Validators.required]],
    });

    this.subscription = this.frmContactInfo?.valueChanges?.subscribe(
      latestFormValues => {
        this.updatePhone(latestFormValues);
      }
    );
  }

  removePrompt = () => {
    this.showRemoveMsg = true;
  };

  confirmRemove = () => {
    this.removeFunction.emit(this.phone);
    this.showRemoveMsg = false;
  };

  getPhoneNumberValidation = (): boolean => {
    return (
      (this.frmContactInfo?.controls?.phoneNumber?.dirty &&
        this.frmContactInfo?.controls?.phoneNumber?.invalid) ||
      (this.frmContactInfo?.controls?.phoneNumber?.dirty &&
        this.phone?.PhoneNumber == '' &&
        this.frmContactInfo?.controls?.inpPhoneType?.touched &&
        this.frmContactInfo?.controls?.inpPhoneType?.valid)
    );
  };

  updatePhone = latestFormValues => {
    this.phone.PhoneNumber = latestFormValues?.phoneNumber;
    this.phone.Type = latestFormValues?.inpPhoneType;
    if (this.phone?.ContactId != null) {
      this.phone.ObjectState = this.saveStates?.Update;
    } else {
      this.phone.ObjectState = this.saveStates?.Add;
    }
    this.onUpdatePhone.emit();
  };

  cancelRemove = () => {
    this.showRemoveMsg = false;
  };

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

import { Component, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateLicense, States, SaveState, User } from '../../team-member';
import cloneDeep from 'lodash/cloneDeep';
import { Subscription } from 'rxjs';

export function spaceValidator(control: AbstractControl) {
  if (control && control?.value && !control?.value?.replace(/\s/g, '')?.length) {
    control?.setValue('');
    return { required: true }
  }
}

@Component({
  selector: 'team-member-state-identification',
  templateUrl: './team-member-state-identification.component.html',
  styleUrls: ['./team-member-state-identification.component.scss']
})
export class TeamMemberStateIdentificationComponent implements OnInit, OnDestroy {
  @Input() user: User;
  @Input() needLicenseStates: string;
  @Output()
  StateLicenseData: EventEmitter<StateLicense[]> = new EventEmitter<StateLicense[]>();
  @Output()
  sendLicensesToValidate: EventEmitter<StateLicense[]> = new EventEmitter<StateLicense[]>();


  states: { Abbreviation: string, Disabled: boolean, StateId: number }[];
  originalStates: States[] = [];
  UserStateLicenses: StateLicense[] = [];
  originalValue: StateLicense;
  saveState = SaveState;
  stateIdentificationFormGroup: FormGroup = new FormGroup({});
  NewUserStateLicense: StateLicense = new StateLicense();
  isOnEditMode: boolean = false;
  isAdding: boolean = false;
  originalStateLicenseCode: number;
  formSubscription: Subscription;
  validateForm: boolean = false;
  validateState: boolean = false;

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event?.keyCode == 13) {
      event.preventDefault();
    }
  }

  constructor(@Inject('StaticData') private staticData,
    @Inject('UserServices') private userServices,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    public fb: FormBuilder) { }

  ngOnInit(): void {
    this.getStates();
  }

  createForm = () => {
    this.NewUserStateLicense.StateId = 0;
    this.stateIdentificationFormGroup = this.fb.group({
      state: [this.NewUserStateLicense?.StateId, [Validators.required]],
      stateLicenseNumber: [this.NewUserStateLicense?.StateLicenseNumber, [Validators.required, spaceValidator, Validators.maxLength(20)]],
      anesthesiaId: [this.NewUserStateLicense?.AnesthesiaId, [spaceValidator]]
    });
    this.formSubscription = this.stateIdentificationFormGroup.valueChanges.subscribe((changes) => {
      if (changes) {
        this.NewUserStateLicense.StateId = changes["state"];
        this.NewUserStateLicense.StateLicenseNumber = changes["stateLicenseNumber"];
        this.NewUserStateLicense.AnesthesiaId = changes["anesthesiaId"];
        if (this.stateIdentificationFormGroup?.valid) {
          this.validateForm = false;
        }
        if (this.stateIdentificationFormGroup?.get('state')?.value > 0) {
          this.validateState = false;
        }
      }
    })
  }

  getStates = () => {
    this.staticData.States().then((res) => {
      this.originalStates = res.Value;
      this.getLicenses();
      this.states = [];
      if (this.states?.length === 0 && this.user?.UserId === '') {
        this.originalStates?.forEach((obj) => {
          let item = {
            Disabled: this.UserStateLicenses?.filter(x => x?.StateId == obj?.StateId)?.length > 0,
            StateId: obj?.StateId,
            Abbreviation: obj?.Abbreviation
          };
          this.states?.push(item);
        })
      }
    })
  }

  getStateAbbreviation = (stateId) => {
    if (this.originalStates) {
      let result = this.originalStates?.filter(x => x?.StateId == stateId)[0];
      return result?.Abbreviation;
    }
  }

  getLicenses = () => {
    if (this.user?.UserId) {
      this.userServices.Licenses.get({ Id: this.user?.UserId }).$promise.then((res) => {
        this.userLicensesGetSuccess(res);
      }, (error) => {
        this.userLicensesGetFailure(error);
      })
    }
  }

  userLicensesGetSuccess = (res) => {
    this.UserStateLicenses = [];
    if (!res.Value?.isEmpty) {
      if (res.Value?.length > 0) {
        res.Value?.forEach((obj) => {
          let item = {
            StateLicenseId: obj?.StateLicenseId,
            Flag: 0,
            StateId: parseInt(obj?.StateId),
            StateAbbreviation: this.getStateAbbreviation(Number(obj?.StateId)),
            StateLicenseNumber: obj?.StateLicenseNumber,
            AnesthesiaId: obj?.AnesthesiaId,
            IsEdit: false,
            ObjectState: this.saveState.None,
            DataTag: obj?.DataTag,
            StateIdUndefined: false,
            StateLicenseUndefined: false,
          };
          this.UserStateLicenses.push(item);
        });
        this.sendUpdatedLicensesToValidate();
      }
      else {
        this.UserStateLicenses = [];
        this.sendUpdatedLicensesToValidate();
      }
    }

    this.user.$$originalStateLicenses = cloneDeep(this.UserStateLicenses);
    if (this.originalStates && this.originalStates?.length > 0) {
      this.states = [];
      this.originalStates?.forEach((obj) => {
        let item = {
          Disabled: this.UserStateLicenses?.filter(x => x?.StateId == obj?.StateId)?.length > 0,
          StateId: obj?.StateId,
          Abbreviation: obj?.Abbreviation
        };
        this.states.push(item);
      });
    }
    else {
      this.staticData.States().then((res) => {
        this.originalStates = res.Value;
        this.states = [];
        this.originalStates?.forEach((obj) => {
          let item = {
            Disabled: this.UserStateLicenses?.filter(x => x?.StateId == obj?.StateId)?.length > 0,
            StateId: obj?.StateId,
            Abbreviation: obj?.Abbreviation
          };
          this.states?.push(item);
        })
      })
    }
  }
  userLicensesGetFailure = (error) => {
    this.toastrFactory.error(this.localize.getLocalizedString('{0} {1} {2}', ['Failed to get', 'User', 'Licenses']),
      [this.localize.getLocalizedString('Error') + error?.data?.Message]);
  };

  allowLicenseAdd = () => {
    if (this.isOnEditMode || this.isAdding) {
      return;
    }
    this.createForm();
    this.validateForm = false;
    this.validateState = false;
    this.isAdding = true;
  }

  addUserStateLicense = (item) => {
    this.validateForm = true;
    if (this.NewUserStateLicense?.StateId > 0) {
      this.validateState = false;
    }
    else {
      this.validateState = true;
    }
    if (this.stateIdentificationFormGroup?.valid && this.NewUserStateLicense?.StateId > 0) {
      let strStateAbbreviation = this.states?.filter(x => x?.StateId == this.NewUserStateLicense?.StateId)[0]?.Abbreviation;
      let tempFilteredUserStateLicenses = this.UserStateLicenses?.filter(x => x?.StateAbbreviation == strStateAbbreviation);
      if (tempFilteredUserStateLicenses?.length === 1) {
        //if deleted license is added back
        let itemStateLicense = this.UserStateLicenses?.filter(x => x?.StateAbbreviation == strStateAbbreviation)[0];
        itemStateLicense.ObjectState = this.saveState.Update;
        itemStateLicense.StateLicenseNumber = item?.StateLicenseNumber;
        itemStateLicense.AnesthesiaId = item?.AnesthesiaId;
      }
      else {
        let newItem = {
          Flag: 1,
          StateId: this.NewUserStateLicense?.StateId,
          StateAbbreviation: this.states?.filter(x => x?.StateId == this.NewUserStateLicense?.StateId)[0]?.Abbreviation,
          StateLicenseNumber: item?.StateLicenseNumber,
          AnesthesiaId: item?.AnesthesiaId,
          IsEdit: false,
          ObjectState: this.saveState.Add,
        }
        this.UserStateLicenses.push(newItem);
      }
      this.states.filter(x => x?.StateId == this.NewUserStateLicense?.StateId)[0].Disabled = true;
      this.clearUserStateLicense();
      this.sendUpdateLicense();
    }
  }

  persistUpdateStateLicense = (item) => {
    this.validateForm = true;
    if (this.stateIdentificationFormGroup?.invalid) {
      return;
    }
    if (this.stateIdentificationFormGroup?.get('state')?.errors?.required || this.stateIdentificationFormGroup?.get('state')?.value == 0) {
      return;
    }
    this.isOnEditMode = false;
    item.IsEdit = false;
    item.ObjectState = this.saveState.Update;
    this.sendUpdateLicense();
    this.states.filter(x => x?.StateId == this.originalStateLicenseCode)[0].Disabled = false;
    this.states.filter(x => x?.StateId == item?.StateId)[0].Disabled = false;
  }


  editUserStateLicense = (item, index) => {
    if (this.isOnEditMode) {
      return;
    }
    this.validateForm = false;
    //Create edit form
    this.stateIdentificationFormGroup = this.fb.group({
      ["state" + index]: [item?.StateId, [Validators.required]],
      ["stateLicenseNumber" + index]: [item?.StateLicenseNumber, [Validators.required, spaceValidator, Validators.maxLength(20)]],
      ["anesthesiaId" + index]: [item?.AnesthesiaId, [spaceValidator]]
    })

    //Handle value change on value change
    this.formSubscription = this.stateIdentificationFormGroup.valueChanges.subscribe((changes) => {
      if (changes) {
        this.UserStateLicenses[index].StateId = Number(changes["state" + index]);
        this.UserStateLicenses[index].StateAbbreviation = this.getStateAbbreviation(Number(changes["state" + index]));
        this.UserStateLicenses[index].StateLicenseNumber = changes["stateLicenseNumber" + index];
        this.UserStateLicenses[index].AnesthesiaId = changes["anesthesiaId" + index];
        if (this.stateIdentificationFormGroup?.valid) {
          this.validateForm = false;
        }
        if (this.stateIdentificationFormGroup?.get('state' + index)?.value > 0) {
          this.validateState = false;
        }
      }
    })
    item.IsEdit = true;
    this.isOnEditMode = true;
    this.originalValue = cloneDeep(item);
    this.originalStateLicenseCode = item.StateId;
  }

  discardChangesStateLicense = (item) => {
    this.isOnEditMode = false;
    item.IsEdit = false;
    item.StateId = this.originalValue?.StateId;
    item.StateLicenseNumber = this.originalValue?.StateLicenseNumber;
    item.StateAbbreviation = this.originalValue?.StateAbbreviation;
    item.AnesthesiaId = this.originalValue?.AnesthesiaId;
  }

  removeUserStateLicense = (item) => {
    let isNewlyAdded = item.ObjectState == 'Add';
    item.ObjectState = this.saveState.Delete;
    let toRemove = this.UserStateLicenses?.indexOf(item);
    if (toRemove > -1) {
      if (isNewlyAdded) {
        this.UserStateLicenses?.splice(toRemove, 1);
      }
      this.states.filter(x => x?.StateId == item?.StateId)[0].Disabled = false;
    }
    this.sendUpdateLicense();
  }

  clearUserStateLicense = () => {
    this.NewUserStateLicense = new StateLicense();
    this.NewUserStateLicense.Flag = 1;
    this.NewUserStateLicense.StateId = 0;
    this.NewUserStateLicense.StateLicenseNumber = "";
    this.NewUserStateLicense.AnesthesiaId = "";
    this.stateIdentificationFormGroup.reset();
    this.isAdding = false;
  }

  sendUpdateLicense = () => {
    this.StateLicenseData.emit(this.UserStateLicenses);
  }

  sendUpdatedLicensesToValidate = () => {
    this.sendLicensesToValidate.emit(this.UserStateLicenses);
  }

  clearStateDropdownValidation = () => {
    if (this.stateIdentificationFormGroup?.controls["stateLicenseNumber"]) {
      this.stateIdentificationFormGroup.controls["stateLicenseNumber"].setValue("");
    }
    if (this.stateIdentificationFormGroup?.controls["anesthesiaId"]) {
      this.stateIdentificationFormGroup.controls["anesthesiaId"].setValue("");
    }
  }

  ngOnDestroy = () => {
    this.formSubscription.unsubscribe();
  }
}
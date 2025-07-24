import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaxonomyCodes, User } from '../../team-member';
import cloneDeep from 'lodash/cloneDeep';
import { OrderByPipe } from 'src/@shared/pipes';

@Component({
  selector: 'team-member-federal-identification',
  templateUrl: './team-member-federal-identification.component.html',
  styleUrls: ['./team-member-federal-identification.component.scss']
})
export class TeamMemberFederalIdentificationComponent implements OnInit, OnChanges {
  @Input() user: User;
  @Input() userLocationSetups;
  @Input() userLocationSetupsDataChanged;
  @Input() isPrescribingUser: boolean = false;

  userIdentificationFrm: FormGroup;
  userIdentificationSectionOpen: boolean = true;
  canEditProviderInfo: boolean = false;
  disableDeaNumber: boolean = false;
  TaxonomyCodesAreUnique: boolean = true;
  validTaxId: boolean = true;
  isProviderOfService: boolean = false;
  taxonomyCodes: TaxonomyCodes[];
  primaryTaxonomyCodes: TaxonomyCodes[];
  secondaryTaxonomyCodes: TaxonomyCodes[];
  editMode: boolean = false;
  customPatterns = {
    '_': { pattern: new RegExp('[0-9]') },
    'x': { pattern: new RegExp('[a-zA-Z]') },
    '~': { pattern: new RegExp('[a-zA-Z0-9]') }
  }

  constructor(@Inject('patSecurityService') private patSecurityService,
    @Inject('StaticData') private staticData,
    private fb: FormBuilder,
    @Inject('$rootScope') private $rootScope) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.user) {
      const nv = changes?.user?.currentValue;
      if (nv) {
        this.user = cloneDeep(nv);
      }
    }
    // UserLocationSetups
    if (changes?.userLocationSetups?.currentValue) {
      this.setProviderOfService();
    }
    // userLocationSetupsDataChanged
    if (changes?.userLocationSetupsDataChanged?.currentValue) {
      this.setProviderOfService();
    }
    // Prescribing User
    if (changes?.isPrescribingUser) {
      const nv = changes?.isPrescribingUser?.currentValue;
      if (nv == true) {
        this.userIdentificationFrm?.controls['TaxId']?.setValidators([Validators.required, Validators.minLength(9)]);
        this.userIdentificationFrm?.controls['TaxId']?.updateValueAndValidity();
        this.userIdentificationFrm?.controls['DeaNumber']?.setValidators(Validators.required);
        this.userIdentificationFrm?.controls['DeaNumber']?.updateValueAndValidity();
        this.userIdentificationFrm?.controls['NpiTypeOne']?.setValidators([Validators.required, Validators.minLength(10)]);
        this.userIdentificationFrm?.controls['NpiTypeOne']?.updateValueAndValidity();
      } else {
        this.userIdentificationFrm?.controls['TaxId']?.clearValidators();
        this.userIdentificationFrm?.controls['TaxId']?.setValidators(Validators.minLength(9));
        this.userIdentificationFrm?.controls['TaxId']?.updateValueAndValidity();
        this.userIdentificationFrm?.controls['DeaNumber']?.clearValidators()
        this.userIdentificationFrm?.controls['DeaNumber']?.updateValueAndValidity();
        this.userIdentificationFrm?.controls['NpiTypeOne']?.clearValidators();
        this.userIdentificationFrm?.controls['NpiTypeOne']?.setValidators(Validators.minLength(10));
        this.userIdentificationFrm?.controls['NpiTypeOne']?.updateValueAndValidity();
      }
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.hasEditProviderInfoAccess();
    this.getTaxonomyCodes();
    if (this.user?.RxUserType === 1) {
      this.isPrescribingUser = true;
    }
    // RxUserType
    if (this.user?.RxUserType) {
      this.validateRxAdmin();
      this.setDeaNumberState();
    }
    this.editMode = this.user?.UserId ? true : false;

    this.$rootScope.$on('fuse:user-rx-changed', (event, rxSettings) => {
      //RxV2
      if (rxSettings) {
        if (rxSettings.roles && rxSettings.roles.length > 0) {
          var index = rxSettings.roles.findIndex(role => role.value === 1);

          if (index > -1) {
            this.isPrescribingUser = true;
          }
          else {
            this.isPrescribingUser = false;
          }
          this.createForm();
        }

      }
    });
  }

  createForm = () => {
    this.userIdentificationFrm = this.fb.group({
      TaxId: [this.user?.TaxId, this.isPrescribingUser ? [Validators.required, Validators.minLength(9)] : Validators.minLength(9)],
      FederalLicense: [this.user?.FederalLicense, [Validators.minLength(1), Validators.maxLength(32)]],
      DeaNumber: [this.user?.DeaNumber, this.isPrescribingUser ?
        [Validators.required] : null],
      NpiTypeOne: [this.user?.NpiTypeOne, this.isPrescribingUser ? [Validators.required,
      Validators.minLength(10), Validators.maxLength(10)] : [Validators.minLength(10), Validators.maxLength(10)]],
      PrimaryTaxonomyId: [this.user?.PrimaryTaxonomyId, null],
      SecondaryTaxonomyId: [this.user?.SecondaryTaxonomyId, null],
      DentiCalPin: [this.user?.DentiCalPin, Validators.maxLength(50)]
    });
  }

  hasEditProviderInfoAccess = () => {
    this.canEditProviderInfo = this.checkAuthorization('soar-biz-bizusr-etprov');
  }

  checkAuthorization = (amfa) => {
    return this.patSecurityService.IsAuthorizedByAbbreviation(amfa);
  }

  getTaxonomyCodes = () => {
    this.staticData.TaxonomyCodes().then(res => {
      let orderPipe = new OrderByPipe();
      this.taxonomyCodes = orderPipe.transform(res?.Value, { sortColumnName: 'Category', sortDirection: 1 });
      this.primaryTaxonomyCodes = cloneDeep(this.taxonomyCodes);
      this.secondaryTaxonomyCodes = cloneDeep(this.taxonomyCodes);
      if (this.editMode) {
        this.filterPrimaryTaxonomyCodes();
        this.filterSecondaryTaxonomyCodes();
      }
      this.setTaxonomyDropdownText();
    });
  }

  setTaxonomyDropdownText = () => {
    if (this.primaryTaxonomyCodes != null) {
      for (let i = 0; i < this.primaryTaxonomyCodes?.length; i++) {
        this.primaryTaxonomyCodes[i].$$DisplayText = this.primaryTaxonomyCodes[i]?.Category + ' / ' + this.primaryTaxonomyCodes[i]?.Code;
      }
    }
    if (this.secondaryTaxonomyCodes != null) {
      for (let j = 0; j < this.secondaryTaxonomyCodes?.length; j++) {
        this.secondaryTaxonomyCodes[j].$$DisplayText = this.secondaryTaxonomyCodes[j]?.Category + ' / ' + this.secondaryTaxonomyCodes[j]?.Code;
      }
    }
  }

  // show all codes except secondary
  filterPrimaryTaxonomyCodes = () => {
    if (this.user?.SecondaryTaxonomyId != null) {
      let index = this.primaryTaxonomyCodes?.findIndex(x => x.TaxonomyCodeId == this.user?.SecondaryTaxonomyId);
      this.primaryTaxonomyCodes.splice(index, 1);
    }
  }

  // show all codes except primary
  filterSecondaryTaxonomyCodes = () => {
    if (this.user?.PrimaryTaxonomyId != null) {
      let index = this.secondaryTaxonomyCodes?.findIndex(x => x.TaxonomyCodeId == this.user?.PrimaryTaxonomyId);
      this.secondaryTaxonomyCodes.splice(index, 1);
    }
  }

  setDeaNumberState = () => {
    this.disableDeaNumber = false;
    if (this.userIdentificationFrm && this.userIdentificationFrm?.controls['DeaNumber'] && this.checkDeaNumberValid(this.user?.DeaNumber) === true && this.user?.RxUserType === 3) {
      this.disableDeaNumber = true;
    }
  }

  checkIfUserIsProviderOfService = () => {
    var result = false;
    this.userLocationSetups.forEach((location) => {
      if (!result) {
        result = this.isProvider(location);
      };
    });
    return result;
  }

  isProvider = (location) => {
    if (location?.ProviderTypeId == 1 || location?.ProviderTypeId == 2 || location?.ProviderTypeId == 3 || location?.ProviderTypeId == 5) {
      return true;
    }
    return false;
  }

  validateRxAdmin = () => {
    if (this.userIdentificationFrm && this.userIdentificationFrm?.get('DeaNumber')) {
      this.userIdentificationFrm.get('DeaNumber')?.setErrors({ 'deaNumberNotAllowed': true });
      if (this.user?.RxUserType === 3 && (this.checkDeaNumberValid(this.user?.DeaNumber) === false)) {
        this.userIdentificationFrm.get('DeaNumber')?.setErrors({ 'deaNumberNotAllowed': false });
      }
    }
  }

  checkDeaNumberValid = (deaNumber) => {
    if (deaNumber == undefined || deaNumber == '' || deaNumber == '' || deaNumber == null) {
      return true;
    }
    return false;
  }

  setProviderOfService = () => {
    this.isProviderOfService = this.checkIfUserIsProviderOfService();
  }

  primaryTaxonomyChanged = (primaryTaxonomyId) => {
    this.user.PrimaryTaxonomyId = primaryTaxonomyId;
    if (this.userIdentificationFrm?.get('SecondaryTaxonomyId')?.value != null) {
      if (primaryTaxonomyId == this.userIdentificationFrm?.get('SecondaryTaxonomyId')?.value) {
        this.TaxonomyCodesAreUnique = false;
        this.userIdentificationFrm?.controls['PrimaryTaxonomyId']?.setErrors({ '': true });
        this.userIdentificationFrm?.controls['SecondaryTaxonomyId']?.setErrors({ '': true });
      } else {
        this.TaxonomyCodesAreUnique = true;
        this.userIdentificationFrm?.controls['PrimaryTaxonomyId']?.setErrors(null);
        this.userIdentificationFrm?.controls['SecondaryTaxonomyId']?.setErrors(null);
      }
    }
    if (primaryTaxonomyId == null)
      this.userIdentificationFrm?.controls['SecondaryTaxonomyId']?.reset();
  }

  secondaryTaxonomyChanged = (secondaryTaxonomyId) => {
    this.user.SecondaryTaxonomyId = secondaryTaxonomyId;
    if (this.userIdentificationFrm?.get('PrimaryTaxonomyId')?.value != null) {
      if (secondaryTaxonomyId == this.userIdentificationFrm?.get('PrimaryTaxonomyId')?.value) {
        this.TaxonomyCodesAreUnique = false;
        this.userIdentificationFrm?.controls['PrimaryTaxonomyId']?.setErrors({ '': true });
        this.userIdentificationFrm?.controls['SecondaryTaxonomyId']?.setErrors({ '': true });
      } else {
        this.TaxonomyCodesAreUnique = true;
        this.userIdentificationFrm?.controls['PrimaryTaxonomyId']?.setErrors(null);
        this.userIdentificationFrm?.controls['SecondaryTaxonomyId']?.setErrors(null);
      }
    }
  }
}
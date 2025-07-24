import {
    AfterContentInit,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ChangeDetectorRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { OrderByPipe, ZipCodePipe } from 'src/@shared/pipes';
import {
    Location,
    TimeZoneModel,
} from 'src/business-center/practice-settings/location';
import cloneDeep from 'lodash/cloneDeep';
import { LocationDataService } from '../service/location-data.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { LocationIdentifierService } from 'src/@shared/providers/location-identifier.service';
import { SaveStates } from 'src/@shared/models/transaction-enum';
import { FuseFlag } from '../../../@core/feature-flags/fuse-flag';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import {
    PaymentProvider,
    PaymentProviderLabels,
} from 'src/@shared/enum/accounting/payment-provider';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ApplicationBillingInfoService } from '../../../@core/http-services/application-billing-info.service';
import { BillingModel } from '../../../@core/models/app-billing-info/billing-model.enum';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { CardReaderComponent } from '../card-reader/card-reader/card-reader.component';
import { CardReader } from '../card-reader/card-reader';
import { ClaimEnumService, IPlaceOfTreatment, PlaceOfTreatmentEnum } from 'src/@core/data-services/claim-enum.service';

declare let angular: angular.IAngularStatic;

@Component({
    selector: 'location-crud',
    templateUrl: './location-crud.component.html',
    styleUrls: ['./location-crud.component.scss'],
})
export class LocationCrudComponent
    implements OnInit, OnChanges, AfterContentInit
{
    @Input() selectedLocation;
    @Input() locations: Location[];
    @Output() saveFuncChange = new EventEmitter<() => void>();
    @Output() editFuncChange = new EventEmitter<() => void>();
    @Output() cancelFuncChange = new EventEmitter<() => void>();
    @Output() addFuncChange = new EventEmitter<() => void>();
    @Input() hasChanges: boolean;
    @Input() loadingLocations = false;
    @Input() saveSuccessful;
    @Input() cancelConfirmed;

    savingLocation = false;
    loading = false;
    frmLocationCrud: FormGroup;
    pageLoading = true;
    dataHasChanged = false;
    hasAdditionalIdentifierViewAccess = false;
    hasAdditionalIdentifierEditAccess = false;
    hasTreatmentRoomsViewAccess = false;
    locationIdentifiers: [];
    taxonomyCodesSpecialties: Array<{
        Category: string;
        TaxonomyCodeId: string;
    }> = [];
    phoneNumberPlaceholder = '';
    taxIdPlaceholder = '';
    readonly defaultPlaceOfTreatment = PlaceOfTreatmentEnum.Office;
    additionalIdentifiers: Array<{ Description: ''; Value: '' }> = [];
    enableAccountsOverDue = false;
    hasChange = false;
    formIsValid = true;
    displayTimezone = '';
    timeZones: { text: string; value: string }[] = [];
    userCount = 0;
    valid = true;
    nowDate = moment().startOf('day').toDate();
    canUpdateInactivation = true;
    originalLocation: Location = {};
    locationId: number;
    isActiveLoc?: boolean = true;
    defaultDate?: Date;
    tempTz?: [];
    tempState?: [];
    loadingStatus?: boolean = true;
    editMode = false;
    selectedLocationId: number;
    timeZoneModel: TimeZoneModel[] = [];
    selectedState?: string;
    anyCardTypeSelected?: boolean = false;
    IsPaymentGatewayEnabled?: boolean = false;
    isEstatementsEnabled = false;
    locationNameIsUnique = true;
    displayNameIsUnique = true;
    selectedRooms: { Name: null; ObjectState: string; $unique: boolean }[] = [];
    addIdentifierGroup: FormGroup;
    isIdentifierAdded = false;
    InsuranceRemittanceTaxId = '';
    InsuranceRemittanceTypeTwoNpi = '';
    InsranceRemittanceLicenseNumber = '';
    accountsOverdueValues: [];
    enableAccountsOverDueList = true;
    invalidDataForRx = false;
    isNewRoomDuplicate = false;
    defaultFinanceChargePattern = /^\d{0,2}(\.\d{0,2})?$/;
    hasCreateAccess = false;
    hasEditAccess = false;
    addRxClinic = false;
    ofcLocation: Location = {};
    hasViewAccess = false;
    uniqueLocationServerMessage = '';
    uniqueDisplayNameServerMessage = '';
    isAdding = false;
    toUpdate = false;
    isModify = false;
    hasLocationAddAccess = false;
    obs: Subscription;
    obs1: Subscription;
    viewTeamMemberUrl = '#/BusinessCenter/Users/';
    addTeamMemberUrl = '#/BusinessCenter/Users/Create/';
    locationChanges = false;
    isRoomsLoadingCompleted = true;
    showPaymentProvider = false;
    paymentProviders: { Text: string; Value: number }[] = [];
    accountTokenInputHidden = {
        OpenEdgeEnabled: false,
        PaymentIntegrationEnabled: true,
    };
    confirmProviderTypeConfirmationRef: ConfirmationModalOverlayRef;
    confirmProviderTypeSubscription: Subscription;
    confirmCancelChangesRef: ConfirmationModalOverlayRef;
    affirmedSubscription = false;

    confirmationModalData: {
        header: string;
        message: string;
        confirm: string;
        cancel: string;
        height: number;
        width: number;
    } = {
            header: this.localize?.getLocalizedString(
                'Notice - Monthly Subscription Fee Increase'
            ),
            message: '',
            confirm: 'Acknowledge',
            cancel: 'Cancel',
            height: 200,
            width: 800,
        };
    dialog: DialogRef;
    dialogSubscription: Subscription;
    confirmationRef: ConfirmationModalOverlayRef;
    @ViewChild('container', { read: ViewContainerRef, static: true })
    public containerRef: ViewContainerRef;
    cardReaderList: CardReader[] = [];
    cardReaderListTemp: CardReader[] = [];
    placeOfTreatmentList: IPlaceOfTreatment[] = [];
    placeOfTreatmentEnum = PlaceOfTreatmentEnum;
    revealMaskAccountCredentials=false;
    FAKE_MASK_ACCOUNT_CREDENTIALS="zzzzzzzzzz"
    realAccountCredential:string;
    constructor(
        private fb: FormBuilder,
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('locationService') private locationService,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('LocationServices') private locationServices,
        @Inject('StaticData') private staticData,
        @Inject('ModalFactory') private modalFactory,
        @Inject('TimeZones') private timeZone,
        @Inject('AccountsOverdueValues') private AccountsOverdueValues,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('PatCacheFactory') private cacheFactory,
        @Inject('ObjectService') private objectService,
        @Inject('$routeParams') private routeParams,
        @Inject('RxService') private rxService,
        @Inject('$location') private $location,
        @Inject('$rootScope') private $rootScope,
        private locationData: LocationDataService,
        private zipCode: ZipCodePipe,
        private locationIdentifierService: LocationIdentifierService,
        private cd: ChangeDetectorRef,
        private featureFlagService: FeatureFlagService,
        private applicationBillingInfoService: ApplicationBillingInfoService,
        private confirmationModalService: ConfirmationModalService,
        private dialogService: DialogService,
        private claimPlaceOfTreatmentService: ClaimEnumService
    ) {
        this.timeZoneModel = cloneDeep(this.timeZone);
        this.timeZoneModel?.forEach(element => {
            this.timeZones.push({ text: element?.Display, value: element?.Value });
        });
        this.placeOfTreatmentList = [...this.claimPlaceOfTreatmentService.getPlaceOfTreatment(), { code: -1, description: 'Enter a new code' }];        
    }

    ngAfterContentInit() {
        if (this.selectedLocation != null || this.selectedLocation != undefined) {
            this.frmLocationCrud?.controls['PrimaryPhone'].setValue(
                this.selectedLocation?.PrimaryPhone?.length > 0
                    ? this.selectedLocation?.PrimaryPhone
                    : null
            );
            this.frmLocationCrud?.controls['SecondaryPhone'].setValue(
                this.selectedLocation?.SecondaryPhone?.length > 0
                    ? this.selectedLocation?.SecondaryPhone
                    : null
            );
            this.frmLocationCrud?.controls['Fax'].setValue(
                this.selectedLocation?.Fax?.length > 0
                    ? this.selectedLocation?.Fax
                    : null
            );
            this.frmLocationCrud?.controls['TaxId'].setValue(
                this.selectedLocation?.TaxId?.length > 0
                    ? this.selectedLocation?.TaxId
                    : null
            );
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.selectedLocation) {
            this.invalidDataForRx = false;
            const nv = changes?.selectedLocation?.currentValue;
            const ov = changes?.selectedLocation?.previousValue;
            this.originalLocation = cloneDeep(nv);
            // Selected Location watch
            this.selectedLocationWatch(nv, ov);
            if (this.selectedLocation && !this.editMode) {
                if (
                    !this.selectedLocation?.PrimaryPhone ||
                    this.selectedLocation.PrimaryPhone === '' ||
                    !this.selectedLocation?.Fax ||
                    this.selectedLocation?.Fax === '' ||
                    !this.selectedLocation?.ZipCode ||
                    this.selectedLocation?.ZipCode === ''
                ) {
                    this.invalidDataForRx = true;
                }
            }
        }
    }

    selectedLocationWatch = (nv, ov) => {
        if (
            nv &&
            ov &&
            nv?.LocationId &&
            ov?.LocationId &&
            nv?.LocationId == ov?.LocationId
        ) {
            this.updateDataHasChangedFlag(false);
        }
    };

    ngOnInit(): void {
        this.editMode = this.routeParams?.locationId < 0;
        this.isAdding = this.routeParams?.locationId < 0;
        if (this.isAdding) {
            this.hasLocationAddAccess =
                this.patSecurityService.IsAuthorizedByAbbreviation(
                    'soar-biz-bizloc-add'
                );
            if (!this.hasLocationAddAccess) {
                this.toastrFactory.error(
                    this.localize.getLocalizedString(
                        'User is not authorized to access this area.'
                    ),
                    this.localize.getLocalizedString('Not Authorized')
                );
                this.$location.path(encodeURIComponent('/'));
            }
            this.initializeDefaultModel();
        }
        this.checkFeatureFlags();
        this.mapPaymentProvider();
        this.createForm();
        this.createGroup();
        this.authAccesss();
        this.getTaxnomyCodes();
        this.getEstatementEnrollmentStatus();
        this.authAccess();
        this.publishOutputFunctions();
        this.placeOfTreatmentFormControlUpdate();
        this.applicationBillingInfoService.applicationBilling$.subscribe(response =>
            this.showBillingMessage(response.Result.BillingModel)
        );
        if (!this.selectedLocation?.AdditionalIdentifiers)
            this.getLocationIdentifiers();
        this.accountsOverdueValues = this.AccountsOverdueValues;
        this.formIsValid = true;
        
    }
    checkFeatureFlags() {
        this.featureFlagService
            .getOnce$(FuseFlag.UsePaymentService)
            .subscribe(value => {
                this.showPaymentProvider = value;
            });
    }

    mapPaymentProvider() {
        this.paymentProviders = Object.keys(PaymentProviderLabels).map(key => ({
            Text: PaymentProviderLabels[key],
            Value: +key,
        }));
    }
    toggleLocationStatus(event) {
        this.isActiveLoc = event?.target?.checked;
        this.frmLocationCrud?.controls['isActiveLoc']?.setValue(this.isActiveLoc);
    }

    OnDefaultDateChanged(date) {
        this.defaultDate = date;
    }

    createForm = () => {

        // **NOTE**: Implementation of this method appears to be entirely misguided!
        // this.selectedLocation is always undefined!

        this.frmLocationCrud = this.fb.group({
            isActiveLoc: [
                this.selectedLocation?.DeactivationTimeUtc === null ? true : false,
                null,
            ],
            NameLine1: [this.selectedLocation?.NameLine1, Validators.required],
            NameLine2: [this.selectedLocation?.NameLine2, null],
            NameAbbreviation: [
                this.selectedLocation?.NameAbbreviation,
                Validators.required,
            ],
            Email: [this.selectedLocation?.Email, null],
            Website: [this.selectedLocation?.Website, null],
            PrimaryPhone: [this.selectedLocation?.PrimaryPhone, null],
            SecondaryPhone: [this.selectedLocation?.SecondaryPhone, null],
            Fax: [this.selectedLocation?.Fax, null],
            AddressLine1: [this.selectedLocation?.AddressLine1, Validators.required],
            AddressLine2: [this.selectedLocation?.AddressLine2, null],
            City: [this.selectedLocation?.City, Validators.required],
            State: [this.selectedLocation?.State, Validators.required],
            ZipCode: [this.selectedLocation?.ZipCode, Validators.required],
            Timezone: [this.selectedLocation?.Timezone, Validators.required],
            ProviderTaxRate: [this.selectedLocation?.ProviderTaxRate, null],
            SalesAndUseTaxRate: [this.selectedLocation?.SalesAndUseTaxRate, null],
            DefaultFinanceCharge: [this.selectedLocation?.DefaultFinanceCharge, null],
            MerchantId: [this.selectedLocation?.MerchantId, Validators.required],
            DisplayCardsOnEstatement: [
                this.selectedLocation?.DisplayCardsOnEstatement,
                null,
            ],
            MinimumFinanceCharge: [this.selectedLocation?.MinimumFinanceCharge, null],
            RemitAddressSource: [this.selectedLocation?.RemitAddressSource, null],
            RemitToNameLine1: [this.selectedLocation?.RemitToNameLine1, null],
            RemitToNameLine2: [this.selectedLocation?.RemitToNameLine2],
            RemitToAddressLine1: [this.selectedLocation?.RemitToAddressLine1, null],
            RemitToAddressLine2: [this.selectedLocation?.RemitToAddressLine2],
            RemitToCity: [this.selectedLocation?.RemitToCity, null],
            RemitToState: [this.selectedLocation?.RemitToState, null],
            RemitToZipCode: [this.selectedLocation?.RemitToZipCode, null],
            RemitToPrimaryPhone: [this.selectedLocation?.RemitToPrimaryPhone, null],
            InsuranceRemittanceAddressSource: [
                this.selectedLocation?.InsuranceRemittanceAddressSource,
                null,
            ],
            InsuranceRemittanceNameLine1: [
                this.selectedLocation?.InsuranceRemittanceNameLine1,
                null,
            ],
            InsuranceRemittanceNameLine2: [
                this.selectedLocation?.InsuranceRemittanceNameLine2,
                null,
            ],
            InsuranceRemittanceAddressLine1: [
                this.selectedLocation?.InsuranceRemittanceAddressLine1,
                null,
            ],
            InsuranceRemittanceAddressLine2: [
                this.selectedLocation?.InsuranceRemittanceAddressLine2,
                null,
            ],
            InsuranceRemittanceCity: [
                this.selectedLocation?.InsuranceRemittanceCity,
                null,
            ],
            InsuranceRemittanceState: [
                this.selectedLocation?.InsuranceRemittanceState,
                null,
            ],
            InsuranceRemittanceZipCode: [
                this.selectedLocation?.InsuranceRemittanceZipCode,
                null,
            ],
            InsuranceRemittancePrimaryPhone: [
                this.selectedLocation?.InsuranceRemittancePrimaryPhone,
                null,
            ],
            InsuranceRemittanceTaxId: [
                this.selectedLocation?.InsuranceRemittanceTaxId,
                null,
            ],
            InsuranceRemittanceTypeTwoNpi: [
                this.selectedLocation?.InsuranceRemittanceTypeTwoNpi,
                null,
            ],
            InsuranceRemittanceLicenseNumber: [
                this.selectedLocation?.InsuranceRemittanceLicenseNumber,
                null,
            ],
            TaxId: [this.selectedLocation?.TaxId, null],
            TypeTwoNpi: [this.selectedLocation?.TypeTwoNpi],
            LicenseNumber: [this.selectedLocation?.LicenseNumber],
            RemitOtherLocationId: [this.selectedLocation?.RemitOtherLocationId, null],
            InsuranceRemittanceOtherLocationId: [
                this.selectedLocation?.InsuranceRemittanceOtherLocationId,
                null,
            ],
            AccountsOverDue: [this.selectedLocation?.AccountsOverDue, null],
            TaxonomyId: [this.selectedLocation?.TaxonomyId, null],
            EnableCreditDebitCard: [
                this.selectedLocation?.IsPaymentGatewayEnabled,
                null,
            ],
            FeeListId: [this.selectedLocation?.FeeListId, null],
            IncludeCvvCodeOnEstatement: [
                this.selectedLocation?.IncludeCvvCodeOnEstatement,
                null,
            ],
            AcceptAmericanExpressOnEstatement: [
                this.selectedLocation?.AcceptAmericanExpressOnEstatement,
                null,
            ],
            AcceptVisaOnEstatement: [
                this.selectedLocation?.AcceptVisaOnEstatement,
                null,
            ],
            AcceptDiscoverOnEstatement: [
                this.selectedLocation?.AcceptDiscoverOnEstatement,
                null,
            ],
            AcceptMasterCardOnEstatement: [
                this.selectedLocation?.AcceptMasterCardOnEstatement,
                null,
            ],
            PaymentProvider: [this.selectedLocation?.PaymentProvider, null],
            PaymentProviderAccountCredential: [
                {value:this.selectedLocation?.PaymentProviderAccountCredential,
                 disabled: this.selectedLocation?.IsPaymentGatewayEnabled},
                Validators.required   
            ],
            PlaceOfTreatment: [ null, Validators.required],
            OtherPlaceOfTreatment: [ null, [Validators.pattern('^[0-9]*$'), Validators.minLength(2), Validators.required]],
        });
        if(this.selectedLocation?.LocationId  && this.selectedLocation?.PaymentProvider ==  PaymentProvider.TransactionsUI){
            this.frmLocationCrud?.controls['PaymentProviderAccountCredential']?.setValue(this.FAKE_MASK_ACCOUNT_CREDENTIALS);
            this.revealMaskAccountCredentials = false;
        }else{
            this.revealMaskAccountCredentials = true;
        }
        this.updatePaymentProviderAccountCredentialDisableState();
        
        // Set MerchantId field to disable
        if (!this.selectedLocation?.IsPaymentGatewayEnabled) {
            this.frmLocationCrud?.get('MerchantId')?.disable();
            this.frmLocationCrud?.get('PaymentProviderAccountCredential')?.disable();
            this.frmLocationCrud?.get('PaymentProvider')?.disable();
        } else {
            this.selectedLocation.PaymentProvider =
                this.selectedLocation?.PaymentProvider ??
                this.paymentProviders[0].Value;
            this.frmLocationCrud?.controls['PaymentProvider']?.setValue(
                this.selectedLocation?.PaymentProvider
            );
            this.frmLocationCrud?.controls[
                'PaymentProvider'
            ]?.updateValueAndValidity();
            this.setVisibilityWhenPaymentProviderChanged(
                this.selectedLocation?.PaymentProvider
            );
        }

        if (this.selectedLocation?.DefaultFinanceCharge != null) {
            this.enableAccountsOverDue = true;
            this.frmLocationCrud?.controls['AccountsOverDue']?.setValidators(
                Validators?.required
            );
            this.frmLocationCrud?.controls[
                'AccountsOverDue'
            ]?.updateValueAndValidity();
        }

        // Set default for RemitAddressSource
        this.frmLocationCrud?.controls['RemitAddressSource']?.setValue('0');

        // Dynamically adding/removing validations for RemitAddressSource
        this.obs = this.RemitAddressSource?.valueChanges?.subscribe(val => {
            if (Number(val) == 2) {
                this.frmLocationCrud.controls['RemitToNameLine1'].setValidators(
                    Validators.required
                );
                this.frmLocationCrud.controls['RemitToAddressLine1'].setValidators(
                    Validators.required
                );
                this.frmLocationCrud.controls['RemitToCity'].setValidators(
                    Validators.required
                );
                this.frmLocationCrud.controls['RemitToState'].setValidators(
                    Validators.required
                );
                this.frmLocationCrud.controls['RemitToZipCode'].setValidators(
                    Validators.required
                );
            } else {
                this.frmLocationCrud.controls['RemitToNameLine1'].setValidators(null);
                this.frmLocationCrud.controls['RemitToAddressLine1'].setValidators(
                    null
                );
                this.frmLocationCrud.controls['RemitToCity'].setValidators(null);
                this.frmLocationCrud.controls['RemitToState'].setValidators(null);
                this.frmLocationCrud.controls['RemitToZipCode'].setValidators(null);
            }

            if (Number(val) == 1) {
                this.frmLocationCrud.controls['RemitOtherLocationId'].setValidators(
                    Validators.required
                );
            } else {
                this.frmLocationCrud.controls['RemitOtherLocationId'].setValidators(
                    null
                );
            }
            this.frmLocationCrud.controls[
                'RemitToNameLine1'
            ].updateValueAndValidity();
            this.frmLocationCrud.controls[
                'RemitToAddressLine1'
            ].updateValueAndValidity();
            this.frmLocationCrud.controls['RemitToCity'].updateValueAndValidity();
            this.frmLocationCrud.controls['RemitToState'].updateValueAndValidity();
            this.frmLocationCrud.controls['RemitToZipCode'].updateValueAndValidity();
            this.frmLocationCrud.controls[
                'RemitOtherLocationId'
            ].updateValueAndValidity();
        });

        // Dynamically adding/removing validations for InsuranceRemittanceAddressSource
        this.obs1 = this.InsuranceRemittanceAddressSource?.valueChanges?.subscribe(
            val => {
                if (Number(val) == 2) {
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceNameLine1'
                    ].setValidators(Validators.required);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceAddressLine1'
                    ].setValidators(Validators.required);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceCity'
                    ].setValidators(Validators.required);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceState'
                    ].setValidators(Validators.required);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceZipCode'
                    ].setValidators(Validators.required);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceTaxId'
                    ].setValidators(Validators.required);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceTypeTwoNpi'
                    ].setValidators(Validators.required);
                } else {
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceNameLine1'
                    ].setValidators(null);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceAddressLine1'
                    ].setValidators(null);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceCity'
                    ].setValidators(null);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceState'
                    ].setValidators(null);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceZipCode'
                    ].setValidators(null);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceTaxId'
                    ].setValidators(null);
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceTypeTwoNpi'
                    ].setValidators(null);
                }

                if (Number(val) == 1) {
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceOtherLocationId'
                    ].setValidators(Validators.required);
                } else {
                    this.frmLocationCrud.controls[
                        'InsuranceRemittanceOtherLocationId'
                    ].setValidators(null);
                }
                this.frmLocationCrud.controls[
                    'InsuranceRemittanceNameLine1'
                ].updateValueAndValidity();
                this.frmLocationCrud.controls[
                    'InsuranceRemittanceAddressLine1'
                ].updateValueAndValidity();
                this.frmLocationCrud.controls[
                    'InsuranceRemittanceCity'
                ].updateValueAndValidity();
                this.frmLocationCrud.controls[
                    'InsuranceRemittanceState'
                ].updateValueAndValidity();
                this.frmLocationCrud.controls[
                    'InsuranceRemittanceZipCode'
                ].updateValueAndValidity();
                this.frmLocationCrud.controls[
                    'InsuranceRemittanceTaxId'
                ].updateValueAndValidity();
                this.frmLocationCrud.controls[
                    'InsuranceRemittanceTypeTwoNpi'
                ].updateValueAndValidity();
                this.frmLocationCrud.controls[
                    'InsuranceRemittanceOtherLocationId'
                ].updateValueAndValidity();
            }
        );    
        
        this.updatePaymentProviderAccountCredentialDisableState();
    };

    createGroup() {
        const addIdentifier = this.selectedLocation?.AdditionalIdentifiers;
        const group = this.fb.group({});
        if (addIdentifier != null) {
            addIdentifier?.forEach((f, index) => {
                const control = this.fb?.control(f.Value);
                group?.addControl(
                    `${'AdditionalIdentifier_'}${String(index)}`,
                    control
                );
            });
            this.addIdentifierGroup = group;
            this.frmLocationCrud?.addControl('AdditionalIdentifier', group);
            this.isIdentifierAdded = true;
        }
    }

    get State() {
        return this.frmLocationCrud?.get('State');
    }

    get RemitAddressSource() {
        return this.frmLocationCrud?.get('RemitAddressSource');
    }

    get InsuranceRemittanceAddressSource() {
        return this.frmLocationCrud?.get('InsuranceRemittanceAddressSource');
    }

    getTaxnomyCodes() {
        this.staticData?.TaxonomyCodes()?.then(res => this.taxonomyOnSuccess(res));
    }

    taxonomyOnSuccess = res => {
        if (res) {
            const orderPipe = new OrderByPipe();
            this.taxonomyCodesSpecialties = orderPipe?.transform(res?.Value, {
                sortColumnName: 'Category',
                sortDirection: 1,
            });
        }
    };

    authAccesss() {
        this.authAdditionalIdentifierAccess();
    }

    authAdditionalIdentifierAccess() {
        this.hasAdditionalIdentifierViewAccess =
            this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-view');
        this.hasAdditionalIdentifierEditAccess =
            this.patSecurityService.IsAuthorizedByAbbreviation(
                'soar-biz-ailoc-manage'
            );
        this.hasTreatmentRoomsViewAccess =
            this.patSecurityService.IsAuthorizedByAbbreviation(
                'soar-sch-stmtrm-view'
            );
    }

    getEstatementEnrollmentStatus = () => {
        const locationId = this.locationService?.getCurrentLocation().id;
        this.locationServices
            ?.getLocationEstatementEnrollmentStatus({ locationId: locationId })
            .$promise?.then(
                res => {
                    this.getEstatementEnrollmentStatusSuccess(res);
                },
                () => {
                    this.getEstatementEnrollmentStatusFailure();
                }
            );
    };

    getEstatementEnrollmentStatusSuccess = res => {
        this.isEstatementsEnabled = res?.Result;
    };

    getEstatementEnrollmentStatusFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'Failed to retrieve eStatement Enrollment Status'
            ),
            this.localize.getLocalizedString('Error')
        );
    }

    displayTaxonomyCodeByField(id: string, field: string): string {
        const result: { [key: string]: string } | undefined =
            this.taxonomyCodesSpecialties?.find(x => x.TaxonomyCodeId == id);
        return result ? result[field] : '';
    }

    setDefaultValues = location => {
        if (!location?.PrimaryPhone) {
            this.selectedLocation.PrimaryPhone = this.phoneNumberPlaceholder;
        }
        if (!location?.SecondaryPhone) {
            this.selectedLocation.SecondaryPhone = this.phoneNumberPlaceholder;
        }
        if (!location?.Fax) {
            this.selectedLocation.Fax = this.phoneNumberPlaceholder;
        }
        if (!location?.TaxId) {
            this.selectedLocation.TaxId = this.taxIdPlaceholder;
        }
        this.enableAccountsOverDue = location?.DefaultFinanceCharge ? true : false;
        if (!location?.PlaceOfTreatment) {
            this.selectedLocation.PlaceOfTreatment = this.defaultPlaceOfTreatment;
        }
    };

    paymentGatewayChanged = event => {
        if (event?.currentTarget?.checked) {
            this.frmLocationCrud?.controls['MerchantId']?.enable();
            this.frmLocationCrud?.controls['PaymentProvider']?.enable();
            this.frmLocationCrud?.controls['EnableCreditDebitCard']?.setValue(true);
        } else {
            if(this.selectedLocation.LocationId && this.selectedLocation.IsPaymentGatewayEnabled ){
                const paymentProviderCtrlVal=   this.frmLocationCrud?.controls['PaymentProvider']?.value;
                if( this.selectedLocation.PaymentProvider === PaymentProvider.TransactionsUI && paymentProviderCtrlVal ===  PaymentProvider.TransactionsUI ){
                    this.warningGPIPaymentProviderChange(true);

                }else{
                    this.disablePaymentGatewayWarning()
                }
            }else{
                this.updateValueforModal();
                
            }
            this.frmLocationCrud?.controls['EnableCreditDebitCard']?.setValue(false);
           
        }
        const paymentProviderVal = event?.currentTarget?.checked
            ? this.setDefaultPaymentProvider()
            : null;
        this.frmLocationCrud?.controls['PaymentProvider']?.setValue(
            paymentProviderVal
        );
        this.frmLocationCrud?.controls['PaymentProvider']?.updateValueAndValidity();
        if(this.frmLocationCrud?.controls['EnableCreditDebitCard'].value){
        this.setVisibilityWhenPaymentProviderChanged(this.selectedLocation?.PaymentProvider);
        }
    };

    setDefaultPaymentProvider = () => {
        if (!this.selectedLocation.PaymentProvider) {
            return this.paymentProviders[0].Value;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return this.selectedLocation?.PaymentProvider;
        }
    };


    setVisibilityWhenPaymentProviderChanged = (
        paymentProviderNumber: PaymentProvider
    ) => {
        if (paymentProviderNumber === PaymentProvider.OpenEdge || !paymentProviderNumber) {
            this.accountTokenInputHidden.OpenEdgeEnabled = false;
            this.accountTokenInputHidden.PaymentIntegrationEnabled = true;
            this.frmLocationCrud?.controls['MerchantId']?.enable();
            this.frmLocationCrud?.controls['PaymentProviderAccountCredential']?.disable();
        } else {
            this.accountTokenInputHidden.OpenEdgeEnabled = true;
            this.accountTokenInputHidden.PaymentIntegrationEnabled = false;
            this.frmLocationCrud?.controls['MerchantId']?.disable();
           if(this.revealMaskAccountCredentials){
            this.frmLocationCrud?.controls['PaymentProviderAccountCredential']?.enable();
           }        
        }
      
    };

    setAccountTokenOnSave = (paymentProviderNumber: PaymentProvider) => {
        if (paymentProviderNumber === PaymentProvider.OpenEdge ) {
            this.selectedLocation.MerchantId =
                this.frmLocationCrud?.controls['MerchantId']?.value;
            this.selectedLocation.PaymentProviderAccountCredential = null;
        } else {
            this.selectedLocation.MerchantId = null;
            const paymentProviderAccountCredential =this.frmLocationCrud?.controls[
                'PaymentProviderAccountCredential'
            ]?.value
            if(paymentProviderAccountCredential == this.FAKE_MASK_ACCOUNT_CREDENTIALS || paymentProviderAccountCredential == this.realAccountCredential || !this.frmLocationCrud.controls.EnableCreditDebitCard.value
               || this.frmLocationCrud.controls.PaymentProvider.value !== PaymentProvider.TransactionsUI){    
                this.selectedLocation.PaymentProviderAccountCredential = null;
            }else{
                this.selectedLocation.PaymentProviderAccountCredential =
                this.frmLocationCrud?.controls[
                    'PaymentProviderAccountCredential'
                ]?.value;
            }  
        }
    };

    disableAccountTokenInputOnSave = (paymentProviderNumber: PaymentProvider) => {
        if (this.selectedLocation?.IsPaymentGatewayEnabled) {
            if (paymentProviderNumber === PaymentProvider.OpenEdge) {
                this.frmLocationCrud?.controls['MerchantId']?.enable();
                this.frmLocationCrud?.controls['PaymentProviderAccountCredential']?.disable();
            } else {
                this.frmLocationCrud?.controls['MerchantId']?.disable();
               this.updatePaymentProviderAccountCredentialDisableState()
            }
        } else {
            this.frmLocationCrud?.controls['MerchantId']?.disable();
            this.frmLocationCrud?.controls['PaymentProviderAccountCredential']?.disable();
        }
    }

    disablePaymentGatewayWarning = () => {
        const message = this.localize.getLocalizedString(
            'By disabling Credit Card/Debit Card Processing, credit cards will no longer be charged using the credit card integration.  Are you sure you want to continue?'
        );
        const title = this.localize.getLocalizedString('Credit Card Integration');
        const button2Text = this.localize.getLocalizedString('Cancel');
        const button1Text = this.localize.getLocalizedString('Ok');
        this.modalFactory
            .ConfirmModal(title, message, button1Text, button2Text)
            .then(this.updateValueforModal, this.closeModals);
    };

    closeModals = () => {
        this.frmLocationCrud?.controls['EnableCreditDebitCard']?.setValue(true);
        this.frmLocationCrud?.controls['PaymentProvider']?.setValue(
            this.setDefaultPaymentProvider()
        );
        this.accountTokenInputHidden.OpenEdgeEnabled = this.selectedLocation.PaymentProvider === PaymentProvider.TransactionsUI ? true : false;
        this.accountTokenInputHidden.PaymentIntegrationEnabled = this.selectedLocation.PaymentProvider === PaymentProvider.TransactionsUI ? false : true;
    };

    updateValueforModal = () => {
        this.frmLocationCrud?.controls['MerchantId']?.disable();
        this.frmLocationCrud?.controls[
            'PaymentProviderAccountCredential'
        ]?.disable();
        this.frmLocationCrud?.controls['PaymentProvider']?.disable();
        this.frmLocationCrud?.controls['EnableCreditDebitCard']?.setValue(false);
    };

    displayCardsOnEstatementChange = value => {
        if (value) {
            this.selectedLocation.AcceptMasterCardOnEstatement = true;
            this.selectedLocation.AcceptDiscoverOnEstatement = true;
            this.selectedLocation.AcceptVisaOnEstatement = true;
            this.selectedLocation.AcceptAmericanExpressOnEstatement = true;
            this.selectedLocation.IncludeCvvCodeOnEstatement = false;
            this.selectedLocation.DisplayCardsOnEstatement = true;
        } else {
            this.selectedLocation.AcceptMasterCardOnEstatement = false;
            this.selectedLocation.AcceptDiscoverOnEstatement = false;
            this.selectedLocation.AcceptVisaOnEstatement = false;
            this.selectedLocation.AcceptAmericanExpressOnEstatement = false;
            this.selectedLocation.IncludeCvvCodeOnEstatement = false;
            this.selectedLocation.DisplayCardsOnEstatement = false;
        }

        this.frmLocationCrud?.controls?.AcceptMasterCardOnEstatement?.patchValue(
            this.selectedLocation?.AcceptMasterCardOnEstatement
        );
        this.frmLocationCrud?.controls?.AcceptDiscoverOnEstatement?.patchValue(
            this.selectedLocation?.AcceptDiscoverOnEstatement
        );
        this.frmLocationCrud?.controls?.AcceptVisaOnEstatement?.patchValue(
            this.selectedLocation?.AcceptVisaOnEstatement
        );
        this.frmLocationCrud?.controls?.AcceptAmericanExpressOnEstatement?.patchValue(
            this.selectedLocation?.AcceptAmericanExpressOnEstatement
        );
        this.frmLocationCrud?.controls?.IncludeCvvCodeOnEstatement?.patchValue(
            this.selectedLocation?.IncludeCvvCodeOnEstatement
        );
    };

    remitAddressSourceChanged = event => {
        if (this.selectedLocation?.RemitAddressSource !== 2) {
            this.selectedLocation.RemitToNameLine1 = '';
            this.selectedLocation.RemitToNameLine2 = '';
            this.selectedLocation.RemitToAddressLine1 = '';
            this.selectedLocation.RemitToAddressLine2 = '';
            this.selectedLocation.RemitToCity = '';
            this.selectedLocation.RemitToState = '';
            this.selectedLocation.RemitToZipCode = '';
            this.selectedLocation.RemitToPrimaryPhone = '';
        }
        if (this.selectedLocation?.RemitAddressSource !== 1) {
            this.selectedLocation.RemitOtherLocationId = 0;
        }
        this.selectedLocation.RemitAddressSource = event?.currentTarget?.value;
    };

    remittanceInsuranceSourceChanged = event => {
        if (this.selectedLocation?.InsuranceRemittanceAddressSource !== 2) {
            this.selectedLocation.InsuranceRemittanceNameLine1 = '';
            this.selectedLocation.InsuranceRemittanceNameLine2 = '';
            this.selectedLocation.InsuranceRemittanceAddressLine1 = '';
            this.selectedLocation.InsuranceRemittanceAddressLine2 = '';
            this.selectedLocation.InsuranceRemittanceCity = '';
            this.selectedLocation.InsuranceRemittanceState = '';
            this.selectedLocation.InsuranceRemittanceZipCode = '';
            this.selectedLocation.InsuranceRemittancePrimaryPhone = '';
            this.InsuranceRemittanceTaxId = '';
            this.InsuranceRemittanceTypeTwoNpi = '';
            this.InsranceRemittanceLicenseNumber = '';
        }
        if (this.selectedLocation?.InsuranceRemittanceAddressSource !== 1) {
            this.selectedLocation.InsuranceRemittanceOtherLocationId = 0;
        }
        this.selectedLocation.InsuranceRemittanceAddressSource =
            event?.currentTarget?.value;
    };

    selectedLocInit = () => {
        this.isActiveLoc = this.selectedLocation?.DeactivationTimeUtc === null;
        this.defaultDate = new Date();
        this.defaultDate?.setHours(0, 0, 0, 0);
        this.canUpdateInactivation = true;
        if (!this.isActiveLoc) {
            const toCheck = moment(
                new Date(this.selectedLocation?.DeactivationTimeUtc)
            )?.format('MM/DD/YYYY');
            const dateNow = moment()?.format('MM/DD/YYYY');

            if (
                moment(toCheck)?.isBefore(dateNow) ||
                moment(toCheck)?.isSame(dateNow)
            ) {
                this.canUpdateInactivation = false;
                this.defaultDate = new Date();
                this.defaultDate.setHours(0, 0, 0, 0);
            } else {
                this.defaultDate = new Date(this.selectedLocation?.DeactivationTimeUtc);
                this.canUpdateInactivation = true;
            }
        }

        this.tempTz = this.selectedLocation?.Timezone;
        this.tempState = this.selectedLocation?.State;

        this.selectedLocation != null
            ? (this.selectedLocation.Timezone = null)
            : null;
        this.selectedLocation != null ? (this.selectedLocation.State = null) : null;

        this.loadingStatus = false;

        this.selectedLocation.Timezone = this.tempTz;
        this.selectedLocation.State = this.tempState;
    };

    // check for duplicate location name from server
    checkForUniqueLocationName = () => {
        const ofcLocation = this.frmLocationCrud?.value;
        if (ofcLocation && ofcLocation?.NameLine1 > '') {
            this.locationServices
                ?.IsNameUnique({
                    Name: ofcLocation?.NameLine1,
                    ExcludeLocationId: this.selectedLocation?.LocationId
                        ? this.selectedLocation?.LocationId
                        : null,
                })
                .$promise?.then(
                    res => {
                        this.checkForUniqueLocationNameSuccess(res);
                    },
                    () => {
                        this.checkForUniqueLocationNameFailure();
                    }
                );
        } else {
            this.locationNameIsUnique = true;
        }
    };

    checkForUniqueLocationNameSuccess = successResponse => {
        const isUnique = successResponse?.Value;
        if (isUnique != null) {
            if (isUnique == true) {
                this.locationNameIsUnique = true;
            } else {
                this.uniqueLocationServerMessage = this.localize.getLocalizedString(
                    'A location with this name already exists.'
                );
                this.locationNameIsUnique = false;
            }
        }
    };

    checkForUniqueLocationNameFailure = () => {
        this.locationNameIsUnique = false;
        this.uniqueLocationServerMessage = this.localize.getLocalizedString(
            'Could not verify unique location name. Please try again.'
        );
        this.savingLocation = false;
    };

    // check for duplicate display name from server
    checkForUniqueDisplayName = () => {
        if (this.selectedLocation?.NameAbbreviation > '') {
            this.locationServices
                ?.IsAbbreviatedNameUnique({
                    Name: this.selectedLocation?.NameAbbreviation,
                    ExcludeLocationId: this.selectedLocation?.LocationId
                        ? this.selectedLocation?.LocationId
                        : null,
                })
                .$promise.then(
                    res => {
                        this.checkForUniqueDisplayNameSuccess(res);
                    },
                    () => {
                        this.checkForUniqueDisplayNameFailure();
                    }
                );
        } else {
            this.displayNameIsUnique = true;
        }
    };

    checkForUniqueDisplayNameSuccess = successResponse => {
        const isUnique = successResponse?.Value;

        if (isUnique != null) {
            if (isUnique == true) {
                this.displayNameIsUnique = true;
            } else {
                this.uniqueDisplayNameServerMessage = this.localize.getLocalizedString(
                    'A location with this display name already exists.'
                );
                this.displayNameIsUnique = false;
            }
        }
    };

    checkForUniqueDisplayNameFailure = () => {
        this.displayNameIsUnique = false;
        this.uniqueDisplayNameServerMessage = this.localize.getLocalizedString(
            'Could not verify unique display name. Please try again.'
        );
        this.savingLocation = false;
    };

    setAccountsOverDue = (ofcLocation: Location) => {
        ofcLocation.DefaultFinanceCharge =
            this.frmLocationCrud?.controls['DefaultFinanceCharge']?.value;
        if (ofcLocation?.DefaultFinanceCharge) {
            this.enableAccountsOverDue = true;
            this.frmLocationCrud?.controls['AccountsOverDue']?.setValidators(
                Validators?.required
            );
            if (ofcLocation?.DefaultFinanceCharge?.toString()?.length == 1) {
                // reinitialize the component
                this.enableAccountsOverDueList = false;
                this.enableAccountsOverDueList = true;
            }
        } else {
            ofcLocation.AccountsOverDue = null;
            this.enableAccountsOverDue = false;
            this.frmLocationCrud.patchValue({ AccountsOverDue: '' });
            this.frmLocationCrud.controls['AccountsOverDue']?.clearValidators();
        }
        this.frmLocationCrud?.controls['AccountsOverDue']?.updateValueAndValidity();
    };

    validatePaste = () => {
        if (/\d/.test(this.selectedLocation?.City)) {
            this.selectedLocation.City = this.selectedLocation?.City?.replace(
                /[0-9]/g,
                ''
            );
        }
    };

    addRoom() {
        if (this.selectedLocation && this.selectedLocation?.Rooms) {
            // For edit location
            this.selectedLocation?.Rooms.push({
                Name: null,
                ObjectState: SaveStates?.Add,
                $unique: true,
            });
            if (this.selectedRooms != undefined) {
                this.selectedRooms?.push({
                    Name: null,
                    ObjectState: SaveStates?.Add,
                    $unique: true,
                });
            } else {
                this.selectedRooms =
                    this.selectedLocation != null ? this.selectedLocation?.Rooms : null;
                this.selectedRooms?.push({
                    Name: null,
                    ObjectState: SaveStates?.Add,
                    $unique: true,
                });
            }
        } else {
            // For add location
            this.selectedLocation.Rooms = []; //Initialize if selectedLocation.Rooms is undefined
            this.selectedLocation?.Rooms?.push({
                Name: null,
                ObjectState: SaveStates?.Add,
                $unique: true,
            });
            this.selectedRooms?.push({
                Name: null,
                ObjectState: SaveStates?.Add,
                $unique: true,
            });
        }
    }

    //This gets hit on blur of room input box
    roomOnChange = (room, index, roomName) => {
        if (room?.RoomId) {
            this.selectedLocation.Rooms[index].ObjectState = SaveStates?.Update;
            this.selectedLocation.Rooms[index].Name = roomName;
            room.Name = roomName;
            room.ObjectState = SaveStates?.Update;
        }
        //Need to add the roomName to a newly added room.
        else {
            //This scenario covers for a newly added room that is now getting added for the first time or loses focus and assigns empty string to room.Name.
            if (
                room?.Name === null ||
                (room?.Name === '' && room?.ObjectState === 'Add')
            ) {
                const roomIndex = this.selectedLocation?.Rooms?.findIndex(
                    a => a?.Name === null || a?.Name === ''
                );
                if (roomIndex > -1) {
                    this.selectedLocation.Rooms[roomIndex].Name = roomName;
                }
                room.Name = roomName;
            }
            //This scenario covers for a newly added room not saved yet but is getting the room name updated
            else if (room?.Name && room?.ObjectState === 'Add') {
                const roomIndex = this.selectedLocation?.Rooms?.findIndex(
                    a => a?.Name === room?.Name && a?.ObjectState === 'Add'
                );
                this.selectedLocation.Rooms[roomIndex].Name = roomName;
                room.Name = roomName;
            }
        }
        this.checkForRoomDuplicates();
    };

    checkForRoomDuplicates() {
        const rooms = this.selectedLocation?.Rooms;
        const originalRooms = this.originalLocation?.Rooms;

        /** now see if there are dupes amongst new ones */
        if (rooms?.length > 0) {
            for (let i = 0; i < rooms?.length && !this.isNewRoomDuplicate; i++) {
                if (rooms[i]?.ObjectState == SaveStates?.Update) {
                    let hasDuplicates = false;

                    /** compare vs original copy so we can mark the correct dupe */
                    for (let j = 0; j < originalRooms?.length && !hasDuplicates; j++) {
                        if (
                            rooms[i]?.Name &&
                            originalRooms[j].Name &&
                            rooms[i]?.Name?.toLowerCase() ==
                            originalRooms[j]?.Name?.toLowerCase() &&
                            rooms[i]?.RoomId != originalRooms[j]?.RoomId
                        ) {
                            hasDuplicates = true;
                        }
                    }

                    rooms[i].$duplicate = hasDuplicates;
                } else if (rooms[i].ObjectState == SaveStates?.Add) {
                    let isNewRoomDuplicate = false;
                    for (let k = 0; k < rooms?.length; k++) {
                        if (
                            rooms[i]?.Name &&
                            rooms[k]?.Name &&
                            rooms[i]?.Name?.toLowerCase() == rooms[k]?.Name?.toLowerCase() &&
                            rooms[k]?.ObjectState != SaveStates?.Delete &&
                            i != k
                        ) {
                            isNewRoomDuplicate = true;
                        }
                    }
                    rooms[i].$duplicate = isNewRoomDuplicate;
                }
            }
            this.selectedRooms = cloneDeep(rooms);
            this.selectedRooms = [...this.selectedRooms];
        }
    }

    //The index passed in here is the index for the selectedRooms which is the list that keeps the view up-to-date
    //We have to get the roomIndex that matches the roomId being passed in for the selectedLocation.Rooms (This is the list that is sent to database)
    deleteRoom(room, index) {
        if (room && room?.RoomId) {
            const roomIndex = this.selectedLocation?.Rooms?.findIndex(
                a => a.RoomId === room.RoomId
            );
            if (roomIndex != -1) {
                this.selectedLocation.Rooms[roomIndex] = room;
                this.selectedLocation.Rooms[roomIndex].ObjectState = SaveStates?.Delete;
            }
        }
        //adding else to handle if they added a room before saving and then decided to delete the room
        else {
            const roomIndex = this.selectedLocation?.Rooms?.findIndex(
                a =>
                    (a.Name === room?.Name && a.ObjectState === 'Add') ||
                    a.ObjectState === 'Update'
            );
            //This removes from the List that is sent to Server for Saving
            this.selectedLocation?.Rooms?.splice(roomIndex, 1);
        }
        //This removes from the view list
        this.selectedRooms?.splice(index, 1);
    }

    onstatechange(updatedState) {
        this.selectedLocation.State = updatedState;
    }

    onfeeChange(updatedFeeLocation: number) {
        this.selectedLocation.FeeListId = updatedFeeLocation;
    }

    //// Provide the action functions for parent view
    publishOutputFunctions = () => {
        this.editFuncChange.emit(() => this.editFunc());
        this.saveFuncChange.emit(() => this.saveFunc());
        this.cancelFuncChange.emit(() => this.cancelFunc());
        this.addFuncChange.emit(() => this.addFunc());
    };

    getLocationIdentifiers = () => {
        if (this.hasAdditionalIdentifierViewAccess) {
            this.locationIdentifierService.get().then(
                res => {
                    this.locationIdentifiersGetSuccess(res);
                },
                () => {
                    this.locationIdentifiersGetFailure();
                }
            );
        }
    };

    locationIdentifiersGetSuccess = res => {
        this.loading = false;
        const result = [];
        for (let i = 0; i < res?.Value?.length; i++) {
            const index = this.selectedLocation?.AdditionalIdentifiers?.findIndex(
                x =>
                    x.MasterLocationIdentifierId ==
                    res?.Value[i]?.MasterLocationIdentifierId
            );
            result.push({
                Description: res?.Value[i]?.Description,
                MasterLocationIdentifierId: res?.Value[i]?.MasterLocationIdentifierId,
                Value: index?.Value,
            });
        }
        this.additionalIdentifiers = result;
        if (!this.selectedLocation?.AdditionalIdentifiers) {
            this.selectedLocation = { AdditionalIdentifiers: [] };
            this.selectedLocation.AdditionalIdentifiers = this.additionalIdentifiers;
            this.createGroup();
        }
    };

    locationIdentifiersGetFailure = () => {
        this.loading = false;
        this.locationIdentifiers = [];
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'Failed to retrieve the list of additional identifiers. Refresh the page to try again.'
            ),
            this.localize.getLocalizedString('Error')
        );
    };

    // used to determine whether or not to show global discard modal
    updateDataHasChangedFlag = resetting => {
        if (this.editMode) {
            if (resetting === true) {
                this.selectedLocation = cloneDeep(this.ofcLocation);
                this.setDisplayTimezone();
            }
            this.dataHasChanged = !this.objectService?.objectAreEqual(
                cloneDeep(this.originalLocation),
                cloneDeep(this.selectedLocation)
            );
            this.hasChanges = this.dataHasChanged;
        }
    };

    setDisplayTimezone = () => {
        if (this.selectedLocation && this.selectedLocation?.Timezone) {
            this.displayTimezone = this.timeZones?.find(
                x => x.value == this.selectedLocation?.Timezone
            )?.text;
        }
    };

    hasChanged = () => {
        this.hasChanges = this.dataHasChanged;
        return this.dataHasChanged;
    };

    getUsersByLocation = location => {
        /** default to zero before retrieving */
        this.userCount = 0;
        if (location && location?.LocationId) {
            this.locationServices
                ?.getUsers({ Id: location?.LocationId })
                .$promise.then(
                    res => {
                        this.userCount = res?.Value?.length;
                    },
                    () => {
                        this.toastrFactory.error(
                            {
                                Text: 'Failed to retrieve the {0} for {1}.',
                                Params: ['team members', 'location'],
                            },
                            'Error'
                        );
                    }
                );
        }
    };

    getRoomsByLocation = location => {
        if (location && location?.LocationId && this.hasTreatmentRoomsViewAccess) {
            this.isRoomsLoadingCompleted = false;
            this.locationServices
                .getRoomScheduleStatus({ locationId: location?.LocationId })
                .$promise.then(
                    scheduleRooms => {
                        const rooms = cloneDeep(this.selectedLocation.Rooms);
                        rooms.forEach(element => {
                            element.duplicate = false;
                            element.ObjectState = SaveStates?.None;
                            const item = scheduleRooms?.Value?.find(
                                x => x.RoomId == element?.RoomId
                            );
                            if (
                                (item && item?.HasRoomAppointments) ||
                                (item && item?.HasProviderRoomOccurrences)
                            ) {
                                element.hasAppointments = true;
                            } else {
                                element.hasAppointments = false;
                            }
                        });
                        // Check if Selected LocationId is null
                        if (!this.selectedLocation.LocationId) {
                            this.selectedLocation = this.originalLocation;
                        }
                        /** update rooms */
                        this.selectedLocation.Rooms = cloneDeep(rooms);
                        this.originalLocation.Rooms = cloneDeep(
                            this.selectedLocation?.Rooms
                        );
                        this.ofcLocation.Rooms = cloneDeep(this.selectedLocation?.Rooms);
                        this.selectedRooms = cloneDeep(this.selectedLocation?.Rooms);
                        this.selectedRooms = [...this.selectedRooms]; //Update selectedRooms array with latest record
                        this.isRoomsLoadingCompleted = true;
                    },
                    () => {
                        this.toastrFactory.error(
                            {
                                Text: 'Failed to retrieve the {0} for {1}.',
                                Params: ['rooms schedule status', 'location'],
                            },
                            'Error'
                        );
                        this.isRoomsLoadingCompleted = true;
                    }
                );
        }
    };

    getIdentifierByLocation = location => {
        if (
            location &&
            location?.LocationId &&
            this.hasAdditionalIdentifierViewAccess
        ) {
            this.locationServices
                ?.getAdditionalIdentifiers({ Id: location?.LocationId })
                .$promise?.then(
                    res => {
                        const orderPipe = new OrderByPipe();
                        const identifiers = orderPipe?.transform(res.Value, {
                            sortColumnName: 'Description',
                            sortDirection: 1,
                        });
                        /** add $duplicate property for validation on HTML */
                        identifiers?.forEach(element => {
                            element.duplicate = false;
                            element.ObjectState = SaveStates?.None;
                        });

                        /** update rooms */
                        this.selectedLocation.AdditionalIdentifiers =
                            cloneDeep(identifiers);
                        this.originalLocation.AdditionalIdentifiers =
                            cloneDeep(identifiers);
                        this.ofcLocation.AdditionalIdentifiers = cloneDeep(identifiers);
                        this.additionalIdentifiers = cloneDeep(identifiers);
                    },
                    () => {
                        this.toastrFactory.error(
                            {
                                Text: 'Failed to retrieve the {0} for {1}.',
                                Params: ['additional identifiers', 'location'],
                            },
                            'Error'
                        );
                    }
                );
        }
    };

    editFunc = () => {
        if (this.selectedLocation != null || this.selectedLocation != undefined) {
            this.editMode = true;
            this.isAdding = false;
            this.selectedRooms = [];
            const orderPipe = new OrderByPipe();
            this.selectedRooms = orderPipe?.transform(this.selectedLocation?.Rooms, {
                sortColumnName: 'Name',
                sortDirection: 1,
            });
            //Adding default value as true for hasAppointments to show delete button disable at initial load and will set actual value once getRoomsByLocation method execution done
            this.selectedRooms = cloneDeep(
                this.selectedRooms?.map(item => ({ ...item, hasAppointments: true }))
            );
            this.originalLocation = cloneDeep(this.selectedLocation);
            if (this.routeParams?.locationId > 0) {
                this.getRoomsByLocation(this.selectedLocation);
                this.getIdentifierByLocation(this.selectedLocation);
            }

            this.bindData();
        }
    };

    addFunc = () => {
        this.editMode = true;
        this.isAdding = true;
        this.initializeDefaultModel();
        this.originalLocation = cloneDeep(this.selectedLocation);
        this.bindData();
    };

    initializeDefaultModel = () => {
        let additionalIdentifier = [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        this.locationData.locationIdentifier?.pipe(take(1))?.subscribe(identifier => additionalIdentifier = identifier);
        this.selectedLocation = new Location(
            null, additionalIdentifier, false, null, null, null, null, null, null, null, null, false, null, null, null,
            false, false, false, false, false, 0, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, [], null, null, null, null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, false, null, false, null, null, null, null, [], false, null, 0, null, null, this.defaultPlaceOfTreatment,[]
        );
    }

    bindData = () => {
        this.createForm();
        this.createGroup();
        //Required to add detect changes at showing "change detection ng-touched" error while patching the value
        this.cd.detectChanges();
        this.frmLocationCrud.patchValue({
            RemitAddressSource: this.selectedLocation?.RemitAddressSource?.toString(),
        });
        this.frmLocationCrud.patchValue({
            InsuranceRemittanceAddressSource:
                this.selectedLocation?.InsuranceRemittanceAddressSource?.toString(),
        });
        this.frmLocationCrud.patchValue({
            RemitToState: this.selectedLocation?.RemitToState,
        });
        this.frmLocationCrud.patchValue({
            InsuranceRemittanceState: this.selectedLocation?.InsuranceRemittanceState,
        });
        this.frmLocationCrud.patchValue({
            DisplayCardsOnEstatement:
                this.selectedLocation?.DisplayCardsOnEstatement == true
                    ? 'true'
                    : 'false',
        });
        this.frmLocationCrud.patchValue({
            TaxonomyId: this.selectedLocation?.TaxonomyId,
        });
        this.frmLocationCrud.patchValue({
            AccountsOverDue:
                this.selectedLocation?.AccountsOverDue != null &&
                    this.selectedLocation?.AccountsOverDue != ''
                    ? Number(this.selectedLocation?.AccountsOverDue)
                    : null,
        });
        this.selectedLocInit();
        this.getLocationIdentifiers();
        this.setDefaultValues(this.selectedLocation);
        this.anyCardTypeSelected = this.isAnyCardTypeSelected(
            this.selectedLocation
        );

        if (this.selectedLocation) {
            this.selectedLocation.CardReaders = this.selectedLocation?.CardReaders ?? [];
            this.selectedLocation.CardReaders.forEach(element => {
                element.ObjectState = SaveStates?.None;});
            this.cardReaderList = cloneDeep(this.selectedLocation?.CardReaders) ?? [];
        }
        this.placeOfTreatmentFormControlUpdate();

    };

    placeOfTreatmentFormControlUpdate() {
        if (this.selectedLocation) {
            const isPlaceOfTreatmentCustom = !this.placeOfTreatmentList.find(x => x.code == this.selectedLocation.PlaceOfTreatment);
            if (isPlaceOfTreatmentCustom) {
                this.frmLocationCrud.patchValue({
                    PlaceOfTreatment: -1,
                    OtherPlaceOfTreatment: this.selectedLocation.PlaceOfTreatment.toString()
                });
                this.frmLocationCrud.controls['OtherPlaceOfTreatment'].enable();
            } else {
                this.frmLocationCrud.patchValue({
                    PlaceOfTreatment: this.selectedLocation.PlaceOfTreatment
                });
                this.frmLocationCrud.controls['OtherPlaceOfTreatment'].disable();
            }
        }
    }

    // need validate both location name line 1 and display as before saving
    saveFunc = () => {
        this.savingLocation = true;
        this.validateForm();
        this.selectedLocation.CardReaders = this.showCardReaders() ? (this.cardReaderList ?? []):this.deleteAllCardReaders();

        this.setAccountTokenOnSave(
            this.frmLocationCrud?.controls['PaymentProvider']?.value
        );
        this.disableAccountTokenInputOnSave(
            this.frmLocationCrud?.controls['PaymentProvider']?.value
        );

        const ofcLocation = this.selectedLocation;
        if (this.formIsValid) {
            this.locationServices
                .IsNameUnique({
                    Name: ofcLocation?.NameLine1,
                    ExcludeLocationId: ofcLocation?.LocationId
                        ? ofcLocation?.LocationId
                        : null,
                })
                .$promise.then(
                    res => {
                        this.saveCheckForUniqueLocationNameSuccess(res);
                    },
                    () => {
                        this.checkForUniqueLocationNameFailure();
                    }
                );
        } else {
            this.savingLocation = false;
            this.locationChanges = true;
        }
    };
    
    deleteAllCardReaders(){
        if(this.originalLocation?.CardReaders?.length){
           return this.originalLocation.CardReaders.map((obj:CardReader) => ({...obj, ObjectState: SaveStates.Delete}))
        }else{
            return null;
        }
    }
    saveLocationAfterUniqueChecks = () => {
        this.savingLocation = true;
        this.invalidDataForRx = false;
        const params = cloneDeep(this.selectedLocation);

        // part 2 of ie hack, see above
        if (params?.PrimaryPhone === this.phoneNumberPlaceholder) {
            params.PrimaryPhone = null;
        }
        if (params?.SecondaryPhone === this.phoneNumberPlaceholder) {
            params.SecondaryPhone = null;
        }
        if (params?.Fax === this.phoneNumberPlaceholder) {
            params.Fax = null;
        }
        if (params?.TaxId === this.taxIdPlaceholder) {
            params.TaxId = null;
        }

        params.ZipCode = params?.ZipCode?.replace(/-/g, '');

        if (params?.RemitToZipCode) {
            params.RemitToZipCode = params?.RemitToZipCode?.replace(/-/g, '');
        }

        if (params?.InsuranceRemittanceZipCode) {
            params.InsuranceRemittanceZipCode =
                params?.InsuranceRemittanceZipCode?.replace(/-/g, '');
        }

        // conversion from percentage to decimal for the back-end
        if (params?.ProviderTaxRate) {
            let provtaxRate = params?.ProviderTaxRate / 100;
            provtaxRate = +provtaxRate?.toFixed(6);
            params.ProviderTaxRate = provtaxRate;
        }
        if (params?.SalesAndUseTaxRate) {
            let salestaxRate = params?.SalesAndUseTaxRate / 100;
            salestaxRate = +salestaxRate.toFixed(6);
            params.SalesAndUseTaxRate = salestaxRate;
        }

        if (this.editMode && params?.LocationId && this.hasEditAccess) {
            if (!this.isActiveLoc && !this.defaultDate) {
                return false;
            }
            if (!this.isActiveLoc) {
                if (this.toUpdate || !this.isModify) {
                    params.DeactivationTimeUtc = this.defaultDate;
                } else {
                    params.DeactivationTimeUtc =
                        this.selectedLocation?.DeactivationTimeUtc;
                }
            } else {
                params.DeactivationTimeUtc = null;
            }

            const enterpriseId = this.locationService.getLocationEnterpriseId(params.LocationId);

            this.locationServices.updateFromEditLocation({ enterpriseId: enterpriseId }, params).$promise?.then(
                res => {
                    const msg = this.localize.getLocalizedString('Update successful.');
                    this.locationAddUpdateSuccess(res, msg);
                },
                error => {
                    const msg = this.localize.getLocalizedString(
                        'Update was unsuccessful. Please retry your save.'
                    );
                    this.locationAddUpdateFailure(error, msg);
                }
            );
        } else if (this.hasCreateAccess) {
            delete params?.LocationId;

            this.locationServices?.save(params).$promise?.then(
                res => {
                    const msg = this.localize.getLocalizedString(
                        'Your location has been created.'
                    );
                    this.locationAddUpdateSuccess(res, msg);
                },
                error => {
                    const msg = this.localize.getLocalizedString(
                        'There was an error and your location was not created.'
                    );
                    this.locationAddUpdateFailure(error, msg);
                }
            );
        }
        this.clearCacheFactoryCache('ServiceCodesService');
    };

    clearCacheFactoryCache = (cacheName: string) => {
        const cache = this.cacheFactory?.GetCache(
            cacheName,
            'aggressive',
            60000,
            60000
        );
        if (cache) this.cacheFactory?.ClearCache(cache);
    };

    cancelFunc = () => {
        if (!this.selectedLocation?.LocationId) {
            if (this.selectedLocation?.FeeListId === 0) {
                if (this.originalLocation != null) {
                    this.originalLocation.FeeListId = 0;
                }
            }
        }

        if (this.originalLocation == null) {
            this.locationChanges = true;
        } else {
            // Fix (hack) on initial login additional property
            if (
                !this.originalLocation?.InsuranceRemittanceOtherLocationId &&
                this.selectedLocation?.InsuranceRemittanceOtherLocationId == 0
            ) {
                this.originalLocation.InsuranceRemittanceOtherLocationId = 0;
            }
            const controls = this.frmLocationCrud?.controls;
            Object?.keys(controls)?.forEach(key => {
                if (!this.locationChanges) {
                    if (controls[key].dirty == true) {
                        this.locationChanges = true;
                    }
                }
            });
        }

        if (!this.locationChanges) {
            this.selectedLocInit();
            this.editMode = false;
            this.cancelConfirmed();
        } else {
            this.modalFactory?.CancelModal()?.then(() => {
                this.confirmCancel(), () => this.selectedLocInit();
            });
        }
    };

    confirmCancel = () => {
        this.selectedLocInit();
        /** need to change the location now */
        const ofcLocation = cloneDeep(this.selectedLocation);
        ofcLocation.DefaultFinanceCharge =
            this.originalLocation?.DefaultFinanceCharge;
        this.getUsersByLocation(ofcLocation);
        this.getRoomsByLocation(ofcLocation);
        this.getIdentifierByLocation(ofcLocation);
        this.setDefaultValues(ofcLocation);
        this.originalLocation = cloneDeep(ofcLocation);
        this.selectedLocation = cloneDeep(ofcLocation);
        this.setDisplayTimezone();
        this.setOldTaxRate(this.selectedLocation);
        /** reset the flag */
        this.updateDataHasChangedFlag(true);
        this.hasChanges = false;
        this.editMode = false;
        this.cancelConfirmed();
    };

    // check for unique location name before saving
    saveCheckForUniqueLocationNameSuccess = successResponse => {
        const isUnique = successResponse?.Value;

        if (isUnique != null) {
            if (isUnique == true) {
                if (this.selectedLocation?.NameAbbreviation > '') {
                    this.locationNameIsUnique = true;

                    this.locationServices
                        ?.IsAbbreviatedNameUnique({
                            Name: this.selectedLocation?.NameAbbreviation,
                            ExcludeLocationId: this.selectedLocation?.LocationId
                                ? this.selectedLocation?.LocationId
                                : null,
                        })
                        .$promise.then(
                            res => {
                                this.saveCheckForUniqueDisplayNameSuccess(res);
                            },
                            () => {
                                this.checkForUniqueDisplayNameFailure();
                            }
                        );
                }
            } else {
                this.uniqueLocationServerMessage = this.localize.getLocalizedString(
                    'A location with this name already exists.'
                );
                this.locationNameIsUnique = false;
            }
        } else {
            this.savingLocation = false;
        }
    };

    // check for unique display name before saving
    saveCheckForUniqueDisplayNameSuccess = successResponse => {
        const isUnique = successResponse?.Value;
        if (isUnique != null) {
            if (isUnique == true) {
                this.displayNameIsUnique = true;
                this.validateRxClinic();
            } else {
                this.uniqueDisplayNameServerMessage = this.localize.getLocalizedString(
                    'A location with this display name already exists.'
                );
                this.displayNameIsUnique = false;
                this.savingLocation = false;
            }
        } else {
            this.savingLocation = false;
        }
    };

    // if they have left a bad value in the taxonomy combobox, clear it
    taxonomyIdBlur = value => {
        if (this.frmLocationCrud?.dirty) {
            let newValueIsInList = false;
            this.taxonomyCodesSpecialties?.forEach(item => {
                if (!newValueIsInList && value == item?.TaxonomyCodeId) {
                    newValueIsInList = true;
                }
            });
            if (!newValueIsInList) {
                this.selectedLocation.TaxonomyId = null;
            }
        }
    };

    async flushCaches() {
        this.referenceDataService.forceEntityExecution(
            this.referenceDataService.entityNames.locations
        );
        await this.locationService.refreshActiveLocations();
    }

    // location add/update success handler
    locationAddUpdateSuccess = (res, msg) => {
        this.editMode = false;
        this.toastrFactory.success(
            this.localize.getLocalizedString(msg),
            this.localize.getLocalizedString('Success')
        );
        this.flushCaches().then(_ => {
            this.savingLocation = false;
            this.updateDataHasChangedFlag(true);
            /** make sure we are ordering the rooms */
            const result = cloneDeep(res.Value);
            const orderPipe = new OrderByPipe();
            result.Rooms = orderPipe.transform(res?.Value?.Rooms, {
                sortColumnName: 'Name',
                sortDirection: 1,
            });
            /** add $duplicate property for validation on HTML */
            result?.Rooms.forEach(room => {
                room.duplicate = false;
                room.ObjectState = SaveStates?.None;
            });
            /** update location objects */
            this.ofcLocation = cloneDeep(res.Value);
            // location watch
            if (this.ofcLocation) {
                this.locationWatch(this.ofcLocation);
            }
            // location id watch
            if (this.ofcLocation?.LocationId) {
                this.locationIdWatch();
            }
            this.saveSuccessful(res.Value);
            this.setDefaultValues(result);
            this.originalLocation = cloneDeep(result);
            this.selectedLocation = cloneDeep(result);
            this.setDisplayTimezone();
            this.$rootScope.$broadcast('update-locations-dropdown', result);
            this.selectedLocInit();
            this.changeLocationUrl(this.ofcLocation.LocationId);            
            this.saveRxClinic(this.ofcLocation);            
        }, (error) => this.locationAddUpdateFailure(error, this.localize.getLocalizedString('There was an error handling the new location, please regresh the page')));
    };

    // location add/update failure handler
    locationAddUpdateFailure = (error, msg) => {
        if (
            error?.data?.InvalidProperties &&
            error?.data?.InvalidProperties?.length > 0
        ) {
            error?.data?.InvalidProperties?.forEach(v => {
                this.toastrFactory.error(
                    (v?.ValidationMessage as string) + '.',
                    this.localize.getLocalizedString('Server Error')
                );
            });
        } else {
            this.toastrFactory.error(
                this.localize.getLocalizedString(msg),
                this.localize.getLocalizedString('Server Error')
            );
        }
        this.savingLocation = false;
    };

    changeLocationUrl(locationId) {
        window.location.href =
            '#/BusinessCenter/PracticeSettings/Locations/' +
            '?locationId=' +
            encodeURIComponent(locationId);
    }

    // validating the form
    validateForm = () => {
        this.originalLocation = cloneDeep(this.selectedLocation);
        const ofcLocation = this.frmLocationCrud?.value;
        // Additional Identifiers
        for (
            let i = 0;
            i < this.originalLocation?.AdditionalIdentifiers?.length;
            i++
        ) {
            this.originalLocation.AdditionalIdentifiers[i].Value =
                this.addIdentifierGroup?.controls[
                    `${'AdditionalIdentifier_'}${String(i)}`
                ].value;
        }
        const rooms = this.selectedLocation?.Rooms;
        const feeListId = this.selectedLocation?.FeeListId;
        this.selectedLocation = ofcLocation;
        if (this.selectedLocation) {
            // Format values
            this.selectedLocation.DisplayCardsOnEstatement =
                this.frmLocationCrud?.controls?.DisplayCardsOnEstatement?.value ==
                    'true'
                    ? true
                    : false;
            this.selectedLocation.RemitAddressSource = Number(
                this.selectedLocation?.RemitAddressSource
            );
            this.selectedLocation.InsuranceRemittanceAddressSource = Number(
                this.selectedLocation?.InsuranceRemittanceAddressSource
            );
            this.selectedLocation.FeeListId =
                this.isAdding == true ? feeListId : feeListId;
            this.selectedLocation.TaxonomyId =
                this.frmLocationCrud?.controls['TaxonomyId'].value != null
                    ? this.isAdding == true
                        ? this.frmLocationCrud?.controls['TaxonomyId'].value.toString()
                        : this.frmLocationCrud?.controls['TaxonomyId'].value
                    : null;
            this.selectedLocation.IsPaymentGatewayEnabled =
                this.frmLocationCrud?.controls['EnableCreditDebitCard'].value != null
                    ? this.frmLocationCrud?.controls['EnableCreditDebitCard'].value
                    : null;
            this.selectedLocation.PaymentProvider = this.selectedLocation
                .IsPaymentGatewayEnabled
                ? this.frmLocationCrud?.controls['PaymentProvider'].value
                : null;
            this.selectedLocation.LocationId =
                this.routeParams?.locationId < 0
                    ? null
                    : Number(this.routeParams?.locationId);
            this.selectedLocation.AdditionalIdentifiers =
                this.originalLocation.AdditionalIdentifiers;
            this.selectedLocation.Rooms = rooms;

            const placeOfTreatmentDropdown: number = this.frmLocationCrud.controls['PlaceOfTreatment'].value;

            this.selectedLocation.PlaceOfTreatment = placeOfTreatmentDropdown == -1 ?
                parseInt(this.frmLocationCrud.controls['OtherPlaceOfTreatment'].value) : this.frmLocationCrud.controls['PlaceOfTreatment'].value;

            // Remove properties before sending it to Api
            delete this.selectedLocation.isActiveLoc;
            if (!this.isAdding) {
                this.selectedLocation.DataTag = this.originalLocation.DataTag;
                this.selectedLocation.DateModified = this.originalLocation.DateModified;
                this.selectedLocation.UserModified = this.originalLocation.UserModified;
                this.selectedLocation.IsRxRegistered =
                    this.originalLocation.IsRxRegistered;
                this.selectedLocation.ImageFile = this.originalLocation.ImageFile;
                this.selectedLocation.LogoFile = this.originalLocation.LogoFile;
            }
        }
        this.formIsValid = true;
        let roomRequired = false;
        for (let i = 0; i < ofcLocation?.Rooms?.length; i++) {
            if (
                ofcLocation?.Rooms[i]?.Name == null ||
                ofcLocation?.Rooms[i]?.Name == ''
            ) {
                if (ofcLocation?.Rooms[i]?.ObjectState == SaveStates?.Add) {
                    ofcLocation?.Rooms?.splice(i, 1);
                } else {
                    roomRequired = true;
                }
            }
        }
        const roomDuplicates = ofcLocation?.Rooms?.forEach(
            x => x.duplicate == true
        );
        if (!ofcLocation.Rooms) ofcLocation.Rooms = [];
        ofcLocation.Rooms.valid = !roomRequired && !roomDuplicates;

        if (
            ofcLocation &&
            this.frmLocationCrud?.valid &&
            ofcLocation?.State &&
            this.locationNameIsUnique &&
            this.displayNameIsUnique &&
            ofcLocation?.Rooms?.valid
        ) {
            this.formIsValid = true;
        } else {
            this.formIsValid = false;
        }
        const maxMinimumFinanceChargeValue = 999999.99;
        if (
            ofcLocation?.MinimumFinanceCharge !== null &&
            ofcLocation?.MinimumFinanceCharge !== '' &&
            (ofcLocation?.MinimumFinanceCharge <= 0 ||
                ofcLocation?.MinimumFinanceCharge > maxMinimumFinanceChargeValue)
        ) {
            this.formIsValid = false;
        }
        if (
            ofcLocation?.DefaultFinanceCharge &&
            !ofcLocation?.AccountsOverDue?.toString()
        ) {
            this.formIsValid = false;
        }
        const maxDefaultFinanceChargeValue = 99.99;
        if (
            ofcLocation?.DefaultFinanceCharge !== null &&
            ofcLocation?.DefaultFinanceCharge !== '' &&
            (ofcLocation?.DefaultFinanceCharge <= 0 ||
                ofcLocation?.DefaultFinanceCharge > maxDefaultFinanceChargeValue)
        ) {
            this.formIsValid = false;
        }
        if (ofcLocation?.PaymentProvider === PaymentProvider.OpenEdge) {
            if (
                ofcLocation?.IsPaymentGatewayEnabled &&
                (ofcLocation?.MerchantId === null || ofcLocation?.MerchantId === '')
            ) {
                this.formIsValid = false;
            }
        }
        if (
            ofcLocation?.PaymentProvider !== null &&
            ofcLocation?.PaymentProvider !== PaymentProvider.OpenEdge
        ) {
            if (
                ofcLocation?.IsPaymentGatewayEnabled &&
                (ofcLocation?.PaymentProviderAccountCredential === null ||
                    ofcLocation?.PaymentProviderAccountCredential === '')
            ) {
                this.formIsValid = false;
            }
        }

        if (
            ofcLocation?.DisplayCardsOnEstatement &&
            !ofcLocation?.AcceptMasterCardOnEstatement &&
            !ofcLocation?.AcceptDiscoverOnEstatement &&
            !ofcLocation?.AcceptVisaOnEstatement &&
            !ofcLocation?.AcceptAmericanExpressOnEstatement
        ) {
            this.formIsValid = false;
        }

        if (
            !ofcLocation?.DisplayCardsOnEstatement &&
            (ofcLocation?.AcceptMasterCardOnEstatement ||
                ofcLocation?.AcceptDiscoverOnEstatement ||
                ofcLocation?.AcceptVisaOnEstatement ||
                ofcLocation?.AcceptAmericanExpressOnEstatement ||
                ofcLocation?.IncludeCvvCodeOnEstatement)
        ) {
            this.formIsValid = false;
        }
        if (
            ofcLocation?.InsuranceRemittanceAddressSource &&
            ofcLocation?.InsuranceRemittanceAddressSource?.toString() === '2'
        ) {
            if (
                this.frmLocationCrud?.controls['InsuranceRemittanceNameLine1']?.errors
                    ?.required
            )
                angular.element('#inpRemitInsToNameLine1').focus();
            else if (
                this.frmLocationCrud?.controls['InsuranceRemittanceAddressLine1']
                    ?.errors?.required
            )
                angular.element('#inpRemitInsToAddressLine1').focus();
            else if (
                this.frmLocationCrud?.controls['InsuranceRemittanceCity']?.errors
                    ?.required
            )
                angular.element('#inpRemitInsToCity').focus();
            else if (!ofcLocation?.InsuranceRemittanceState) {
                $($('#inpRemitInsToState .k-widget.k-dropdown').find('select')[0])
                    .data('kendoDropDownList')
                    .focus();
                this.formIsValid = false;
            } else if (
                this.frmLocationCrud?.controls['InsuranceRemittanceZipCode']?.errors
                    ?.required
            )
                angular.element('#inpRemitInsToZipCode').focus();
            else if (
                !this.frmLocationCrud?.controls['InsuranceRemittanceTaxId']?.valid
            )
                angular.element('#inpEditRemitInsTaxId').focus();
            else if (
                !ofcLocation?.InsuranceRemittanceTypeTwoNpi ||
                ofcLocation?.InsuranceRemittanceTypeTwoNpi?.length !== 10
            )
                angular.element('#inpEditRemitInsBillingEntityNPI').focus();
            else if (
                !this.frmLocationCrud?.controls['InsuranceRemittanceLicenseNumber']
                    ?.valid
            )
                angular.element('#inpEditRemitInsLicenseNumber').focus();
        }
    };

    authAccess = () => {
        this.authViewAccess();
        this.authCreateAccess();
        this.authEditAccess();

        if (!this.hasViewAccess) {
            this.toastrFactory.error(
                this.localize.getLocalizedString(
                    'User is not authorized to access this area.'
                ),
                this.localize.getLocalizedString('Not Authorized')
            );
            this.$location.path(encodeURIComponent('/'));
        }
    };

    // view access
    authViewAccess = () => {
        this.hasViewAccess = this.patSecurityService.IsAuthorizedByAbbreviation(
            'soar-biz-bizloc-view'
        );
    };

    // create access
    authCreateAccess = () => {
        this.hasCreateAccess = this.patSecurityService.IsAuthorizedByAbbreviation(
            'soar-biz-bizloc-add'
        );
    };

    // edit access
    authEditAccess = () => {
        this.hasEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation(
            'soar-biz-bizloc-edit'
        );
    };

    confirmNoRxAccessOnSave = () => {
        const message = this.localize.getLocalizedString('{0}\n\n {1}', [
            'Rx access requires Primary Phone and Fax.',
            'Would you like to add these before continuing?',
        ]);
        const title = this.localize.getLocalizedString('Confirm before saving');
        const button2Text = this.localize.getLocalizedString('No');
        const button1Text = this.localize.getLocalizedString('Yes');
        this.modalFactory
            .ConfirmModal(title, message, button1Text, button2Text)
            .then(
                () => {},
                () => this.resumeSave()
            );
    };

    resumeSave = () => {
        this.saveLocationAfterUniqueChecks();
    };

    // location must have phone and fax to have rx access
    validateRxClinic = () => {
        if (
            !this.selectedLocation?.NameLine1 ||
            !this.selectedLocation?.City ||
            !this.selectedLocation?.AddressLine1 ||
            !this.selectedLocation?.State ||
            !this.selectedLocation?.ZipCode ||
            !this.selectedLocation?.Fax ||
            !(this.selectedLocation?.Fax != null) ||
            !this.selectedLocation?.PrimaryPhone ||
            !(this.selectedLocation?.PrimaryPhone != null)
        ) {
            this.addRxClinic = false;
            // confirm that they want to save without phone and fax
            this.confirmNoRxAccessOnSave();
        } else {
            this.addRxClinic = true;
            this.saveLocationAfterUniqueChecks();
        }
    };

    // template for clinic save
    createRxLocation = location => {
        const formattedZipCode = this.zipCode.transform(location.ZipCode);
        // get the application id
        const userContext = JSON.parse(sessionStorage?.getItem('userContext'));
        const applicationId = userContext?.Result?.Application?.ApplicationId;
        const rxLocation = {
            Name: location?.NameLine1,
            ApplicationId: applicationId,
            Fax: location?.Fax,
            Address1: location?.AddressLine1,
            Address2: location?.AddressLine2,
            City: location?.City,
            State: location?.State,
            PostalCode: formattedZipCode,
            Phone: location?.PrimaryPhone,
        };
        return rxLocation;
    };

    saveRxClinic = location => {
        if (this.hasCreateAccess && this.addRxClinic) {
            const rxLocation = this.createRxLocation(location);
            this.rxService?.saveRxClinic(location, rxLocation)?.then(
                () => {
                    this.saveRxClinicSuccess();
                },
                () => {
                    this.saveRxClinicFailed();
                }
            );
            this.addRxClinic = false;
        }
    };

    saveRxClinicSuccess = () => {
        this.invalidDataForRx = false;
    };

    saveRxClinicFailed = () => {
        // show rx message
        this.invalidDataForRx = true;
    };

    locationWatch = nv => {
        // location watch
        if (nv) {
            const ofcLocation = cloneDeep(nv);
            if (
                !this.selectedLocation ||
                !this.selectedLocation?.LocationId ||
                (ofcLocation &&
                    ofcLocation?.LocationId != this.selectedLocation?.LocationId)
            ) {
                /** user could have clicked another location, but has made changes */
                if (this.hasChanged()) {
                    this.cancelFunc();
                    return;
                } else {
                    /** we need to do a little logic override when cancelling out of an add location */
                    const isNewLocation =
                        ofcLocation != null ? !ofcLocation?.LocationId : true;
                    this.editMode = false;
                    this.cancelConfirmed(isNewLocation);
                }

                // set to edit mode if no location id is found and locations have been loaded.
                if (this.loadingLocations === false || !ofcLocation?.LocationId) {
                    //$scope.editMode = location.LocationId ? false : true;
                    this.editMode = false;
                    if (this.$location?.search()?.locationId != null) {
                        if (
                            this.$location?.search()?.locationId === -1 ||
                            this.$location?.search()?.locationId === '-1'
                        ) {
                            this.editMode = true;
                        }
                    }
                }

                if (this.editMode) {
                    document.title = 'Add a Location';
                }
                this.getUsersByLocation(ofcLocation);
                this.getRoomsByLocation(ofcLocation);
                this.getIdentifierByLocation(ofcLocation);
                if (ofcLocation) {
                    this.setDefaultValues(ofcLocation);
                }

                this.originalLocation = cloneDeep(nv);
                this.selectedLocation = cloneDeep(nv);
                if (this.selectedLocation) {
                    this.selectedLocInit();
                }

                this.setDisplayTimezone();

                if (
                    this.editMode &&
                    this.selectedLocation &&
                    !this.selectedLocation?.LocationId &&
                    this.routeParams?.locationId < 0 &&
                    !this.hasCreateAccess
                ) {
                    this.toastrFactory.error(
                        this.localize.getLocalizedString(
                            'User is not authorized to access this area.'
                        ),
                        this.localize.getLocalizedString('Not Authorized')
                    );
                    this.$location.path(encodeURIComponent('/'));
                }
                this.formIsValid = true;
            }
        }
        // End location watch
    };

    locationIdWatch = () => {
        this.invalidDataForRx = false;
        this.addRxClinic = true;
    };

    isAnyCardTypeSelected(selectedLocation) {
        if (selectedLocation) {
            let status = false;
            status =
                selectedLocation?.AcceptMasterCardOnEstatement ||
                selectedLocation?.AcceptDiscoverOnEstatement ||
                selectedLocation?.AcceptVisaOnEstatement ||
                selectedLocation?.AcceptAmericanExpressOnEstatement;
            return status;
        }
    }

    changeMasterCard(event) {
        this.selectedLocation.AcceptMasterCardOnEstatement = event?.target?.checked;
        this.frmLocationCrud?.controls['AcceptMasterCardOnEstatement']?.patchValue(
            this.selectedLocation?.AcceptMasterCardOnEstatement
        );
    }

    changeDiscoverCard(event) {
        this.selectedLocation.AcceptDiscoverOnEstatement = event?.target?.checked;
        this.frmLocationCrud?.controls['AcceptDiscoverOnEstatement']?.patchValue(
            this.selectedLocation?.AcceptDiscoverOnEstatement
        );
    }

    changeVisaCard(event) {
        this.selectedLocation.AcceptVisaOnEstatement = event?.target?.checked;
        this.frmLocationCrud?.controls['AcceptVisaOnEstatement']?.patchValue(
            this.selectedLocation?.AcceptVisaOnEstatement
        );
    }

    changeAmericanCard(event) {
        this.selectedLocation.AcceptAmericanExpressOnEstatement =
            event?.target?.checked;
        this.frmLocationCrud?.controls[
            'AcceptAmericanExpressOnEstatement'
        ]?.patchValue(this.selectedLocation?.AcceptAmericanExpressOnEstatement);
    }

    changeCvvCode(event) {
        this.selectedLocation.IncludeCvvCodeOnEstatement = event?.target?.checked;
        this.frmLocationCrud?.controls['IncludeCvvCodeOnEstatement']?.patchValue(
            this.selectedLocation?.IncludeCvvCodeOnEstatement
        );
    }

    setOldTaxRate = (location: Location) => {
        // conversion from percentage to decimal for as same as coming from backend
        if (location?.ProviderTaxRate) {
            let provtaxRate = location?.ProviderTaxRate / 100;
            provtaxRate = +provtaxRate?.toFixed(6);
            this.selectedLocation.ProviderTaxRate = provtaxRate;
        }
        if (location?.SalesAndUseTaxRate) {
            let salestaxRate = location?.SalesAndUseTaxRate / 100;
            salestaxRate = +salestaxRate.toFixed(6);
            this.selectedLocation.SalesAndUseTaxRate = salestaxRate;
        }
        this.originalLocation = cloneDeep(this.selectedLocation);
    };

    ngOnDestroy() {
        this.obs && this.obs?.unsubscribe();
        this.obs1 && this.obs1?.unsubscribe();
    }

    showBillingMessage = billingModel => {
        let alertMessage = null;

        if (
            billingModel == BillingModel.ProviderFee ||
            billingModel == BillingModel.FixedPracticeFee
        ) {
            alertMessage =
                'Adding a Location requires additional setup for eServices and Imaging. Please contact the Patterson Technology Center at (866) 590-3384 | Press 2 for Sales.';
        } else if (
            billingModel == BillingModel.LocationFee ||
            billingModel == BillingModel.FixedLocationFee
        ) {
            alertMessage =
                'Adding a Location incurs an increase in the Practice monthly subscription fee and requires additional setup for eServices and Imaging.  Please contact the Patterson Technology Center at (866) 590-3384 | Press 2 for Sales.';
        }

        if (alertMessage) {
            if (this.confirmationModalData) {
                this.confirmationModalData.header
                    = billingModel == BillingModel.ProviderFee || billingModel == BillingModel.FixedPracticeFee
                        ? this.localize?.getLocalizedString('Notice - Activate Location Services')
                        : this.localize?.getLocalizedString('Notice - Monthly Subscription Fee Increase');

                this.confirmationModalData.message =
                    this.localize?.getLocalizedString(alertMessage);
                this.confirmationModalData.confirm =
                    billingModel == BillingModel.LocationFee ||
                        billingModel == BillingModel.FixedLocationFee
                        ? this.localize?.getLocalizedString('Acknowledge')
                        : this.localize?.getLocalizedString('Ok');
                this.confirmationModalData.cancel =
                    billingModel == BillingModel.LocationFee ||
                        billingModel == BillingModel.FixedLocationFee
                        ? this.localize?.getLocalizedString('Cancel')
                        : null;
                this.confirmationModalData.height = 200;
                this.confirmationModalData.width = 800;
            }

            if (this.isAdding) {
                if (!this.affirmedSubscription) {
                    if (this.confirmationModalData) {
                        const data = this.confirmationModalData;
                        this.confirmProviderTypeConfirmationRef =
                            this.confirmationModalService?.open({ data });
                        this.confirmProviderTypeSubscription =
                            this.confirmProviderTypeConfirmationRef?.events
                                ?.pipe(
                                    filter(event => !!event),
                                    filter(event => {
                                        return event.type === 'confirm' || event.type === 'close';
                                    }),
                                    take(1)
                                )
                                .subscribe(events => {
                                    switch (events?.type) {
                                        case 'confirm':
                                            this.affirmedSubscription = true;
                                            this.confirmProviderTypeConfirmationRef?.close();
                                            break;
                                        case 'close':
                                            this.selectedLocInit();
                                            this.editMode = false;
                                            this.cancelConfirmed();
                                            this.confirmProviderTypeConfirmationRef?.close();
                                            break;
                                    }
                                });
                    }
                }
            }
        }
    };

    addCardReader = () => {
        this.dialog = this.dialogService.open({
            appendTo: this.containerRef,
            content: CardReaderComponent,
        });
        this.dialog.content.instance.cardReaderList = this.cardReaderList;
        this.dialog.result.pipe(take(1)).subscribe((result) => {
            if(result){
                this.cardReaderChange(result)  
            }      
         });
    };
    
    cardReaderChange(obj){
        let cardReader = new CardReader();
        switch (obj?.ObjectState) {
            case 'Add':     
                cardReader = Object.assign(cardReader,obj)
                this.cardReaderList.push(cardReader);
                break;
            case 'Update':
                  obj.ObjectState = obj.PaymentIntegrationDeviceId ? SaveStates.Update:SaveStates.Add;
                  cardReader = Object.assign(cardReader,obj)
                 this.cardReaderList.splice(obj.rowIndex, 1, cardReader)
                 break;
            case 'Delete':{
                const index =this.cardReaderList.findIndex(
                x => x.PartnerDeviceId === obj.PartnerDeviceId
                );
                  if(obj.PaymentIntegrationDeviceId){
                   cardReader = Object.assign(cardReader,obj)
                    
                    this.cardReaderList.splice(index, 1, obj);
                  }else{
                    this.cardReaderList.splice(index, 1);
                  }
                }
                break ;   
        }
    }

    showCardReaders() {
        if (this.editMode) {
            return (
                this.showPaymentProvider &&
                this.frmLocationCrud.get('EnableCreditDebitCard').value &&
                this.frmLocationCrud.get('PaymentProvider').value ===
                PaymentProvider.TransactionsUI
            );
        } else {
            return (
                this.showPaymentProvider &&
                this.selectedLocation?.IsPaymentGatewayEnabled &&
                this.selectedLocation?.PaymentProvider ===
                PaymentProvider.TransactionsUI
            );
        }
    }

    selectPlaceOfTreatment(newValue: number) {
        if (newValue == -1) {
            this.frmLocationCrud.controls['OtherPlaceOfTreatment'].enable();
            this.frmLocationCrud.patchValue({
                OtherPlaceOfTreatment: ""
            });
        } else {
            this.frmLocationCrud.controls['OtherPlaceOfTreatment'].disable();
        }
    }

    updatePaymentProviderAccountCredentialDisableState() {
        if (this.selectedLocation?.IsPaymentGatewayEnabled && this.revealMaskAccountCredentials) {
          this.frmLocationCrud.controls['PaymentProviderAccountCredential'].enable();
        } else {
          this.frmLocationCrud.controls['PaymentProviderAccountCredential'].disable();
        }
    }

     revealMask(){    
        if(!this.revealMaskAccountCredentials){
            if( this.frmLocationCrud?.controls['PaymentProviderAccountCredential'].value === this.FAKE_MASK_ACCOUNT_CREDENTIALS){
                //give api call
                this.locationServices.
                getMerchantRegistrationAsync({ locationId: this.routeParams?.locationId }).$promise.then((res) => {
                   this.realAccountCredential = res.Value.MerchantCredentials
                   this.frmLocationCrud?.controls['PaymentProviderAccountCredential']?.setValue(this.realAccountCredential);
                   this.revealMaskAccountCredentials =!this.revealMaskAccountCredentials;
                   this.updatePaymentProviderAccountCredentialDisableState()
                });               
                
            }else{
                this.revealMaskAccountCredentials = !this.revealMaskAccountCredentials;
            }         
        }else{
            this.revealMaskAccountCredentials = !this.revealMaskAccountCredentials;
        }
        this.updatePaymentProviderAccountCredentialDisableState()
     }
   

    changePaymentProvider = (
        paymentProviderNumber: PaymentProvider
    ) => {
        this.setVisibilityWhenPaymentProviderChanged( paymentProviderNumber);
        if(this.selectedLocation.LocationId && this.selectedLocation.PaymentProvider === PaymentProvider.TransactionsUI && paymentProviderNumber === PaymentProvider.OpenEdge){
          this.warningGPIPaymentProviderChange(false);
        }

    }

    warningGPIPaymentProviderChange = (disablePaymentProvider: boolean) => {
        const message = this.localize.getLocalizedString('{0}\n\n {1}', [
            'This action will permanently remove your credit card provider account information and any credit card readers added for this location. This information will need to be added again in the future if you re-enable this service.',
            'Do you wish to continue?',
        ]);
        const title = this.localize.getLocalizedString('Warning');
        const button1Text = this.localize.getLocalizedString('Ok');
        const button2Text = this.localize.getLocalizedString('Cancel');
        this.modalFactory
            .ConfirmModal(title, message, button1Text, button2Text)
            .then(this.updateValueforGPIWarningModal(disablePaymentProvider), this.closeGPIWarningModals);
    };


    updateValueforGPIWarningModal = (disablePaymentProvider: boolean) => { 
       if( disablePaymentProvider)
        {
            this.frmLocationCrud?.controls['PaymentProvider']?.disable();
            this.frmLocationCrud?.controls['EnableCreditDebitCard']?.setValue(false);
            this.frmLocationCrud?.controls['MerchantId']?.disable();
            this.frmLocationCrud?.controls[
                'PaymentProviderAccountCredential'
            ]?.disable();

        }
       else{
            this.frmLocationCrud?.controls['PaymentProvider']?.enable();
        }
        
    };


    closeGPIWarningModals = () => {
        this.frmLocationCrud?.controls['PaymentProvider']?.setValue(
          this.selectedLocation.PaymentProvider
        );
        this.accountTokenInputHidden.OpenEdgeEnabled = this.selectedLocation.PaymentProvider === PaymentProvider.TransactionsUI ? true : false;
        this.accountTokenInputHidden.PaymentIntegrationEnabled = this.selectedLocation.PaymentProvider === PaymentProvider.TransactionsUI ? false : true;
        this.frmLocationCrud?.controls['EnableCreditDebitCard']?.setValue(true);
        this.frmLocationCrud?.controls['PaymentProvider']?.enable();
        this.updatePaymentProviderAccountCredentialDisableState()
    };
}

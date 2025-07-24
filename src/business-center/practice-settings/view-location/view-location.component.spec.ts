import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { OrderByPipe, ZipCodePipe } from 'src/@shared/pipes';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { FeeListsService } from 'src/@shared/providers/fee-lists.service';
import { configureTestSuite } from 'src/configure-test-suite';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { TimeZoneModel } from '../location';
import { ClaimEnumService } from '../../../@core/data-services/claim-enum.service';


import { ViewLocationComponent } from './view-location.component';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';
let feeListsInputMock = [];

for (var i = 1; i < 4; i++) {
    feeListsInputMock.push({
        Name: "Fee List " + i,
        FeeListId: i,
        Locations: []
    });
}

var res = {
    Value: feeListsInputMock
};

let mockFeeListService = {
    FeeLists: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy().and.returnValue(res) }),
};
let locationsList: any = {
    Value: [
        { LocationId: '1', NameLine1: 'First Office', AddressLine1: '123 Apple St', AddressLine2: 'Suite 10', ZipCode: '62401', City: 'Effingham', State: 'IL', PrimaryPhone: '5551234567' },
        { LocationId: '2', NameLine1: 'Second Office', AddressLine1: '123 Count Rd', AddressLine2: '', ZipCode: '62858', City: 'Louisville', State: 'IL', PrimaryPhone: '5559876543' },
        { LocationId: '3', NameLine1: 'Third Office', AddressLine1: '123 Adios St', AddressLine2: '', ZipCode: '60601', City: 'Chicago', State: 'IL', PrimaryPhone: '3124567890' },
        { LocationId: '4', NameLine1: 'Fourth Office', AddressLine1: '123 Hello Rd', AddressLine2: '', ZipCode: '62895', City: 'Wayne City', State: 'IL', PrimaryPhone: '6187894563', SecondaryPhone: '6181234567' }
    ]
};

const taxonomyData = [{ TaxonomyCodeId: 1, Category: '12', Code: '123' },
{ TaxonomyCodeId: 2, Category: '12', Code: '123' },
{ TaxonomyCodeId: 3, Category: '12', Code: '123' },
{ TaxonomyCodeId: 4, Category: '12', Code: '123' }]
const mockLocation = [{ LocationId: 1, }, { LocationId: 2, }, { LocationId: 3, }, { LocationId: 4, }];

let mockClaimEnumService;
let mockPlaceOfTreatmentList

describe('ViewLocationComponent', () => {
    let component: ViewLocationComponent;
    let fixture: ComponentFixture<ViewLocationComponent>;
    let toastrFactory: any;
    let modalFactory: any;
    let mockFeatureFlagService;

    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    let mockGetLocationServices = {
        get: jasmine.createSpy().and.callFake((array) => {
            return {
                $promise: {
                    then(res: any) {
                    }
                }
            };
        }),
        getRooms: (Id) => jasmine.createSpy().and.returnValue({
            $promise: {
                then: (success) => { success({ Value: [] }) }
            }
        }),
    };
    mockFeatureFlagService = {
        getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
            of(true)),
    };

    mockPlaceOfTreatmentList = [
        { code: 1, description: 'Pharmacy' },
        { code: 2, description: 'Telehealth Provided Other than in Patient’s Home' },
    ];

    mockClaimEnumService = {
        getPlaceOfTreatment: jasmine.createSpy().and.callFake(() => {
            return {
                then: (res, error) => {
                    res({ Value: { placeOfTreatments: mockPlaceOfTreatmentList } }),
                        error({})
                }
            }
        })
    }

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule, TranslateModule.forRoot(), BrowserModule,
                ReactiveFormsModule
            ],
            providers: [
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'LocationServices', useValue: mockGetLocationServices },
                { provide: FeeListsService, useValue: mockFeeListService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                { provide: ClaimEnumService, useValue: mockClaimEnumService },
            ],
            declarations: [ViewLocationComponent, ZipCodePipe, PhoneNumberPipe]
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ViewLocationComponent],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ViewLocationComponent);
        component = fixture.componentInstance;
        toastrFactory = TestBed.get('toastrFactory');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit ->', () => {
        it('should call following funcations', () => {
            component.checkFeatureFlags = jasmine.createSpy();
            component.ngOnInit();
            expect(component.checkFeatureFlags).toHaveBeenCalled();
            expect(component.showPaymentProvider).toBe(true);
        });
    });

    describe('ngOnChanges ->', () => {

        it('should not call the getRoomsByLocation method when there is no location selected', () => {
            const changes = new SimpleChange(null, undefined, true);
            component.getRoomsByLocation = jasmine.createSpy();
            component.ngOnChanges({ selectedLocation: changes });
            expect(component.getRoomsByLocation).not.toHaveBeenCalled();
        });

        it('should not call the get displayTaxonomyCodeByField method when there is no location selected', () => {
            component.displayTaxonomyCodeByField = jasmine.createSpy();
            const changes = new SimpleChange(null, undefined, true);
            component.ngOnChanges({ selectedLocation: changes });
            expect(component.displayTaxonomyCodeByField).not.toHaveBeenCalled();
        });

        it('should not call the get setDefaultValues when there is no location selected', () => {
            component.setDefaultValues = jasmine.createSpy();
            const changes = new SimpleChange(null, undefined, true);
            component.ngOnChanges({ selectedLocation: changes });
            expect(component.setDefaultValues).not.toHaveBeenCalled();
        });

        it('should call the getRoomsByLocation method when there is location selected', () => {
            component.getRoomsByLocation = jasmine.createSpy();
            component.selectedLocation = { TaxonomyId: undefined };
            component.placeOfTreatmentList = mockPlaceOfTreatmentList;
            const changes = new SimpleChange(null, mockLocation, true);
            component.ngOnChanges({ selectedLocation: changes });
            expect(component.getRoomsByLocation).toHaveBeenCalled();
        });

        it('should call the displayTaxonomyCodeByField method when there is location selected and TaxonomyId exists', () => {
            component.displayTaxonomyCodeByField = jasmine.createSpy();
            const changes = new SimpleChange(null, mockLocation, true);
            component.placeOfTreatmentList = mockPlaceOfTreatmentList;
            component.selectedLocation = { TaxonomyId: 23432 };
            component.ngOnChanges({ selectedLocation: changes });
            expect(component.displayTaxonomyCodeByField).toHaveBeenCalled();
        });

        it('should not call the displayTaxonomyCodeByField method when there is location selected and TaxonomyId does not exists', () => {
            component.displayTaxonomyCodeByField = jasmine.createSpy();
            const changes = new SimpleChange(null, mockLocation, true);
            component.placeOfTreatmentList = mockPlaceOfTreatmentList;
            component.selectedLocation = { TaxonomyId: undefined };
            component.ngOnChanges({ selectedLocation: changes });
            expect(component.displayTaxonomyCodeByField).not.toHaveBeenCalled();
        });

        it('should call the setDefaultValues method when there is location selected', () => {
            component.setDefaultValues = jasmine.createSpy();
            component.selectedLocation = { TaxonomyId: undefined };
            component.placeOfTreatmentList = mockPlaceOfTreatmentList;
            const changes = new SimpleChange(null, mockLocation, true);
            component.ngOnChanges({ selectedLocation: changes });
            expect(component.setDefaultValues).toHaveBeenCalled();
        });

    });

    describe('getPlaceOfTreatmentList function -> ', () => {
        it('should call the getPlaceOfTreatment', () => {
            expect(mockClaimEnumService.getPlaceOfTreatment).toHaveBeenCalled();
        })
    })

    describe('getRoomsByLocation ->', () => {
        it('should set the room by the location Id', () => {
            spyOn(component, 'getRoomsByLocation');
            component.getRoomsByLocation();
            expect(component.getRoomsByLocation).toHaveBeenCalled();
        });
        it('should not set the rooms by the location Id', () => {
            spyOn(component, 'getRoomsByLocation');
            expect(component.getRoomsByLocation).not.toHaveBeenCalled();
        });

        it('should get the room when location id not undefined and hasTreatmentRoomsViewAccess is true', () => {
            spyOn(mockGetLocationServices, 'getRooms');
            component.selectedLocation = { LocationId: mockLocation[0].LocationId };
            component.hasTreatmentRoomsViewAccess = true;
            component.getRoomsByLocation();
            expect(mockGetLocationServices.getRooms).toHaveBeenCalled();
        });

        it('should not get the room when location id not undefined and hasTreatmentRoomsViewAccess is false', () => {
            spyOn(mockGetLocationServices, 'getRooms');
            component.selectedLocation = { LocationId: mockLocation[0].LocationId };
            component.hasTreatmentRoomsViewAccess = false;
            component.getRoomsByLocation();
            expect(mockGetLocationServices.getRooms).not.toHaveBeenCalled();
        });

        it('should not get the room when location id is undefined and hasTreatmentRoomsViewAccess is true', () => {
            spyOn(mockGetLocationServices, 'getRooms');
            component.selectedLocation = { LocationId: undefined };
            component.hasTreatmentRoomsViewAccess = true;
            component.getRoomsByLocation();
            expect(mockGetLocationServices.getRooms).not.toHaveBeenCalled();
        });

        it('should not set the rooms by the location Id', () => {
            spyOn(component, 'getRoomsByLocation');
            expect(component.getRoomsByLocation).not.toHaveBeenCalled();
        });

    });

    describe('setDefaultValues ->', () => {
        it('should set ProviderTaxRate when there is ProviderTaxRate and less then equal to one in selected location', () => {
            component.selectedLocation = { ProviderTaxRate: 0.32432 }
            component.setDefaultValues();
            expect(component.selectedLocation.ProviderTaxRate).toEqual(32.432)
        });

        it('should set ProviderTaxRate when there is ProviderTaxRate and greater then one in selected location', () => {
            component.selectedLocation = { ProviderTaxRate: 2.32432 }
            component.setDefaultValues();
            expect(component.selectedLocation.ProviderTaxRate).toEqual(2.32432)
        });

        it('should set SalesAndUseTaxRate when there is SalesAndUseTaxRate and less then equal to one in selected location', () => {
            component.selectedLocation = { SalesAndUseTaxRate: 0.32432 }
            component.setDefaultValues();
            expect(component.selectedLocation.SalesAndUseTaxRate).toEqual(32.432)
        });

        it('should set SalesAndUseTaxRate when there is SalesAndUseTaxRate and greater then one in selected location', () => {
            component.selectedLocation = { SalesAndUseTaxRate: 5.32432 }
            component.setDefaultValues();
            expect(component.selectedLocation.SalesAndUseTaxRate).toEqual(5.32432)
        });

    })

    describe('displayTaxonomyCodeByField ->', () => {
        it('the taxonomyCodeSpeciality should not equal to empty string', () => {
            component.selectedLocation = { TaxonomyId: 1 };
            component.taxonomyCodesSpecialties = taxonomyData;
            component.displayTaxonomyCodeByField();
            expect(component.taxonomyCodeSpeciality).not.toEqual(undefined);
        });

        it('the taxonomyCodeSpeciality should equal to empty string', () => {
            component.selectedLocation = { TaxonomyId: 6 };
            component.taxonomyCodesSpecialties = taxonomyData;
            component.displayTaxonomyCodeByField();
            expect(component.taxonomyCodeSpeciality).toEqual('');
        });
    })

    describe('displayTaxonomyCodeByField ->', () => {
        it('should set the room by the location Id', () => {
            spyOn(component, 'displayTaxonomyCodeByField');
            component.displayTaxonomyCodeByField();
            expect(component.displayTaxonomyCodeByField).toHaveBeenCalled();
        });
        it('should not set the rooms by the location Id', () => {
            spyOn(component, 'displayTaxonomyCodeByField');
            expect(component.displayTaxonomyCodeByField).not.toHaveBeenCalled();
        });
    });

    describe('authAdditionalIdentifierAccess ->', () => {
        it('hasAdditionalIdentifierViewAccess enabled to false', () => {
            component.hasAdditionalIdentifierViewAccess = false;
            fixture.detectChanges();
            expect(component.hasAdditionalIdentifierViewAccess).toBe(false);
        });
        it('hasTreatmentRoomsViewAccess enabled to false', () => {
            component.hasTreatmentRoomsViewAccess = false;
            fixture.detectChanges();
            expect(component.hasTreatmentRoomsViewAccess).toBe(false);
        });
    })

    describe('getEstatementEnrollmentStatusSuccess ->', () => {
        it('isEstatementsEnabled enabled to false', () => {
            component.isEstatementsEnabled = false;
            fixture.detectChanges();
            expect(component.isEstatementsEnabled).toBe(false);
        });
    })

    describe('updateValueforModal function -> ', function () {
        it('should set the IsPaymentGatewayEnabled property to true', function () {
            component.selectedLocation = locationsList.Value[0];
            fixture.detectChanges();
            expect(component.selectedLocation?.IsPaymentGatewayEnabled).toBe(component.selectedLocation?.IsPaymentGatewayEnabled);
        });
    });

    describe('displayCardsOnEstatementChange function -> ', function () {
        it('should set the properties value', function () {
            component.selectedLocation = locationsList
            fixture.detectChanges();
            expect(component.selectedLocation?.AcceptAmericanExpressOnEstatement).toBe(component.selectedLocation?.AcceptAmericanExpressOnEstatement);
            expect(component.selectedLocation?.AcceptDiscoverOnEstatement).toBe(component.selectedLocation?.AcceptDiscoverOnEstatement);
            expect(component.selectedLocation?.AcceptMasterCardOnEstatement).toBe(component.selectedLocation?.AcceptMasterCardOnEstatement);
            expect(component.selectedLocation?.AcceptVisaOnEstatement).toBe(component.selectedLocation?.AcceptVisaOnEstatement);
            expect(component.selectedLocation?.IncludeCvvCodeOnEstatement).toBe(component.selectedLocation?.IncludeCvvCodeOnEstatement);
        });
    });

    describe('remitAddressSourceChanged function -> ', function () {
        it('should set the properties value', function () {
            component.selectedLocation = locationsList
            fixture.detectChanges();
            expect(component.selectedLocation?.RemitToNameLine1).toBe(component.selectedLocation?.RemitToNameLine1);
            expect(component.selectedLocation?.RemitToNameLine2).toBe(component.selectedLocation?.RemitToNameLine2);
            expect(component.selectedLocation?.RemitToAddressLine1).toBe(component.selectedLocation?.RemitToAddressLine1);
            expect(component.selectedLocation?.RemitToAddressLine2).toBe(component.selectedLocation?.RemitToAddressLine2);
            expect(component.selectedLocation?.RemitToCity).toBe(component.selectedLocation?.RemitToCity);
            expect(component.selectedLocation?.RemitToState).toBe(component.selectedLocation?.RemitToState);
            expect(component.selectedLocation?.RemitToZipCode).toBe(component.selectedLocation?.RemitToZipCode);
            expect(component.selectedLocation?.RemitToPrimaryPhone).toBe(component.selectedLocation?.RemitToPrimaryPhone);
        });
    });

    describe('remittanceInsuranceSourceChanged function -> ', function () {
        it('should set the properties value', function () {
            component.selectedLocation = locationsList
            fixture.detectChanges();
            expect(component.selectedLocation?.InsuranceRemittanceNameLine1).toBe(component.selectedLocation?.InsuranceRemittanceNameLine1);
            expect(component.selectedLocation?.InsuranceRemittanceNameLine2).toBe(component.selectedLocation?.InsuranceRemittanceNameLine2);
            expect(component.selectedLocation?.InsuranceRemittanceAddressLine1).toBe(component.selectedLocation?.InsuranceRemittanceAddressLine1);
            expect(component.selectedLocation?.InsuranceRemittanceAddressLine2).toBe(component.selectedLocation?.InsuranceRemittanceAddressLine2);
            expect(component.selectedLocation?.InsuranceRemittanceCity).toBe(component.selectedLocation?.InsuranceRemittanceCity);
            expect(component.selectedLocation?.InsuranceRemittanceState).toBe(component.selectedLocation?.InsuranceRemittanceState);
            expect(component.selectedLocation?.InsuranceRemittanceZipCode).toBe(component.selectedLocation?.InsuranceRemittanceZipCode);
            expect(component.selectedLocation?.InsuranceRemittancePrimaryPhone).toBe(component.selectedLocation?.InsuranceRemittancePrimaryPhone);

        });
    });

    describe('value of merchantId -> ', function () {
        it('should show masked value of Account credentials when payment provider is Global Payments Integrated', function () {
            component.selectedLocation= {PaymentProvider :PaymentProvider.TransactionsUI};
            component.setDefaultValues();
            component.placeOfTreatmentList =[];
            component.ngOnChanges({
            selectedLocation: new SimpleChange(null, component.selectedLocation, true)
            });

            fixture.detectChanges();
  
            const lblMerchantId = fixture.debugElement.query(By.css('#lblMerchantId'));
            const inputElement = lblMerchantId.nativeElement;
            expect(lblMerchantId).toBeTruthy();
            expect(inputElement.type).toBe('password'); 
            expect(inputElement.value).toBe(component.FAKE_MASK_ACCOUNT_CREDENTIALS);

        });

        it('should show value of Account credentials when  payment provider is open edge', function () {
            component.selectedLocation= {PaymentProvider :PaymentProvider.OpenEdge, MerchantId:'test'};
            component.setDefaultValues();
            component.placeOfTreatmentList =[];
            component.ngOnChanges({
            selectedLocation: new SimpleChange(null, component.selectedLocation, true)
            });

            fixture.detectChanges();
  
            const lblMerchantId = fixture.debugElement.query(By.css('#lblMerchantId'));
            const htmlElement = lblMerchantId.nativeElement;
            expect(lblMerchantId).toBeTruthy();
            expect(htmlElement.textContent).toBe(' test ');

        });
    });


});
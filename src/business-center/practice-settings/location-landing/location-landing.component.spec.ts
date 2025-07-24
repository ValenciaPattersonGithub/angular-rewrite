import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, SimpleChange } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

import { LocationLandingComponent } from './location-landing.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LocationIdentifierService } from 'src/@shared/providers/location-identifier.service';

const mockLocation = [{
    LocationId: 1,
    NameLine1: 'Test',
    NameLine2: 'Location',
    NameAbbreviation: null,
    Website: null,
    AddressLine1: null,
    AddressLine2: null,
    City: null,
    State: null,
    ZipCode: '30092',
    Email: "stmt@test.com",
    PrimaryPhone: null,
    SecondaryPhone: null,
    Fax: null,
    TaxId: null,
    TypeTwoNpi: null,
    TaxonomyId: null,
    Timezone: 'Central Standard Time',
    LicenseNumber: null,
    ProviderTaxRate: null,
    SalesAndUseTaxRate: null,
    Rooms: [],
    AdditionalIdentifiers: [],
    DefaultFinanceCharge: null,
    DeactivationTimeUtc: null,
    AccountsOverDue: null,
    MinimumFinanceCharge: null,
    MerchantId: null,
    RemitAddressSource: 0,
    RemitOtherLocationId: null,
    RemitToNameLine1: null,
    RemitToNameLine2: null,
    RemitToAddressLine1: null,
    RemitToAddressLine2: null,
    RemitToCity: null,
    RemitToState: null,
    RemitToZipCode: null,
    RemitToPrimaryPhone: null,
    DisplayCardsOnEstatement: false
}, {
    LocationId: 2,
    NameLine1: 'Miniphilisipe',
    NameLine2: 'Alaksa',
    NameAbbreviation: null,
    Website: null,
    AddressLine1: null,
    AddressLine2: null,
    City: null,
    State: null,
    ZipCode: '30092',
    Email: "stmt@test.com",
    PrimaryPhone: null,
    SecondaryPhone: null,
    Fax: null,
    TaxId: null,
    TypeTwoNpi: null,
    TaxonomyId: null,
    Timezone: 'Central Standard Time',
    LicenseNumber: null,
    ProviderTaxRate: null,
    SalesAndUseTaxRate: null,
    Rooms: [],
    AdditionalIdentifiers: [],
    DefaultFinanceCharge: null,
    DeactivationTimeUtc: null,
    AccountsOverDue: null,
    MinimumFinanceCharge: null,
    MerchantId: null,
    RemitAddressSource: 0,
    RemitOtherLocationId: null,
    RemitToNameLine1: null,
    RemitToNameLine2: null,
    RemitToAddressLine1: null,
    RemitToAddressLine2: null,
    RemitToCity: null,
    RemitToState: null,
    RemitToZipCode: null,
    RemitToPrimaryPhone: null,
    DisplayCardsOnEstatement: false
}, {
    LocationId: 3,
    NameLine1: 'Test',
    NameLine2: 'Aqrsm',
    NameAbbreviation: null,
    Website: null,
    AddressLine1: null,
    AddressLine2: null,
    City: null,
    State: null,
    ZipCode: '30092',
    Email: "stmt@test.com",
    PrimaryPhone: null,
    SecondaryPhone: null,
    Fax: null,
    TaxId: null,
    TypeTwoNpi: null,
    TaxonomyId: null,
    Timezone: 'Central Standard Time',
    LicenseNumber: null,
    ProviderTaxRate: null,
    SalesAndUseTaxRate: null,
    Rooms: [],
    AdditionalIdentifiers: [],
    DefaultFinanceCharge: null,
    DeactivationTimeUtc: null,
    AccountsOverDue: null,
    MinimumFinanceCharge: null,
    MerchantId: null,
    RemitAddressSource: 0,
    RemitOtherLocationId: null,
    RemitToNameLine1: null,
    RemitToNameLine2: null,
    RemitToAddressLine1: null,
    RemitToAddressLine2: null,
    RemitToCity: null,
    RemitToState: null,
    RemitToZipCode: null,
    RemitToPrimaryPhone: null,
    DisplayCardsOnEstatement: false
}, {
    LocationId: 4,
    NameLine1: 'Miniphilisipe',
    NameLine2: 'Alaksa',
    NameAbbreviation: null,
    Website: null,
    AddressLine1: null,
    AddressLine2: null,
    City: null,
    State: null,
    ZipCode: '30092',
    Email: "stmt@test.com",
    PrimaryPhone: null,
    SecondaryPhone: null,
    Fax: null,
    TaxId: null,
    TypeTwoNpi: null,
    TaxonomyId: null,
    Timezone: 'Central Standard Time',
    LicenseNumber: null,
    ProviderTaxRate: null,
    SalesAndUseTaxRate: null,
    Rooms: [],
    AdditionalIdentifiers: [],
    DefaultFinanceCharge: null,
    DeactivationTimeUtc: null,
    AccountsOverDue: null,
    MinimumFinanceCharge: null,
    MerchantId: null,
    RemitAddressSource: 0,
    RemitOtherLocationId: null,
    RemitToNameLine1: null,
    RemitToNameLine2: null,
    RemitToAddressLine1: null,
    RemitToAddressLine2: null,
    RemitToCity: null,
    RemitToState: null,
    RemitToZipCode: null,
    RemitToPrimaryPhone: null,
    DisplayCardsOnEstatement: false
}];

const tempMockLoation = [{
    LocationId: 111,
    NameLine1: 'Test',
    NameLine2: 'Location',
    NameAbbreviation: null,
    Website: null,
    AddressLine1: null,
    AddressLine2: null,
    City: null,
    State: null,
    ZipCode: '30092',
    Email: "stmt@test.com",
    PrimaryPhone: null,
    SecondaryPhone: null,
    Fax: null,
    TaxId: null,
    TypeTwoNpi: null,
    TaxonomyId: null,
    Timezone: 'Central Standard Time',
    LicenseNumber: null,
    ProviderTaxRate: null,
    SalesAndUseTaxRate: null,
    Rooms: [],
    AdditionalIdentifiers: [],
    DefaultFinanceCharge: null,
    DeactivationTimeUtc: null,
    AccountsOverDue: null,
    MinimumFinanceCharge: null,
    MerchantId: null,
    RemitAddressSource: 0,
    RemitOtherLocationId: null,
    RemitToNameLine1: null,
    RemitToNameLine2: null,
    RemitToAddressLine1: null,
    RemitToAddressLine2: null,
    RemitToCity: null,
    RemitToState: null,
    RemitToZipCode: null,
    RemitToPrimaryPhone: null,
    DisplayCardsOnEstatement: false
}];

let mockConditionsService = {
    get: () => {
        return {
            then: (success, error) => {
                success({ Value: mockLocation }),
                    error({
                        data: {
                            InvalidProperties: [{
                                PropertyName: "Description",
                                ValidationMessage: "Not Allowed"
                            }]
                        }
                    })
            }
        }
    }
};


describe('LocationLandingComponent', () => {
    let component: LocationLandingComponent;
    let fixture: ComponentFixture<LocationLandingComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    const mockLocationServices = {
        //get: jasmine.createSpy().and.callFake(() => retValue),
        get: jasmine.createSpy().and.returnValue({
            $promise: {
                then: (success, failure) => {
                    success({ Value: mockLocation });
                }
            }
        }),
    };

    let locationIdentifierList =
        [
            { DataTag: 'AAAAAAALtDw=', DateDeleted: null, DateModified: '2022-06-07T10:02:27.921738', Description: 'Test', MasterLocationIdentifierId: '16ca7326-0ae7-4f0f-be7d-16428b431c3b', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
            { DataTag: 'AAAAAAAL/o4=', DateDeleted: null, DateModified: '2022-06-19T07:19:49.5247696', Description: 'Test QA', MasterLocationIdentifierId: 'f5c40f16-ed83-4616-aaf5-8600d46d83c8', Qualifier: 4, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
            { DataTag: 'AAAAAAAL/pI="', DateDeleted: null, DateModified: '2022-06-19T07:22:40.6805857', Description: 'Test QA 1', MasterLocationIdentifierId: '1697c792-8780-4f1d-b5bd-739d46c4b492', Qualifier: 1, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
            { DataTag: 'AAAAAAAMAQM=', DateDeleted: null, DateModified: '2022-06-20T06:24:26.3819186', Description: 'Test QA 2', MasterLocationIdentifierId: '96307e38-a65d-410b-a333-9509bebf5064', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
        ];

    let mockLocationIdentifierService = {
        get: jasmine.createSpy().and.returnValue({
            $promise: {
                then: (success) => { success({ Value: locationIdentifierList }) }
            }
        }),
        save: (masterLocationIdentifier) => jasmine.createSpy().and.callFake(() => { }),
        locationIdentifier: (Id) => jasmine.createSpy().and.callFake(() => { }),
        delete: (Id) => jasmine.createSpy().and.callFake(() => { })
    };

    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    const mockLocalizeService = {
        getLocalizedString: () => 'translated text'
    };

    const mockservice = {
        IsAuthorizedByAbbreviation: (authtype: string) => { },
        getServiceStatus: () => new Promise((resolve, reject) => {
            // the resolve / reject functions control the fate of the promise
        }),
        isEnabled: () => new Promise((resolve, reject) => { }),
    };

    const mockRoute = {};

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'LocationServices', useValue: mockLocationServices },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'patSecurityService', useValue: mockservice },
                { provide: 'LocationIdentifierService', useValue: mockLocationIdentifierService },
                { provide: '$routeParams', useValue: mockRoute },
                { provide: LocationIdentifierService, useValue: mockConditionsService }
            ],
            declarations: [LocationLandingComponent],

        })
            .compileComponents().then(() => {
                fixture = TestBed.createComponent(LocationLandingComponent);
                component = fixture.componentInstance;
            });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LocationLandingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnChanges ->', () => {

        it('should not do anything if there is new value', () => {
            const changes = new SimpleChange(null, mockLocation, true);

            component.ngOnChanges({ selectedLocation: changes });
            //Do Nothing
        });

        it('should set isAdding to true if new value is undefined', () => {
            const changes = new SimpleChange(null, undefined, true);
            component.ngOnChanges({ selectedLocation: changes });
            expect(component.isAdding).toBe(true);
        });
    });

    describe('ngOnInit ->', async () => {
        beforeEach(() => {
            spyOn(component, 'getPageNavigation').and.callFake(() => { });
            spyOn(component, 'getLocations').and.callFake(() => { });
            spyOn(component, 'authAccess').and.callFake(() => { });
        });

        it('should call getPageNavigation ', () => {
            component.ngOnInit();
            expect(component.getPageNavigation).toHaveBeenCalled();
        });

        it('should call getLocations ', () => {
            component.ngOnInit();
            expect(component.getLocations).toHaveBeenCalled();
        });

        it('should call authAccess ', () => {
            component.ngOnInit();
            expect(component.authAccess).toHaveBeenCalled();
        });

        it('should set isAdding as true when not selected location', () => {
            component.selectedLocationId = -1;
            component.ngOnInit();
            expect(component.isAdding).toBe(true);
        })
    });

    describe('on Add location button click ->', async () => {
        it('should set isAdding true and call getLocationIdentifiers', () => {
            component.isAdding = false;
            component.isEditing = false;
            fixture.detectChanges();

            const buttonElement = fixture.debugElement.query(By.css('#btnAddLocation'));

            buttonElement.triggerEventHandler('click', null);

            fixture.detectChanges();

            fixture.whenStable().then(() => {
                component.hasAdditionalIdentifierAccess = true;
                expect(component.getLocationIdentifiers).toHaveBeenCalled();
                expect(component.isAdding).toBe(true);
            });
        });


    });

    describe('on Edit location button click ->', async () => {
        it('should set isEditing true, update title to "Edit Location" and call editLocation() ', () => {
            component.isAdding = false;
            component.isEditing = false;
            fixture.detectChanges();
            const buttonElement = fixture.debugElement.query(By.css('#btnEditLocation'));
            buttonElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(component.isEditing).toBe(true);
                expect(document.title.toString()).toEqual('Edit Location');
            });
        });
    });

    describe('on Cancel location adding/editing ->', async () => {
        it('should update title to "Locations" and call cancelAddEdit() ', () => {
            component.isEditing = true;
            fixture.detectChanges();

            const buttonElement = fixture.debugElement.query(By.css('#btnCancel'));
            buttonElement.triggerEventHandler('click', null);
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(document.title).toEqual("Locations");
            });
        });
    });

    describe('on Save location ->', async () => {
        it('should call saveLocation() ', () => {
            component.isEditing = true;
            fixture.detectChanges();

            const buttonElement = fixture.debugElement.query(By.css('#btnSaveLocation'));

            buttonElement.triggerEventHandler('click', null);
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(component.saveLocation).toHaveBeenCalled();
            });
        });

        it('should call onSaveSuccess() on successful location save', () => {
            component.onSaveSuccess(mockLocation[0]);
            component.selectedLocation = mockLocation[0];
        });

        it('should call onSaveSuccess() on successful location save and push new record', () => {

            component.onSaveSuccess(tempMockLoation[0]);
            component.selectedLocation = tempMockLoation[0];
        });

    });

    describe('getLocations ->', () => {
        it('should get the locations', () => {
            spyOn(component, 'locationIdentifiersGetSuccess').and.callFake(() => { });
            spyOn(component, 'locationIdentifiersGetFailure').and.callFake(() => { });
            const promise = mockLocationServices.get();
            component.getLocations();

            promise.$promise.then((res) => {
                expect(mockLocationServices.get).toHaveBeenCalled();
                component.locationsGetSuccess(res);
            }, (error) => {
                component.locationIdentifiersGetFailure();
            });

        });
    });

    describe('locationsGetSuccess ->', () => {
        it('should filter selected location data', () => {
            const promise = mockLocationServices.get();
            component.getLocations();
            promise.$promise.then((res) => {
                component.selectedLocationId = 1;
                component.locationsGetSuccess(res);
            });

        })
    });
    describe('getLocationIdentifiers ->', () => {
        it('should getLocationIdentifiers data', () => {
            component.hasAdditionalIdentifierAccess = true;
            const promise = mockLocationIdentifierService.get();
            component.getLocationIdentifiers();
            promise.$promise.then((res) => {
                expect(mockLocationIdentifierService.get).toHaveBeenCalled();
                component.locationIdentifiersGetSuccess(res);
            })
            mockLocationIdentifierService.get.and.callFake(() => Promise.reject('no'));
            component.locationIdentifiersGetFailure();
        })
    });


    describe('locationsGetFailure ->', () => {
        it('should show error message and set loadingLocations as false', () => {
            component.locationsGetFailure();
            expect(component.loadingLocations).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('locationIdentifiersGetFailure ->', () => {
        it('should show error message and set loading as false', () => {
            component.locationIdentifiersGetFailure();
            expect(component.loading).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('onCancelConfirm ->', () => {
        it('should set isAdding is false', () => {
            component.onCancelConfirm(false);
            expect(component.isAdding).toBe(false);
            expect(component.isEditing).toBe(false);
        })

        it('Cancel the confirmation box', () => {
            component.onCancelConfirm(true);
            expect(component.isEditing).toBe(false);
        })
    });

    describe('resetData ->', () => {
        it('should set dataForCrudOperation.DataHasChanged false', () => {
            component.resetData();
            expect(component.dataForCrudOperation.DataHasChanged).toBe(false);
        })
    });
});

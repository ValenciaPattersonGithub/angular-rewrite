import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EraLandingComponent } from './era-landing.component';
import { LocationChangeService } from 'src/@shared/providers/location-change.service';
import { SharedModule } from 'src/@shared/shared.module';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { SoarEraHttpService } from 'src/@core/http-services/soar-era-http.service';
import { of } from 'rxjs';
import { AccessBasedLocationSelectorComponent } from 'src/@shared/components/access-based-location-selector/access-based-location-selector.component';
import { SoarLocationHttpService } from 'src/@core/http-services/soar-location-http.service';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('EraLandingComponent', () => {
    let component: EraLandingComponent;
    let fixture: ComponentFixture<EraLandingComponent>;

    let mockPatSecurityService;
    let mockLocationService;
    let mockLocationServices;
    let mockEraService;
    let mockPaymentTypesService;
    let mockReferenceDataService
    let mockSoarLocationHttpService;
    let mockFeatureFlagService;

    beforeEach(() => {
        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
        };
        mockLocationService = {
            getCurrentLocation: jasmine.createSpy('LocationService.getCurrentLocation').and.returnValue({ id: 3, name: 'Location3', status: 'Inactive' })
        }
        mockLocationServices = {
            getPermittedLocations: jasmine.createSpy('LocationServices.getPermittedLocations').and.returnValue({ $promise: Promise.resolve({ Value: [{ LocationId: 3 }, { LocationId: 4 }] }) }),
            getLocationEraEnrollmentStatus: jasmine.createSpy('LocationServices.getLocationEraEnrollmentStatus').and.returnValue({ $promise: Promise.resolve({ Result: true }) })
        }
        mockEraService = {
            loadNewEras: jasmine.createSpy('SoarEraHttpService.loadNewEras').and.returnValue(of()),
        }
        mockPaymentTypesService = {
            getAllPaymentTypesMinimal: jasmine.createSpy('PaymentTypesService.getAllPaymentTypesMinimal').and.returnValue(Promise.resolve({ Value: [{ CurrencyTypeId: 2 }] }))
        }
        mockReferenceDataService = {
            getData: jasmine.createSpy().and.returnValue(Promise.resolve([
                { LocationId: 3, NameLine1: 'Location3' },
                { LocationId: 4, NameLine1: 'Location4' },
            ])),
            entityNames: { locations: 'locations' }
        }
        mockSoarLocationHttpService = {
            requestPermittedLocations: jasmine.createSpy('SoarLocationHttpService.requestPermittedLocations').and.returnValue(
                of({
                    Value: []
                })),
        };

        mockFeatureFlagService = {
            getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
        };
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EraLandingComponent, AccessBasedLocationSelectorComponent],
            providers: [
                { provide: '$location', useValue: {} },
                { provide: 'toastrFactory', useValue: {} },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AmfaInfo', useValue: { 'soar-ins-iclaim-view': 1 } },
                LocationChangeService,
                { provide: 'locationService', useValue: mockLocationService },
                { provide: 'LocationServices', useValue: mockLocationServices },
                { provide: SoarEraHttpService, useValue: mockEraService },
                { provide: SoarLocationHttpService, useValue: mockSoarLocationHttpService },
                { provide: PaymentTypesService, useValue: mockPaymentTypesService },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService }  
            ],
            imports: [
                SharedModule,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        });
    });

    beforeEach(waitForAsync(async () => {
        fixture = TestBed.createComponent(EraLandingComponent);
        component = fixture.componentInstance;
        mockFeatureFlagService.getOnce$.and.returnValue(of(false)); 
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }));

    describe('initialize', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
            expect(component.insurancePaymentTypes.length).toEqual(1);
            expect(component.loggedInLocation.id).toEqual(3);
            expect(component.selectedLocationIds.length).toEqual(1);
            expect(component.selectedLocationIds[0]).toEqual(3);
            expect(component.allowedLocations.length).toEqual(2);
            expect(Object.keys(component.allLocations).length).toEqual(2);
            expect(Object.values(component.allLocations)[0]).toEqual('Location3');
            expect(component.locationEnrolledInEra).toEqual(true);
            expect(component.initialLoading).toEqual(false);
            //expect(component.eras[0].PaymentString).toEqual('Other/1234');
            //expect(component.eras[0].items.length).toEqual(3);
            //expect(component.eras[0].EraClaimPayments[0].canView).toEqual(true);
            expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-acct-aipmt-view');
            expect(mockLocationService.getCurrentLocation).toHaveBeenCalled();
            expect(mockLocationServices.getPermittedLocations).toHaveBeenCalled();
            expect(mockLocationServices.getLocationEraEnrollmentStatus).toHaveBeenCalled();
            expect(mockPaymentTypesService.getAllPaymentTypesMinimal).toHaveBeenCalled();
            expect(mockReferenceDataService.getData).toHaveBeenCalled();
            expect(mockEraService.loadNewEras).not.toHaveBeenCalled();
        });
    });

    describe('showLocations', () => {
        let location3 = 'Location3',
            location4 = 'Location4';

        it('should display logged in location when location enrolled in era', () => {
            const element = fixture.debugElement.query(By.css('.loc-name'))?.nativeElement;
            expect(element).toBeTruthy();
            expect(element.textContent).toContain(location3);
            expect(component.loggedInLocation.id).toEqual(3);
            expect(component.loggedInLocation.name).toEqual(location3);
            expect(component.locationEnrolledInEra).toEqual(true);
        });

        it('should not display logged in location when location not enrolled in era', waitForAsync(async () => {
            mockLocationService.getCurrentLocation.and.returnValue({ id: 4, name: location4, status: 'Inactive' });
            mockLocationServices.getLocationEraEnrollmentStatus.and.returnValue({ $promise: { Result: false } });
            component.ngOnInit();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            const element = fixture.debugElement.query(By.css('.loc'));

            expect(element).toBeNull();
            expect(component.loggedInLocation.id).toEqual(4);
            expect(component.loggedInLocation.name).toEqual(location4);
            expect(component.locationEnrolledInEra).toEqual(false);
        }));
    });
    describe('onSelectedLocationChanged', () => {
        it('should set filteredLocations correctly', () => {
            let locations = [
                {
                    text: '3',
                    value: 3,
                    IsDisabled: false,
                    subcategory: ''
                },
                {
                    text: '4',
                    value: 4,
                    IsDisabled: false,
                    subcategory: ''
                }
            ];
            component.onSelectedLocationChanged(locations);

            expect(component.filteredLocations.length).toEqual(locations.length);
            expect(component.filteredLocations[1]).toEqual(locations[1].value);
        });

        it('should clear filteredLocation', () => {
            component.onSelectedLocationChanged([]);

            expect(component.filteredLocations.length).toEqual(0);
        });
    });
});

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { SoarLocationHttpService } from 'src/@core/http-services/soar-location-http.service';
import { LocationDto } from 'src/@core/models/location/location-dto.model';

import { AccessBasedLocationSelectorComponent } from './access-based-location-selector.component';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'app-multiselect',
    template: ''
})
export class MultiSelectComponent {
    @Input() id?: string;
    @Input() listItems: Array<{ text: string, value: number, IsDisabled?: boolean, subcategory?: string }>;
    @Input() placeholder: string;
    @Input() label?: string;
    @Input() labelDirection?: string;
    @Input() model: any[] = [];
    @Input() showSelectAll: boolean;
    @Input() customClass?: string;
    @Input() groupData?: boolean = false;
    @Input() disabled: boolean = false;
    @Output() modelChange = new EventEmitter<any>();
}

describe('AccessBasedLocationSelectorComponent', () => {
    let component: AccessBasedLocationSelectorComponent;
    const res = { Value:[] };
    let mockAmfaInfo= {
        'soar-acct-aipmt-add':{
            ActionId: 2205
        }
    };

    const mockLocations: LocationDto[] = [
        { LocationId: 1, NameLine1: 'First Office',NameLine2:'',  AddressLine1: '123 Apple St', AddressLine2: 'Suite 10', ZipCode: '62401', 
        City: 'Effingham', State: 'IL', PrimaryPhone: '5551234567', Timezone: '12', PracticeId: '12', TaxId: '' ,TypeTwoNpi: '', TaxonomyId: '', LicenseNumber: '', 
        ProviderTaxRate: 0, SalesAndUseTaxRate:  0, DefaultFinanceCharge :  0,MinimumFinanceCharge :  0,  MerchantId: '', IsPaymentGatewayEnabled: false,  
        IsRxRegistered: false, Selected: false, DeactivationTimeUtc: null, PaymentProviderAccountCredential: '',PaymentProvider:null
    },
        { LocationId: 2, NameLine1: 'Second Office', NameLine2:'', AddressLine1: '123 Count Rd', AddressLine2: '', ZipCode: '62858', City: 'Louisville', 
        State: 'IL', PrimaryPhone: '5559876543', Timezone: '12',  PracticeId: '12', TypeTwoNpi: '', TaxId: '', TaxonomyId: '', LicenseNumber: '', 
        ProviderTaxRate: 0, SalesAndUseTaxRate:  0, DefaultFinanceCharge :  0,MinimumFinanceCharge :  0,  MerchantId: '', IsPaymentGatewayEnabled: false,  
        IsRxRegistered: false, Selected: false, DeactivationTimeUtc: new Date(), PaymentProviderAccountCredential: '',PaymentProvider:null
    },]
    
    let mockSoarLocationHttpService= {        
        requestPermittedLocations: jasmine.createSpy('SoarEraHttpService.requestPermittedLocations').and.returnValue(
            of({
                Value: mockLocations
            }))
    };

    let fixture: ComponentFixture<AccessBasedLocationSelectorComponent>;
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [                
                { provide: 'AmfaInfo', useValue: mockAmfaInfo },
                { provide: SoarLocationHttpService, useValue: mockSoarLocationHttpService }
            ],
            declarations: [AccessBasedLocationSelectorComponent, MultiSelectComponent],
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccessBasedLocationSelectorComponent);
        component = fixture.componentInstance;
        // set component inputs
        component.showActiveOnly = false;
        component.amfaAccess = "soar-acct-aipmt-add";
        component.id = '1234';
        component.expanded = false;
        component.selectedLocationIds= [];
        component.allPermittedLocations=[];
        
        fixture.detectChanges();
    });

    it('should create', () => {
        component.amfaAccess = "soar-acct-aipmt-add";
        spyOn(component, 'requestPermittedLocations').and.callFake((any: any) => {});
        expect(component).toBeTruthy();
    });


    describe('set_selectedLocationIds', () => {
        it('should call assignSelectedLocations when permittenLocationsPromise is set', fakeAsync(() => {  
            component.permittenLocationsPromise = Promise.resolve();
            spyOn(component, 'assignSelectedLocations').and.callFake(() => {});
            
            component.selectedLocationIds = [2];
            tick();
            
            expect(component.assignSelectedLocations).toHaveBeenCalled()
        }));
    });

    describe('requestPermittedLocations', () => {
        it('should call buildLocationList', () => {            
            spyOn(component, 'buildLocationList').and.callFake((any: any) => {});
            component.requestPermittedLocations();
            expect(component.allPermittedLocations).toEqual(mockLocations)
            expect(component.buildLocationList).toHaveBeenCalled()
        });
    });

    describe('buildLocationList', () => {        
        beforeEach(() => {
            component.allPermittedLocations = mockLocations;
        });
        it('should create LocationList with equal number of records to locations', () => {            
            component.buildLocationList();
            expect(component.locationList.length).toEqual(2)
        });

        it('should create LocationList with text equal to Nameline1', () => {            
            component.buildLocationList();
            expect(component.locationList[0].text).toEqual('First Office');
            expect(component.locationList[1].text).toEqual('Second Office');
        });

        it('should create LocationList with value equal to LocationId', () => {            
            component.buildLocationList();
            expect(component.locationList[0].value).toEqual(1);
            expect(component.locationList[1].value).toEqual(2);
        });

        it('should group LocationList based on DeactivationTimeUtc', () => {
            component.buildLocationList();
            expect(component.locationList[0].subcategory).toEqual('Active');
            expect(component.locationList[1].subcategory).toEqual('Inactive');
        });

        it('should filter out inactive locatios if ShowActiveOnly is true', () => {
            component.showActiveOnly = true;
            let locationList = component.buildLocationList();
            expect(locationList.length).toBe(1)
            expect(locationList[0].subcategory).toEqual('Active');
        });

        it('should set initialSelection selected if has one', () => {
            component.selectedLocationIds = [2];
            component.buildLocationList();
            expect(component.selectedLocations.length).toBe(1)
            expect(component.selectedLocations[0].value).toEqual(2);
        });
    });

    describe('assignSelectedLocations', () => {
        beforeEach(() => {
            component.locationList = [
                {'text':'A1', 'value': 1},
                {'text':'A2', 'value': 2},
                {'text':'A3', 'value': 3},
                {'text':'A4', 'value': 4},
                {'text':'A5', 'value': 5},
            ];
        });

        it('should replace selected locations', () => {
            component.selectedLocations = [{'text':'A1', 'value': 1},{'text':'A2', 'value': 2}]
            component.selectedLocationIds = [3];

            component.assignSelectedLocations(component.locationList);            
            expect(component.selectedLocations).toEqual([component.locationList[2]])
        }); 
    });

    describe('onLocationChange', () => {        
        beforeEach(() => {
            component.selectedLocations = ['1234', '5678']
        });
        it('should set initialSelection selected if has one', () => {
            component.selectedValueChanged.emit = jasmine.createSpy();
            component.onLocationChange();            
            expect(component.selectedValueChanged.emit).toHaveBeenCalledWith(component.selectedLocations)
        });        
    });
});

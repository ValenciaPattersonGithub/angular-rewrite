import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogRef, DialogService, DialogContainerDirective } from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
import { configureTestSuite } from 'src/configure-test-suite';
import { ServiceFeesByLocationComponent } from './service-fees-by-location.component';
declare var _: any;
import cloneDeep from 'lodash/cloneDeep';


let refDataService: any;
let dialogservice: DialogService;
var ServiceCodeData = { Fee: null, ServiceCode: {}, TaxableServiceTypeId: null, LocationSpecificInfo: null };

var serviceCodeMock = {
    DisplayAs: 'PerEx',
    Fee: 200.00,
    Code: 'D0150',
    TaxableServiceTypeId: 1,
    LocationSpecificInfo: [{ TaxableServiceTypeId: 2, LocationId: 1, Fee: 100.00 },
    { TaxableServiceTypeId: 1, LocationId: 2, Fee: 200.00 },
    { TaxableServiceTypeId: 3, LocationId: 3, Fee: 300.00 },
    ]
};

let mockReferenceService: any = {
    setFeesForLocations: jasmine.createSpy(),
    get: jasmine.createSpy().and.callFake(() => {
        return [{ LocationId: 5 }, { LocationId: 6 }, { LocationId: 7 }];
    }),
    entityNames: {
        locations: 'locations'
    }
};

const mockDialogRef = {
    close: () => of({}),
    open: (dialogResult: any) => { },
    content: {
        instance: {
            title: ''
        }
    },
    result:  of({}),
}



describe('ServiceFeesByLocationComponent', () => {
    let component: ServiceFeesByLocationComponent;
    let fixture: ComponentFixture<ServiceFeesByLocationComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [DialogService, DialogContainerService,
                { provide: 'referenceDataService', useValue: mockReferenceService },
                { provide: DialogRef, useValue: mockDialogRef }           ],
            declarations: [ServiceFeesByLocationComponent]
        })
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServiceFeesByLocationComponent);
        component = fixture.componentInstance;
        refDataService = TestBed.get('referenceDataService');
        dialogservice = TestBed.get(DialogService);
        spyOn(dialogservice, 'open').and.returnValue({ content: ServiceFeesByLocationComponent, result: of({}) });
        let tempserviceCodeMock = {
            Fee: 200.00, ServiceCode: serviceCodeMock, TaxableServiceTypeId: 1,
            LocationSpecificInfo: null
        };
        component.ServiceCodeData = cloneDeep(tempserviceCodeMock);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit ->', () => {
        it('should Call getLocations method', () => {
            component.getLocations = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getLocations).toHaveBeenCalled();
        });

        it('should Call setDefaultFee method', () => {
            component.setDefaultFee = jasmine.createSpy();
            component.ngOnInit();
            expect(component.setDefaultFee).toHaveBeenCalled();
        });
        it('should call  openPreviewDialog method', () => {
            dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            component.openPreviewDialog();
            expect(dialogservice.open).toHaveBeenCalled();
        });
    });

     describe('setDefaultFee -> ', ()=> {
        it('should set default fee to Service.Code fee if not null', ()=> {
            ServiceCodeData = { Fee: 200.00, ServiceCode: serviceCodeMock, TaxableServiceTypeId: null, LocationSpecificInfo: null };
            component.ServiceCodeData = ServiceCodeData;
            component.setDefaultFee();
            expect(component.defaultFee).toEqual(200.00);
        });

        it('should set default fee to 0.00 if ServiceCode.Fee null', () => {
            component.ServiceCodeData = serviceCodeMock;
            component.ServiceCodeData.Fee = null;

            component.setDefaultFee();
            expect(component.defaultFee).toEqual(0.00);
        });
    });

    describe('getLocations ->', () => {
        it('should call referenceDataService.get', () => {
            component.getLocations();
            expect(mockReferenceService.get).toHaveBeenCalledWith(mockReferenceService.entityNames.locations);
        });

        describe('when locations call succeeds', () => {
            var locations;

            beforeEach( ()=> {
                component.setLocationProperties = jasmine.createSpy();
                locations = [{ LocationId: 5 }, { LocationId: 6 }, { LocationId: 7 }];
            });

            it('should set properties data', () => {
                component.getLocations();
                expect(component.locations).toEqual(locations);
                expect(component.filteredLocations).toEqual(locations);
            });

            it('should call methods', () => {
                component.ServiceCodeData = ServiceCodeData;
                component.getLocations();
                expect(mockReferenceService.setFeesForLocations).toHaveBeenCalledWith(component.ServiceCodeData , _.map(locations, 'LocationId'));
                expect(component.setLocationProperties).toHaveBeenCalledWith(locations);
            });
        });
    });

    describe('getTaxableServiceTypeType -> ', () =>  {
        it('should set the label based on TaxableServiceTypeId', () => {
            expect(component.getTaxableServiceTypeType(1)).toEqual('Not A Taxable Service');

            expect(component.getTaxableServiceTypeType(2)).toEqual('Provider');

            expect(component.getTaxableServiceTypeType(3)).toEqual('Sales And Use');
        });

        it('should not fail when an unknown value is passed in', () =>  {
            expect(component.getTaxableServiceTypeType(null)).toEqual('');
        });
    });

    describe('setLocationProperties ->', () => {
        beforeEach(() => {
            component.locations = [{ NameLine1: 'Effingham', LocationId: 1 },
            { NameLine1: 'Altamont', LocationId: 2 },
            { NameLine1: 'Teutopolis', LocationId: 3 }];
        });

        it('should set locationInfo to ServiceCode defaults if no LocationSpecificInfo ', () => {

            let tempserviceCodeMock = {
                Fee: 200.00, ServiceCode: serviceCodeMock, TaxableServiceTypeId: 1,
                LocationSpecificInfo: null
            };
            component.ServiceCodeData = null;
            component.ServiceCodeData = cloneDeep(tempserviceCodeMock);
            component.setLocationProperties(component.locations);
            expect(component.locations[0]["$$LocationOverrides"].$$FeeOverride).toEqual(component.defaultFee);
            expect(component.locations[0]["$$LocationOverrides"].$$TaxableServiceTypeId).toEqual(component.ServiceCodeData.TaxableServiceTypeId);
        });

        it('should set locationInfo to LocationSpecificInfo if exists ', ()=> {
            let tempserviceCodeMock = {
                Fee: 200.00, ServiceCode: serviceCodeMock, TaxableServiceTypeId: 1,
                LocationSpecificInfo: [{ TaxableServiceTypeId: 2, LocationId: 1, Fee: 100.00 },
                { TaxableServiceTypeId: 1, LocationId: 2, Fee: 200.00 },
                { TaxableServiceTypeId: 3, LocationId: 3, Fee: 300.00 },
                ]
            };
            component.ServiceCodeData = cloneDeep(tempserviceCodeMock);
            component.setLocationProperties(component.locations);
            expect(component.locations[1]["$$LocationOverrides"].$$FeeOverride).toEqual(200.00);
            expect(component.locations[2]["$$LocationOverrides"].$$TaxableServiceTypeId).toEqual(3);
        });

        describe('clearLocationOnClick -> ', () => {
            it('should clear Location', () => {
                component.clearLocation();
                expect(component.searchTerm).toEqual("");
            });
        });
        describe("close -> ", function () {
            it("should call modal instance close", function () {
                component.dialog = TestBed.get(DialogRef);
                component.cancel();    
            });
           
        });
    });
});

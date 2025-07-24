import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EraGridComponent } from './era-grid.component';
import { TranslateModule } from '@ngx-translate/core';
import { PdfService } from 'src/@shared/providers/pdf.service';
import { SharedModule } from 'src/@shared/shared.module';
import { EraHeaderSortColumn, RequestEraArgs, SoarEraHttpService } from 'src/@core/http-services/soar-era-http.service';
import { of } from 'rxjs';
import { EraHeaderDto } from 'src/@core/models/era/soar-era-dtos.model';
import { By } from '@angular/platform-browser';
import { EllipsisSelectComponent } from '../ellipsis-select/ellipsis-select.component';

describe('EraGridComponent', () => {
    let component: EraGridComponent;
    let fixture: ComponentFixture<EraGridComponent>;

    let mockLocations;
    let mockInsurancePaymentTypes;
    let mockEraService;
    let mockWindow;
    let mockCommonServices;
    let mockPdfService;
    let mockLocationService;
    let mockTabLauncher;
    let mockPatSecurityService;
    let mockModalFactory;
    let res;

    beforeEach(async () => {
        res = { Value: [] };
        mockLocations = { 3: 'Location3', 4: 'Location4' };
        mockInsurancePaymentTypes = [
            { CurrentTypeId: 4 }
        ];
        mockEraService = {
            requestEraList: jasmine.createSpy('SoarEraHttpService.requestEraList').and.returnValue(
                of({
                    Value: [
                        {
                            EraHeaderId: 4,
                            TransactionSetHeaderId: 1,
                            PaymentNumber: '1234',
                            CarrierName: 'BB',
                            Date: '2017-01-01',
                            IsAutoMatched: true,
                            EraPayerName: null,
                            EraClaimPayments: [
                                {
                                    EraHeaderId: 4,
                                    ClaimCommonId: 2,
                                    ClaimId: 6,
                                    PatientCode: 'TESTT1',
                                    LocationId: 3,
                                    ClaimStatus: 2,
                                    Matched: true
                                },
                                {
                                    LocationId: 4,
                                    ClaimStatus: 5,
                                    Matched: true
                                }
                            ]
                        },
                        {
                            PaymentNumber: '1234',
                            CarrierName: 'AA',
                            Date: '2017-01-02',
                            IsAutoMatched: true,
                            EraClaimPayments: [
                                {
                                    LocationId: 3,
                                    ClaimStatus: 5,
                                    Matched: true
                                },
                                {
                                    LocationId: 3,
                                    ClaimStatus: 5,
                                    Matched: true
                                }
                            ]
                        },
                        {
                            PaymentNumber: '1234',
                            CarrierName: 'AA',
                            Date: '2017-01-02',
                            IsAutoMatched: false,
                            EraPayerName: 'ERA Payer Name',
                            EraClaimPayments: [
                            ]
                        },
                        {
                            PaymentNumber: '1234',
                            CarrierName: 'AA',
                            Date: '2017-01-02',
                            IsAutoMatched: false,
                            IsProcessed: true,
                            EraPayerName: 'ERA Payer Name',
                            EraClaimPayments: [
                            ]
                        }
                    ]
                }))
        };
        mockWindow = {
            open: jasmine.createSpy('window.open'),
            location: {
                href: ""
            }
        };
        mockCommonServices = {
            Insurance: {
                ClaimPdf: jasmine.createSpy('CommonServices.Insurance.ClaimPdf').and.returnValue({
                    then: function (callback) { callback({ data: '1' }) }
                })
            }
        };
        mockPdfService = {
            viewPdfInNewWindow: jasmine.createSpy('PdfService.viewPdfInNewWindow')
        };
        mockLocationService = {
            getCurrentLocation: jasmine.createSpy('LocationService.getCurrentLocation').and.returnValue({ id: 3, name: 'Location3', status: 'Inactive' })
        };
        mockTabLauncher = {
            launchNewTab: jasmine.createSpy()
        };
        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
            generateMessage: jasmine.createSpy('patSecurityService.generateMessage').and.returnValue('')
        };

        mockModalFactory = {
            CardServiceDisabledModal: jasmine.createSpy('ModalFactory.CardServiceDisabledModal').and.returnValue({
                then(callback) {
                    callback(res);
                }
            })
        };

        await TestBed.configureTestingModule({
            declarations: [EraGridComponent, EllipsisSelectComponent],
            providers: [
                { provide: 'windowObject', useValue: mockWindow },
                { provide: 'CommonServices', useValue: mockCommonServices },
                { provide: 'locationService', useValue: mockLocationService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: PdfService, useValue: mockPdfService },
                { provide: SoarEraHttpService, useValue: mockEraService },
                { provide: 'ModalFactory', useValue: mockModalFactory },
            ],
            imports: [
                SharedModule,
                TranslateModule.forRoot()
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EraGridComponent);
        component = fixture.componentInstance;
        component.insurancePaymentTypes = mockInsurancePaymentTypes;
        component.allLocations = mockLocations;
        component.allowedLocations = [{ LocationId: 3 }, { LocationId: 4 }];
        component.filteredLocations = [3];
        component.loadFirstPageEras();

        fixture.detectChanges();
    });

    describe('initialize', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('component DOM tests', () => {
        it('should have all expected columns', () => {
            const debugElement = fixture.debugElement;
            const grid = debugElement.query(By.css('.era-new.grid.header'));
            expect(grid).toBeTruthy();
            const headers = grid.queryAll(By.css('div'));
            expect(headers.length).toBe(9);
            ['Pay Date', 'Carrier', 'Payment Method/Number', 'Amount', 'Unmatched', 'Status'].forEach(header => {
                expect(headers.map(h => h.nativeElement as HTMLDivElement).some(e => e.innerText.includes(header)));
            });
        });
        
    });

    describe('input data changes', () => {
        let eraArgs: RequestEraArgs;
        beforeEach(() => {
            eraArgs = {
                isProcessed: component.filterOption.IsProcessed,
                selectedLocations: component.filteredLocations,
                sortOn: EraHeaderSortColumn.PayDate,
                skip: 0,
                take: 300,
                ascending: true
            };
        });

        it('should get era list when filteredLocations is updated', () => {
            component.filteredLocations = [4];

            expect(component.filteredLocations.length).toEqual(1);
            expect(mockEraService.requestEraList).toHaveBeenCalledWith(eraArgs);
        });

        it('should get era list when filterOption is updated', () => {
            component.filterOption = { Description: 'Not Completed', IsProcessed: true };

            expect(mockEraService.requestEraList).toHaveBeenCalledWith(eraArgs);
        });

        it('should clear eras when filteredLocations is empty', () => {
            component.filteredLocations = [];

            expect(component.eras.length).toEqual(0);
            expect(component.viewShowMoreButton).toBeFalsy();
        });

        it('should not get era list when filterOption is updated and filteredLocation is empty', () => {
            spyOn(component, 'loadFirstPageEras');
            component.filteredLocations = [];
            component.filterOption = { Description: 'Not Completed', IsProcessed: null };

            expect(component.loadFirstPageEras).not.toHaveBeenCalled();
        });
    });

    describe('orderEra', () => {
        it('should update eraOrder and call to order eras', () => {
            component.orderEra(EraHeaderSortColumn.Carrier);

            var expectedArgs: RequestEraArgs = {
                isProcessed: component.filterOption.IsProcessed,
                selectedLocations: component.filteredLocations,
                sortOn: EraHeaderSortColumn.Carrier,
                skip: 0,
                take: 300,
                ascending: true
            };

            expect(mockEraService.requestEraList).toHaveBeenCalledWith(expectedArgs)

            component.orderEra(EraHeaderSortColumn.Carrier);

            expectedArgs.ascending = false;

            expect(mockEraService.requestEraList).toHaveBeenCalledWith(expectedArgs);
        });
    });

    describe('orderEraClaims', () => {
        it('should update claimOrder and call to order claims', () => {
            component.orderEraClaims('ClaimStatusText', component.eras[0]);

            expect(component.eras[0].claimOrder.sortColumnName).toEqual('ClaimStatusText');
            expect(component.eras[0].claimOrder.sortDirection).toEqual(1);
            expect(component.eras[0].EraClaimPayments[0].ClaimStatusText).toEqual('Accepted Electronic');
            component.orderEraClaims('ClaimStatusText', component.eras[0]);

            expect(component.eras[0].claimOrder.sortColumnName).toEqual('ClaimStatusText');
            expect(component.eras[0].claimOrder.sortDirection).toEqual(-1);
            expect(component.eras[0].EraClaimPayments[0].ClaimStatusText).toEqual('Printed');

            component.orderEraClaims('location', component.eras[0]);

            expect(component.eras[0].claimOrder.sortColumnName).toEqual('location');
            expect(component.eras[0].claimOrder.sortDirection).toEqual(1);
            expect(component.eras[0].EraClaimPayments[0].location).toEqual('Location3');

            component.orderEraClaims('location', component.eras[0]);

            expect(component.eras[0].claimOrder.sortColumnName).toEqual('location');
            expect(component.eras[0].claimOrder.sortDirection).toEqual(-1);
            expect(component.eras[0].EraClaimPayments[0].location).toEqual('Location4');
            component.orderEraClaims('location', component.eras[0]); // back to ascending
        });
    });

    describe('viewEra', () => {
        it('should open a new window with proper url when no claim', () => {
            component.viewEra(component.eras[0], null);

            expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith('#/BusinessCenter/Insurance/ERA/1?carrier=BB');
        });

        it('should open a new window with proper url when claim', () => {
            component.viewEra(component.eras[0], component.eras[0].EraClaimPayments[0]);

            expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith('#/BusinessCenter/Insurance/ERA/1/Claim/2?carrier=BB&patient=TESTT1');
        });
    });

    describe('viewEob', () => {
        it('should open a new window with proper url ', () => {

            component.viewEob(component.eras[0].EraClaimPayments[0]);

            expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith('#/BusinessCenter/Insurance/ERA/1/Claim/2?carrier=BB&patient=TESTT1');
        });
    })

    describe('viewClaim', () => {
        it('should retrieve the pdf and call to the service to open', () => {
            component.viewClaim(component.eras[0].EraClaimPayments[0]);

            expect(mockCommonServices.Insurance.ClaimPdf).toHaveBeenCalledWith('_soarapi_/insurance/claims/pdf?claimCommondId=6');
        });
    });

    describe('processEras', () => {
        beforeEach(() => {
            let eras = component.eras;
            eras[0].IsProcessed = false;
            eras[1].IsProcessed = false;
            component.allLocations = {
                3: 'Location3',
                4: 'Location4',
                5: 'Location5'
            };
        });

        it('should allow ERAs to be marked completed, even if the ERA has a bulk transaction', () => {
            var era = component.eras[0];
            // component.eras = [era];
            era.IsProcessed = false;
            era.IsAssociatedWithBulk = true;
            const processedEras: EraHeaderDto[] = component.processEras([era]);

            expect(processedEras[0].items.length).toEqual(3);
            expect(processedEras[0].items[2].label).toEqual('Mark As Completed');
        });

        it('should not allow completed ERAs with a bulk transaction to be marked uncomplete', () => {
            let era = component.eras[0];
            // component.eras = [era];
            era.IsProcessed = true;
            era.IsAssociatedWithBulk = true;
            const processedEras: EraHeaderDto[] = component.processEras([era]);

            expect(processedEras[0].items.length).toEqual(2);
            expect(processedEras[0].items.some(i => i.label === 'Mark As Complete')).toBe(false);
        });

        it('should enable era when all claims\' locations user has access to', () => {
            component.allowedLocations = [{ LocationId: 3 }, { LocationId: 4 }];
            const processedEras: EraHeaderDto[] = component.processEras(component.eras);

            expect(processedEras[0].canView).toBeTruthy();
            expect(processedEras[0].tooltip).toBeUndefined();
            expect(processedEras[0].items.length).toBeTruthy();
            expect(processedEras[1].canView).toBeTruthy();
            expect(processedEras[1].tooltip).toBeUndefined();
            expect(processedEras[1].items.length).toBeTruthy();
        });

        it('should disable era when some claims\' locations user has no access to', () => {
            component.allowedLocations = [{ LocationId: 3 }];
            const processedEras: EraHeaderDto[] = component.processEras(component.eras);

            expect(processedEras[0].canView).toBeFalsy();
            expect(processedEras[1].canView).toBeTruthy();
        });

        it('should disable era when no claims\' locations user has access to', () => {
            component.allowedLocations = [{ LocationId: 5 }];
            const processedEras: EraHeaderDto[] = component.processEras(component.eras);

            expect(processedEras[0].canView).toBeFalsy();
            expect(processedEras[1].canView).toBeFalsy();
        });

        it('should enable apply bulk payment menu item when user has access to, unless InProcessed', () => {
            const processedEras: EraHeaderDto[] = component.processEras(component.eras);

            expect(processedEras.length).toEqual(4);
            expect(processedEras[0].items[1].label).toEqual('Apply Bulk Payment');
            expect(processedEras[0].items[1].disabled).toBeFalsy();
            expect(processedEras[1].items[1].label).toEqual('Apply Bulk Payment');
            expect(processedEras[1].items[1].disabled).toBeFalsy();
            expect(processedEras[2].items[1].label).toEqual('Apply Bulk Payment');
            expect(processedEras[2].items[1].disabled).toBeFalsy();
            expect(processedEras[3].items[1].label).toEqual('Apply Bulk Payment');
            expect(processedEras[3].items[1].disabled).toBeTruthy(); // this one IsProcessed==true
        });

        it('should disable the apply bulk payment option when user is not authorized', () => {
            const msg = 'You do not have permission to apply insurance payment';
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
            mockPatSecurityService.generateMessage = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(msg);
            const processedEras: EraHeaderDto[] = component.processEras(component.eras);
            expect(processedEras.length).toEqual(4);
            for (const era of processedEras) {
                expect(era.items[1].label).toEqual('Apply Bulk Payment');
            }
           
        });

        it('should disable apply bulk payment menu item when user does have access, but era is processed', () => {
            var eras = component.eras;
            eras[0].IsProcessed = true;
            eras[0].IsAssociatedWithBulk = true;
            const processedEras: EraHeaderDto[] = component.processEras(eras);

            expect(processedEras.length).toEqual(4);
            expect(processedEras[0].items.length).toEqual(2);
            expect(processedEras[0].items[1].label).toEqual('Apply Bulk Payment');
            expect(processedEras[0].items[1].disabled).toBeTruthy();
            expect(processedEras[1].items.length).toEqual(3);
            expect(processedEras[1].items[1].label).toEqual('Apply Bulk Payment');
            // NG15CLEANUP This was expecting disabled to be true. However, the setup leaves index 1 as not IsProcessed, so it is not disabled.
            expect(processedEras[1].items[1].disabled).toBeFalsy();
            expect(processedEras[2].items.length).toEqual(3);
            expect(processedEras[2].items[1].label).toEqual('Apply Bulk Payment');
            expect(processedEras[2].items[1].disabled).toBeFalsy();
            expect(processedEras[3].items.length).toEqual(3);
            expect(processedEras[3].items[1].label).toEqual('Apply Bulk Payment');
            expect(processedEras[3].items[1].disabled).toBeTruthy();
        });
    });
});


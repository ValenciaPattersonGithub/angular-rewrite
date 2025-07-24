import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockRepository } from '../payment-types-mock-repo';
import { PaymentTypesComponent, PaymentTypeViewModel } from './payment-types.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchPipe, HighlightTextIfContainsPipe, OrderByPipe } from 'src/@shared/pipes';
import { DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SelectEvent } from '@progress/kendo-angular-layout';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PaymentTypeCategory, PaymentTypes } from './payment-types.model';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';

let localize;
let paymentTypeService;
let patSecurityService;
let toastrFactory;
let dialogservice: DialogService;
let mockDialogRef;

describe('PayementTypesComponent', () => {
    let component: PaymentTypesComponent;
    let fixture: ComponentFixture<PaymentTypesComponent>;
    let mockRepo: any;
    const defaultOrderKey = 'Description';
    let mockToastrFactory;

    beforeEach(() => {
        mockRepo = MockRepository();

        mockToastrFactory = {
            error: jasmine.createSpy().and.returnValue('Error Message'),
            success: jasmine.createSpy().and.returnValue('Success Message')
        };

        mockDialogRef = {
            close: () => of({}),
            open: () => { },
            content: {
                template: '',
                result: of(null),
                instance: {
                    title: '',
                    paymentTypes: mockRepo.mockDeletePaymentType
                },
            },
            result: of(null),
        };
    });

    beforeEach((() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [DialogService, DialogContainerService,
                { provide: 'localize', useValue: mockRepo.mockLocalizeService },
                { provide: "$location", useValue: {} },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: PaymentTypesService, useValue: mockRepo.mockpaymentTypeService },
                { provide: 'patSecurityService', useValue: mockRepo.mockpatSecurityService },
                { provide: DialogRef, mockDialogRef }
            ],
            declarations: [PaymentTypesComponent, SearchPipe, HighlightTextIfContainsPipe, OrderByPipe]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaymentTypesComponent);
        component = fixture.componentInstance;
        localize = TestBed.get('localize');
        paymentTypeService = TestBed.get(PaymentTypesService);
        patSecurityService = TestBed.get('patSecurityService');
        toastrFactory = TestBed.get('toastrFactory');
        dialogservice = TestBed.get(DialogService);
        component.insurancePaymentTypes = [];
        component.accountPaymentTypes = [];
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('ngOnInit', () => {
        it('should call paymentTypeService.getAllPaymentTypes', () => {
            spyOn(component, 'getAllPaymentypesSuccess');
            component.ngOnInit();
            expect(component.getAllPaymentypesSuccess).toHaveBeenCalled();
        });

        it('should call getAllPaymentTypes function with valid paramter', (done) => {
            spyOn(paymentTypeService, 'getAllPaymentTypes').and.returnValue(Promise.resolve(mockRepo.mockPaymentTypesList));

            paymentTypeService.getAllPaymentTypes()
                .then((result: SoarResponse<PaymentTypes[]>) => {
                    component.getAllPaymentypesSuccess(result);
                    expect(component.accountPaymentTypes).toBeDefined();
                    expect(component.insurancePaymentTypes).toBeDefined();
                    expect(component.accountPaymentTypes[0].PaymentTypeCategory).toEqual(1);
                    expect(component.insurancePaymentTypes[0].PaymentTypeCategory).toEqual(2);
                    done();
                })
                .catch(done.fail);
        });

        // TODO: This test is not setting up any expectations
        it('should call getAllPaymentTypes function with invalid paramter', () => {
            spyOn(paymentTypeService, 'getAllPaymentTypes').and.returnValue(Promise.reject({ reason: 'reject' }));
            paymentTypeService.getAllPaymentTypes()
                .then((result: SoarResponse<PaymentTypes[]>) => {
                }, () => {
                    component.getAllPaymentypesFailure();
                });
        });
    });
    describe('authAccess', () => {

        beforeEach(() => {
            mockToastrFactory.error.calls.reset();
        });

        it('should call toastrFactory.error if hasViewAccess is false', (done) => {
            component.viewAuthAbbreviation = '';
            mockRepo.mockpatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
            component.authAccess();

            setTimeout(() => {
                expect(mockToastrFactory.error).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not call toastrFactory.error if hasViewAccess is true', () => {
            component.viewAuthAbbreviation = '';
            mockRepo.mockpatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true);
            component.authAccess();

            expect(mockToastrFactory.error).not.toHaveBeenCalled();
        });
    });

    describe('orderList', () => {
        it('should return records if description and insurance payment types are passed', () => {
            const defaultSortColumn = 'Description';
            component.orderList(mockRepo.mockPaymentTypesList.Value, defaultSortColumn);

        });
    });

    describe('clearSearchText', () => {
        it('should empty searchText when clearSearchText called ', () => {
            component.clearSearchText();
            const result = component.searchText;
            expect(result).toBe('');
        });
    });

    describe('onTabSelect', () => {
        it('should set selectedTab 0 when click on tab Account Payment Types', () => {
            const event: SelectEvent = new SelectEvent(0, '');
            component.onTabSelect(event);
            expect(component.selectedTab).toEqual(0);
        });
        it('should set selectedTab 1 when click on tab Insurance Payment Types', () => {
            const event: SelectEvent = new SelectEvent(1, '');
            component.onTabSelect(event);
            expect(component.selectedTab).toEqual(1);
        });
    });

    describe('addPaymentType', () => {
        beforeEach(() => {
            dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
        })
        it('should add Insurance Payment Type', () => {
            const event: SelectEvent = new SelectEvent(1, '');
            component.hasCreateAccess = true;
            component.defaultOrderKey = 'Description';
            component.onTabSelect(event);
            component.addPaymentType();
            expect(component.selectedTab).toEqual(1);
        });

        it('should add Account Payment Type', () => {
            const event: SelectEvent = new SelectEvent(0, '');
            component.hasCreateAccess = true;
            component.defaultOrderKey = 'Description';
            component.onTabSelect(event);
            component.addPaymentType();
            expect(component.selectedTab).toEqual(0);
        });
    });

    describe('orderList', () => {
        it('should sort array ', () => {
            const resultArray = component.orderList(mockRepo.mockPaymentTypesList.Value, defaultOrderKey);
            expect(resultArray).toEqual(mockRepo.mockPaymentTypesList.Value);
        });

        it('should sort array when pass reverse order', () => {
            const resultArray = component.orderList(mockRepo.mockupReversearray, defaultOrderKey);
            expect(resultArray).toEqual(mockRepo.mockupReversearray);
        });
    });

    describe('getAllPaymentTypesSucess', () => {
        it('should not have any payment types', () => {
            component.getAllPaymentypesSuccess(null);
            expect(component.accountPaymentTypes).toEqual([]);
        });
        
        it('should have various payment types', () => {
            const mockResponse: SoarResponse<PaymentTypes[]> = {
                Value: [
                    { Description: 'Bogus Account Type', IsSystemType: false, PaymentTypeCategory: PaymentTypeCategory.AccountPayment },
                    { Description: 'Bogus Insurance Type', IsSystemType: false, PaymentTypeCategory: PaymentTypeCategory.InsurancePayment },
                    { Description: 'Vendor Payment', IsSystemType: true, PaymentTypeCategory: PaymentTypeCategory.AccountPayment },
                    { Description: 'Bogus System Account Type', IsSystemType: true, PaymentTypeCategory: PaymentTypeCategory.AccountPayment },
                    { Description: 'Bogus System Insurance Type', IsSystemType: true, PaymentTypeCategory: PaymentTypeCategory.InsurancePayment },
                ]
            }
            component.getAllPaymentypesSuccess(mockResponse);
            expect(component.accountPaymentTypes.length).toEqual(3);
            expect(component.insurancePaymentTypes.length).toEqual(2);
            expect(component.accountPaymentTypes.filter(x => x.isVendorPaymentType).length).toEqual(1);
        });
    });
});

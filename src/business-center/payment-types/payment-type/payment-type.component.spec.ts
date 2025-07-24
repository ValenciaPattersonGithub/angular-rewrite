import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentTypeComponent } from './payment-type.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { configureTestSuite } from 'src/configure-test-suite';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PaymentTypes } from '../payment-types.model';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';

describe('PaymentTypeComponent', () => {
    let component: PaymentTypeComponent;
    let fixture: ComponentFixture<PaymentTypeComponent>;
    let staticData;
    let paymentTypesService;

    const mockPaymentTypeValue: PaymentTypes = {
        Description: 'Cash',
        CurrencyTypeId: 1,
        Prompt: 'Cash alias',
        IsActive: true
    };
    const mockEditPaymentType = {
        PaymentTypeId: 'e98afd59-9a8a-45c5-a549-03229b6de026',
        IsSystemType: false,
        Description: 'AAAd',
        Prompt: 'AAA',
        CurrencyTypeId: 1,
        CurrencyTypeName: 'CREDIT CARD',
        IsActive: true,
        IsUsedInCreditTransactions: false,
        PaymentTypeCategory: 1,
        DataTag: 'AAAAAAAAiRA=',
        UserModified: 'd7188401-6ef2-e811-b7f9-8056f25c3d57',
        DateModified: '2019-10-30T09:16:33.7132509'
    };
    const mockLocalizeService = {
        getLocalizedString: jasmine.createSpy().and.returnValue('Billing')
    };
    const mockPaymentTypesList = {
        ExtendedStatusCode: null,
        Value: [{
            PaymentTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false,
            Description: 'AccoountPaymentType', PaymentTypeCategory: 1, IsActive: true
        },
        {
            PaymentTypeId: '00000000-0000-0000-0000-000000000002', IsSystemType: false,
            Description: 'InsurancePaymentType1', PaymentTypeCategory: 2, IsActive: false
        },
        {
            PaymentTypeId: 'e98afd59-9a8a-45c5-a549-03229b6de026', IsSystemType: false,
            Description: 'InsurancePaymentType3', PaymentTypeCategory: 2, IsActive: false
        }]
    };
    const mockCurrencyTypeList = {
        Value: [{ Id: 1, Name: 'CASH', Order: 1 }, { Id: 2, Name: 'CHECK', Order: 2 },
        { Id: 3, Name: 'CREDIT CARD', Order: 3 }, { Id: 4, Name: 'DEBIT CARD', Order: 4 },
        { Id: 5, Name: 'OTHER', Order: 5 }
        ]
    };
    const mockTostarfactory = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    const mockpaymentTypeService = {
        getAllPaymentTypes: () => {
            return {
                then: (res, error) => {
                    res({ Value: [] }),
                        error({})
                }
            }
        },
        save: () => {
            return {
                then: (res, error) => {
                    res({ Value: [] }),
                        error({})
                }
            }
        },
        update: () => {
            return {
                then: (res, error) => {
                    res({ Value: [] }),
                        error({})
                }
            }
        }
    };
    const mockStaticDataService = {
        CurrencyTypes: () => new Promise((resolve, reject) => {
            // the resolve / reject functions control the fate of the promise
        })
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            providers: [{ provide: 'localize', useValue: mockLocalizeService },
            { provide: 'toastrFactory', useValue: mockTostarfactory },
            { provide: PaymentTypesService, useValue: mockpaymentTypeService },
            { provide: 'StaticData', useValue: mockStaticDataService },
            {
                provide: DialogRef, useValue: {
                    close: () => { },
                    open: () => { },
                    content: {
                        instance: {
                            title: '',
                            paymentTypes: mockPaymentTypesList
                        }
                    }
                }
            }
            ],
            declarations: [PaymentTypeComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PaymentTypeComponent);
        component = fixture.componentInstance;
        staticData = TestBed.get('StaticData');
        paymentTypesService = TestBed.get(PaymentTypesService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should currencyTypes initialize when staticData.CurrencyTypes() retrun value', () => {
            spyOn(staticData, 'CurrencyTypes').and.returnValue(Promise.resolve(mockCurrencyTypeList));
            component.ngOnInit();
        });

        it('should call getCurrencytypesFailure when staticData.CurrencyTypes() retrun error', () => {
            spyOn(staticData, 'CurrencyTypes').and.returnValue(Promise.reject());
            component.ngOnInit();
        });

    });

    describe('createFormControls', () => {
        it('should create FormControls when paymentType passed', () => {
            component.createFormControls(mockEditPaymentType);
            const description = component.addPaymentType.controls.Description;
            expect(description).toBeDefined();
            const currencyTypeId = component.addPaymentType.controls.CurrencyTypeId;
            expect(currencyTypeId).toBeDefined();
        });


    });

    describe('CancelAddPaymentType', () => {
        it('should reset addPaymentType when CancelAddPaymentType called', () => {
            component.CancelAddPaymentType();
        });
    });

    describe('updatePaymentType', () => {
        it('should call paymentTypesService.update when savePaymentType called', () => {
            component.createFormControls(mockEditPaymentType);
            component.paymentTypes = mockPaymentTypesList.Value;
            component.dialog.content.instance.paymentType = mockEditPaymentType;
            spyOn(paymentTypesService, 'update').and.returnValue(Promise.resolve({ Value: mockEditPaymentType }));
            component.savePaymentType();
            paymentTypesService.update(mockEditPaymentType)
                .then((result: SoarResponse<PaymentTypes>) => {
                    component.updatePaymentTypeSuccess(result);
                }, () => {
                });
            expect(paymentTypesService.update);
        });
        it('should reset addPaymentType when updatePaymentTypeSuccess called', () => {
            component.createFormControls(mockEditPaymentType);
            component.paymentTypes = mockPaymentTypesList.Value;
            component.dialog.content.instance.paymentType = mockEditPaymentType;
            spyOn(paymentTypesService, 'update').and.returnValue(Promise.resolve({
                data: {
                    InvalidProperties: [{
                        ValidationMessage:
                            'There was an error and your payment type was not updated.'
                    }]
                }
            }));
            component.savePaymentType();
            paymentTypesService.update(mockEditPaymentType)
                .then((result: SoarResponse<PaymentTypes>) => {
                    component.updatePaymentTypeFailure(result);
                }, () => {
                });
            expect(paymentTypesService.update);
        });
    });

    describe('isDescriptionAlreadyExists', () => {
        it('should retrun true Description Already Exists', () => {
            component.dialog.content.instance.paymentType = null;
            component.paymentTypes = mockPaymentTypesList.Value;
            component.isDescriptionAlreadyExists({ target: { value: mockPaymentTypesList.Value[0].Description } });
            expect(component.isDescriptionExists).toBeTruthy();
        });
        it('should retrun false Description not Exists', () => {
            component.dialog.content.instance.paymentType = mockEditPaymentType;
            component.paymentTypes = mockPaymentTypesList.Value;
            component.isDescriptionAlreadyExists({ target: { value: mockEditPaymentType.Description } });
            expect(component.isDescriptionExists).toBeFalsy();
        });
    });

    describe('savePaymentType', () => {
        it('should call paymentTypesService.save when savePaymentType called', () => {
            spyOn(paymentTypesService, 'save').and.returnValue(Promise.resolve({ Value: mockPaymentTypeValue }));
            component.paymentTypes = mockPaymentTypesList.Value;
            component.savePaymentType();
            paymentTypesService.save(mockPaymentTypeValue)
                .then((result: SoarResponse<PaymentTypes>) => {
                    component.savePaymentTypeSuccess(result);
                }, () => {
                });
            expect(paymentTypesService.save);
        });

        it('should call savePaymentTypeFailure when paymentTypesService.save return Promise.reject', () => {
            spyOn(paymentTypesService, 'save').and.returnValue(Promise.reject());
            component.paymentTypes = mockPaymentTypesList.Value;
            component.savePaymentType();
            paymentTypesService.save(mockPaymentTypeValue)
                .then((result: SoarResponse<PaymentTypes>) => {
                    if (result) {
                        expect(mockTostarfactory.success).toHaveBeenCalled();
                    }
                }, () => {
                    component.savePaymentTypeFailure();
                });
            expect(paymentTypesService.save);
        });

        it('should call paymentTypesService.save when editPaymentType called', () => {
            component.dialog.content.instance.paymentType = mockEditPaymentType;
            spyOn(paymentTypesService, 'update').and.returnValue(Promise.resolve({ Value: mockPaymentTypeValue }));
            component.paymentTypes = mockPaymentTypesList.Value;
            component.savePaymentType();
            paymentTypesService.update(mockPaymentTypeValue)
                .then((result: SoarResponse<PaymentTypes>) => {
                    component.savePaymentTypeSuccess(result);
                }, () => {
                });
            expect(paymentTypesService.save);
        });
    });
});

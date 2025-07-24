import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockRepository } from '../../payment-types-mock-repo';
import { PaymentTypesListComponent } from './payment-types-list.component';
import { DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { SearchPipe, HighlightTextIfContainsPipe, OrderByPipe } from 'src/@shared/pipes';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { configureTestSuite } from 'src/configure-test-suite';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PaymentTypes } from '../payment-types.model';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

let paymentTypeService;
let dialogservice: DialogService;
let mockTostarfactory;
let mockDialogRef;

describe('PaymentTypesListComponent', () => {
    let component: PaymentTypesListComponent;
    let fixture: ComponentFixture<PaymentTypesListComponent>;
    let mockRepo;

    configureTestSuite(() => {
        mockRepo = MockRepository();
        mockTostarfactory = {
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

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [DialogService, DialogContainerService,
                { provide: 'localize', useValue: mockRepo.mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: PaymentTypesService, useValue: mockRepo.mockpaymentTypeService },
                { provide: 'locationService', useValue: mockRepo.mockLocationService },
                { provide: FeatureFlagService, useValue: mockRepo.mockFeatureFlagService },
                { provide: 'patSecurityService', useValue: mockRepo.mockpatSecurityService },
                { provide: DialogRef, useValue: mockDialogRef }
            ],
            declarations: [PaymentTypesListComponent, SearchPipe, HighlightTextIfContainsPipe, OrderByPipe]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PaymentTypesListComponent);
        component = fixture.componentInstance;
        paymentTypeService = TestBed.inject(PaymentTypesService);
        dialogservice = TestBed.inject(DialogService);
        component.paymentTypes = [];
        fixture.detectChanges();
        dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('editPaymentType', () => {
        it('should edit Insurance Payment Type', () => {
            component.selectedTab = 1;
            component.hasEditAccess = true;
            component.defaultOrderKey = 'Description';
            mockRepo.mockEditPaymentType.IsUsedInCreditTransactions = false;
            mockRepo.mockEditPaymentType.IsSystemType = false;
            component.editPaymentType(mockRepo.mockEditPaymentType);
            expect(component.selectedTab).toEqual(1);
        });

        it('should edit Account Payment Type', () => {
            component.selectedTab = 0;
            component.hasEditAccess = true;
            mockRepo.mockEditPaymentType.IsUsedInCreditTransactions = false;
            mockRepo.mockEditPaymentType.IsSystemType = false;
            component.defaultOrderKey = 'Description';
            component.editPaymentType(mockRepo.mockEditPaymentType);
            expect(component.selectedTab).toEqual(0);
        });
    });
    describe('sortPaymentTypes', () => {
        it('should sort insurance payment types when selectedTab is defined ', () => {
            component.selectedTab = 1;
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.sortPaymentTypes('PaymentTypeId');
            expect(mockRepo.mockPaymentTypesList.Value.indexOf(mockRepo.mockPaymentTypesList.Value.
                find(x => x.PaymentTypeId === '00000000-0000-0000-0000-000000000001'))).toEqual(0);
            expect(component.paymentTypes).toEqual(mockRepo.mockPaymentTypesList.Value);
        });
        it('should sort account payment types when selectedTab is undefined ', () => {
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.sortPaymentTypes('PaymentTypeId');
            expect(mockRepo.mockPaymentTypesList.Value.indexOf(mockRepo.mockPaymentTypesList.Value.
                find(x => x.PaymentTypeId === '00000000-0000-0000-0000-000000000001'))).toEqual(0);
            expect(component.paymentTypes).toEqual(mockRepo.mockPaymentTypesList.Value);
        });
    });

    // NG15CLEANUP can fix incrementally after merge to DEV
    // PaymentTypesListComponent filterPaymentTypes should return active insurance payment types when select target value active and selected tab defined' has no expectations.'
    describe('filterPaymentTypes', () => {
        it('should return all account payment types when select target value all and selected tab undefined', () => {
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.filteredPaymentTypes = mockRepo.mockPaymentTypesList.Value;
            const event = { target: { value: 'all' } };
            component.filterPaymentTypes(event);
        });
        it('should return active account payment types when select target value active and selected tab undefined', () => {
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.filteredPaymentTypes = mockRepo.mockPaymentTypesList.Value;
            const event = { target: { value: 'active' } };
            component.filterPaymentTypes(event);
        });
        it('should return inActive account payment types when select target value inActive and selected tab undefined', () => {
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.filteredPaymentTypes = mockRepo.mockPaymentTypesList.Value;
            const event = { target: { value: 'inActive' } };
            component.filterPaymentTypes(event);
        });

        it('should return all insurance payment types when select target value all and selected tab defined', () => {
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.selectedTab = 1;
            component.filteredPaymentTypes = mockRepo.mockPaymentTypesList.Value;
            const event = { target: { value: 'all' } };
            component.filterPaymentTypes(event);
        });
        it('should return active insurance payment types when select target value active and selected tab defined', () => {
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.selectedTab = 1;
            component.filteredPaymentTypes = mockRepo.mockPaymentTypesList.Value;
            const event = { target: { value: 'active' } };
            component.filterPaymentTypes(event);
        });
        it('should return inActive insurance payment types when select target value inActive and selected tab defined', () => {
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.selectedTab = 1;
            component.filteredPaymentTypes = mockRepo.mockPaymentTypesList.Value;
            const event = { target: { value: 'inActive' } };
            component.filterPaymentTypes(event);
        });
    });

    describe('toolTipText', () => {

        it('should return valid tooltip message for Delete button when hasDeleteAccess is false', () => {
            component.hasDeleteAccess = false;
            component.toolTipText(mockRepo.mockDeletePaymentType, 'Delete');
            const result = component.toolTipMessage;
            expect(result).toBe(component.deleteAccessToolTipText);
        });
        it('should return valid tooltip message on Delete button when IsSystemType is true', () => {
            component.hasDeleteAccess = true;
            const mockpaymentype = { IsSystemType: true, IsUsedInCreditTransactions: false };
            component.toolTipText(mockpaymentype, 'Delete');
            const result = component.toolTipMessage;
            expect(result).toBe(component.deleteSystemTypeToolTipText);
        });
        it('should return valid tooltip message on Delete button when IsUsedInCreditTransactions is true', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: true };
            component.hasDeleteAccess = true;
            component.toolTipText(mockpaymentype, 'Delete');
            const result = component.toolTipMessage;
            expect(result).toBe(component.deleteIsUsedInCreditToolTipText);
        });
        it('should return no tooltip message on Delete button When hasDeleteAccess is true', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: false };
            component.hasDeleteAccess = true;
            component.toolTipText(mockpaymentype, 'Delete');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return no tooltip message on Delete button When hasEditAccess & hasDeleteAccess is true', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: false };
            component.hasDeleteAccess = true;
            component.hasEditAccess = true;
            component.toolTipText(mockpaymentype, 'Delete');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return no tooltip message on Delete button When IsSystemType has invalid data', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: false };
            component.hasEditAccess = true;
            component.hasDeleteAccess = true;
            component.toolTipText(mockpaymentype, 'Delete');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return valid tooltip message on Edit button when IsUsedInCreditTransactions is true', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: true };
            component.hasEditAccess = true;
            component.toolTipText(mockpaymentype, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe(component.editIsUsedInCreditToolTipText);
        });
        it('should return valid toolTip message on Edit button when hasEditAccess is false', () => {
            component.hasEditAccess = false;
            component.toolTipText(mockRepo.mockEditPaymentType, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe(component.editAccessToolTipText);
        });

        it('should return no tooltip message on Edit button When hasEditAccess is true', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: false };
            component.hasEditAccess = true;
            component.toolTipText(mockpaymentype, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return no tooltip message on Edit button When hasEditAccess & hasDeleteAccess is true', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: false };
            component.hasEditAccess = true;
            component.hasDeleteAccess = true;
            component.toolTipText(mockpaymentype, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return no tooltip message on Edit button When IsSystemType has invalid data', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: false };
            component.hasEditAccess = true;
            component.hasDeleteAccess = true;
            component.toolTipText(mockpaymentype, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return no tooltip message on Edit button When IsUsedInCreditTransactions has invalid data', () => {
            const mockpaymentype = { IsSystemType: false, IsUsedInCreditTransactions: false };
            component.hasEditAccess = true;
            component.hasDeleteAccess = true;
            component.toolTipText(mockpaymentype, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return valid tooltip message for Edit button when IsSystemType is true', () => {
            component.hasEditAccess = true;
            const mockpaymentype = { IsSystemType: true, IsUsedInCreditTransactions: false };
            component.toolTipText(mockpaymentype, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe(component.editSystemTypeToolTipText);
        });
        it('should return valid tooltip message on Inactivate_Activate button when hasEditAccess is false', () => {
            component.hasEditAccess = false;
            component.toolTipText(mockRepo.mockDeletePaymentType, 'Inactivate_Activate');
            const result = component.toolTipMessage;
            expect(result).toBe(component.isActivateAccessToolTipText);
        });
        it('should return no tooltip message on Inactivate_Activate button when hasEditAccess is true', () => {
            component.hasEditAccess = true;
            component.toolTipText(mockRepo.mockDeletePaymentType, 'Inactivate_Activate');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        // Edit
        it('should return no tooltip message on Edit button when IsDefaultTypeOnBenefitPlan is false', () => {
            component.hasEditAccess = true;
            component.toolTipText(mockRepo.mockEditPaymentType, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return defaultOnPlanEditMessage tooltip message on Edit button when IsDefaultTypeOnBenefitPlan is true', () => {
            mockRepo.mockEditPaymentType.IsDefaultTypeOnBenefitPlan = true;
            component.hasEditAccess = true;
            component.toolTipText(mockRepo.mockEditPaymentType, 'Edit');
            const result = component.toolTipMessage;
            expect(result).toBe(component.defaultOnPlanEditMessage);
        });
        // Delete
        it('should return no tooltip message on Delete button when IsDefaultTypeOnBenefitPlan is false', () => {
            component.hasEditAccess = true;
            component.toolTipText(mockRepo.mockDeletePaymentType, 'Delete');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return defaultOnPlanDeleteMessage tooltip message on Delete button when IsDefaultTypeOnBenefitPlan is true', () => {
            mockRepo.mockDeletePaymentType.IsDefaultTypeOnBenefitPlan = true;
            component.hasEditAccess = true;
            component.toolTipText(mockRepo.mockDeletePaymentType, 'Delete');
            const result = component.toolTipMessage;
            expect(result).toBe(component.defaultOnPlanDeleteMessage);
        });
        // Inactivate
        it('should return no tooltip message on Inactivate_Activate button when IsDefaultTypeOnBenefitPlan is false', () => {
            mockRepo.mockDeletePaymentType.IsDefaultTypeOnBenefitPlan = false;
            component.hasEditAccess = true;
            component.toolTipText(mockRepo.mockDeletePaymentType, 'Inactivate_Activate');
            const result = component.toolTipMessage;
            expect(result).toBe('');
        });
        it('should return defaultOnPlanInactivateMessage tooltip message on Inactivate_Activate button when IsDefaultTypeOnBenefitPlan is true', () => {
            mockRepo.mockDeletePaymentType.IsDefaultTypeOnBenefitPlan = true;
            component.hasEditAccess = true;
            component.toolTipText(mockRepo.mockDeletePaymentType, 'Inactivate_Activate');
            const result = component.toolTipMessage;
            expect(result).toBe(component.defaultOnPlanInactivateMessage);
        });
    });

    // NG15CRITICAL  must fix before merging to DEV
    xdescribe('deletePaymentType', () => {
        it('should call deletePaymentTypeSuccess when paymentTypeService.deletePaymentTypeById return success', () => {
            mockRepo.mockDeletePaymentType.IsDefaultTypeOnBenefitPlan = false;
            component.typeToDelete = mockRepo.mockDeletePaymentType;
            component.hasDeleteAccess = true;
            spyOn(paymentTypeService, 'deletePaymentTypeById').and.returnValue(Promise.resolve({ result: 'success' }));
            component.paymentTypes = component.filteredPaymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.deletePaymentType(mockRepo.mockDeletePaymentType, null, null);
            paymentTypeService.deletePaymentTypeById({ paymentTypeId: mockRepo.mockDeletePaymentType.PaymentTypeId })
                .then((result) => {
                    component.deletePaymentTypeSuccess(result);
                }, () => {
                });
            expect(paymentTypeService.deletePaymentTypeById).toHaveBeenCalled();;
        });
        it('should call deletePaymentTypeFailure when paymentTypeService.deletePaymentTypeById return failure', () => {
            component.typeToDelete = mockRepo.mockDeletePaymentType;
            spyOn(paymentTypeService, 'deletePaymentTypeById').and.returnValue(Promise.resolve({ result: 'failure' }));
            component.deletePaymentType(mockRepo.mockDeletePaymentType, null, null);
            paymentTypeService.deletePaymentTypeById({ paymentTypeId: '' })
                .then(() => {
                    component.deletePaymentTypeFailure();
                }, () => {

                });
            expect(paymentTypeService.deletePaymentTypeById).toHaveBeenCalled();;
        });
    });

    describe('updatePaymentTypeStatus', () => {
        it('should call paymentTypesService.update when updatePaymentTypeSuccess called', () => {
            component.paymentTypes = component.filteredPaymentTypes = mockRepo.mockPaymentTypesList.Value;
            component.hasEditAccess = true;
            spyOn(paymentTypeService, 'update').and.returnValue(Promise.resolve({ Value: mockRepo.mockEditPaymentType }));
            component.updatePaymentTypeStatus(mockRepo.mockEditPaymentType);
            paymentTypeService.update(mockRepo.mockEditPaymentType)
                .then((result: SoarResponse<PaymentTypes>) => {
                    component.updatePaymentTypeSuccess(result);
                }, () => {
                });
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            expect(paymentTypeService.update).toHaveBeenCalled();
        });

        it('should call updatePaymentTypeFailure when any error occurred while paymentTypesService.update', () => {
            component.paymentTypes = mockRepo.mockPaymentTypesList.Value;
            spyOn(paymentTypeService, 'update').and.returnValue(Promise.resolve({ result: 'failure' }));
            component.updatePaymentTypeStatus(mockRepo.mockEditPaymentType);
            paymentTypeService.update(mockRepo.mockEditPaymentType)
                .then((error) => {
                    component.updatePaymentTypeFailure(error);
                }, () => {
                });
            expect(paymentTypeService.update).toHaveBeenCalled();
        });
    });
});

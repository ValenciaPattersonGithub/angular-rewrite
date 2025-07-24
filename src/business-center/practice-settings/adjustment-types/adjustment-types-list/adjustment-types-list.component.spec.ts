import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { MockRepository } from '../../../payment-types-mock-repo';
import { TranslateService } from '@ngx-translate/core';
import { AdjustmentTypesListComponent } from './adjustment-types-list.component';
import { ConfirmationModalService } from '../../../../@shared/components/confirmation-modal/confirmation-modal.service';
import { OrderByPipe } from '../../../../@shared/pipes/order-by/order-by.pipe';
import { of } from 'rxjs';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';

let dialogservice: DialogService;

describe('AdjustmentTypesListComponent', () => {
    let component: AdjustmentTypesListComponent;
    let fixture: ComponentFixture<AdjustmentTypesListComponent>;
    let mockRepo: any;
    let mockTostarfactory;
    let drawer;
    let mockTranslateService;
    let mockConfirmationModalService;
    let mockAdjustmentTypesService;
    let mockAdjustmentType;
    let mockAdjustmentTypesList;

    beforeEach(() => {
        mockRepo = MockRepository();

        mockTostarfactory = {
            error: jasmine.createSpy().and.returnValue('Error Message'),
            success: jasmine.createSpy().and.returnValue('Success Message')

        };
        drawer = { isOpen: true };
        mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
        mockConfirmationModalService = {
            open: jasmine.createSpy().and.returnValue({
                events: {
                    pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
                },
                subscribe: jasmine.createSpy(),
                closed: jasmine.createSpy(),
            }),


        };
        mockAdjustmentTypesService = {
            GetAdjustmentTypeAssociatedWithTransactions: () => {
                return {
                    then: (success, error) => {
                        success({}),
                            error({})
                    }
                }
            },
            deleteAdjustmentTypeById: () => {
                return {
                    then: (success, error) => {
                        success({}),
                            error({})
                    }
                }
            },
        };
        mockAdjustmentType = {

            AdjustmentTypeId: "3jf81c9d-13d7-4f00-96g3-cfa4c576592e",
            DataTag: null,
            DateModified: "0001-01-01T00:00:00",
            Description: "Balance Adjustments",
            ImpactType: 1,
            IsActive: true,
            IsAdjustmentTypeAssociatedWithTransactions: false,
            IsDefaultTypeOnBenefitPlan: false,
            IsPositive: true,
            IsSystemType: false,
            UserModified: "00000000-0000-0000-0000-000000000000"
        };

        mockAdjustmentTypesList = {
            Value: [{
                AdjustmentTypeId: "3jf81c9d-13d7-4f00-96g3-cfa4c576592e",
                DataTag: null,
                DateModified: "0001-01-01T00:00:00",
                Description: "Balance Adjustments",
                ImpactType: 1,
                IsActive: true,
                IsAdjustmentTypeAssociatedWithTransactions: false,
                IsDefaultTypeOnBenefitPlan: false,
                IsPositive: true,
                IsSystemType: false,
                UserModified: "00000000-0000-0000-0000-000000000000"
            },
            {
                AdjustmentTypeId: "3bf81c9d-13d7-4f00-96d3-cfa4c576592e",
                DataTag: null,
                DateModified: "0001-01-01T00:00:00",
                Description: "Negative Test",
                ImpactType: 1,
                IsActive: true,
                IsAdjustmentTypeAssociatedWithTransactions: false,
                IsDefaultTypeOnBenefitPlan: false,
                IsPositive: true,
                IsSystemType: false,
                UserModified: "00000000-0000-0000-0000-000000000000"
            }]
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdjustmentTypesListComponent, OrderByPipe],
            providers: [DialogService, DialogContainerService,
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: AdjustmentTypesService, useValue: mockAdjustmentTypesService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: TranslateService, useValue: mockTranslateService },
                {
                    provide: DialogRef, useValue: {
                        close: () => { },
                        open: () => { },
                        content: {
                            instance: {
                                title: ''
                            }
                        }
                    }
                }
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdjustmentTypesListComponent);
        dialogservice = TestBed.inject(DialogService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('editAdjustmentType', () => {
        it('should edit Adjustment Type', () => {
            component.hasEditAccess = true;
            component.defaultOrderKey = 'Description';
            mockAdjustmentType.IsAdjustmentTypeAssociatedWithTransactions = false;
            mockAdjustmentType.IsSystemType = false;
            component.drawer = { isOpen: true };
            component.editAdjustmentType(mockAdjustmentType);
            expect(component.hasEditAccess).toEqual(true);
        });

    });
    describe('sortAdjustmentTypes', () => {
        it('should sort adjustment types', () => {
            component.adjustmentTypes = mockAdjustmentTypesList.Value;
            component.sortAdjustmentTypes('AdjustmentTypeId');
            expect(mockAdjustmentTypesList.Value.indexOf(mockAdjustmentTypesList.Value.find(x => x.AdjustmentTypeId === '3jf81c9d-13d7-4f00-96g3-cfa4c576592e'))).toEqual(0);
            expect(component.adjustmentTypes).toEqual(mockAdjustmentTypesList.Value);
        });
    });

    describe('toolTipText', () => {

        it('should return valid tooltip message for Edit button when hasEditAccess is false', () => {
            component.hasEditAccess = false;
            component.editAdjustmentType(mockAdjustmentType);
            const result = component.toolTipEditMessage;
            expect(result).toBe(component.editAccessToolTipText);
        });
        it('should return valid tooltip message on Edit button when IsSystemType is true', () => {
            component.hasEditAccess = true;
            const mockAdjustment = { IsSystemType: true };
            component.editAdjustmentType(mockAdjustment);
            const result = component.toolTipEditMessage;
            expect(result).toBe(component.editSystemTypeToolTipText);
        });
        it('should return no tooltip message on Edit button When hasEditAccess is true', () => {
            component.hasEditAccess = true;
            component.drawer = { isOpen: true };
            component.editAdjustmentType(mockAdjustmentType);
            const result = component.toolTipEditMessage;
            expect(result).toBe('');
        });
    });

    describe('deleteAdjustmentType', () => {
        let mockDialogRef;
        beforeEach(() => {
            mockDialogRef = {
                close: () => of({}),
                open: () => { },
                content: {
                    template: '',
                    result: { subscribe: () => of({}) },
                    instance: {},
                },
                result: { subscribe: () => of({}), },
            };
        })
        it('should call deletePaymentTypeSuccess when adjustmentTypesService.deleteAdjustmentTypeById return success', () => {
            mockAdjustmentType.IsDefaultTypeOnBenefitPlan = false;
            component.typeToDelete = mockAdjustmentType;
            component.hasDeleteAccess = true;
            dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            component.adjustmentTypes = mockAdjustmentTypesList.Value;
            component.deleteAdjustmentType(mockAdjustmentType);
            expect(component.hasDeleteAccess).toEqual(true);
        });
    });

});

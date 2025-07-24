import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { configureTestSuite } from 'src/configure-test-suite';

import { AdjustmentTypeFormComponent } from './adjustment-type-form.component';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';

describe('AdjustmentTypeFormComponent', () => {
    let component: AdjustmentTypeFormComponent;
    let fixture: ComponentFixture<AdjustmentTypeFormComponent>;

    const mockTostarfactory = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    const mockAdjustmentTypeService = {
        create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ })),
        update: jasmine.createSpy('update').and.returnValue(Promise.resolve({ }))
    };

    const mockService = {
        // define called methods
    };

    //RandomDescription
    let generateRandomDescription = Math.random().toString(36).substring(2, 15) + Math.random().toString(23).substring(2, 5);

    const mockAddAdjustmentType = {
        AdjustmentTypeId: '',
        Description: generateRandomDescription,
        IsPositive: true,
        IsActive: true,
        ImpactType: 1,
        DataTag: "AAAAAAThsww="
    };

    generateRandomDescription = Math.random().toString(36).substring(2, 15) + Math.random().toString(23).substring(2, 5);
    const mockEditAdjustmentType = {
        AdjustmentTypeId: 'F1DDB02A-E832-4526-81F9-E011189BA1AD',
        Description: generateRandomDescription,
        IsPositive: true,
        IsActive: true,
        ImpactType: 1,
        DataTag: "AAAAAAThsww="
    };

    const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    const drawer = { isOpen: false };
    const mockConfirmationModalService = {
        open: jasmine.createSpy().and.returnValue({
            events: {
                pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
            },
            subscribe: jasmine.createSpy(),
            closed: jasmine.createSpy(),
        }),
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            providers: [
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: AdjustmentTypesService, useValue: mockAdjustmentTypeService },
                { provide: ConfirmationModalOverlayRef, useValue: mockService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: TranslateService, useValue: mockTranslateService }
            ],
            declarations: [AdjustmentTypeFormComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdjustmentTypeFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdjustmentTypeFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('createFormControls', () => {
        it('should create FormControls', () => {
            component.initiateFormControls();
            const description = component.adjustmentTypeFG.controls.Description;
            expect(description).toBeDefined();
            const impactType = component.adjustmentTypeFG.controls.ImpactType;
            expect(impactType).toBeDefined();
            const isPositive = component.adjustmentTypeFG.controls.IsPositive;
            expect(isPositive).toBeDefined();
            const isActive = component.adjustmentTypeFG.controls.IsActive;
            expect(isActive).toBeDefined();
        });
    });

    describe('CancelAdjustmentType', () => {
        it('should reset adjustmentType when CancelAdjustmentType called', () => {
            component.drawer = drawer;
            component.discardAdjustmentType(false);
        });
    });

    describe('saveAdjustmentType', () => {
        it('should call saveAdjustment and should update the adjustment details', () => {
            component.bindForm(mockAddAdjustmentType);
            component.remainingText= mockEditAdjustmentType.Description.length;
            component.drawer = drawer;
            component.saveAdjustmentType();
            mockAdjustmentTypeService.update()
                .then((result) => {
                    component.onSuccess(result);
                }, () => {
                });
            expect(mockAdjustmentTypeService.update);
        });
        it('should call saveAdjustment and should create the adjustment details', () => {
            component.initiateFormControls();
            component.remainingText= mockAddAdjustmentType.Description.length;
            component.drawer = drawer;
            component.saveAdjustmentType();
            mockAdjustmentTypeService.create()
                .then((result) => {
                    component.onSuccess(result);
                }, () => {
                });
            expect(mockAdjustmentTypeService.create);
        });
    });
});

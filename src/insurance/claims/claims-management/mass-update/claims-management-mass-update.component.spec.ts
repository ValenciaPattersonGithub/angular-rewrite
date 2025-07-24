import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClaimsManagementMassUpdateComponent } from './claims-management-mass-update.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService, DialogContainerService } from '@progress/kendo-angular-dialog';
import { configureTestSuite } from 'src/configure-test-suite';
// import { configureTestSuite } from 'src/configure-test-suite';

describe('ClaimsManagementMassUpdateComponent', () => {
    let component: ClaimsManagementMassUpdateComponent;
    let fixture: ComponentFixture<ClaimsManagementMassUpdateComponent>;

    const mockSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [ClaimsManagementMassUpdateComponent],
            providers: [
                DialogService, DialogContainerService,
                { provide: 'patSecurityService', useValue: mockSecurityService },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClaimsManagementMassUpdateComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call security service with correct amfa',
            () => {
                component.ngOnInit();
                expect(mockSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-ins-iclaim-edit');
            });
    });

    describe('massUpdateAllowed',
        () => {
            it('should return false when list of claims is empty',
                () => {
                    component.claims = [];
                    const isAllowed = component.massUpdateAllowed();
                    expect(isAllowed).toBe(false);
                });
            it('should set tooltip when list of claims is empty',
                () => {
                    component.claims = [];
                    component.massUpdateAllowed();
                    expect(component.massUpdateTooltip).toEqual('Multiple claims or predeterminations must be selected.');
                });
            it('should return true when list of claims has two selected claims',
                () => {
                    component.claims = [{ Selected: true }, { Selected: true }];
                    const isAllowed = component.massUpdateAllowed();
                    expect(isAllowed).toBe(true);
                });
            it('should clear tooltip when list of claims has two selected claims',
                () => {
                    component.claims = [{ Selected: true }, { Selected: true }];
                    component.massUpdateAllowed();
                    expect(component.massUpdateTooltip).toEqual('');
                });
            it('should return false when list of claims has one selected claims',
                () => {
                    component.claims = [{ Selected: true }, { Selected: false }];
                    const isAllowed = component.massUpdateAllowed();
                    expect(isAllowed).toBe(false);
                });
            it('should set tooltip when list of claims has one selected claims',
                () => {
                    component.claims = [{ Selected: true }, { Selected: false }];
                    component.massUpdateAllowed();
                    expect(component.massUpdateTooltip).toEqual('Multiple claims or predeterminations must be selected.');
                });
            it('should return false when list of claims contains claim for non-primary and non-secondary benefit plan',
                () => {
                    component.claims = [{ Selected: true }, { Selected: true }, { Selected: true, PatientBenefitPlanPriority: 2 }];
                    const isAllowed = component.massUpdateAllowed();
                    expect(isAllowed).toBe(false);
                });
            it('should set tooltip when list of claims contains claim for non-primary and non-secondary benefit plan',
                () => {
                    component.claims = [{ Selected: true }, { Selected: true }, { Selected: true, PatientBenefitPlanPriority: 2 }];
                    component.massUpdateAllowed();
                    expect(component.massUpdateTooltip).toEqual('Mass Update can only be used for Primary and Secondary claims.');
                });
        });
});




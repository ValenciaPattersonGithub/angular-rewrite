import { CurrencyPipe } from "@angular/common";
import { FormBuilder } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { CloseInsuranceclaimModalComponent } from "./close-insuranceclaim-modal.component";

describe('CloseInsuranceclaimModalComponent', () => {
    let component: CloseInsuranceclaimModalComponent;

    const mockPatientServices = {
        PatientBenefitPlan:{
            get: jasmine.createSpy().and.returnValue({
                $promise: Promise.resolve([])
            }),
        }
    };

    const mockClaimsServices = {
        getClaimById:{
            get: jasmine.createSpy().and.returnValue({
                $promise: Promise.resolve({})
            }),
        },
    };


    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    const patSecurityServiceMock = {
        generateMessage: jasmine.createSpy().and.returnValue(''),
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };

    const mockLocalizeService: any = {
        getLocalizedString: () => 'translated text'
    };

    const mockModalDataFactory = {
        GetCheckoutModalData: jasmine.createSpy().and.callFake((array) => {
            return Promise.resolve(array);
        })
    };

    const mockUsersFactory = {};

    const mockCloseClaimService = {
        update: jasmine.createSpy().and.returnValue({
            $promise: Promise.resolve()
        }),
    };

    let retVal = false;
    const mockModalFactory = {
        ConfirmModal: jasmine.createSpy().and.callFake(() => {
            return Promise.resolve(retVal);
        })
    };
    
    // mock the currency Pipe
    let mockCurrencyPipe: CurrencyPipe;

    beforeEach(() => {
        mockCurrencyPipe = new CurrencyPipe('100');
    });
    const fb: FormBuilder = new FormBuilder();

    const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

       
    beforeEach(() => {
        component = new CloseInsuranceclaimModalComponent(
            mockToastrFactory,
            mockPatientServices,
            mockLocalizeService,
            patSecurityServiceMock,
            mockClaimsServices,
            mockModalDataFactory,
            mockUsersFactory,
            mockCloseClaimService,
            mockModalFactory,
            fb,
            mockTranslateService,
            mockCurrencyPipe,
        );

    });

    describe('handleAdjustmentModal method', () => {
        let mockClaim = {};
        let mockClaimObject = {};
        
        beforeEach(() => {
            spyOn(component, 'openAdjustmentModalCustom').and.callFake(function () { });;
            spyOn(component, 'closeModals').and.callFake(function () { });;
        });

        it('should call modalFactory.ConfirmModal', () => {
            component.handleAdjustmentModal(mockClaim, mockClaimObject);
            expect(mockModalFactory.ConfirmModal).toHaveBeenCalled() ;
        });

        it('should call openAdjustmentModalCustom if ConfirmModal Yes', (done) => {             
            component.handleAdjustmentModal(mockClaim, mockClaimObject);            
            mockModalFactory.ConfirmModal()
                .then(function() {
                    expect(component.openAdjustmentModalCustom).toHaveBeenCalledWith({},{});
                    done();
                });
        });

        it('should call closeModals if ConfirmModal No', (done) => {
            component.handleAdjustmentModal(mockClaim, mockClaimObject);            
            mockModalFactory.ConfirmModal()
                .then(function() {
                    expect(component.closeModals).toHaveBeenCalledWith({}); 
                    done();
                });
        });
    });
    
    describe('openAdjustmentModalResultCancel method', () => {
        
        beforeEach(() => {            
            component.closeClaimObject={ClaimId:'1234', hasMultipleTransactions: true} 
        });

        it('should set showContinueButton and showCloseClaimErrorMessage to true if closeClaimService.update fails and multiple transactions', () => {
            let errorResult = {};
            mockCloseClaimService.update = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => failure(errorResult) }
            });
            component.openAdjustmentModalResultCancel();
            expect(component.showCloseClaimErrorMessage).toBe(true);
            expect(component.showContinueButton).toBe(true);
            
        });

        it('should set hideCancel to false and showCloseClaimErrorMessage to true if closeClaimService.update fails and not multiple transactions', () => {
            let errorResult = {};
            mockCloseClaimService.update = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => failure(errorResult) }
            });
            component.closeClaimObject.hasMultipleTransactions = false;
            component.openAdjustmentModalResultCancel();
            expect(component.showCloseClaimErrorMessage).toBe(true);
            expect(component.hideCancel).toBe(false);
            
        });
    });

    describe('openAdjustmentModalResultOk method', () => {
        
        beforeEach(() => {            
            component.closeClaimObject={ClaimId:'1234', hasMultipleTransactions: true} 
        });

        it('should set showContinueButton and showCloseClaimErrorMessage to true if closeClaimService.update fails and multiple transactions', () => {
            let errorResult = {};
            mockCloseClaimService.update = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => failure(errorResult) }
            });
            component.openAdjustmentModalResultOk();
            expect(component.showCloseClaimErrorMessage).toBe(true);
            expect(component.showContinueButton).toBe(true);
            
        });

        it('should set hideCancel to false and showCloseClaimErrorMessage to true if closeClaimService.update fails and not multiple transactions', () => {
            let errorResult = {};
            mockCloseClaimService.update = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => failure(errorResult) }
            });
            component.closeClaimObject.hasMultipleTransactions = false;
            component.openAdjustmentModalResultOk();
            expect(component.showCloseClaimErrorMessage).toBe(true);
            expect(component.hideCancel).toBe(false);
            
        });
    }); 
    
    describe('closeClaim method', () => {
        
        beforeEach(() => {            
            component.closeClaimObject={claimId:'1234', hasMultipleTransactions: true, claimActionsValue: 1} 
            component.recreateClaimSelected = false;
        });

        it('should set showContinueButton and showCloseClaimErrorMessage to true if closeClaimService.update fails and multiple transactions', () => {
            let errorResult = {};
            mockCloseClaimService.update = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => failure(errorResult) }
            });
            component.closeClaim();
            expect(component.showCloseClaimErrorMessage).toBe(true);
            expect(component.showContinueButton).toBe(true);
            
        });

        it('should set hideCancel to false and showCloseClaimErrorMessage to true if closeClaimService.fails false and not multiple transactions', () => {
            let errorResult = {};
            mockCloseClaimService.update = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => failure(errorResult) }
            });
            component.closeClaimObject.hasMultipleTransactions = false;
            component.closeClaim();
            expect(component.showCloseClaimErrorMessage).toBe(true);
            expect(component.hideCancel).toBe(false);
            
        });

        it('should call closeclaimservice.update with calculateEstimatedInsurance set to false if estimateInsuranceOption is false', function () {
            mockCloseClaimService.update = jasmine.createSpy().and.returnValue({
                $promise: { then() { return {}; } }
            });
            component.closeClaimObject.claimActionsValue = 1;
            component.recreateClaimSelected = true;
            component.closeClaimObject.DataTag = '112233';
            component.estimateInsuranceOption = false;
            component.closeClaim();
            expect(mockCloseClaimService.update.calls.first().args[0]).toEqual({ calculateEstimatedInsurance: false });
        });
    }); 

    describe('validateIndvDeductible method', () => {
        let data = {NewValue: null}
        beforeEach(() => {            
            component.individualDeductibleRemaining = null;  
            component.patientBenefitPlan = [{PolicyHolderBenefitPlanDto:{BenefitPlanDto:{IndividualDeductible:300, FamilyDeductible: 600}}}];          
        });

        it('should set individualDeductibleRemaining to data.Value if less than or equal to patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.IndividualDeductible', () => {
            data.NewValue = 200;
            component.validateIndvDeductible(data);
            expect(component.individualDeductibleRemaining).toBe(200);            
        });

        it('should not set individualDeductibleRemaining to data.Value if more than patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.IndividualDeductible', () => {
            data.NewValue = 400;
            component.validateIndvDeductible(data);
            expect(component.individualDeductibleRemaining).toBe(null);            
        });

        it('should not set individualDeductibleRemaining to data.Value if more than patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.IndividualDeductible', () => {
            data.NewValue = null;
            component.individualDeductibleRemaining = 200;
            component.validateIndvDeductible(data);
            expect(component.individualDeductibleRemaining).toBe(null);            
        });
    });

    describe('validateFamDeductible method', () => {
        let data = {NewValue: null}
        beforeEach(() => {            
            component.familyDeductibleRemaining = null;  
            component.patientBenefitPlan = [{PolicyHolderBenefitPlanDto:{BenefitPlanDto:{IndividualDeductible:300, FamilyDeductible: 600}}}];                 
        });

        it('should set familyDeductibleRemaining to data.Value if less than or equal to patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.FamilyDeductible', () => {
            data.NewValue = 200;
            component.validateFamDeductible(data);
            expect(component.familyDeductibleRemaining).toBe(200);            
        });

        it('should not set familyDeductibleRemaining to data.Value if more than patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.FamilyDeductible', () => {
            data.NewValue = 700;
            component.validateFamDeductible(data);
            expect(component.familyDeductibleRemaining).toBe(null);            
        });

        it('should not set familyDeductibleRemaining to data.Value if more than patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.FamilyDeductible', () => {
            data.NewValue = null;
            component.familyDeductibleRemaining = 200;
            component.validateFamDeductible(data);
            expect(component.familyDeductibleRemaining).toBe(null);            
        });
    });


    /*


  validateIndvDeductible(data: any) {
    this.amounts.individualDeductibleRemainingtemp = data.NewValue;
    if (data.NewValue <= this.patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.IndividualDeductible) 
        this.individualDeductibleRemaining = data.NewValue;
  };

  validateFamDeductible(data) {
    this.amounts.familyDeductibleRemainingtemp = data.NewValue;
    if (data.NewValue <= this.patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.FamilyDeductible)
        this.familyDeductibleRemaining = data.NewValue;
  };
    */
    
    
});
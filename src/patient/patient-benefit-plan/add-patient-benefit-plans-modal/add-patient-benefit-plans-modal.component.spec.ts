import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPatientBenefitPlansModalComponent } from './add-patient-benefit-plans-modal.component';
import { AddBenefitPlanModalRef } from '../add-benefit-plan-modal-ref';
import { TranslateModule } from '@ngx-translate/core';
import { ADD_BENEFIT_PLAN_MODAL_DATA } from '../add-benefit-plan-modal.data';
import { SoarPatientBenefitPlanHttpService } from 'src/@core/http-services/soar-patient-benefit-plan-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BestPracticePatientNamePipe } from 'src/@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { of } from 'rxjs';
import * as cloneDeep from 'lodash/cloneDeep';
import { PatientBenefitPlanDto } from 'src/@core/models/patient-benefit-plan-dtos.model';
import { BenefitPlanForAddInsuranceDto } from 'src/patient/common/models/benefit-plan-for-add-insurance-dto.model';

describe('AddPatientBenefitPlansModalComponent', () => {
    let component: AddPatientBenefitPlansModalComponent;
    let fixture: ComponentFixture<AddPatientBenefitPlansModalComponent>;
    let mockRef = {}
    let mockAddBenefitPlanModalData = {
        cancel: 'Cancel',
        confirm: 'Save',       
        patient: {PatientId: 'p123456789', PersonAccount:{AccountId:'a123456789'}},
        plan: {},
        allowedPlans: 6,
    }
    let mockBenefitPlan: BenefitPlanForAddInsuranceDto = {
        BenefitPlanId:'b123456789' ,
        BenefitPlanCarrierId: 'c123456789' ,
        BenefitPlanName: 'BenefitPlan',
        CarrierAddressLine1: null,
        CarrierAddressLine2: null,
        CarrierCity: null,
        CarrierState: null,
        CarrierZipCode: null,        
        BenefitPlanGroupNumber: null,
        BenefitPlanGroupName: 'PlanGroupName',        
        CarrierName: '',        
        BenefitPlanIsActive: false,       
    }

   

    let mockPatientBenefitPlan: PatientBenefitPlanDto = {
        PatientBenefitPlanId: 'b123456787',
        PolicyHolderId: 'p123456787',
        PatientId: 'p123456787',
        BenefitPlanId: 'b123456789',
        PolicyHolderBenefitPlanId: '12345',
        PolicyHolderStringId: '11114',
        RelationshipToPolicyHolder: 'self',
        DependentChildOnly: false,
        EffectiveDate: new Date(),
        IndividualDeductibleUsed: 0,
        IndividualMaxUsed: 0,
        Priority: 1,
        EligibleEPSDTTitleXIX: false,
        ObjectState: 'None',
        FailedMessage: 'string',
        IsDeleted: false,
        AdditionalBenefits: 0,
        MemberId: null
    };
    let requestPatientBenefitPlansResolve = [];

    let mockSoarPatientBenefitPlanHttpService;
    beforeEach(() => {
    
        mockSoarPatientBenefitPlanHttpService = {
            requestActiveBenefitPlans:jasmine.createSpy('SoarPatientBenefitPlanHttpService.requestActiveBenefitPlans').and.returnValue(
                of({
                    Value: []
                })),   
            requestBenefitPlansForAddInsurance:jasmine.createSpy('SoarPatientBenefitPlanHttpService.requestBenefitPlansForAddInsurance').and.returnValue(
                    of({
                        Value: []
                    })),           
            requestClaimsListByPayerId: jasmine.createSpy('SoarPatientBenefitPlanHttpService.requestClaimsListByPayerId').and.returnValue(
                of({
                    Value: []
                })),
            requestPatientBenefitPlans: jasmine.createSpy('SoarPatientBenefitPlanHttpService.requestPatientBenefitPlans').and.returnValue(
                of({
                    Value: requestPatientBenefitPlansResolve
                })),
            createPatientBenefitPlans: jasmine.createSpy('SoarPatientBenefitPlanHttpService.createPatientBenefitPlans').and.returnValue(
                of({
                    Value: []
                })),
            requestAvailablePolicyHolders: jasmine.createSpy('SoarPatientBenefitPlanHttpService.requestAvailablePolicyHolders').and.returnValue(
                of({
                    Value: []
                })),
            
        }
    });

    let mockPatSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
    };

    let mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
      };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                TranslateModule.forRoot()
            ],
            declarations: [AddPatientBenefitPlansModalComponent],
            providers: [                  
                BestPracticePatientNamePipe,              
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: AddBenefitPlanModalRef, useValue: mockRef },
                { provide: ADD_BENEFIT_PLAN_MODAL_DATA, useValue: mockAddBenefitPlanModalData },
                { provide: 'SoarConfig', useValue: {} },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: SoarPatientBenefitPlanHttpService, useValue: mockSoarPatientBenefitPlanHttpService },                
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AddPatientBenefitPlansModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();             
    });

    it('should create', () => {
        spyOn(component, 'addPolicy').and.callFake(() => {});
        spyOn(component, 'getAvailablePolicyHolders').and.callFake(() => {});
        spyOn(component, 'getBenefitPlans').and.callFake(() => {});
        expect(component).toBeTruthy();
        expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-ins-ibcomp-add');
            
    });

    describe('getBenefitPlans', () => {
        let mockBenefitPlans: BenefitPlanForAddInsuranceDto[];              
        beforeEach(() => {
            mockBenefitPlans = [];
            for(let x = 1; x < 4; x++) { 
                let benefitPlan: BenefitPlanForAddInsuranceDto = cloneDeep(mockBenefitPlan);
                benefitPlan.BenefitPlanId+=x; 
                benefitPlan.BenefitPlanCarrierId+=x; 
                benefitPlan.BenefitPlanName+=x; 
                benefitPlan.BenefitPlanGroupName+=x;
                mockBenefitPlans.push(benefitPlan);                
            }
        });

        it('should call patientBenefitPlanService.requestBenefitPlansForAddInsurance', () => {
            component.getBenefitPlans();
            expect(mockSoarPatientBenefitPlanHttpService.requestBenefitPlansForAddInsurance).toHaveBeenCalled()           
        }); 
        
        // TODO fix this
        it('should call patientBenefitPlanService.requestBenefitPlansForAddInsurance',  (done: DoneFn) => {   
            spyOn(component, 'getCurrentPlans');
            let policyHolderId = '1234556';
            component.getBenefitPlans();
            mockSoarPatientBenefitPlanHttpService.requestActiveBenefitPlans(policyHolderId).subscribe(value => {
                expect(component.getCurrentPlans).toHaveBeenCalled();
                done();
            }); 
        });
    });

    describe('getCurrentPlans', () => {                   
        beforeEach(() => {
            
        });

        it('should call patientBenefitPlanService.requestPatientBenefitPlans', () => {
            component.getCurrentPlans();
            expect(mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlans).toHaveBeenCalled()           
        });
    });

    describe('filterActiveBenefitPlans', () => {
        let mockBenefitPlans: BenefitPlanForAddInsuranceDto[];
        let mockPatientBenefitPlans: PatientBenefitPlanDto[];              
        beforeEach(() => {
            mockBenefitPlans = [];
            for(let x = 1; x < 4; x++) { 
                let benefitPlan: BenefitPlanForAddInsuranceDto = cloneDeep(mockBenefitPlan);
                benefitPlan.BenefitPlanId+=x; 
                benefitPlan.BenefitPlanCarrierId+=x; 
                benefitPlan.BenefitPlanName+=x; 
                benefitPlan.BenefitPlanGroupName+=x;
                mockBenefitPlans.push(benefitPlan);                
            }
            mockPatientBenefitPlans = [];
            let patientBenefitPlan: PatientBenefitPlanDto = cloneDeep(mockPatientBenefitPlan);
            // set this patient benefit plan BenefitPlanId to BenefitId from first activeBenefitPlan
            patientBenefitPlan.BenefitPlanId = mockBenefitPlans[0].BenefitPlanId;
            mockPatientBenefitPlans.push(patientBenefitPlan);
        });

        it('should not filter current patientBenefitPlans out of activeBenefitPlans ', () => {
            component.activeBenefitPlans= mockBenefitPlans;
            component.currentPatientBenefitPlans=mockPatientBenefitPlans;            
            let returnValue = component.filterActiveBenefitPlans();
            expect(returnValue.length).toBe(3);                      
        });
    });

    describe('save', () => {
        var event={}
        beforeEach(() => {            
            spyOn(component, 'createPatientBenefitPlans');
            spyOn(component, 'createPolicyHolderBenefitPlans'); 
        });

        it('should not call createPatientBenefitPlans if hasErrors', () => {
            spyOn(component, 'validateForm');
            component.hasErrors = true;
            component.save(event);
            expect(component.createPatientBenefitPlans).not.toHaveBeenCalled();
        });

        it('should call createPatientBenefitPlans if no errors and if no newPolicyHolderBenefitPlan', () => {
            spyOn(component, 'validateForm');
            component.hasErrors = false;
            component.save(event);
            expect(component.createPatientBenefitPlans).toHaveBeenCalled();
        });

        it('should call createPolicyHolderBenefitPlans if no errors and if no newPolicyHolderBenefitPlan', () => {
            spyOn(component, 'validateForm');
            component.newPolicyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.hasErrors = false;
            component.save(event);
            expect(component.createPolicyHolderBenefitPlans).toHaveBeenCalled();
        });
    })

    describe('createPatientBenefitPlans', () => {                   
        beforeEach(() => {
            spyOn(component, 'confirmModal');
            spyOn(component, 'addAdditionalPolicy');
            spyOn(component, 'filterActiveBenefitPlans');
            component.newPatientBenefitPlans = [];
            let newPatientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.newPatientBenefitPlans.push(newPatientBenefitPlan);
            component.patient = {PatientId:'p123456789'};
        });

        it('should call patientBenefitPlanService.createPatientBenefitPlans', () => {
            component.createPatientBenefitPlans();
            expect(mockSoarPatientBenefitPlanHttpService.createPatientBenefitPlans).toHaveBeenCalledWith({patientId:component.patient.PatientId}, component.newPatientBenefitPlans);          
        });

        it('should call confirmModal if onSaveCreateNew is true',  (done: DoneFn) => {   
            let policyHolderId = '1234556';
            component.onSaveCreateNew = true;              
            component.createPatientBenefitPlans();
            mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlans(policyHolderId).subscribe(value => {
                expect(component.addAdditionalPolicy).toHaveBeenCalled();
                done()
            });              
        });

        it('should call filterActiveBenefitPlans',  (done: DoneFn) => {   
            let policyHolderId = '1234556';                        
            component.createPatientBenefitPlans();
            mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlans(policyHolderId).subscribe(value => {
                expect(component.filterActiveBenefitPlans).toHaveBeenCalled();
                done()
            });              
        });

        it('should call addAdditionalPolicy if onSaveCreateNew is false',  (done: DoneFn) => {   
            let policyHolderId = '1234556';
            component.onSaveCreateNew = false;              
            component.createPatientBenefitPlans();
            mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlans(policyHolderId).subscribe(value => {                
                expect(component.confirmModal).toHaveBeenCalled();
                done()
            });              
        });       
    });

    describe('getAvailablePolicyHolders', () => {
        it('should call patientBenefitPlanService.requestPatientBenefitPlans', () => {            
            component.getAvailablePolicyHolders(component.patient);
            expect(mockSoarPatientBenefitPlanHttpService.requestAvailablePolicyHolders).toHaveBeenCalledWith({accountId:component.patient.PersonAccount.AccountId})           
        });
    })
    
    describe('setPolicyHolders', () => {
        let policyHolders
        beforeEach(() => {
            component.patient = {PatientId: '11111'};
           policyHolders =  [
            { Person:{PatientId:'11111', FirstName:'Bob', LastName: 'Frapples'}, PolicyHolder:[{Person:{PatientId:'11111', FirstName:'Bob', LastName: 'Frapples'}}]}, 
            { Person:{PatientId:'11113', FirstName:'Duncan', LastName: 'Frapples'}, PolicyHolder:[{Person:{PatientId:'11113', FirstName:'Duncan', LastName: 'Frapples'}}]}] 
        });
        it('should only add patient to policyHoldersList if selfonly is true', () => { 
            component.data.selfonly = true; 
            component.setPolicyHolders(policyHolders);
            expect(component.policyHolderList.length).toBe(1);
            expect(component.policyHolderList[0].text).toEqual('Self');
            expect(component.policyHolderList[0].value).toEqual('11111');
        });

        it('should add policyHolders that do not match patient to policyHoldersList if selfonly is false', () => { 
            component.data.selfonly = undefined; 
            component.setPolicyHolders(policyHolders);
            expect(component.policyHolderList.length).toBe(3);
            expect(component.policyHolderList[0].text).toEqual('Self');            
            expect(component.policyHolderList[1].text).toEqual('Duncan Frapples');
            expect(component.policyHolderList[1].value).toEqual('11113');
            expect(component.policyHolderList[2].text).toEqual('Other...');
        });
    });

    describe('saveAndAddPolicy', () => {
        it('should call set onSaveCreateNew and call save', () => {  
            var event={};
            spyOn(component, 'save').and.callFake(() => {});         
            component.saveAndAddPolicy(event);
            expect(component.onSaveCreateNew).toBe(true);
            expect(component.save).toHaveBeenCalled();             
        });
    });

    describe('addAdditionalPolicy', () => {
        it('should call set onSaveCreateNew and call save', () => {  
            spyOn(component, 'save').and.callFake(() => {});         
            component.addAdditionalPolicy();
            spyOn(component, 'addPolicy').and.callFake(() => {});
            spyOn(component, 'getAvailablePolicyHolders').and.callFake(() => {});
            spyOn(component, 'getBenefitPlans').and.callFake(() => {});           
        });
    });

    describe('cancel', () => {
        it('should call confirmModal when confirmOnClose is true', () => {
            spyOn(component, 'confirmModal');
            component.confirmOnClose = true;
            var event = {};
            component.cancel(event);
            expect(component.confirmModal).toHaveBeenCalled();
        });

        it('should call confirmModal when confirmOnClose is false', () => {
            spyOn(component, 'closeModal');
            component.confirmOnClose = false;
            var event = {};
            component.cancel(event);
            expect(component.closeModal).toHaveBeenCalled();
        });
    });
});

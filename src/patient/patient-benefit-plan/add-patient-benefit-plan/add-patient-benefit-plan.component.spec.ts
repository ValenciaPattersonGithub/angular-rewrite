import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPatientBenefitPlanComponent } from './add-patient-benefit-plan.component';
import { of } from 'rxjs';
import { cloneDeep } from 'lodash';
import { PatientBenefitPlanDto } from 'src/@core/models/patient-benefit-plan-dtos.model';
import { BenefitPlanDto } from 'src/patient/common/models/benefit-plan-dto.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SoarPatientBenefitPlanHttpService } from 'src/@core/http-services/soar-patient-benefit-plan-http.service';
import { BestPracticePatientNamePipe } from 'src/@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { AutocompleteComponent } from 'src/@shared/components/autocomplete/autocomplete.component';
import { BenefitPlanForAddInsuranceDto } from 'src/patient/common/models/benefit-plan-for-add-insurance-dto.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddPatientBenefitPlanComponent', () => {
    let component: AddPatientBenefitPlanComponent;
    let fixture: ComponentFixture<AddPatientBenefitPlanComponent>;

    let mockSoarPatientBenefitPlanHttpService;
    let mockPatientServices;
    let mockPatientValidationFactory;
    let requestPatientBenefitPlansResolve;
    let requestAvailablePolicyHoldersResolve;
    let patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false } };
    let res;
    let mockBenefitPlan: BenefitPlanForAddInsuranceDto;
    let mockFilteredBenefitPlans;
    let mockPatientBenefitPlan: PatientBenefitPlanDto;
    let mockService;
    let mockToastrFactory;

    beforeEach(() => {
        requestPatientBenefitPlansResolve = [];
        requestAvailablePolicyHoldersResolve = [];
        res = { Value: [] };

        mockPatientValidationFactory = {
            PatientSearchValidation: jasmine.createSpy('PatientValidationFactory.PatientSearchValidation').and.returnValue({
                then(callback) {
                    callback(patientLocationAuthorization);
                }
            }),
            LaunchPatientLocationErrorModal: jasmine.createSpy('PatientValidationFactory.LaunchPatientLocationErrorModal').and.returnValue({
                then(callback) {
                    callback(res);
                }
            }),
            GetPatientData: jasmine.createSpy()
        };

        mockSoarPatientBenefitPlanHttpService = {
            requestClaimsListByPayerId: jasmine.createSpy('SoarPatientBenefitPlanHttpService.requestClaimsListByPayerId').and.returnValue(
                of({
                    Value: []
                })),
            requestBenefitPlansForAddInsurance: jasmine.createSpy('SoarPatientBenefitPlanHttpService.requestBenefitPlansForAddInsurance').and.returnValue(
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
                    Value: requestAvailablePolicyHoldersResolve
                })),
            requestActiveBenefitPlans: jasmine.createSpy('SoarPatientBenefitPlanHttpService.requestActiveBenefitPlans').and.returnValue(
                of({
                    Value: []
                })),
        }

        mockPatientServices = {
            PatientLocations: {
                get: jasmine.createSpy().and.callFake((array) => {
                    return {
                        then(callback) {
                            callback(array);
                        }
                    };
                })
            }
        };

        mockBenefitPlan = {
            BenefitPlanId: 'b123456789',
            BenefitPlanCarrierId: 'c123456789',
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

        mockFilteredBenefitPlans = [];
        for (let x = 1; x < 4; x++) {
            let plan: BenefitPlanForAddInsuranceDto = cloneDeep(mockBenefitPlan)
            plan.BenefitPlanId = 'b123456789' + x;
            plan.BenefitPlanCarrierId = 'c123456789' + x;
            mockFilteredBenefitPlans.push(plan);
        }

        mockPatientBenefitPlan = {
            PatientBenefitPlanId: '',
            PolicyHolderId: '',
            PatientId: 'p123456787',
            BenefitPlanId: '',
            PolicyHolderBenefitPlanId: '',
            PolicyHolderStringId: '',
            RelationshipToPolicyHolder: null,
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
        mockService = {};

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

    });

    beforeEach(async () => {

        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                TranslateModule.forRoot()
            ],
            declarations: [AddPatientBenefitPlanComponent, AutocompleteComponent],
            providers: [
                BestPracticePatientNamePipe,
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'PatientValidationFactory', useValue: mockPatientValidationFactory },
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: 'SoarConfig', useValue: {} },
                { provide: SoarPatientBenefitPlanHttpService, useValue: mockSoarPatientBenefitPlanHttpService },
                { provide: 'tabLauncher', useValue: mockService },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AddPatientBenefitPlanComponent);
        component = fixture.componentInstance;
        component.patientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
        component.filteredBenefitPlans = cloneDeep(mockFilteredBenefitPlans);
        component.policyHolders = [];
        component.policyHolderList = [];
        component.patient = { PatientId: '', PersonAccount: { AccountId: '' } }
        fixture.detectChanges();
    });

    it('should create', () => {
        spyOn(component, 'ngOnInit')
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {

        beforeEach(() => {
            component.patientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            spyOn(component, 'buildRelationships');
            spyOn(component, 'setPlanName');
        })

        it('should call buildRelationships', () => {
            component.ngOnInit();
            expect(component.buildRelationships).toHaveBeenCalled();
        });
        it('should call setPlanName with Priority', () => {
            component.patientBenefitPlan.Priority = 2;
            component.ngOnInit();
            expect(component.setPlanName).toHaveBeenCalledWith(2);
        });
    })

    describe('validateForm', () => {
        beforeEach(() => {
            spyOn(component, 'searchForDuplicates').and.returnValue(false);
            component.patient = { PatientId: 'p345678' }
            component.patientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.patientBenefitPlan.BenefitPlanId = 'p123456';
            component.patientBenefitPlan.PolicyHolderId = 'ph78910';
            component.patientBenefitPlan.PatientId = 'p123457';
            component.patientBenefitPlan.RelationshipToPolicyHolder = 'Spouse';
            component.notifyValidState.emit = jasmine.createSpy();
            component.currentPatientBenefitPlans = [];
            component.currentPatientBenefitPlans.push(mockPatientBenefitPlan);
            component.hasErrors = false;
        });

        it('should set hasErrors to true if no PolicyHolderId', () => {
            component.patientBenefitPlan.PolicyHolderId = '';
            component.validateForm();
            expect(component.hasErrors).toBe(true);
        });


        it('should set hasErrors to true if patientBenefitPlan.PolicyHolderId equals this.patient.PatientId and ' +
            'RelationshipToPolicyHolder is not null', () => {
                component.patientBenefitPlan.PolicyHolderId = 'p345678'
                component.patientBenefitPlan.RelationshipToPolicyHolder = 'spouse';
                component.validateForm();
                expect(component.hasErrors).toBe(true);
            });

        it('should set hasErrors to true if patientBenefitPlan.PolicyHolderId not equal this.patient.PatientId and ' +
            'RelationshipToPolicyHolder is null', () => {
                component.patientBenefitPlan.RelationshipToPolicyHolder = null;
                component.validateForm();
                expect(component.hasErrors).toBe(true);
            });


        it('should set hasErrors to true if no BenefitPlanId', () => {
            component.patientBenefitPlan.BenefitPlanId = '';
            component.validateForm();
            expect(component.hasErrors).toBe(true);
        });

        it('should set hasErrors to false if conditions met', () => {
            component.validateForm();
            expect(component.hasErrors).toBe(false);
        });

        it('should set hasErrors to true and isDuplicatePlan if searchForDuplicates returns true', () => {
            component.searchForDuplicates = jasmine.createSpy().and.returnValue(true);
            component.validateForm();
            expect(component.hasErrors).toBe(true);
        });

        it('should set hasErrors to false and isDuplicatePlan if if searchForDuplicates returns false', () => {
            component.searchForDuplicates = jasmine.createSpy().and.returnValue(false);
            component.validateForm();
            expect(component.hasErrors).toBe(false);
        });

    });

    describe('searchForDuplicates', () => {
        let patientBenefitPlan;
        beforeEach(() => {
            patientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            patientBenefitPlan.BenefitPlanId = 'p123456';
            patientBenefitPlan.PolicyHolderId = 'ph78910';

            component.currentPatientBenefitPlans = [];
            component.currentPatientBenefitPlans.push(mockPatientBenefitPlan);
        });

        it('should return true and set isDuplicatePlan to true if new plan matches existing plan' +
            'based on PolicyHolderId and BenefitPlanId', () => {
                component.currentPatientBenefitPlans[0].BenefitPlanId = 'p123456';
                component.currentPatientBenefitPlans[0].PolicyHolderId = 'ph78910';
                expect(component.searchForDuplicates(patientBenefitPlan)).toEqual(true);
            });

        it('should return false and set set isDuplicatePlan to false if new plan does not match existing plan' +
            'based on PolicyHolderId and BenefitPlanId', () => {
                component.currentPatientBenefitPlans[0].BenefitPlanId = 'p123457';
                component.currentPatientBenefitPlans[0].PolicyHolderId = '78910';
                expect(component.searchForDuplicates(patientBenefitPlan)).toEqual(false);
            });

    });

    describe('getBenefitPlansForPolicyHolder', () => {
        beforeEach(() => {
            spyOn(component, 'addPolicyHolderBenefitPlan').and.callFake(() => { })
        })

        it('should call patientBenefitPlanService.requestPatientBenefitPlans', () => {
            let policyHolderId = '1234556';
            component.getBenefitPlansForPolicyHolder(policyHolderId);
            expect(mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlans).toHaveBeenCalledWith({ patientId: policyHolderId });
        });

        it('should call addPolicyHolderBenefitPlan if no rows returned', (done: DoneFn) => {
            let policyHolderId = '1234556';
            component.getBenefitPlansForPolicyHolder(policyHolderId);
            mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlans(policyHolderId).subscribe(value => {
                expect(component.policyHolderPlans.length).toBe(0)
                expect(component.addPolicyHolderBenefitPlan).toHaveBeenCalledWith(policyHolderId, 0);
                done()
            });
        });

        it('should call addPolicyHolderBenefitPlan if with correct priority if has current plans but is not the policy holder on any of them', (done: DoneFn) => {
            let policyHolderId = '1234556';            
            requestPatientBenefitPlansResolve.push({ BenefitPlanId: '12345678910', PolicyHolderId: '12345568', Priority: 0 });
            component.getBenefitPlansForPolicyHolder(policyHolderId);
            mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlans(policyHolderId).subscribe(value => {
                expect(component.policyHolderPlans.length).toBe(0)
                expect(component.addPolicyHolderBenefitPlan).toHaveBeenCalledWith(policyHolderId, 1);
                done()
            });
        });        

        it('should not call addPolicyHolderBenefitPlan if there are plans which this patient is the policy holder', (done: DoneFn) => {
            let policyHolderId = '1234556';
            requestPatientBenefitPlansResolve.push({ BenefitPlanId: '123456789', PolicyHolderId: '1234556' });
            component.getBenefitPlansForPolicyHolder(policyHolderId);
            mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlans(policyHolderId).subscribe(value => {
                expect(component.policyHolderPlans.length).toBe(1);
                expect(component.addPolicyHolderBenefitPlan).not.toHaveBeenCalled()
                done()
            });
        });

    })

    describe('policyHolderChanged', () => {
        let event;
        let patientBenefitPlan;
        beforeEach(() => {
            patientBenefitPlan = { BenefitPlanId: 'b123456', PolicyHolderId: null };
            component.policyHolders = [
                { Person: { PatientId: '11112' } },
                { Person: { PatientId: '11113' } }];
            spyOn(component, 'setPolicyHolder').and.callFake(() => { });
            spyOn(component, 'clearSelectedPlan').and.callFake(() => { });
        })

        it('should call clearSelectedPlan if selected policyHolderId is Other', () => {
            event = { target: { value: '-1' } };
            component.policyHolderChanged(event, patientBenefitPlan);
            expect(component.clearSelectedPlan).toHaveBeenCalled();
        });

        it('should set showPatientSearch to true if selected policyHolderId is Other', () => {
            event = { target: { value: '-1' } };
            component.policyHolderChanged(event, patientBenefitPlan);
            expect(component.showPatientSearch).toBe(true);
        });

        it('should do nothing if selected policy holder is not in policyHolder list ', () => {
            event = { target: { value: '11114' } };
            component.policyHolderChanged(event, patientBenefitPlan);
            expect(component.setPolicyHolder).not.toHaveBeenCalled();
        });
        it('should call component.setPolicyHolder if selected policy holder is in policyHolder list ' +
            'and if the policy holder id is other than patient and UserIsAuthorizedToAtLeastOnePatientLocation is true', () => {
                component.patient.PatientId = '11113';
                event = { target: { value: '11113' } };
                patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: true } };
                component.policyHolderChanged(event, patientBenefitPlan);
                expect(component.setPolicyHolder).toHaveBeenCalled();
            });

        it('should not call component.setPolicyHolder if selected policy holder is in policyHolder list ' +
            'and if the policy holder id is other than patient and UserIsAuthorizedToAtLeastOnePatientLocation is false', () => {
                component.patient.PatientId = '11113';
                event = { target: { value: '11113' } };
                patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false } };
                component.policyHolderChanged(event, patientBenefitPlan);
                expect(component.setPolicyHolder).toHaveBeenCalled();
            });
    })

    describe('setPolicyHolder)', () => {
        let selectedPolicyHolderId;
        let patientBenefitPlan;
        beforeEach(() => {
            patientBenefitPlan = { BenefitPlanId: 'b123456', PolicyHolderId: null };
            spyOn(component, 'clearSelectedPlan').and.callFake(() => { });
            spyOn(component, 'filterForAvailablePlans').and.callFake(() => { });
            spyOn(component, 'getBenefitPlansForPolicyHolder').and.callFake(() => { });
        })
        it('should call filterForAvailablePlans', () => {
            selectedPolicyHolderId = '11112';
            component.patient.PatientId = '11113';
            component.setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan)
            expect(component.filterForAvailablePlans).toHaveBeenCalled();
        });

        it('should call clearSelectedPlan', () => {
            selectedPolicyHolderId = '11112';
            component.patient.PatientId = '11113';
            component.setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan)
            expect(component.clearSelectedPlan).toHaveBeenCalled();
        });
        it('should set patientBenefitPlan.PolicyHolderId', () => {
            selectedPolicyHolderId = '11112';
            component.patient.PatientId = '11113';
            component.setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan)
            expect(patientBenefitPlan.PolicyHolderId).toEqual(selectedPolicyHolderId);
        });
        it('should set component.showPlanSearch to true if patientBenefitPlan.PolicyHolderId equals patient.PatientId', () => {
            selectedPolicyHolderId = '11113';
            component.patient.PatientId = '11113';
            component.setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan)
            expect(component.showPlanSearch).toBe(true);
        });
        it('should set component.showPlanSearch to false if patientBenefitPlan.PolicyHolderId does not equal patient.PatientId', () => {
            selectedPolicyHolderId = '11112';
            component.patient.PatientId = '11113';
            component.setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan)
            expect(component.showPlanSearch).toBe(false);
        });
        it('should set component.showRelationshipToPolicyHolder to false if patientBenefitPlan.PolicyHolderId equals patient.PatientId', () => {
            selectedPolicyHolderId = '11113';
            component.patient.PatientId = '11113';
            component.setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan)
            expect(component.showRelationshipToPolicyHolder).toBe(false);
        });
        it('should set component.showRelationshipToPolicyHolder to true if patientBenefitPlan.PolicyHolderId does not patient.PatientId', () => {
            selectedPolicyHolderId = '11112';
            component.patient.PatientId = '11113';
            component.setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan);
            expect(component.showRelationshipToPolicyHolder).toBe(true);
        });
        it('should call getBenefitPlansForPolicyHolder if patientBenefitPlan.PolicyHolderId does not patient.PatientId', () => {
            selectedPolicyHolderId = '11112';
            component.patient.PatientId = '11113';
            component.setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan);
            expect(component.getBenefitPlansForPolicyHolder).toHaveBeenCalledWith(selectedPolicyHolderId);
        });
    });

    describe('selectBenefitPlan)', () => {
        let selectedBenefitPlan: BenefitPlanForAddInsuranceDto;
        beforeEach(() => {
            selectedBenefitPlan = cloneDeep(mockBenefitPlan);
        })

        it('should set properties on component.patientBenefitPlan', () => {
            component.selectBenefitPlan(selectedBenefitPlan)
            expect(component.patientBenefitPlan.BenefitPlanId).toEqual(selectedBenefitPlan.BenefitPlanId);
        });

        it('should set properties on component.policyHolderBenefitPlan if defined', () => {
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan)
            component.selectBenefitPlan(selectedBenefitPlan)
            expect(component.policyHolderBenefitPlan.BenefitPlanId).toEqual(selectedBenefitPlan.BenefitPlanId);
        });

        it('should set component.selectedPlan if not PatientHasPlan', () => {
            component.selectBenefitPlan(selectedBenefitPlan)
            expect(component.selectedPlan).toEqual(selectedBenefitPlan);
        });

        it('should not set component.selectedPlan if PatientHasPlan', () => {
            selectedBenefitPlan.PatientHasPlan = true;
            component.selectBenefitPlan(selectedBenefitPlan)
            expect(component.selectedPlan).toBeUndefined();
        });

    });


    describe('clearSelectedPlan)', () => {

        beforeEach(() => {
            component.selectedPlan = cloneDeep(mockBenefitPlan);
            component.patientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            spyOn(component, 'removePolicyHolderBenefitPlan')
        })

        it('should clear properties on component.patientBenefitPlan', () => {
            component.clearSelectedPlan(component.patientBenefitPlan);
            expect(component.patientBenefitPlan.BenefitPlanId).toBe(null);
            expect(component.patientBenefitPlan.PolicyHolderStringId).toBe(null);
            expect(component.patientBenefitPlan.MemberId).toBe(null);
            expect(component.patientBenefitPlan.RelationshipToPolicyHolder).toBe(null);
        });

        it('should call removePolicyHolderBenefitPlan if policyHolderBenefitPlan defined', () => {
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.clearSelectedPlan(component.patientBenefitPlan);
            expect(component.removePolicyHolderBenefitPlan).toHaveBeenCalled()
        });

        it('should set showPlanSearch to true if patientBenefitPlan.PolicyHolderId equals patient.PatientId', () => {
            component.patient = { PatientId: 'p123456787' };
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.patientBenefitPlan.PolicyHolderId = 'p123456787';
            component.clearSelectedPlan(component.patientBenefitPlan);
            expect(component.showPlanSearch).toBe(true);
        });

        it('should set showPlanSearch to false if patientBenefitPlan.PolicyHolderId does not equal patient.PatientId and policyHolderPlans > 0', () => {
            component.patient = { PatientId: 'p123456788' };
            component.policyHolderPlans.push(mockPatientBenefitPlan);
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.patientBenefitPlan.PatientId = 'p123456787';
            component.clearSelectedPlan(component.patientBenefitPlan);
            expect(component.showPlanSearch).toBe(false);
        });

        it('should set showPlanSearch to false if patientBenefitPlan.PolicyHolderId is Other and policyHolderPlans > 0', () => {
            component.patient = { PatientId: 'p123456788' };
            component.policyHolderPlans.push(mockPatientBenefitPlan);
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.patientBenefitPlan.PatientId = 'p123456787';
            component.clearSelectedPlan(component.patientBenefitPlan);
            expect(component.showPlanSearch).toBe(false);
        });

        it('should set showPolicyHolderPlans to true if policyHolderPlans.length > 0', () => {
            component.policyHolderPlans.push(mockPatientBenefitPlan);
            component.patient = { PatientId: 'p123456787' };
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.patientBenefitPlan.PatientId = 'p123456787';
            component.clearSelectedPlan(component.patientBenefitPlan);
            expect(component.showPolicyHolderPlans).toBe(true);
        });

        it('should set showPolicyHolderPlans to true if policyHolderPlans.length = 0', () => {
            component.patient = { PatientId: 'p123456788' };
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.patientBenefitPlan.PatientId = 'p123456787';
            component.clearSelectedPlan(component.patientBenefitPlan);
            expect(component.showPolicyHolderPlans).toBe(false);
        });

        it('should reset boolean checks', () => {
            component.patient = { PatientId: 'p123456788' };
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.patientBenefitPlan.PatientId = 'p123456787';
            component.clearSelectedPlan(component.patientBenefitPlan);
            expect(component.hasErrors).toBe(false);
            expect(component.validEffectiveDate).toBe(true);
            expect(component.showPolicyHolderMessage).toBe(false);
        });
    });

    describe('relationshipToPolicyHolderChanged', () => {
        let event;
        let patientBenefitPlan;

        beforeEach(() => {
            event = { target: { value: 'any' } };
            patientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
        })

        it('should set showPolicyHolderPlans to true and showPolicyOptions to false if policyHolderPlans.length > 0', () => {
            event = { target: { value: '-1' } };
            component.policyHolderPlans.push(mockPatientBenefitPlan);
            component.relationshipToPolicyHolderChanged(event, patientBenefitPlan);
            expect(component.showPolicyHolderPlans).toBe(true);
            expect(component.showPolicyOptions).toBe(false);
        });

        it('should set showPolicyHolderPlans to false and showPolicyOptions to true if policyHolderPlans.length eqauls 0', () => {
            event = { target: { value: '-1' } };
            component.policyHolderPlans = [];
            component.relationshipToPolicyHolderChanged(event, patientBenefitPlan);
            expect(component.showPolicyHolderPlans).toBe(false);
            expect(component.showPolicyOptions).toBe(true);
        });

    });

    describe('onPersonSearch', () => {

        beforeEach(() => {
            spyOn(component, 'onOtherPolicyHolderSelected');
            component.selectedPerson = null;
            component.patientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
        })

        it('should call onOtherPolicyHolderSelected', () => {
            component.onPersonSearch({ PatientId: '123456' });
            expect(component.selectedPerson).toEqual({ PatientId: '123456' });
            expect(component.showRelationshipToPolicyHolder).toBe(true);
            expect(component.onOtherPolicyHolderSelected).toHaveBeenCalledWith(component.selectedPerson, component.patientBenefitPlan);
        });

        it('should set showPolicyOptions to false and set PolicyHolderName', () => {
            component.onPersonSearch({ PatientId: '123456', FirstName: 'Bob', LastName: 'Frapples' });
            expect(component.showPolicyOptions).toBe(false);
            expect(component.policyHolderName).toBe('Bob Frapples');
        });

    });

    describe('onOtherPolicyHolderSelected', () => {
        let patientBenefitPlan;
        let selectedPerson;
        beforeEach(() => {
            selectedPerson = { PatientId: 'p123456789', PersonAccount: { AccountId: '456789' } };
            patientBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            spyOn(component, 'setPolicyHolder');
        });

        it('should call PatientValidationFactory.PatientSearchValidation', () => {
            component.onOtherPolicyHolderSelected(selectedPerson, patientBenefitPlan);
            expect(mockPatientValidationFactory.PatientSearchValidation).toHaveBeenCalled();
        });

        it('should set to null if user not authorized for this location', () => {
            patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false } };
            component.onOtherPolicyHolderSelected(selectedPerson, patientBenefitPlan);
            expect(mockPatientValidationFactory.LaunchPatientLocationErrorModal).toHaveBeenCalled();
            expect(patientBenefitPlan.PolicyHolderId).toBe(null)
        });

        it('should set to null if user not authorized for this location', () => {
            patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: true } };
            component.onOtherPolicyHolderSelected(selectedPerson, patientBenefitPlan);
            expect(mockSoarPatientBenefitPlanHttpService.requestAvailablePolicyHolders).toHaveBeenCalledWith({ accountId: selectedPerson.PersonAccount.AccountId })
        });

        it('should call setPolicyHolder if one of availablePolicyHolders returned matches the selected person ', (done: DoneFn) => {
            patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: true } };
            requestAvailablePolicyHoldersResolve.push({ BenefitPlanId: '123456789', Person: { PatientId: 'p123456788' }, PolicyHolder: [{}] });
            component.onOtherPolicyHolderSelected(selectedPerson, patientBenefitPlan);
            mockSoarPatientBenefitPlanHttpService.requestAvailablePolicyHolders({ accountId: selectedPerson.PersonAccount.AccountId }).subscribe(value => {
                expect(component.setPolicyHolder).not.toHaveBeenCalled()
                done()
            });
        });

        it('should call setPolicyHolder if one of availablePolicyHolders returned matches the selected person ', (done: DoneFn) => {
            patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: true } };
            requestAvailablePolicyHoldersResolve.push({ BenefitPlanId: '123456789', Person: { PatientId: 'p123456789' }, PolicyHolder: [{}] });
            component.onOtherPolicyHolderSelected(selectedPerson, patientBenefitPlan);
            mockSoarPatientBenefitPlanHttpService.requestAvailablePolicyHolders({ accountId: selectedPerson.PersonAccount.AccountId }).subscribe(value => {
                expect(component.setPolicyHolder).toHaveBeenCalledWith(selectedPerson.PatientId, patientBenefitPlan);
                done()
            });
        });


    });

    describe('clearSelectedPerson', () => {

        beforeEach(() => {
            component.selectedPerson = { PatientId: '123456' };
            spyOn(component, 'clearSelectedPlan').and.callFake(() => { });
        })

        it('should clear selectedPerson', () => {
            component.clearSelectedPerson();
            expect(component.selectedPerson).toBe(null);
            expect(component.clearSelectedPlan).toHaveBeenCalledWith(component.patientBenefitPlan);
            expect(component.showPatientSearch).toBe(true);
            expect(component.showRelationshipToPolicyHolder).toBe(false);
        });

        it('should reset boolean checks', () => {
            component.clearSelectedPerson();
            expect(component.validEffectiveDate).toBe(true);
            expect(component.showPolicyOptions).toBe(false);
            expect(component.showPolicyHolderMessage).toBe(false);
        });
    });

    describe('policyHolderStringIdChanged', () => {

        let event;
        let patientBenefitPlan;
        beforeEach(() => {
            patientBenefitPlan = { BenefitPlanId: 'b123456', PolicyHolderId: null };
        });

        it('should set patientBenefitPlan.PolicyHolderStringId', () => {
            event = '12345';
            component.policyHolderStringIdChanged(event, patientBenefitPlan);
            expect(patientBenefitPlan.PolicyHolderStringId).toEqual(event);
        });

        it('should set policyHolderBenefitPlan.PolicyHolderStringId if policyHolderBenefitPlan exists', () => {
            event = '12345';
            component.policyHolderBenefitPlan = cloneDeep(mockPatientBenefitPlan);
            component.policyHolderStringIdChanged(event, patientBenefitPlan);
            expect(component.policyHolderBenefitPlan.PolicyHolderStringId).toEqual(event);
        });
    });

    describe('planSearch', () => {
        let items: BenefitPlanForAddInsuranceDto[] = []
        beforeEach(() => {
            items = [mockBenefitPlan]
        });

        it('should return filtered plans by string value', () => {
            items[0].BenefitPlanGroupName = 'ABC';
            let returnValue = (component.planSearch(items, 'ABC'));
            expect(returnValue[0]).toEqual(items[0]);
        });

        it('should return no rows if no match', () => {
            items[0].BenefitPlanGroupName = 'DRG';
            let returnValue = (component.planSearch(items, 'ABC'));
            expect(returnValue).toEqual([]);
        });

        it('should return filtered plans by PlanGroupNumber value', () => {
            items[0].BenefitPlanGroupName = 'A123';
            let returnValue = (component.planSearch(items, 'A1'));
            expect(returnValue[0]).toEqual(items[0]);
        });
    });

    describe('policyHolderPlanSearch', () => {

        let items: any[] = [];
        beforeEach(() => {
            items = [{
                PolicyHolderDetails: { FirstName: 'Jim', LastName: 'Belushi', DateOfBirth: '1992-09-16 12:55:28.0082334' },
                PolicyHolderBenefitPlanDto: {
                    PolicyHolderStringId: '123456',
                    BenefitPlanDto: {
                        Name: 'John Candy Insurance', CarrierName: '', PlanGroupName: 'ABC',
                        Carrier: { AddressLine1: '', AddressLine2: '', City: '', State: '', ZipCode: '', }
                    }
                }
            }];
        });

        it('should return filtered plans by string value', () => {
            let returnValue = (component.policyHolderPlanSearch(items, 'Cand'));
            expect(returnValue[0]).toEqual(items[0]);
        });

        it('should return no rows if no match', () => {
            let returnValue = (component.policyHolderPlanSearch(items, 'Chevy'));
            expect(returnValue).toEqual([]);
        });
    });

    describe('selectPolicyHolderBenefitPlan', () => {
        let item: any;
        beforeEach(() => {
            item = {
                PolicyHolderDetails: { FirstName: 'Jim', LastName: 'Belushi', DateOfBirth: '1992-09-16 12:55:28.0082334' },
                PolicyHolderBenefitPlanDto: {
                    PolicyHolderStringId: '123456',
                    BenefitPlanDto: {
                        Name: 'John Candy Insurance', CarrierName: '', PlanGroupName: 'ABC',
                        Carrier: { AddressLine1: '', AddressLine2: '', City: '', State: '', ZipCode: '', }
                    }
                }
            };
        });

        it('should set selectedPlan if not item.PolicyHolderBenefitPlanDto.PatientHasPlan', () => {
            component.selectPolicyHolderBenefitPlan(item);
            expect(component.selectedPlan).toEqual(item.PolicyHolderBenefitPlanDto.BenefitPlanDto);
        });

        it('should set not selectedPlan if item.PolicyHolderBenefitPlanDto.PatientHasPlan', () => {
            item.PolicyHolderBenefitPlanDto.PatientHasPlan = true;
            component.selectPolicyHolderBenefitPlan(item);
            expect(component.selectedPlan).toBe(undefined);
        });
    });

    describe('markPlansDisabled', () => {
        let mockPolicyHolderBenefitPlans: any[];
        let mockPatientBenefitPlans: PatientBenefitPlanDto[];
        beforeEach(() => {
            mockPolicyHolderBenefitPlans = [{
                BenefitPlanId: '123456',
                PolicyHolderDetails: { FirstName: 'Jim', LastName: 'Belushi', DateOfBirth: '1992-09-16 12:55:28.0082334' },
                PolicyHolderBenefitPlanDto: {
                    PolicyHolderStringId: '123456',
                    BenefitPlanDto: {
                        Name: 'John Candy Insurance', CarrierName: '', PlanGroupName: 'ABC',
                        Carrier: { AddressLine1: '', AddressLine2: '', City: '', State: '', ZipCode: '', }
                    }
                }
            }];

            mockPatientBenefitPlans = [];
            let patientBenefitPlan: PatientBenefitPlanDto = cloneDeep(mockPatientBenefitPlan);

            // set this patient benefit plan BenefitPlanId to BenefitId from first activeBenefitPlan
            patientBenefitPlan.BenefitPlanId = mockPolicyHolderBenefitPlans[0].BenefitId;
            component.currentPatientBenefitPlans.push(patientBenefitPlan);
        });

        it('should set PatientHasPlan to true if policyHolder plan matches a patient plan', () => {
            mockPolicyHolderBenefitPlans[0].BenefitPlanId = '123456';
            component.currentPatientBenefitPlans[0].BenefitPlanId = '123456';
            mockPolicyHolderBenefitPlans[0].PolicyHolderId = 'ph123456';
            component.currentPatientBenefitPlans[0].PolicyHolderId = 'ph123456';
            component.markPlansDisabled(mockPolicyHolderBenefitPlans);
            expect(mockPolicyHolderBenefitPlans[0].PolicyHolderBenefitPlanDto.PatientHasPlan).toBe(true);
        });

        it('should expect PatientHasPlan to be undefined if policyHolder plan does not match a patient plan', () => {
            mockPolicyHolderBenefitPlans[0].BenefitPlanId = '123457';
            component.currentPatientBenefitPlans[0].BenefitPlanId = '123456';
            component.markPlansDisabled(mockPolicyHolderBenefitPlans);
            expect(mockPolicyHolderBenefitPlans[0].PolicyHolderBenefitPlanDto.PatientHasPlan).toBe(undefined);
        });
    });

    describe('setPlanName', () => {

        it('should set planName based on Priority', () => {
            component.setPlanName(0);
            expect(component.planName).toBe('Primary');

            component.setPlanName(1);
            expect(component.planName).toBe('Secondary');

            component.setPlanName(2);
            expect(component.planName).toBe('3rd');

            component.setPlanName(3);
            expect(component.planName).toBe('4th');

            component.setPlanName(4);
            expect(component.planName).toBe('5th');

            component.setPlanName(5);
            expect(component.planName).toBe('6th');

            component.setPlanName(6);
            expect(component.planName).toBe('');

        });

    });

    describe('filterForAvailablePlans', () => {

        beforeEach(() => {
            let activeBenefitPlans = [];
            for (let x = 1; x < 4; x++) {
                let benefitPlan: BenefitPlanForAddInsuranceDto = cloneDeep(mockBenefitPlan);
                // Why are these properties set here, they don't even exist on this type!
                // benefitPlan.BenefitId+=x.toString(); 
                // benefitPlan.CarrierId+=x.toString(); 
                // benefitPlan.Name+=x; 
                // benefitPlan.PlanGroupName+=x.toString();
                activeBenefitPlans.push(benefitPlan);
            }
            component.activeBenefitPlans = activeBenefitPlans;
            let mockPatientBenefitPlans = [];
            let patientBenefitPlan: PatientBenefitPlanDto = cloneDeep(mockPatientBenefitPlan);
            mockPatientBenefitPlans.push(patientBenefitPlan);
            component.currentPatientBenefitPlans = mockPatientBenefitPlans;
        });
        it('should set PatientHasPlan on filteredBenefitPlans that patient has ', () => {
            let policyHolderId = 'ph123456';
            component.currentPatientBenefitPlans[0].BenefitPlanId = component.activeBenefitPlans[0].BenefitPlanId;
            component.currentPatientBenefitPlans[0].PolicyHolderId = policyHolderId;
            component.filterForAvailablePlans(policyHolderId);
            expect(component.filteredBenefitPlans.length).toBe(3);
            expect(component.filteredBenefitPlans[0].PatientHasPlan).toBe(true);
        });

        it('should not set PatientHasPlan on filteredBenefitPlans that patient does not have ', () => {
            let policyHolderId = 'ph123456';
            component.currentPatientBenefitPlans[0].BenefitPlanId = '5';
            component.filterForAvailablePlans(policyHolderId);
            expect(component.filteredBenefitPlans.length).toBe(3);
            expect(component.filteredBenefitPlans[0].PatientHasPlan).toBe(undefined);
        });

    });

});

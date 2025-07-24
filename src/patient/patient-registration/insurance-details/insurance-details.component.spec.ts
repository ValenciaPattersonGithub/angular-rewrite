import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { InsuranceDetailsComponent } from './insurance-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { BenefitPlanSearchComponent } from 'src/patient/patient-account/patient-insurance-info/benefit-plan-search/benefit-plan-search.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { SvgIconComponent } from 'src/@shared/components/svg-icons/svg-icon.component';
import { SearchBarAutocompleteComponent } from 'src/@shared/components/search-bar-autocomplete/search-bar-autocomplete.component';
import { SearchBarAutocompleteByIdComponent } from '../../../@shared/components/search-bar-autocomplete-by-id/search-bar-autocomplete-by-id.component';
import { AddPatientBenefitPlansModalService } from 'src/patient/patient-benefit-plan/add-patient-benefit-plans-modal.service';
import { subscribeOn } from 'rxjs/operators';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';

describe('InsuranceDetailsComponent', () => {
    let component: InsuranceDetailsComponent;
    let fixture: ComponentFixture<InsuranceDetailsComponent>;
    let patientRegistrationService: any;

    let mockAddPatientBenefitPlansModalService = {
        open: jasmine.createSpy().and.returnValue( {
             events: { type:'confirm' ,next: jasmine.createSpy(), subscribe: jasmine.createSpy(), },
        })         
    }  

    const modalFactory = {
        Modal: jasmine.createSpy().and.returnValue({
            result: {
                then: (fn) => { fn(); }
            }
        })        
    };    
    
    const mockservice = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        get: jasmine.createSpy().and.returnValue([{}]),
        getPatientBenefitPlans: () => of({}),
        LaunchPatientLocationErrorModal: (a: any) => { },
        PatientSearchValidation: (a: any) => { },
        Modal: (a: any) => { },
        PatientBenefitPlan: {
            get: (a: any) => { }
        },
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({}),
        getAvailablePolicyHolders: (a: any) => of({}),
        getPersonByPersonId: (a: any) => of({}),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
            providers: [
                AddPatientBenefitPlansModalService,
                { provide: PatientRegistrationService, useValue: mockservice },
                { provide: 'toastrFactory', useValue: mockservice },
                { provide: 'PatientValidationFactory', useValue: mockservice },
                { provide: 'ModalFactory', useValue: modalFactory },
                { provide: 'PatientServices', useValue: mockservice },
                { provide: 'tabLauncher', useValue: mockservice },
                { provide: AddPatientBenefitPlansModalService, useValue: mockAddPatientBenefitPlansModalService },
            ],
            declarations: [InsuranceDetailsComponent, SearchBarAutocompleteByIdComponent, BenefitPlanSearchComponent, AppLabelComponent, SvgIconComponent, SearchBarAutocompleteComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InsuranceDetailsComponent);
        patientRegistrationService = TestBed.get(PatientRegistrationService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getPatientBenefitPlans', () => {
        it('should call patientRegistrationService.getPatientBenefitPlans when getPatientBenefitPlans is a success', () => {
            spyOn(patientRegistrationService, 'getPatientBenefitPlans').and.callThrough();
            spyOn(component, 'getPatientBenefitPlansOnSuccess').and.callThrough();
            component.getBenefitPlans();
            expect(component.getPatientBenefitPlansOnSuccess).toHaveBeenCalled();
        });
        it('should call getPatientBenefitPlansOnFail when patientRegistrationService.getPatientBenefitPlans throw Error', () => {
            spyOn(patientRegistrationService, 'getPatientBenefitPlans').and.returnValue(throwError('Error'));
            spyOn(component, 'getPatientBenefitPlansOnFail').and.callThrough();
            component.getBenefitPlans();
            expect(component.getPatientBenefitPlansOnFail).toHaveBeenCalled();
        });
    });
    describe('onChangePlan', () => {
        it('should call onChangePlan when user click to change the plan', () => {
            const insurancePolicy: any = {
                showPlanName: true,
                showIfPlanSelected: true
            };
            component.onChangePlan(insurancePolicy);
            expect(component.selectedBenefitPlan).toEqual(null);
            expect(insurancePolicy.showPlanName).toEqual(false);
            expect(insurancePolicy.showIfPlanSelected).toEqual(false);

        });
    });
    describe('showFields', () => {
        it('should call showFields when existing plan is added from a modal', () => {
            const type = 'planAdded';
            const isPolicyHolder = false;
            const insurancePolicy: any = {
                showRelationships: false,
                showPlans: false,
                showPolicyHolderSearch: true,
                showPlanName: false,
                showChangeText: false,
                showIfPlanSelected: false,
                selectPlan: false
            };
            
            component.showFields(insurancePolicy, isPolicyHolder, type);

            expect(insurancePolicy.showRelationships).toEqual(true);
            expect(insurancePolicy.showPlans).toEqual(true);
            expect(insurancePolicy.showPolicyHolderSearch).toEqual(false);
            expect(insurancePolicy.showPlanName).toEqual(true);
            expect(insurancePolicy.showChangeText).toEqual(false);
            expect(insurancePolicy.showIfPlanSelected).toEqual(true);
            expect(insurancePolicy.selectPlan).toEqual(false);
        });
        it('should call showFields when new plan is added from a modal', () => {
            const type = 'newPlanAdded';
            const isPolicyHolder = false;
            const insurancePolicy: any = {
                showRelationships: false,
                showPlans: false,
                showPolicyHolderSearch: true,
                showPlanName: false,
                showChangeText: false,
                showIfPlanSelected: false,
                selectPlan: false
            };

            component.showFields(insurancePolicy, isPolicyHolder, type);

            expect(insurancePolicy.showRelationships).toEqual(true);
            expect(insurancePolicy.showPlans).toEqual(true);
            expect(insurancePolicy.showPolicyHolderSearch).toEqual(false);
            expect(insurancePolicy.showPlanName).toEqual(true);
            expect(insurancePolicy.showChangeText).toEqual(false);
            expect(insurancePolicy.showIfPlanSelected).toEqual(true);
            expect(insurancePolicy.selectPlan).toEqual(true);
        });
        it('should call showFields when policy holder is default', () => {
            const type = 'policyHolder';
            const policyHolder = 'default';
            const insurancePolicy: any = {
                showRelationships: false,
                showPlans: false,
                showPolicyHolderSearch: true,
                showPlanName: false,
                showIfPlanSelected: false,
                showPersonSearch: true
            };

            component.showFields(insurancePolicy, policyHolder, type);

            expect(insurancePolicy.showRelationships).toEqual(false);
            expect(insurancePolicy.showPlans).toEqual(false);
            expect(insurancePolicy.showPolicyHolderSearch).toEqual(false);
            expect(insurancePolicy.showPlanName).toEqual(false);
            expect(insurancePolicy.showIfPlanSelected).toEqual(false);
            expect(component.selectedBenefitPlan).toEqual(null);
            expect(component.isPolicyHolderId).toEqual(null);
            expect(insurancePolicy.showPersonSearch).toEqual(false);

        });
        it('should call showFields when policy holder is self', () => {
            const type = 'policyHolder';
            const policyHolder = 'self';
            const insurancePolicy: any = {
                showRelationships: false,
                showPlans: false,
                showPolicyHolderSearch: true,
                showPlanName: false,
                showIfPlanSelected: false,
                showPersonSearch: true
            };
            
            component.showFields(insurancePolicy, policyHolder, type);

            expect(insurancePolicy.showRelationships).toEqual(false);
            expect(insurancePolicy.showPlans).toEqual(true);
            expect(insurancePolicy.showPolicyHolderSearch).toEqual(false);
            expect(insurancePolicy.showPlanName).toEqual(false);
            expect(insurancePolicy.showIfPlanSelected).toEqual(false);
            expect(component.isPolicyHolderId).toEqual(null);
            expect(insurancePolicy.showPersonSearch).toEqual(false);
        });
        it('should call showFields when policy holder is other', () => {
            const type = 'policyHolder';
            const policyHolder = 'other';
            const insurancePolicy: any = {
                showRelationships: false,
                showPolicyHolderSearch: false,
                showPersonSearch: false
            };
            component.showFields(insurancePolicy, policyHolder, type);

            expect(insurancePolicy.showRelationships).toEqual(false);
            expect(insurancePolicy.showPolicyHolderSearch).toEqual(true);
            expect(component.isPolicyHolderId).toEqual(true);
            expect(insurancePolicy.showPersonSearch).toEqual(true);
        });
    });

    describe('getPatientBenefitPlanSuccess', () => {
        let res = {Value:[]};
        
        beforeEach(() => { 
            spyOn(component, 'planAdded')          
            spyOn(component, 'openInsuranceModal');
            res.Value = [{PolicyHolderBenefitPlanDto:{PolicyHolderId:'123456'}}];
            component.filteredPolicyHolder = {PatientId:'123456'};
        })
        it('should not call openInsuranceModal if patientBenefitPlans length is more than 0', () => {
            component.getPatientBenefitPlanSuccess(res);
            expect(component.openInsuranceModal).not.toHaveBeenCalled();
            expect(component.planAdded).toHaveBeenCalled();
        });

        it('should call openInsuranceModal if patientBenefitPlans length is 0', () => {
            res = {Value:[]};
            component.getPatientBenefitPlanSuccess(res);
            expect(component.openInsuranceModal).toHaveBeenCalled();            
            expect(component.planAdded).not.toHaveBeenCalled();
        });
    });

    describe('openInsuranceModal', () => {
        let patient = {PatientId:'123456'};
        beforeEach(() => {
            spyOn(patientRegistrationService, 'getPersonByPersonId').and.returnValue(of({}));
        });
        it('should call registrationService.getPersonByPersonId with patientId', () => {
            component.openInsuranceModal(patient);
            expect(patientRegistrationService.getPersonByPersonId).toHaveBeenCalledWith(patient.PatientId);
        });

        it('should call addPatientBenefitPlansModalService.open', () => {
            component.openInsuranceModal(patient);
            expect(mockAddPatientBenefitPlansModalService.open).toHaveBeenCalled();
        });       
    })

    describe('onPolicyHolderSelected', () => {
        let event;
        let insurancePolicy = {};        
        beforeEach(() => {   
            event = {target:{value:'1'}};
            spyOn(component, 'filterBenefitPlans');
        })
        it('should call filterBenefitPlans when policyHolderSelected is self', () => {
            event = {target:{value:'1'}};
            component.onPolicyHolderSelected(event, insurancePolicy, 1);            
            expect(component.filterBenefitPlans).toHaveBeenCalled
        });

        it('should not call filterBenefitPlans when policyHolderSelected is other', () => {
            event = {target:{value:'2'}};
            component.onPolicyHolderSelected(event, insurancePolicy, 1);
            expect(component.filterBenefitPlans).not.toHaveBeenCalled
        });       
    });

    describe('filterBenefitPlans', () => {            
        beforeEach(() => { 
            component.policies = {value: []};
            component.policies.value.push({PolicyHolderId:'', BenefitPlanId:'2'});
            component.benefitPlans = [{BenefitId:'1'},{BenefitId:'2'}, {BenefitId:'3'}]; 
            component.filteredBenefitPlans=[];
        });
;       it('should filter benefitPlans based on matching BenefitPlanId when PolicyHolderId is empty (self)', () => {
            component.filterBenefitPlans();
            expect(component.filteredBenefitPlans.length).toEqual(2);
        });         
    });
    
   
});

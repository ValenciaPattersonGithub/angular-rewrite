import { ComponentFixture, TestBed, flushMicrotasks, fakeAsync, waitForAsync } from '@angular/core/testing';

import { EncounterCartComponent } from './encounter-cart.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { EncounterCartCardComponent } from '../encounter-cart-card/encounter-cart-card.component';
import { EncounterCartBalanceBarComponent } from '../encounter-cart-balance-bar/encounter-cart-balance-bar.component';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import {
    EncounterTotalAmountPipe, EncounterTotalTaxPipe, EncounterTotalDiscountPipe,
    EncounterTotalFeePipe, EncounterTotalAdjEstPipe, EncounterTotalEstinsPipe, EncounterTotalPatientPortionPipe,
    EncounterTotalAllowedAmountPipe
} from 'src/@shared/pipes/encounter/encounter-totals.pipe';
import { SharedModule } from '../../../@shared/shared.module';
import { ServiceTotalEstinsPipe, ServiceAdjEstPipe } from '../../../@shared/pipes/service/service-totals.pipe';
import { ToothAreaDataService } from '../../../@shared/providers/tooth-area-data.service';
import { ToothAreaService } from '../../../@shared/providers/tooth-area.service';
import { PatientEncounterService } from '../providers/patient-encounter.service';
import { configureTestSuite } from 'src/configure-test-suite';
import { Insurance } from '../../../patient/common/models/insurance.model';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { CurrencyPipe } from '@angular/common';
import { BestPracticePatientNamePipe } from 'src/@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { of } from 'rxjs';
import { SoarInsuranceEstimateHttpService } from 'src/@core/http-services/soar-insurance-estimate-http.service';
import { SoarEncounterHttpService } from 'src/@core/http-services/soar-encounter-http.service';

describe('EncounterCartComponent', () => {
    let component: EncounterCartComponent;
    let fixture: ComponentFixture<EncounterCartComponent>;

    let patientServices: any;
    let scheduleServices: any;
    let route: any;
    let encounterService: any;
    let toastrFactory: any;
    let financialService: any;
    let modalFactory: any;
    let businessCenterService: any;
    let toothAreaDataService: any;
    let successResult: any;

    let mockPatSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
    };    
    let mockToothAreaDataService = {
        loadPrerequisiteData: jasmine.createSpy('toothAreaDataService.loadPrerequisiteData'),
        loadToothAreaDataValuesForService: jasmine.createSpy('toothAreaDataService.loadToothAreaDataValuesForService'),
    };

    // confirmationModal objects

    const mockConfirmationModalSubscription = {
        subscribe: jasmine.createSpy(),
        unsubscribe: jasmine.createSpy(),
        _subscriptions: jasmine.createSpy(),
        _parentOrParents: jasmine.createSpy(),
        closed: jasmine.createSpy(),
    };

    const mockDialogRef = {
        events: {
            pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
            // subscribe: jasmine.createSpy(),
            // unsubscribe: jasmine.createSpy(),
        },
        subscribe: jasmine.createSpy(),
        unsubscribe: jasmine.createSpy(),
        _subscriptions: jasmine.createSpy(),
        _parentOrParents: jasmine.createSpy(),
        closed: jasmine.createSpy(),
    };

    const mockConfirmationModalService = {
        open: jasmine.createSpy().and.returnValue({
            events: {
                pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
            },
            subscribe: jasmine.createSpy(),
            closed: jasmine.createSpy(),
        }),
    };

    const mockCurrencyPipe = new CurrencyPipe('en_US', 'USD');               

    const mockBestPracticePatientNamePipe = new BestPracticePatientNamePipe();

    const mockEncounterTotalPatientPortionPipe = new EncounterTotalPatientPortionPipe();

    let serviceEstimateCalculationService = {            
        mapServiceTransactionToInterface:jasmine.createSpy(). and.callFake(() => { })
    };

    let mockSoarInsuranceEstimateHttpService = {
        calculateDiscountAndTaxAndInsuranceEstimate: jasmine.createSpy('SoarInsuranceEstimateHttpService.mockSoarInsuranceEstimateHttpService').and.returnValue(
            of({
                Value: []
            })),

    };

    let mockSoarEncounterHttpService = {
        update: jasmine.createSpy('SoarEncounterHttpService.mockEncounterHttpService').and.returnValue(
            of({
                Value: {
                    AccountMemberId: 1,
                    EncounterId: 1,
                    Description: 'test',
                    ServiceTransactionDtos: [
                        { EncounterId: 1, ServiceTransactionId: 1 },
                        { EncounterId: 1, ServiceTransactionId: 2 }
                    ]
                }
            })
        ),
        create: jasmine.createSpy('SoarEncounterHttpService.mockEncounterHttpService').and.returnValue(
            of({
                Value: {
                    AccountMemberId: 1,
                    EncounterId: 1,
                    Description: 'test',
                    ServiceTransactionDtos: []
                }
            })
        )
    };


    configureTestSuite(() => {
        const mockEncounterService = {
            serviceHasChanged$: { subscribe: jasmine.createSpy().and.returnValue({ unsubscribe: () => { } }) },
            notifyServiceHasChanged: jasmine.createSpy().and.callFake(() => { })
        };
        let mockPatientServices: any = {
            Encounter: {
                getEncountersByAccountId: jasmine.createSpy()
            },
            PatientAppointment: {
                GetWithDetails: jasmine.createSpy().and.callFake((array) => {
                    return {
                        then(callback) {
                            callback(array);
                        }
                    };
                })
            },
            Patients: {
                get: jasmine.createSpy().and.callFake((array) => {
                    return {
                        then(callback) {
                            callback(array);
                        }
                    };
                })
            },
            PatientBenefitPlan: {
                getBenefitPlansRecordsByPatientId: jasmine.createSpy().and.returnValue({ $promise: { then: function () { return {}; } } })
            },           
        };
        let mockScheduleServices: any = {
            Lists: {
                Appointments: {
                    GetWithDetails: jasmine.createSpy().and.callFake((array) => {
                        return {
                            then(callback) {
                                callback(array);
                            }
                        };
                    })
                }
            },
            Update: {
                Appointment: jasmine.createSpy()
            }
        };
        const mockBusinessCenterServices: any = {
            FeeSchedule: {
                get: jasmine.createSpy().and.returnValue({ $promise: { then: function () { return {}; } } }),
                getById: jasmine.createSpy().and.returnValue({ $promise: { then: function () { return {}; } } })
            }
        };
        const mockFinancialService: any = {
            CreateOrCloneInsuranceEstimateObject: jasmine.createSpy().and.returnValue([{ AccountMemberId: 1 }]),
            RecalculateInsurance: jasmine.createSpy().and.returnValue({ then: function () { return {}; } }),
            CreateInsuranceEstimateObject: jasmine.createSpy().and.returnValue([{ PatientBenefitPlanId: 1 }]),
        };
        const mockModalFactory: any = {
            Modal: jasmine.createSpy().and.returnValue([{ isEncounterServices: false }])
        };
        const mockRoute: any = {};
        const mockWindowObject: any = {};
        const mockDiscardChangesService: any = {
            onRegisterController: jasmine.createSpy(),
            currentChangeRegistration: {
                hasChanges: false,
                controller: ''
            }
        };
        const mockLocationService: any = {
            getCurrentLocation: jasmine.createSpy()
        };
        const mockReferenceDataServices: any = {
            get: function (x) { return []; },
            getData: function (x) { return []; },
            entityNames: {
                serviceCodes: [{ Description: 'code1', ServiceCodeId: '1', DiscountableServiceTypeId: '1' }]
            }
        };
        const mockQ: any = {
            all: function (x) { return []; }
        };
        const mockToastrFactory: any = {
            error: jasmine.createSpy(),
            success: jasmine.createSpy()
        };

        const mockLocalizeService: any = {
            getLocalizedString: jasmine.createSpy().and.returnValue('Service Date')
        };

        

        const mockToothAreaDataService = {
            loadPrerequisiteData: jasmine.createSpy('toothAreaDataService.loadPrerequisiteData').and.callFake(() => []),
            loadToothAreaDataValuesForService: jasmine.createSpy('toothAreaDataService.loadToothAreaDataValuesForService').and.callFake(function (x) { return x; }),
        };

        const mockToothAreaService = {
            //loadPrerequisiteData: jasmine.createSpy('toothAreaDataService.loadPrerequisiteData'),
            //loadToothAreaDataValuesForService: jasmine.createSpy('toothAreaDataService.loadToothAreaDataValuesForService'),
        };

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), AppKendoUIModule, SharedModule, FormsModule],
            declarations: [EncounterCartComponent, EncounterCartCardComponent, EncounterCartBalanceBarComponent,
                EncounterTotalAmountPipe, EncounterTotalTaxPipe, EncounterTotalDiscountPipe,
                EncounterTotalFeePipe, EncounterTotalAdjEstPipe, EncounterTotalEstinsPipe, EncounterTotalPatientPortionPipe,
                ServiceTotalEstinsPipe, ServiceAdjEstPipe, EncounterTotalAllowedAmountPipe],
            providers: [
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: 'ScheduleServices', useValue: mockScheduleServices },
                { provide: 'PatientEncounterService', useValue: mockEncounterService },
                { provide: 'referenceDataService', useValue: mockReferenceDataServices },
                { provide: '$q', useValue: mockQ },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'FinancialService', useValue: mockFinancialService },
                { provide: 'ModalFactory', useValue: mockModalFactory },
                { provide: '$routeParams', useValue: mockRoute },
                { provide: 'locationService', useValue: mockLocationService },
                { provide: 'windowObject', useValue: mockWindowObject },
                { provide: 'BusinessCenterServices', useValue: mockBusinessCenterServices },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'DiscardChangesService', useValue: mockDiscardChangesService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService }, 
                { provide: ToothAreaService, useValue: mockToothAreaService },
                { provide: ToothAreaDataService, useValue: mockToothAreaDataService }, 
                { provide: CurrencyPipe, useValue: mockCurrencyPipe },
                { provide: BestPracticePatientNamePipe, useValue: mockBestPracticePatientNamePipe },
                { provide: EncounterTotalPatientPortionPipe, useValue: mockEncounterTotalPatientPortionPipe },
                { provide: SoarInsuranceEstimateHttpService, useValue: mockSoarInsuranceEstimateHttpService },
                { provide: SoarEncounterHttpService, useValue: mockSoarEncounterHttpService }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EncounterCartComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
        toothAreaDataService = TestBed.get(ToothAreaDataService);
        patientServices = TestBed.get('PatientServices');
        scheduleServices = TestBed.get('ScheduleServices');
        encounterService = TestBed.get(PatientEncounterService);
        toastrFactory = TestBed.get('toastrFactory');
        financialService = TestBed.get('FinancialService');
        modalFactory = TestBed.get('ModalFactory');
        route = TestBed.get('$routeParams');
        businessCenterService = TestBed.get('BusinessCenterServices');
        component.location = { id: 1 };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit function ->', async () => {
        let successResult = 'Woot!';
        let getWithDetailsResult = { Value: { Appointment: { PlannedServices: [{}, {}] } } };
        beforeEach(() => {
            patientServices.Encounter = {
                getEncountersByAccountId: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(successResult) }
                })
            };
            component.location = { id: 1 };

            patientServices.PatientBenefitPlan = {
                getBenefitPlansRecordsByPatientId: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(successResult) }
                })
            }

            patientServices.Patients = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(successResult) }
                })
            }

            patientServices.PatientAppointment = {
                GetWithDetails: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(getWithDetailsResult) }
                })
            }

            businessCenterService.FeeSchedule = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(successResult) }
                }),
                getById: jasmine.createSpy().and.returnValue({ $promise: { then: function () { return {}; } } })
            };

            toothAreaDataService = {
                loadPrerequisiteData: jasmine.createSpy('toothAreaDataService.loadPrerequisiteData'),
            };

            component.accountId = 'accountid';
            route = { patientId: '123' };
        });

        it('should set title property', () => {
            component.title = '';

            component.ngOnInit();

            expect(component.title).toBe('Cart for Encounter');
        });


        it('should call patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId when encounterId is not null', () => {
            component.encounterId = 'encounterId';


            component.ngOnInit();

            expect(patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId).toHaveBeenCalled();
        });


        it('should call patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId when encounterId is null', () => {
            component.encounterId = null;

            component.ngOnInit();

            expect(patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId).toHaveBeenCalled();
        });


        it('should call patientServices.Encounter.getEncountersByAccountId when encounterId is not null', () => {
            component.encounterId = 'encounterId';
            component.ngOnInit();

            expect(patientServices.Encounter.getEncountersByAccountId).toHaveBeenCalledWith({ accountId: component.accountId, includeTransactions: true });
        });


        it('should call patientServices.PatientAppointment.GetWithDetails when encounterId is null and appointmentId is not null or undefined', () => {
            component.appointmentId = '1234';
            component.ngOnInit();
            expect(patientServices.PatientAppointment.GetWithDetails).toHaveBeenCalledWith({ appointmentId: component.appointmentId, FillAppointmentType: true, FillProviders: true, FillServices: true });
        });

        it('should not call patientServices.PatientAppointment.GetWithDetails when encounterId is null and appointmentId is null or undefined', () => {
            component.ngOnInit();
            expect(patientServices.PatientAppointment.GetWithDetails).not.toHaveBeenCalledWith({ appointmentId: component.appointmentId, FillAppointmentType: true, FillProviders: true, FillServices: true });
        });

        it('should not call patientServices.Encounter.getEncountersByAccountId when encounterId is null', () => {
            component.encounterId = null;

            component.ngOnInit();

            expect(patientServices.Encounter.getEncountersByAccountId).not.toHaveBeenCalled();
        });

        describe('serviceTransactionData promise resolve  ->', () => {

            beforeEach(() => {
                spyOn(component, 'addServicesToEncounter');
                patientServices.PatientAppointment.GetWithDetails = () => {
                    return {
                        $promise: {
                            then: (success) => success(getWithDetailsResult)
                        }
                    };
                };
            });

            it('should call addServicesToEncounter for each plannedService in appointment if appointmentId and no encounterId', fakeAsync(() => {
                component.appointmentId = '1234';
                let res = getWithDetailsResult.Value;
                component.ngOnInit();
                flushMicrotasks();
                expect(component.addServicesToEncounter).toHaveBeenCalledWith(res.Appointment.PlannedServices, null, null);
            }));

            it('should set isLoadingData property after getting all data', fakeAsync(() => {
                expect(component.isLoadingData).toBe(true);
                component.appointmentId = '1234';

                component.ngOnInit();
                flushMicrotasks();

                expect(component.isLoadingData).toBe(false);
            }));

            it('should not call addServicesToEncounter if appointmentId and encounterId', fakeAsync(() => {
                component.appointmentId = '1234';
                component.encounterId = '5678';
                let res = getWithDetailsResult.Value;
                component.ngOnInit();
                flushMicrotasks();
                expect(component.addServicesToEncounter).not.toHaveBeenCalled();
            }));

            it('should set appointmentId to first serviceTransaction.AppointmentId if no appointmentId and encounterId exists'+
            ' when editing an existing encounter', fakeAsync(() => {
                let successResult = {Value:
                    [{EncounterId:'5678', AppointmentId:'1234', ServiceTransactionDtos:[
                        {AppointmentId:'1234',Description: 'codeA:descA'},{AppointmentId:'1234', Description:'codeB:descB'}
                    ]}, 
                    {EncounterId:'5679', AppointmentId:'1235', ServiceTransactionDtos:[
                        {AppointmentId:'1235',Description: 'codeC:descC'},{AppointmentId:'1235', Description:'codeD:descD'}
                    ]}] 
                };                
                patientServices.Encounter = {
                    getEncountersByAccountId: jasmine.createSpy().and.returnValue({
                        $promise: { then: (success, failure) => success(successResult) }
                    })
                };                
                component.appointmentId = null;
                component.encounterId = '5678';                
                component.ngOnInit();
                flushMicrotasks();
                expect(component.appointmentId).toEqual('1234');
            }));

            it('should not set appointmentId to first serviceTransaction.AppointmentId if appointmentId exists and encounterId exists'+
            ' when editing an existing encounter', fakeAsync(() => {
                let successResult = {Value:
                    [{EncounterId:'5678', AppointmentId:'1234', ServiceTransactionDtos:[
                        {AppointmentId:'1234',Description: 'codeA:descA'},{AppointmentId:'1234', Description:'codeB:descB'}
                    ]}, 
                    {EncounterId:'5679', AppointmentId:'1235', ServiceTransactionDtos:[
                        {AppointmentId:'1235',Description: 'codeC:descC'},{AppointmentId:'1235', Description:'codeD:descD'}
                    ]}] 
                };                
                patientServices.Encounter = {
                    getEncountersByAccountId: jasmine.createSpy().and.returnValue({
                        $promise: { then: (success, failure) => success(successResult) }
                    })
                };                
                component.appointmentId = '1236';
                component.encounterId = '5678';                
                component.ngOnInit();
                flushMicrotasks();
                expect(component.appointmentId).toEqual('1236');
            }));

            it('should not set appointmentId if no service has AppointmentId and no component.appointmentId exists and encounterId exists'+
            ' when editing an existing encounter', fakeAsync(() => {
                let successResult = {Value:
                    [{EncounterId:'5678', AppointmentId:'1234', ServiceTransactionDtos:[
                        {AppointmentId:null,Description: 'codeA:descA'},{AppointmentId:null, Description:'codeB:descB'}
                    ]}, 
                    {EncounterId:'5679', AppointmentId:'1235', ServiceTransactionDtos:[
                        {AppointmentId:'1235',Description: 'codeC:descC'},{AppointmentId:'1235', Description:'codeD:descD'}
                    ]}] 
                };                
                patientServices.Encounter = {
                    getEncountersByAccountId: jasmine.createSpy().and.returnValue({
                        $promise: { then: (success, failure) => success(successResult) }
                    })
                };                
                component.appointmentId = null;
                component.encounterId = '5678';                
                component.ngOnInit();
                flushMicrotasks();
                expect(component.appointmentId).toEqual(null);
            }));

            it('should not call addServicesToEncounter if no appointmentId and encounterId', fakeAsync(() => {
                let res = getWithDetailsResult.Value;
                component.ngOnInit();
                flushMicrotasks();
                expect(component.addServicesToEncounter).not.toHaveBeenCalled();
            }));
        });

        describe('getBenefitPlans success function ->', () => {

            let result, updateTitleSpy;
            beforeEach(() => {
                component.patientBenefitPlans = [{ Test: 1 }];
                result = {};

                patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId = () => {
                    return {
                        $promise: {
                            then: (success, failure) => success(result)
                        }
                    };
                };

                updateTitleSpy = jasmine.createSpy();
                (component as any).updateTitle = updateTitleSpy;
                component.encounterId = 'encounterid';
                component.loadFeeSchedule = jasmine.createSpy();
            });

            it('should not set patientBenefitPlans when res.Value is null', fakeAsync(() => {
                result.Value = null;

                component.ngOnInit();
                flushMicrotasks();

                expect(component.patientBenefitPlans).toEqual([{ Test: 1 }]);
            }));

            it('should not set patientBenefitPlans when res.Value.length is 0', fakeAsync(() => {
                result.Value = [];

                component.ngOnInit();
                flushMicrotasks();

                expect(component.patientBenefitPlans).toEqual([{ Test: 1 }]);
            }));

            it('should set patientBenefitPlans when res.Value.length is > 0', fakeAsync(() => {
                result.Value = [{ Test: 2 }];

                component.ngOnInit();
                flushMicrotasks();

                expect(component.patientBenefitPlans).toBe(result.Value);
            }));

        });

        describe('getEncounters success function ->', () => {

            let result, updateTitleSpy;
            beforeEach(() => {
                result = {};
                patientServices.Encounter.getEncountersByAccountId = () => {
                    return {
                        $promise: {
                            then: (success) => success(result)
                        }
                    };
                };

                patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId = () => {
                    return {
                        $promise: {
                            then: (success, failure) => success({})
                        }
                    };
                };

                updateTitleSpy = jasmine.createSpy();
                (component as any).updateTitle = updateTitleSpy;
                component.encounterId = 'encounterid';
            });

            it('should set values and call updateTitle when res.Value.length is > 0', fakeAsync(() => {
                let services = [{ Description: 'code1:desc1' }, { Description: 'code2:desc2' }];
                result.Value = [{ EncounterId: 'junk' }, { EncounterId: component.encounterId, ServiceTransactionDtos: services }];

                component.ngOnInit();
                flushMicrotasks();

                //expect(toastrFactory.error).not.toHaveBeenCalled();
                expect(component.encounter.EncounterId).toBe(component.encounterId);
                expect(component.services[1].CompleteDescription).toBe('desc2');
                expect(component.services[1].Code).toBe('code2');
                expect(component.services[0].CompleteDescription).toBe('desc1');
                expect(component.services[0].Code).toBe('code1');
            }));

        });
    });

    describe('loadFeeSchedule ->', () => {
        it('should call FeeSchedule.getbyid if FeeSchedules', () => {
            let newFeeSchedule = { FeeScheduleId: 1 };
            businessCenterService.FeeSchedule = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(successResult) }
                }),
                getById: jasmine.createSpy().and.returnValue({ $promise: { then: function () { return {}; } } })
            };
            component.loadFeeSchedule(newFeeSchedule);

            expect(businessCenterService.FeeSchedule.getById).toHaveBeenCalled();
        });

        it('should not call FeeSchedule.getbyid if no FeeSchedules', () => {
            let newFeeSchedule = null;
            businessCenterService.FeeSchedule = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(successResult) }
                }),
                getById: jasmine.createSpy().and.returnValue({ $promise: { then: function () { return {}; } } })
            };
            component.loadFeeSchedule(newFeeSchedule);

            expect(businessCenterService.FeeSchedule.getById).not.toHaveBeenCalled();
        });
    });

    describe('updateAllowedAmount ->', () => {
        beforeEach(() => {
            component.patientBenefitPlans = [{
                PatientBenefitPlanId: 1,
                PolicyHolderBenefitPlanDto: {
                    BenefitPlanDto: {
                        FeeScheduleId: 10
                    }
                }
            }];
            component.feeSchedules = [{
                FeeScheduleId: 10,
                FeeScheduleGroupDtos: [{
                    LocationIds: [123],
                    FeeScheduleGroupDetails: [{
                        ServiceCodeId: '1234',
                        AllowedAmount: 12345
                    }]
                }]
            }];
            component.location = { id: 123 };
        });

        it('should do nothing if servicetransaciton is null', () => {
            let serviceTransaction = null;

            component.updateAllowedAmount(serviceTransaction);

            expect(serviceTransaction).toBe(null);
        });

        it('should set AllowedAmountDisplay on each estimate to AllowedAmount if AllowedAmountOverride is null', () => {
            let serviceTransaction = { InsuranceEstimates: [] };
            serviceTransaction.InsuranceEstimates.push({ PatientBenefitPlanId: null, ServiceCodeId: '1234', AllowedAmount: 0 });
            serviceTransaction.InsuranceEstimates.push({ PatientBenefitPlanId: null, ServiceCodeId: '1234', AllowedAmount: 10 });
            component.updateAllowedAmount(serviceTransaction);

            expect(serviceTransaction.InsuranceEstimates[0].AllowedAmountDisplay).toBe(0);
            expect(serviceTransaction.InsuranceEstimates[1].AllowedAmountDisplay).toBe(10);
        });

        it('should set serviceTransaction.AllowedAmountDisplay properties to AllowedAmountOverride '+
        'if it is not null and if there is only one row of InsuranceEstimates', () => {  
            let serviceTransaction = {AllowedAmount: null, InsuranceEstimates: [] };
            serviceTransaction.InsuranceEstimates.push({ PatientBenefitPlanId: null, ServiceCodeId: '1234', AllowedAmount: 0 , AllowedAmountOverride: 125 });
            component.updateAllowedAmount(serviceTransaction);
            expect(serviceTransaction.InsuranceEstimates[0].AllowedAmountDisplay).toBe(125);           
            expect(serviceTransaction.AllowedAmount).toBe(125);         
        });

        it('should set serviceTransaction.AllowedAmount properties to the lesser insuranceEstimate.AllowedAmountDisplay (when one or more is override) '+
        'if there is more than one row InsuranceEstimates', () => { 
            let serviceTransaction = {AllowedAmount: null, InsuranceEstimates: [] };
            serviceTransaction.InsuranceEstimates.push({ PatientBenefitPlanId: null, ServiceCodeId: '1234', AllowedAmount: 0 , AllowedAmountOverride: 125 });
            serviceTransaction.InsuranceEstimates.push({ PatientBenefitPlanId: null, ServiceCodeId: '1234', AllowedAmount: 100 , AllowedAmountOverride: null });
           
            component.updateAllowedAmount(serviceTransaction); 
            expect(serviceTransaction.InsuranceEstimates[0].AllowedAmountDisplay).toBe(125);    
            expect(serviceTransaction.InsuranceEstimates[1].AllowedAmountDisplay).toBe(100);              
            expect(serviceTransaction.AllowedAmount).toBe(100);            
        });

        it('should set serviceTransaction.AllowedAmount properties to the lesser insuranceEstimate.AllowedAmount (when one or more is override) '+
        'if there is more than one row InsuranceEstimates and service.AllowedAmount is null', () => {  
            
            let serviceTransaction = {AllowedAmount: null, InsuranceEstimates: [] };
            serviceTransaction.InsuranceEstimates.push({ PatientBenefitPlanId: null, ServiceCodeId: '1234', AllowedAmount: 0 , AllowedAmountOverride: 125 });
            serviceTransaction.InsuranceEstimates.push({ PatientBenefitPlanId: null, ServiceCodeId: '1234', AllowedAmount: 100 , AllowedAmountOverride: 100 });
           
            component.updateAllowedAmount(serviceTransaction); 
            expect(serviceTransaction.InsuranceEstimates[0].AllowedAmountDisplay).toBe(125);    
            expect(serviceTransaction.InsuranceEstimates[1].AllowedAmountDisplay).toBe(100);              
            expect(serviceTransaction.AllowedAmount).toBe(100);            
        });

    });

    describe('cancelClicked function ->', () => {
        beforeEach(()=>{
            component.cancel.emit = jasmine.createSpy();
            spyOn(component, 'confirmCancellation');
        })

        it('should call cancel.emit if no changes', () => {
            component.hasChanges = false;
            component.cancelClicked();
            expect(component.cancel.emit).toHaveBeenCalled();
        });

        it('should component.confirmCancellation if changes', () => {
            component.hasChanges = true;
            component.cancelClicked();
            expect(component.confirmCancellation).toHaveBeenCalled();
        });
    });

    describe('getEncounterDisplayDate function ->', () => {
        beforeEach(() => {
            component.services = [
                { EncounterId: 1, ServiceTransactionId: 1, DateEntered: '2021-01-05 22:32:59.5352723Z' },
                { EncounterId: 1, ServiceTransactionId: 2, DateEntered: '2021-01-06 15:35:59.5352257Z' }
            ];            
        });
        it('should return formatted version of the oldest DateEntered from service transactions on encounter', () => {
            expect(component.getEncounterDisplayDate(component.services)).toEqual('01/05/2021')
        });

        it('should return formatted version of the oldest DateEntered from service transactions on encounter when date does not have timezone offset', () => {
            component.services[0].DateEntered = '2021-01-05 22:32:59.5352723'
            expect(component.getEncounterDisplayDate(component.services)).toEqual('01/05/2021')
        });
    });

    describe('confirmCancellation function ->', () => {
        let data={ header: 'Discard Changes', message: 'Are you sure you want to discard these changes?', message2: null, confirm: 'Yes', cancel: 'No', height: 200, width: 400 }
        beforeEach(() => {            
            component.patientData = {
                FirstName: 'Kate', LastName:'Bradshaw',                
            };
            component.services = [
                { EncounterId: 1, ServiceTransactionId: 1, DateEntered: '2021-01-05 22:32:59.5352723Z', Amount: 25.00, ObjectState: 'Update', InsuranceEstimates:[]},
                { EncounterId: 1, ServiceTransactionId: 2, DateEntered: '2021-01-06 15:35:59.5352257Z', Amount: 35.00, ObjectState: 'Update', InsuranceEstimates:[]},
            ]
            
        });
        it('should call ConfirmationModalService.open with standard message if isFamilyCheckout is false', () => {
            component.isFamilyCheckout = false;
            data.message = 'Are you sure you want to discard these changes?';
            data.message2 = null;
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);

            component.confirmCancellation()
            expect(mockConfirmationModalService.open).toHaveBeenCalledWith({data});
        });

        it('should call ConfirmationModalService.open with modified message if isFamilyCheckout is true', () => {
            component.isFamilyCheckout = true;
            data.message = 'Are you sure you want to discard these changes for ';
            data.message2 = 'Kate Bradshaw 01/05/2021 $60.00';
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            
            component.confirmCancellation()
            expect(mockConfirmationModalService.open).toHaveBeenCalledWith({data});
        });
    });

    describe('saveEncounter function, encounter saved already->', () => {
        beforeEach(() => {
            //Possible scenarios to represent
            //1. Previously on the encounter, but removed
            //2. New service, never saved yet
            //3. Existing service, already saved, but not yet on the encounter
            //4. Existing service, already on encounter, remains on the encounter

            component.encounter = {
                AccountMemberId: 1,
                EncounterId: 1,
                Description: 'test',
                ServiceTransactionDtos: [
                    { EncounterId: 1, ServiceTransactionId: 1 },

                    //Service that was on the encounter, but we want to remove
                    { EncounterId: 1, ServiceTransactionId: 2 }
                ]
            };

            component.services = [
                //New service, not saved yet
                { EncounterId: 1, ServiceTransactionId: null, DisplayAs: '1' },

                //Service already saved to the encounter
                { EncounterId: 1, ServiceTransactionId: 1, DisplayAs: '2' },

                //Existing service, but not saved to encounter yet
                { EncounterId: 1, ServiceTransactionId: 3, DisplayAs: '3' }
            ];
            component.navigateToNextScreen = jasmine.createSpy();
            component.processRequiredPropertiesForServiceTransaction = jasmine.createSpy().and.returnValue({
                AccountMemberId: 1,
                EncounterId: 1,
                Description: 'test',
                ServiceTransactionDtos: [
                    { EncounterId: 1, ServiceTransactionId: 1 },
                    { EncounterId: 1, ServiceTransactionId: 2 }
                ]
            });
        });

        it('should call reconcile encounter and services list', () => {
            const successResponse = { Value: true };
            component.isEditEncounter = true;

            spyOn(component, 'validateInsuranceOrder')

            component.saveEncounter();

            expect(component.validateInsuranceOrder).toHaveBeenCalledWith(component.services);

            expect(component.encounter).toEqual({
                AccountMemberId: 1,
                EncounterId: 1,
                Description: 'test',
                ServiceTransactionDtos: [
                    { EncounterId: 1, ServiceTransactionId: 1 },

                    //Service that was on the encounter, but we want to remove
                    { EncounterId: 1, ServiceTransactionId: 2 }
                ]
            });
        });

    });

    describe('saveEncounter function, update encounter created from appointment->', () => {
        beforeEach(() => {
            component.appointmentId = '1234';
            // existing encounter originally created from an appointment with 2 services from same appointment          
            component.encounter = {
                Description: 'test',
                ServiceTransactionDtos: [
                    { EncounterId: 1, ServiceTransactionId: 1234, AppointmentId: '1234' },
                    { EncounterId: 1, ServiceTransactionId: 1236, AppointmentId: '1234' }
                ]
            };
            // component services includes new service added from encounter page
            component.services = [
                { EncounterId: 1, ServiceTransactionId: 1234, AppointmentId: '1234' },
                { EncounterId: 1, ServiceTransactionId: 1236, AppointmentId: '1234' },
                { EncounterId: null, ServiceTransactionId: null, AppointmentId: null, ObjectState: 'Add' },
            ];
            component.isEditEncounter = true;
            component.navigateToNextScreen = jasmine.createSpy();
        });

        it('should call soarEncounterHttpService.update if isEditEncounter is true', () => {
            component.saveEncounter();
            expect(mockSoarEncounterHttpService.update).toHaveBeenCalled();
        });

        it('should call soarEncounterHttpService.create if isEditEncounter is false', () => {
            component.isEditEncounter = false;
            component.saveEncounter();
            expect(mockSoarEncounterHttpService.create).toHaveBeenCalled();
        });

        it('should call encounterService.syncAppointmentIdOnService and sync AppointmentIds on the encounter ' +
            'if AppointmentId exists on at least one service and isEditEncounter is true and ObjectState is Update, Add, or None', () => {
                component.saveEncounter();
                expect(component.tempEncounter.ServiceTransactionDtos[0].AppointmentId).toEqual('1234');
                expect(component.tempEncounter.ServiceTransactionDtos[1].AppointmentId).toEqual('1234');
                expect(component.tempEncounter.ServiceTransactionDtos[2].AppointmentId).toEqual('1234');
            });

        it('should set set AppointmentId to null if isEditEncounter is true and service is no longer in list of services (indicates deleted)', () => {
            // remove serviceTransaction with ServiceTransactionId of 1236 from services to indicate its been deleted
            let deletedService = component.services.find(serviceTransaction => {
                return serviceTransaction.ServiceTransactionId === 1236
            })
            const index = component.services.indexOf(deletedService);
            component.services.splice(index, 1);

            component.saveEncounter();
            let deletedServiceTransaction = component.tempEncounter.ServiceTransactionDtos.find(serviceTransaction => {
                return serviceTransaction.ServiceTransactionId === 1236
            })
            expect(deletedServiceTransaction.ServiceTransactionId).toEqual(1236);
            expect(deletedServiceTransaction.AppointmentId).toEqual(null);
            expect(deletedServiceTransaction.EncounterId).toEqual(null);
            expect(deletedServiceTransaction.ObjectState).toEqual('Update');
        });
    });

    describe('saveEncounter function, new encounter->', () => {
        beforeEach(() => {
            //Possible scenarios to represent
            //1. Previously on the encounter, but removed
            //2. New service, never saved yet
            //3. Existing service, already saved, but not yet on the encounter
            //4. Existing service, already on encounter, remains on the encounter


            component.encounter = {
                AccountMemberId: 1,
                EncounterId: 1,
                Description: 'test',
                ServiceTransactionDtos: []
            };

            component.services = [
                //New service, not saved yet
                { EncounterId: null, ServiceTransactionId: null, DisplayAs: '1' },

                //Service already saved to the encounter
                { EncounterId: null, ServiceTransactionId: 1, DisplayAs: '2' },
            ];
            component.navigateToNextScreen = jasmine.createSpy();
            component.processRequiredPropertiesForServiceTransaction = jasmine.createSpy().and.returnValue({
                AccountMemberId: 1,
                EncounterId: 1,
                Description: 'test',
                ServiceTransactionDtos: []
            });
        });

        it('should call reconcile encounter and services list', () => {
            const successResponse = { Value: true };
            component.isEditEncounter = false;
            spyOn(component, 'validateInsuranceOrder')

            component.saveEncounter();

            expect(component.validateInsuranceOrder).toHaveBeenCalledWith(component.services);

            expect(component.encounter).toEqual({
                AccountMemberId: 1,
                EncounterId: 1,
                Description: 'test',
                ServiceTransactionDtos: []
            });
        });
    });


    describe('saveEncounterSuccess function ->', () => {
        beforeEach(() => {
            component.processRequiredPropertiesForServiceTransaction = jasmine.createSpy();
            component.navigateToNextScreen = jasmine.createSpy();
        });

        it('should call processRequiredPropertiesForServiceTransaction for edit', () => {
            const successResponse = { Value: true };
            component.isEditEncounter = true;

            component.saveEncounterSuccess(successResponse);

            expect(component.processRequiredPropertiesForServiceTransaction).toHaveBeenCalled();
        });

        it('should call toastrfactory.success for edit', () => {
            const successResponse = { Value: true };
            component.isEditEncounter = true;

            component.saveEncounterSuccess(successResponse);

            expect(toastrFactory.success).toHaveBeenCalled();
        });

        it('should call toastrfactory.error for edit', () => {
            const successResponse = { Value: false };
            component.isEditEncounter = true;

            component.saveEncounterSuccess(successResponse);

            expect(toastrFactory.error).toHaveBeenCalled();
        });

        it('should call processRequiredPropertiesForServiceTransaction for new', () => {
            const successResponse = { Value: true };
            component.isEditEncounter = false;

            component.saveEncounterSuccess(successResponse);

            expect(component.processRequiredPropertiesForServiceTransaction).toHaveBeenCalled();
        });

        it('should call toastrfactory.success for new', () => {
            const successResponse = { Value: true };
            component.isEditEncounter = false;

            component.saveEncounterSuccess(successResponse);

            expect(toastrFactory.success).toHaveBeenCalled();
        });

        it('should call toastrfactory.error for new', () => {
            const successResponse = { Value: false };
            component.isEditEncounter = false;

            component.saveEncounterSuccess(successResponse);

            expect(toastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('saveEncounterFailure function', () => {
        it('should call toastrfactory.error if its new', () => {
            const errorResponse = { status: 200 };
            component.isEditEncounter = false;

            component.saveEncounterFailure(errorResponse);

            expect(toastrFactory.error).toHaveBeenCalled();
        });

        it('should not call toastrfactory.error if its edit and error code is 409', () => {
            const errorResponse = { status: 409 };
            component.isEditEncounter = true;

            component.saveEncounterFailure(errorResponse);

            expect(toastrFactory.error).toHaveBeenCalled();
        });

        it('should call toastrfactory.error if its edit and error code is not 409', () => {
            const errorResponse = { status: 200 };
            component.isEditEncounter = true;

            component.saveEncounterFailure(errorResponse);

            expect(toastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('saveAsPendingClicked function', () => {
        beforeEach(() => {
            component.encounter = {
                Description: 'test',
                ServiceTransactionDtos: [{ ObjectState: 'None', InsuranceOrder: 0 },
                { ObjectState: 'None', InsuranceOrder: 1 },
                { ObjectState: 'None', InsuranceOrder: 2 }]
            };
            component.services = [{ ObjectState: 'None', InsuranceOrder: 0 },
                { ObjectState: 'None', InsuranceOrder: 1 },
                { ObjectState: 'None', InsuranceOrder: 2 }];
            component.navigateToNextScreen = jasmine.createSpy();
            component.canSave = true;
        });

        it('should call update if is edit', () => {
            component.isEditEncounter = true;

            component.saveAsPendingClicked();

            expect(mockSoarEncounterHttpService.update).toHaveBeenCalled();
        });

        it('should call create if is new', () => {
            component.isEditEncounter = false;

            component.saveAsPendingClicked();

            expect(mockSoarEncounterHttpService.create).toHaveBeenCalled();
        });

        it('should set serviceTransaction InsuranceOrder if InsuranceOrder is null', () => {
            var transaction = { ObjectState: 'None', InsuranceOrder: null };
            component.isEditEncounter = false;
            component.encounter.ServiceTransactionDtos.push(transaction);
            component.services = component.encounter.ServiceTransactionDtos;

            component.saveAsPendingClicked();

            expect(transaction.InsuranceOrder).toBe(4);
        });
    });

    describe('onRemoveService function ->', () => {

        beforeEach(() => {
            component.services = [{ ProviderOnClaimsId: '1' }, { ProviderOnClaimsId: '2' }];
            component.recalculateEstimatedInsuranceForAllServices = jasmine.createSpy();
        });

        it('should remove service from service list', () => {
            component.onRemoveService(component.services[1]);
            expect(component.services.length).toBe(1);
            expect(component.services[0].ProviderOnClaimsId).toBe('1');
        });

        it('should call encounterBar forceUpdate when service is removed', () => {
            component.updateCanSave = jasmine.createSpy();
            component.onRemoveService(component.services[1]);
            expect(component.updateCanSave).toHaveBeenCalled();
        });

        it('should call recalculateEstimatedInsuranceForAllServices', () => {
            component.onRemoveService(component.services[1]);
            expect(component.recalculateEstimatedInsuranceForAllServices).toHaveBeenCalled();
        });

        it('should remove the service from its appointment if this is a new encounter', () => {
            let appointmentId = '12345';

            component.appointmentId = appointmentId;
            component.services[0].AppointmentId = appointmentId;
            component.services[0].ServiceTransactionStatusId = 5;
            component.services[0].InsuranceOrder = 1;
            component.services[1].AppointmentId = appointmentId;
            component.services[1].ServiceTransactionStatusId = 5;
            component.services[1].InsuranceOrder = 2;

            let getWithDetailsResult = { Value: { Appointment: { PlannedServices: [component.services] } } };
            component.updateCanSave = jasmine.createSpy();
            scheduleServices.Update = {
                Appointment: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(expect(component.updateCanSave).toHaveBeenCalled()) }
                })
            };
            scheduleServices.Lists.Appointments = {
                GetWithDetails: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(getWithDetailsResult, expect(scheduleServices.Update.Appointment).toHaveBeenCalledWith({ AppointmentDto: getWithDetailsResult.Value.Appointment })) }
                })
            };

            component.onRemoveService(component.services[1]);

            expect(scheduleServices.Lists.Appointments.GetWithDetails).toHaveBeenCalledWith({ AppointmentId: appointmentId }, jasmine.any(Function), jasmine.any(Function));
            expect(component.services.length).toBe(1);
        });
    });

    describe('onServiceChanged function ->', () => {

        beforeEach(() => {
        });

        it('should set providerOnClaims to value passed in', () => {
            component.updateHasChanges = jasmine.createSpy();
            component.onServiceChanged('10');
            expect(component.updateHasChanges).toHaveBeenCalled();
        });


    });

    describe('updateHasChanges function ->', () => {

        beforeEach(() => {
        });

        it('should call registerControllerHasChanges', () => {
            component.registerControllerHasChanges = jasmine.createSpy();
            component.updateHasChanges();
            expect(component.registerControllerHasChanges).toHaveBeenCalled();
        });

        it('should set hasChanges to true', () => {
            component.hasChanges = false;
            component.updateHasChanges();
            expect(component.hasChanges).toBe(true);
        });

        it('should call registerControllerHasChanges', () => {
            component.updateCanSave = jasmine.createSpy();
            component.updateHasChanges();
            expect(component.updateCanSave).toHaveBeenCalled();
        });
    });

    describe('onProviderOnClaimsChanged function ->', () => {

        beforeEach(() => {
            component.providerOnClaims = '5';
            component.services = [{ ProviderOnClaimsId: '1' }, { ProviderOnClaimsId: '2' }];
        });

        it('should set providerOnClaims to value passed in', () => {
            component.onProviderOnClaimsChanged('10');
            expect(component.providerOnClaims).toBe('10');
        });

        it('should set ProviderOnClaimsId on all services', () => {
            component.onProviderOnClaimsChanged('3');

            component.services.forEach(service => {
                expect(service.ProviderOnClaimsId).toBe('3');
            });
        });

        it('should call updateCanSave when service is removed', () => {
            component.updateCanSave = jasmine.createSpy();
            component.onProviderOnClaimsChanged('3');
            expect(component.updateCanSave).toHaveBeenCalled();
        });
    });

    describe('onProviderOnServicesChanged function ->', () => {

        beforeEach(() => {
            component.updateCanSave = jasmine.createSpy();
            component.providerOnServices = '5';
            component.services = [{ ProviderUserId: '1', ProviderOnClaimsId: '1' }, { ProviderUserId: '2', ProviderOnClaimsId: '2' }];
        });

        it('should set providerOnServices to value passed in', () => {
            let provider = {
                ProviderId: '1',
                UserLocationSetup: {
                    ProviderOnClaimsRelationship: 2,
                    ProviderOnClaimsId: '3'
                }
            };

            component.onProviderOnServicesChanged(provider);

            expect(component.providerOnServices).toBe('1');
        });

        it('should set ProviderUserId on all services', () => {
            let provider = {
                ProviderId: '1',
                UserLocationSetup: {
                    ProviderOnClaimsRelationship: 2,
                    ProviderOnClaimsId: '3'
                }
            };

            component.onProviderOnServicesChanged(provider);

            component.services.forEach(service => {
                expect(service.ProviderUserId).toBe('1');
            });
        });

        it('should set ProviderOnClaimsId on all services', () => {
            let provider = {
                ProviderId: '1',
                UserLocationSetup: {
                    ProviderOnClaimsRelationship: 2,
                    ProviderOnClaimsId: '3'
                }
            };

            component.onProviderOnServicesChanged(provider);

            component.services.forEach(service => {
                expect(service.ProviderOnClaimsId).toBe('3');
            });
        });

        it('should set providerOnServices, ProviderUserId, and ProviderOnClaimsId to null when provider is default', () => {
            let provider = null;

            component.onProviderOnServicesChanged(provider);

            expect(component.providerOnServices).toBe(null);
            component.services.forEach(service => {
                expect(service.ProviderUserId).toBe(null);
                expect(service.ProviderOnClaimsId).toBe(null);
            });
        });

        it('should set ProviderOnClaimsId on all services when not ProviderOnClaimsRelationship', () => {
            let provider = {
                ProviderId: '1',
                UserLocationSetup: {
                    ProviderOnClaimsRelationship: 1,
                    ProviderOnClaimsId: '3'
                }
            };

            component.onProviderOnServicesChanged(provider);

            component.services.forEach(service => {
                expect(service.ProviderOnClaimsId).toBe('1');
            });
        });

        it('should call updateCanSave when services are updated', () => {
            let provider = {
                ProviderId: '1',
                UserLocationSetup: {
                    ProviderOnClaimsRelationship: 2,
                    ProviderOnClaimsId: '3'
                }
            };

            component.onProviderOnServicesChanged(provider);

            expect(component.updateCanSave).toHaveBeenCalled();
        });
    });

    describe('addServiceClicked ->', () => {
        it('should call modalFactory.Modal', () => {
            component.addServiceClicked();

            expect(modalFactory.Modal).toHaveBeenCalled();
        });
    });

    describe('addServicesToEncounter ->', () => {
        let newServices = [];
        beforeEach(() => {
            newServices = [{
                AccountMemberId: 1, DateEntered: Date.now(), LocationId: 0, Code: 'code1', Description: 'code2', CompleteDescription: 'code3', ProviderUserId: '3',
                ProviderName: 'Just Jack', Fee: 0, EncounterId: null, DebitTransactionId: null, ServiceTransactionId: null, Discount: 0, Tax: 0, ServiceCodeId: '1',
                TotalEstInsurance: 0, TotalAdjEstimate: 0, Balance: 0, Amount: 0, AdjustmentAmount: 0, isAdjustment: false
            }];
            component.location = { id: 1 };
            component.services = [{ ObjectState: 'None', InsuranceOrder: 0 }, { ObjectState: 'None', InsuranceOrder: 1 }, { ObjectState: 'None', InsuranceOrder: 2 }];
            spyOn(component, 'onCalculateDiscountAndTaxAndInsuranceEstimateSuccess');
            successResult = { Value: newServices };
        });

        it('should push new service into component', () => {
            component.addServicesToEncounter(newServices, 1, true);
            expect(component.services.length).toBe(4);
        });


         it('should add new services and set InsuranceOrder to next incremented InsuranceOrder', () => {
            newServices = [
                { ObjectState: 'Add',  Fee:10.00, InsuranceOrder: 7,  DateEntered: Date.now()}, 
                { ObjectState: 'Add', Fee:11.00, InsuranceOrder: 3 ,DateEntered: Date.now()}, 
                { ObjectState: 'Add', Fee:12.00, InsuranceOrder: 2 ,DateEntered: Date.now()}, 
                { ObjectState: 'Add', Fee:13.00, InsuranceOrder: 5 ,DateEntered: Date.now()}, 
                ];
            component.services = [
                { ObjectState: 'None', Fee: 15.00 , InsuranceOrder: 1}, 
                { ObjectState: 'None', Fee: 16.00 , InsuranceOrder: 2}];
            
            component.addServicesToEncounter(newServices, 1, true);
            expect(component.services[0].InsuranceOrder).toBe(1);
            expect(component.services[0].Fee).toBe(15.00);

            expect(component.services[1].InsuranceOrder).toBe(2);
            expect(component.services[1].Fee).toBe(16.00);

            expect(component.services[2].InsuranceOrder).toBe(3);
            expect(component.services[2].Fee).toBe(12.00);

            expect(component.services[3].InsuranceOrder).toBe(4);
            expect(component.services[3].Fee).toBe(11.00);

            expect(component.services[4].InsuranceOrder).toBe(5);
            expect(component.services[4].Fee).toBe(13.00);

            expect(component.services[5].InsuranceOrder).toBe(6);
            expect(component.services[5].Fee).toBe(10.00);
        });        

        it('should preserve existing InsuranceOrder when adding new records that conflict with existing', () => {
            newServices = [
                { ObjectState: 'None',  Fee:10.00, InsuranceOrder: 7,  DateEntered: Date.now()}, 
                { ObjectState: 'None', Fee:11.00, InsuranceOrder: 3 ,DateEntered: Date.now()}, 
                { ObjectState: 'None', Fee:12.00, InsuranceOrder: 1 ,DateEntered: Date.now()}, 
                { ObjectState: 'None', Fee:13.00, InsuranceOrder: 5 ,DateEntered: Date.now()}, 
                ];
            component.services = [
                { ObjectState: 'None',Fee:10.00, InsuranceOrder: 1 }, 
                { ObjectState: 'None',Fee:11.00, InsuranceOrder: 2 }];            
            
            component.addServicesToEncounter(newServices, 1, true);
            expect(component.services[0].InsuranceOrder).toBe(1);
            expect(component.services[0].Fee).toBe(10.00);

            expect(component.services[1].InsuranceOrder).toBe(2);
            expect(component.services[1].Fee).toBe(11.00);

            expect(component.services[2].InsuranceOrder).toBe(3);
            expect(component.services[2].Fee).toBe(12.00);

            expect(component.services[3].InsuranceOrder).toBe(4);
            expect(component.services[3].Fee).toBe(11.00);

            expect(component.services[4].InsuranceOrder).toBe(5);
            expect(component.services[4].Fee).toBe(13.00);

            expect(component.services[5].InsuranceOrder).toBe(6);
            expect(component.services[5].Fee).toBe(10.00);
        });

        it('should preserve order on new services when adding new records that dont conflict with existing', () => {
            newServices = [
                { ObjectState: 'None',  Fee:10.00, InsuranceOrder: 7,  DateEntered: Date.now()}, 
                { ObjectState: 'None', Fee:11.00, InsuranceOrder: 3 ,DateEntered: Date.now()}, 
                { ObjectState: 'None', Fee:12.00, InsuranceOrder: 2 ,DateEntered: Date.now()}, 
                { ObjectState: 'None', Fee:13.00, InsuranceOrder: 5 ,DateEntered: Date.now()}, 
                ];
            component.services = [
               ];            
            
            component.addServicesToEncounter(newServices, 1, true);
            expect(component.services[0].InsuranceOrder).toBe(1);
            expect(component.services[0].Fee).toBe(12.00);

            expect(component.services[1].InsuranceOrder).toBe(2);
            expect(component.services[1].Fee).toBe(11.00);

            expect(component.services[2].InsuranceOrder).toBe(3);
            expect(component.services[2].Fee).toBe(13.00);

            expect(component.services[3].InsuranceOrder).toBe(4);
            expect(component.services[3].Fee).toBe(10.00);
        });

        it('should call SoarInsuranceEstimateHttpService.calculateDiscountAndTaxAndInsuranceEstimate with all services', () => {
            component.addServicesToEncounter(newServices, 1, true);
            expect(mockSoarInsuranceEstimateHttpService.calculateDiscountAndTaxAndInsuranceEstimate).toHaveBeenCalledWith(component.services);
        });

        it('should call applyTxEstInsOverrides when services have TreatmentPlanServiceHeader', () => {
            newServices = [{ TreatmentPlanServiceHeader: 'test' }]
            component.applyTxEstInsOverrides = jasmine.createSpy();            

            component.addServicesToEncounter(newServices, 1, true);
            expect(component.applyTxEstInsOverrides).toHaveBeenCalledWith(newServices);
        });
    });

    describe('applyTxEstInsOverrides ->', () => {
        let newServices = [];
        beforeEach(() => {
            //newServices = [{
            //    AccountMemberId: 1, DateEntered: Date.now(), LocationId: 0, Code: 'code1', Description: 'code2', CompleteDescription: 'code3', ProviderUserId: '3',
            //    ProviderName: 'Just Jack', Fee: 0, EncounterId: null, DebitTransactionId: null, ServiceTransactionId: null, Discount: 0, Tax: 0, ServiceCodeId: '1',
            //    TotalEstInsurance: 0, TotalAdjEstimate: 0, Balance: 0, Amount: 0, AdjustmentAmount: 0, isAdjustment: false
            //}];
            component.location = { id: 1 };
            //component.services = [{ ObjectState: 'None', InsuranceOrder: 0 }, { ObjectState: 'None', InsuranceOrder: 1 }, { ObjectState: 'None', InsuranceOrder: 2 }];
            component.services = [];
            spyOn(component, 'onCalculateDiscountAndTaxAndInsuranceEstimateSuccess');
            successResult = { Value: newServices };
        });


        it('should push new service into component', () => {
            component.patientBenefitPlans = [
                { PatientBenefitPlanId: 1, Priority: 0 },
                { PatientBenefitPlanId: 2, Priority: 1 },
            ];

            var dateEntered = new Date().toISOString();
            newServices = [
                {
                    TreatmentPlanServiceHeader: {
                        TreatmentPlanInsuranceEstimates: [
                            { PatientBenefitPlanId: 1, EstInsurance: 15, AdjEst: 20, IsUserOverRidden: true },
                            { PatientBenefitPlanId: 2, EstInsurance: 25, AdjEst: 40, IsUserOverRidden: true }
                        ]
                    },
                    ServiceTransaction: {
                        AccountMemberId: 1, DateEntered: dateEntered, LocationId: 0, Code: 'code1', Description: 'code2', CompleteDescription: 'code3', ProviderUserId: '3',
                        ProviderName: 'Just Jack', Fee: 0, EncounterId: null, DebitTransactionId: null, ServiceTransactionId: null, Discount: 0, Tax: 0, ServiceCodeId: '1',
                        TotalEstInsurance: 0, TotalAdjEstimate: 0, Balance: 0, Amount: 0, AdjustmentAmount: 0, isAdjustment: false, InsuranceOrder: 0
                    }
                },
                {
                    TreatmentPlanServiceHeader: {
                        TreatmentPlanInsuranceEstimates: [
                            { PatientBenefitPlanId: 1, EstInsurance: 13, AdjEst: 52, IsUserOverRidden: false },
                            { PatientBenefitPlanId: 2, EstInsurance: 16, AdjEst: 41, IsUserOverRidden: false }
                        ]
                    },
                    ServiceTransaction: {
                        AccountMemberId: 1, DateEntered: dateEntered, LocationId: 0, Code: 'code1', Description: 'code2', CompleteDescription: 'code3', ProviderUserId: '3',
                        ProviderName: 'Just Jack', Fee: 0, EncounterId: null, DebitTransactionId: null, ServiceTransactionId: null, Discount: 0, Tax: 0, ServiceCodeId: '1',
                        TotalEstInsurance: 0, TotalAdjEstimate: 0, Balance: 0, Amount: 0, AdjustmentAmount: 0, isAdjustment: false, InsuranceOrder: 1
                    }
                },
            ];

            component.applyTxEstInsOverrides(newServices);

            expect(component.services).toEqual([
                {
                    AccountMemberId: null, DateEntered: dateEntered, LocationId: 1,
                    Code: 'code1', Description: 'code2', CompleteDescription: 'code3',
                    ProviderUserId: '3', ProviderName: 'Just Jack', Fee: 0,
                    EncounterId: undefined, DebitTransactionId: null, ServiceTransactionId: null, Discount: 0,
                    Tax: 0, ServiceCodeId: '1', TotalEstInsurance: 0, TotalAdjEstimate: 0, Balance: 0, Amount: 0,
                    AdjustmentAmount: 0, isAdjustment: false, InsuranceOrder: 1, ServiceTransactionStatusId: 5,
                    InsuranceEstimates:
                        [
                            {
                                PatientBenefitPlanId: 1,
                                EstInsurance: 15, AdjEst: 20,
                                IsUserOverRidden: true,
                                IsMostRecentOverride: true,
                                Fee: 0
                            },
                            {
                                PatientBenefitPlanId: 2,
                                EstInsurance: 25,
                                AdjEst: 40,
                                IsUserOverRidden: true,
                                Fee: 0
                            }
                        ],
                    ObjectState: 'Add',
                    SequenceNumber: 1, SurfaceSummaryInfo: '',
                    RootSummaryInfo: '', applyDiscount: false,
                    IsEligibleForDiscount: false, isDiscounted: false,
                    providerToothError: false, providerAreaError: false,
                    providerServicesError: false, providerClaimsError: true
                },

                {
                    AccountMemberId: null,
                    DateEntered: dateEntered,
                    LocationId: 1, Code: 'code1',
                    Description: 'code2', CompleteDescription: 'code3',
                    ProviderUserId: '3', ProviderName: 'Just Jack', Fee: 0,
                    EncounterId: undefined, DebitTransactionId: null, ServiceTransactionId: null,
                    Discount: 0, Tax: 0, ServiceCodeId: '1', TotalEstInsurance: 0, TotalAdjEstimate: 0,
                    Balance: 0, Amount: 0, AdjustmentAmount: 0, isAdjustment: false, InsuranceOrder: 2,
                    ServiceTransactionStatusId: 5,
                    InsuranceEstimates:
                        [
                            { PatientBenefitPlanId: 1, Fee: 0 }
                            ,
                            { PatientBenefitPlanId: 2, Fee: 0 }
                        ],
                    ObjectState: 'Add',
                    SequenceNumber: 2, SurfaceSummaryInfo: '',
                    RootSummaryInfo: '', applyDiscount: false,
                    IsEligibleForDiscount: false, isDiscounted: false,
                    providerToothError: false, providerAreaError: false,
                    providerServicesError: false, providerClaimsError: true
                }
            ]);            
        });
    });

    describe('onCalculateDiscountAndTaxAndInsuranceEstimateSuccess ->', () => {
        let servicesWithDiscountTaxAndEstimate = [];
        beforeEach(() => {
            servicesWithDiscountTaxAndEstimate = [
                {
                    AccountMemberId: "c49",
                    AllowedAmount: 11,
                    Amount: 100.94,
                    Balance: 8.469999999999999,
                    Description: "D0180: comprehensive periodontal evaluation - new or established patient (D0180)",
                    Discount: 5,
                    Fee: 100,
                    InsuranceEstimates: [{
                        AdjEst: 84,
                        EstInsurance: 8.47,
                    }],
                    InsuranceOrder: 0,
                    IsDiscounted: true,
                    Tax: 5.94,
                    TotalAdjEstimate: 84,
                    TotalAdjPaidAmount: 0,
                    TotalEstInsurance: 8.47
                }, {
                    AccountMemberId: "c49",
                    AllowedAmount: 11,
                    Amount: 201.88,
                    Balance: 79.32,
                    Description: "D2160: amalgam - three surfaces, primary or permanent (D2160)",
                    Discount: 10,
                    Fee: 200,
                    InsuranceEstimates: [{
                        AdjEst: 84,
                        EstInsurance: 82.56,
                    }],
                    InsuranceOrder: 1,
                    IsDiscounted: true,
                    Tax: 11.88,
                    TotalAdjEstimate: 40,
                    TotalAdjPaidAmount: 0,
                    TotalEstInsurance: 82.56
                }];
            spyOn(component.encounterBar, 'forceUpdate');
            spyOn(component, 'updateAllowedAmount');
            encounterService.notifyServiceHasChanged = jasmine.createSpy().and.callFake(() => { });
        });

        it('should calculate Balance based on serviceTransaction.Amount minus serviceTransaction.TotalEstInsurance minus serviceTransaction.TotalAdjEstimate', () => {
            component.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(servicesWithDiscountTaxAndEstimate);
            component.services.forEach(serviceTransaction => {
                expect(serviceTransaction.Balance).toEqual(serviceTransaction.Amount - serviceTransaction.TotalEstInsurance - serviceTransaction.TotalAdjEstimate);
            });
        });

        it('should call updateAllowedAmount for each serviceTransaction', () => {
            component.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(servicesWithDiscountTaxAndEstimate);
            component.services.forEach(serviceTransaction => {
                expect(component.updateAllowedAmount).toHaveBeenCalledWith(serviceTransaction);
            });
        });

        it('should call this.encounterBar.forceUpdate();', () => {
            component.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(servicesWithDiscountTaxAndEstimate);
            expect(component.encounterBar.forceUpdate).toHaveBeenCalled();
        });

        it('should call encounterService.notifyServiceHasChanged to refresh insurance estimates', () => {
            component.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(servicesWithDiscountTaxAndEstimate);
            expect(encounterService.notifyServiceHasChanged).toHaveBeenCalled();
        });
    });

    describe('createServiceTransactionForEncounter ->', () => {
        let newService;
        beforeEach(() => {
            newService = {
                AccountMemberId: 1,
                DateEntered: Date.now(),
                LocationId: 0,
                Code: 'code1',
                Description: 'code2',
                CompleteDescription: 'code3',
                ProviderUserId: '3',
                ProviderName: 'Just Jack',
                Fee: 0,
                EncounterId: null,
                DebitTransactionId: null,
                ServiceTransactionId: null,
                Discount: 0,
                Tax: 0,
                ServiceCodeId: '1',
                TotalEstInsurance: 0,
                TotalAdjEstimate: 0,
                Balance: 0,
                Amount: 0,
                AdjustmentAmount: 0,
                isAdjustment: false
            };
            component.location = { id: 1 };
        });

        it('should call financialService.CreateOrCloneInsuranceEstimateObject', () => {
            component.createServiceTransactionForEncounter(newService, 1);

            expect(financialService.CreateOrCloneInsuranceEstimateObject).toHaveBeenCalled();
        });

        it('should call setProviderOnClaimsForService', () => {
            component.setProviderOnClaimsForService = jasmine.createSpy();
            component.createServiceTransactionForEncounter(newService, 1);

            expect(component.setProviderOnClaimsForService).toHaveBeenCalled();
        });

        it('should return new service', () => { });
    });

    describe('getTransactionType ->', () => {
        it('should return empty string when invalid id', () => {
            let typeName = 'Hello World';

            typeName = component.getTransactionType(16);

            expect(typeName).toBe('');
        });

        it('should return empty string when string id', () => {
            let typeName = 'Hello World';

            typeName = component.getTransactionType('16');

            expect(typeName).toBe('');
        });

        it('should return empty string when null id', () => {
            let typeName = 'Hello World';

            typeName = component.getTransactionType(16);

            expect(typeName).toBe('');
        });

        it('should return correct serviceType.Text when valid id', () => {
            let typeName = 'Hello World';

            typeName = component.getTransactionType(1);

            expect(typeName).toBe('Services');
        });
    });

    describe('getAccountMemberId', () => {
        it('should return encounter AccountMemberId if available', () => {
            component.encounter.AccountMemberId = 12;

            let result = component.getAccountMemberId();

            expect(result).toBe(12);
        });

        it('should return patient AccountMemberId if encounter AccountId is unavailable', () => {
            component.patientData = {
                PersonAccount: {
                    PersonAccountMember: {
                        AccountMemberId: 12
                    }
                }
            };

            let result = component.getAccountMemberId();

            expect(result).toBe(12);
        });

        it('should return null if nothing else is available', () => {
            let result = component.getAccountMemberId();

            expect(result).toBe(null);
        });
    });

    describe('processRequiredPropertiesForServiceTransaction', () => {
        it('if empty encounter returns encounter', () => {
            let encounter = {};

            let result = component.processRequiredPropertiesForServiceTransaction(encounter);

            expect(result).not.toBe(null);
        });

        it('if null encounter returns null', () => {
            let result = component.processRequiredPropertiesForServiceTransaction(null);

            expect(result).toBe(null);
        });

        it('should set transaction info empty if unable to find servicecode', () => {
            component.serviceCodes = [{ ServiceCodeId: 2 }];
            let encounter = {
                ServiceTransactionDtos: [{
                    EncounterId: '1',
                    ServiceCodeId: 1, DisplayAs: 'ABC', AffectedAreaId: 'ABC',
                    Code: 'ABC', CdtCodeName: 'ABC', TransactionTypeId: 'ABC', TransactionType: 'ABC'
                }]
            };

            let result = component.processRequiredPropertiesForServiceTransaction(encounter);

            expect(result.ServiceTransactionDtos[0].CdtCodeName).toBe('');
        });

        it('should set transaction if able to find servicecode', () => {
            component.serviceCodes = [{ ServiceCodeId: 1, DisplayAs: 'ABC', AffectedAreaId: 'ABC', Code: 'ABC', CdtCodeName: 'ABC' }];
            let encounter = {
                ServiceTransactionDtos: [{
                    EncounterId: '1',
                    ServiceCodeId: 1, DisplayAs: '', AffectedAreaId: '',
                    Code: '', CdtCodeName: '', TransactionTypeId: '', TransactionType: ''
                }]
            };

            let result = component.processRequiredPropertiesForServiceTransaction(encounter);

            expect(result.ServiceTransactionDtos[0].CdtCodeName).toBe('ABC');
        });
    });


    describe('onServiceDateChanged', () => {
        let newDate;
        let dateEntered;
        beforeEach(() => {
            newDate = new Date('1/1/2000');
            dateEntered = new Date('9/9/1999')
            component.services = [{
                DateEntered: dateEntered,
            }];
        });

        it('should do nothing when dateValue is not defined', () => {
            component.isValidDateRange = false;
            component.onServiceDateChanged(null);
            expect(component.services[0].DateEntered).toEqual(new Date('9/9/1999'));
            expect(component.isValidDateRange).toBe(false);
        });

        it('should set isValidDateRange to false when dateValue is over max', () => {
            let dateValue = new Date('9/10/2000');
            component.maxServiceDate = new Date('9/9/2000')
            component.isValidDateRange = true;
            component.onServiceDateChanged(dateValue);
            expect(component.isValidDateRange).toBe(false);
        });

        it('should set isValidDateRange to false when dateValue is under minimum', () => {
          let dateValue = new Date('12/31/1899');
          component.isValidDateRange = true;
          component.onServiceDateChanged(dateValue);
          expect(component.isValidDateRange).toBe(false);
        });

        it('should set isValidDateRange to true when dateValue is over minimum and under max', () => {
            let dateValue = new Date('9/8/2000');
            component.maxServiceDate = new Date('9/9/2000')
            component.isValidDateRange = false;
            component.onServiceDateChanged(dateValue);
            expect(component.isValidDateRange).toBe(true);
        });
    });

    // NOTE user with add or edit permissions can create or edit an encounter but must have
    // checkout priveleges to check out an encounter.  example: Associate Dentist can create an encounter
    // but doesn't have permissions to check it out.
    describe('startCheckoutClicked ->', () => {
        beforeEach(() => {
            spyOn(component, 'navigateToNextScreen');
            spyOn(component, 'saveEncounter');
            component.services = [{}, {}];
        });

        it('should call saveEncounter if canSave is true and user hasCheckoutPermissions is true and has services', () => {
            component.canSave = true;
            component.hasCheckoutPermissions = true;
            component.startCheckoutClicked();
            expect(component.saveEncounter).toHaveBeenCalled();
            expect(component.navigateToNextScreen).not.toHaveBeenCalled();
        });

        it('should not call saveEncounter if canSave is false and user hasCheckoutPermissions is true and has services', () => {
            component.canSave = false;
            component.hasCheckoutPermissions = true;
            component.startCheckoutClicked();
            expect(component.navigateToNextScreen).toHaveBeenCalled();
            expect(component.saveEncounter).not.toHaveBeenCalled();
        });

        it('should not call saveEncounter or navigateToNextScreen if hasCheckoutPermissions is false and has services', () => {
            component.canSave = true;
            component.hasCheckoutPermissions = false;
            component.startCheckoutClicked();
            expect(component.saveEncounter).not.toHaveBeenCalled();
            expect(component.navigateToNextScreen).not.toHaveBeenCalled();
        });

        it('should not call saveEncounter or navigateToNextScreen if does not have services', () => {
            component.services = [];
            component.canSave = true;
            component.hasCheckoutPermissions = true;
            component.startCheckoutClicked();
            expect(component.saveEncounter).not.toHaveBeenCalled();
            expect(component.navigateToNextScreen).not.toHaveBeenCalled();
        });
    });

    // changing date comparison to ignore hours and minutes
    describe(' getServiceTransactionDate->', () => {
        let serviceTransaction;
        let dateEntered;
        let pastDate;
        let futureDate;
        beforeEach(() => {
            const today = new Date()
            pastDate = new Date(today)
            pastDate.setDate(pastDate.getDate() - 1);
            futureDate = new Date(today)
            futureDate.setDate(futureDate.getDate() + 1);

            const currentDate = new Date();
            component.maxServiceDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 0);
            serviceTransaction = { DateEntered: null };
            dateEntered = currentDate.toISOString();
        });

        it('should return serviceTransaction.DateEntered if serviceTransaction.DateEntered is today', () => {
            serviceTransaction = { DateEntered: new Date() };
            dateEntered = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(serviceTransaction.DateEntered.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(serviceTransaction.DateEntered.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(serviceTransaction.DateEntered.getDate());
        });


        it('should return dateEntered if serviceTransaction.DateEntered is null but dateEntered is today', () => {
            serviceTransaction = { DateEntered: null };
            dateEntered = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(dateEntered.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(dateEntered.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(dateEntered.getDate());
        });

        it('should return todays date if serviceTransaction.DateEntered is future date', () => {
            serviceTransaction.DateEntered = futureDate;
            let todaysDate = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(todaysDate.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
        });

        it('should return todays date if dateEntered is before minServiceDate', () => {
            dateEntered = new Date(1899, 11, 31);
            let todaysDate = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(todaysDate.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
        });

        it('should return todays date if serviceTransaction.DateEntered is null but dateEntered is future date', () => {
            serviceTransaction.DateEntered = null;
            dateEntered = futureDate;
            let todaysDate = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(todaysDate.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
        });

        it('should return past date if dateEntered is past date and this is a new serviceTransaction', () => {
            serviceTransaction.ServiceTransactionId = null;
            dateEntered = pastDate;
            serviceTransaction.DateEntered = null;
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(dateEntered.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(dateEntered.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(dateEntered.getDate());
        });

        it('should return todays date if dateEntered is before minServiceDate and this is a not a new serviceTransaction', () => {
            dateEntered = new Date(1899, 11, 31);
            serviceTransaction.DateEntered = dateEntered;
            serviceTransaction.ServiceTransactionId = 1234;
            let todaysDate = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(todaysDate.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
        });

        it('should return todays date if dateEntered is before minServiceDate and this is a new serviceTransaction', () => {
            dateEntered = new Date(1899, 11, 31);
            serviceTransaction.DateEntered = null;
            serviceTransaction.ServiceTransactionId = null;
            let todaysDate = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(todaysDate.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
        });

        it('should return todays date if serviceTransaction.DateEntered is past date and this is a not a new serviceTransaction', () => {
            serviceTransaction.DateEntered = pastDate;
            serviceTransaction.ServiceTransactionId = 1234;
            let todaysDate = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(todaysDate.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
        });

        it('should return todays date if serviceTransaction.DateEntered is null but dateEntered is past date and this is a not a new serviceTransaction', () => {
            serviceTransaction.ServiceTransactionId = 1234;
            dateEntered = pastDate;
            serviceTransaction.DateEntered = null;
            let todaysDate = new Date();
            let dateReturned = component.getServiceTransactionDate(serviceTransaction, dateEntered);
            expect(new Date(dateReturned).getFullYear()).toEqual(todaysDate.getFullYear());
            expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
            expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
        });

        it('should set serviceTransaction.DateEntered to currentDate if serviceTransaction.DateEntered is future date', () => {
            const now = new Date();
            const tomorrow = new Date();
            serviceTransaction.DateEntered = tomorrow.setDate(tomorrow.getDate() + 1);
            let serviceDate = component.getServiceTransactionDate(serviceTransaction, dateEntered).split('.')[0];
            let expectedDate = now.toISOString().split('.')[0];

            expect(serviceDate).toEqual(expectedDate);
        });

    });


    describe('checkIfServicesAreValid function ->', () => {

        beforeEach(() => {
            component.services = [{ ProviderUserId: '1', ProviderOnClaimsId: '1' },
            { ProviderUserId: '2', ProviderOnClaimsId: '2' }];
        });

        it('should return true if all services have ProviderUserId and checkToothAndAreaSelections returns true', () => {
            spyOn(component, 'checkToothAndAreaSelections').and.returnValue(true);
            expect(component.checkIfServicesAreValid(component.services)).toEqual(true);

        });

        it('should return false if one or more services have null ProviderUserId and checkToothAndAreaSelections returns true', () => {
            component.services[0].ProviderUserId = null;
            spyOn(component, 'checkToothAndAreaSelections').and.returnValue(true);
            expect(component.checkIfServicesAreValid(component.services)).toEqual(false);

        });

        it('should return false if one or more services have null ProviderOnClaimsId and checkToothAndAreaSelections returns true', () => {
            component.services[0].ProviderOnClaimsId = null;
            spyOn(component, 'checkToothAndAreaSelections').and.returnValue(true);
            expect(component.checkIfServicesAreValid(component.services)).toEqual(false);

        });

        it('should set checkoutButtonTooltip to empty string if service selections are valid and hasCheckoutPermissions is true', () => {
            component.services[0].ProviderOnClaimsId = '2';
            component.hasCheckoutPermissions = true;            
            spyOn(component, 'checkToothAndAreaSelections').and.returnValue(true);
            component.checkIfServicesAreValid(component.services);
            expect(component.checkoutButtonTooltip).toEqual('');
        });

        it('should set checkoutButtonTooltip to Invalid selection(s) if service selections are invalid and hasCheckoutPermissions is true', () => {
            component.services[0].ProviderOnClaimsId = null;
            component.hasCheckoutPermissions = true;            
            spyOn(component, 'checkToothAndAreaSelections').and.returnValue(true);
            component.checkIfServicesAreValid(component.services);
            expect(component.checkoutButtonTooltip).toEqual('Invalid selection(s)');
        });

        it('should not set checkoutButtonTooltip to Invalid selections if service selections are invalid and hasCheckoutPermissions is false', () => {
            component.services[0].ProviderOnClaimsId = null;
            component.checkoutButtonTooltip = 'You do not have permission to checkout encounters.'
            component.hasCheckoutPermissions = false;            
            spyOn(component, 'checkToothAndAreaSelections').and.returnValue(true);
            component.checkIfServicesAreValid(component.services);
            expect(component.checkoutButtonTooltip).toEqual('You do not have permission to checkout encounters.');
        });

    });

    describe('validateInsuranceOrder ->', () => {
        let services = [];
        beforeEach(() => {
            services = [{
                AccountMemberId: "c49",
                AllowedAmount: 11,
                Amount: 75,
                Description: "d0274",
                Fee: 75,
                InsuranceEstimates: [{
                    AdjEst: 0,
                    EstInsurance: 37.50,
                },],
                InsuranceOrder: null,
            }, {
                AccountMemberId: "c49",
                AllowedAmount: 11,
                Amount: 120,
                Description: "d0210",
                Fee: 120,
                InsuranceEstimates: [{
                    AdjEst: 0,
                    EstInsurance: 60,
                },],
                InsuranceOrder: null,
            }, {
                AccountMemberId: "c49",
                AllowedAmount: 0,
                Amount: 100,
                Description: "d1110",
                Fee: 100,
                InsuranceEstimates: [{
                    AdjEst: 0,
                    EstInsurance: 50,
                },],
                InsuranceOrder: null,
            }, {
                AccountMemberId: "c49",
                AllowedAmount: 0,
                Amount: 100,
                Description: "d2140",
                Fee: 100,
                InsuranceEstimates: [{
                    AdjEst: 0,
                    EstInsurance: 50,
                },],
                InsuranceOrder: null,
            }]
        });
        it('should set InsuranceOrder on services that have null InsuranceOrder - CASE all have Null InsuranceOrder', () => {
            services[0].InsuranceOrder = null;
            services[0].Description = 'd0274';

            services[1].InsuranceOrder = null;
            services[1].Description = 'd0210';

            services[2].InsuranceOrder = null;
            services[2].Description = 'd1110';

            services[3].InsuranceOrder = null;
            services[3].Description = 'd2140';
            component.validateInsuranceOrder(services);
            expect(services[0].InsuranceOrder).toBe(1);
            expect(services[0].Description).toBe('d0274');
            expect(services[1].InsuranceOrder).toBe(2);
            expect(services[1].Description).toBe('d0210');
            expect(services[2].InsuranceOrder).toBe(3);
            expect(services[2].Description).toBe('d1110');
            expect(services[3].InsuranceOrder).toBe(4);
            expect(services[3].Description).toBe('d2140');
        });
        it('should set InsuranceOrder on services that have null InsuranceOrder - CASE if some have InsuranceOrder', () => {
            services[0].InsuranceOrder = 1;
            services[0].Description = 'd0274';

            services[1].InsuranceOrder = null;
            services[1].Description = 'd0210';

            services[2].InsuranceOrder = null;
            services[2].Description = 'd1110';

            services[3].InsuranceOrder = null;
            services[3].Description = 'd2140';
            
            component.validateInsuranceOrder(services);
            expect(services[0].InsuranceOrder).toBe(1);
            expect(services[0].Description).toBe('d0274');
            expect(services[1].InsuranceOrder).toBe(2);
            expect(services[1].Description).toBe('d0210');
            expect(services[2].InsuranceOrder).toBe(3);
            expect(services[2].Description).toBe('d1110');
            expect(services[3].InsuranceOrder).toBe(4);
            expect(services[3].Description).toBe('d2140');
        });

        it('should set InsuranceOrder on services that have 0 for InsuranceOrder - CASE if all have InsuranceOrder of 0', () => {
            services[0].InsuranceOrder = 0;
            services[0].Description = 'd0274';

            services[1].InsuranceOrder = 0;
            services[1].Description = 'd0210';

            services[2].InsuranceOrder = 0;
            services[2].Description = 'd1110';

            services[3].InsuranceOrder = 0;
            services[3].Description = 'd2140';

            component.validateInsuranceOrder(services);
            expect(services[0].InsuranceOrder).toBe(1);
            expect(services[0].Description).toBe('d0274');
            expect(services[1].InsuranceOrder).toBe(2);
            expect(services[1].Description).toBe('d0210');
            expect(services[2].InsuranceOrder).toBe(3);
            expect(services[2].Description).toBe('d1110');
            expect(services[3].InsuranceOrder).toBe(4);
            expect(services[3].Description).toBe('d2140');
        });

        it('should set InsuranceOrder on services that have 0 or null for InsuranceOrder - CASE if some NULL, some have InsuranceOrder of 0', () => {
            services[0].InsuranceOrder = 0;
            services[0].Description = 'd0274';

            services[1].InsuranceOrder = null;
            services[1].Description = 'd0210';

            services[2].InsuranceOrder = 0;
            services[2].Description = 'd1110';

            services[3].InsuranceOrder = null;
            services[3].Description = 'd2140';

            component.validateInsuranceOrder(services);
            expect(services[0].InsuranceOrder).toBe(1);
            expect(services[0].Description).toBe('d0274');
            expect(services[1].InsuranceOrder).toBe(2);
            expect(services[1].Description).toBe('d0210');
            expect(services[2].InsuranceOrder).toBe(3);
            expect(services[2].Description).toBe('d1110');
            expect(services[3].InsuranceOrder).toBe(4);
            expect(services[3].Description).toBe('d2140');
        });

        it('should set InsuranceOrder on services that have 0 or null for InsuranceOrder - CASE if some NULL, some have InsuranceOrder of 0, some have > 0' +
            ' and should preserve existing InsuranceOrder > 0', () => {
                services[0].InsuranceOrder = 0;
                services[0].Description = 'd0274';

                services[1].InsuranceOrder = 1;
                services[1].Description = 'd0210';

                services[2].InsuranceOrder = 0;
                services[2].Description = 'd1110';

                services[3].InsuranceOrder = 2;
                services[3].Description = 'd2140';

                component.validateInsuranceOrder(services);
                expect(services[0].InsuranceOrder).toBe(1);
                expect(services[0].Description).toBe('d0210');
                expect(services[1].InsuranceOrder).toBe(2);
                expect(services[1].Description).toBe('d2140');
                expect(services[2].InsuranceOrder).toBe(3);
                expect(services[2].Description).toBe('d0274');
                expect(services[3].InsuranceOrder).toBe(4);
                expect(services[3].Description).toBe('d1110');
            });

            it('should call reconcile services list with duplicate InsuranceOrder', () => {
                // 2 services have a duplicate InsuranceOrder
                var services = [                
                    { ServiceTransactionId: null, DisplayAs: '1', InsuranceOrder:1 },
                    { ServiceTransactionId: 1, DisplayAs: '2' , InsuranceOrder:2 },
                    { ServiceTransactionId: 3, DisplayAs: '3' , InsuranceOrder:3 },
                    { ServiceTransactionId: 4, DisplayAs: '3' , InsuranceOrder:3 },
                    { ServiceTransactionId: 5, DisplayAs: '5' , InsuranceOrder:4 },
                ];
                component.validateInsuranceOrder(services);
                expect(services[0].InsuranceOrder).toEqual(1);
                expect(services[1].InsuranceOrder).toEqual(2);
                expect(services[2].InsuranceOrder).toEqual(3);
                expect(services[3].InsuranceOrder).toEqual(4);
                expect(services[4].InsuranceOrder).toEqual(5);
            });
    });

    describe('resetAllowedAmounts function ->', () => {
        beforeEach(() => {

            spyOn(component, 'recalculateEstimatedInsuranceForAllServices');
            spyOn(component, 'updateHasChanges');
            component.services = [{Fee: 125, Tax: 12.50, Discount: 5, AllowedAmount: 100, InsuranceEstimates:[]}];            
        });

        it('should reset each service AllowedAmount to null', () => {
            component.services[0].InsuranceEstimates.push({
                IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1, AllowedAmount: 100, AllowedAmountOverride: 110 }),            
            
            component.resetAllowedAmounts();
            expect(component.services[0].AllowedAmount).toBeNull();           
        });

        it('should reset each service insurance estimate AllowedAmountOverride to null', () => {
            component.services[0].InsuranceEstimates.push({
                IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1, AllowedAmount: 100, AllowedAmountOverride: 110 ,AllowedAmountDisplay: 100}),          
            component.services[0].InsuranceEstimates.push({
                IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1, AllowedAmount: 100, AllowedAmountOverride: 130, AllowedAmountDisplay: 130 }), 
            component.resetAllowedAmounts(); 
            expect(component.services[0].InsuranceEstimates[0].AllowedAmountOverride).toBeNull();
            expect(component.services[0].InsuranceEstimates[1].AllowedAmountOverride).toBeNull();
        });
        
        it('should reset each service insurance estimate AllowedAmountDisplay to original estimate AllowedAmount value', () => {
            component.services[0].InsuranceEstimates.push({
                IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1, AllowedAmount: 100, AllowedAmountOverride: 110 ,AllowedAmountDisplay: 100}),            
            component.services[0].InsuranceEstimates.push({
                IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1, AllowedAmount: 110, AllowedAmountOverride: 130, AllowedAmountDisplay: 130 }), 
            component.resetAllowedAmounts();            
            expect(component.services[0].InsuranceEstimates[0].AllowedAmountDisplay).toEqual(component.services[0].InsuranceEstimates[0].AllowedAmount);            
            expect(component.services[0].InsuranceEstimates[1].AllowedAmountDisplay).toEqual(component.services[0].InsuranceEstimates[1].AllowedAmount);
        });
       
        it('should call SoarInsuranceEstimateHttpService.calculateDiscountAndTaxAndInsuranceEstimate', () => {
            component.services[0] ={
                Fee: 125, Tax: 12.50, Discount: 5, InsuranceEstimates:
                [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmountOverride: null },
                { IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1 }]
            };
            component.resetAllowedAmounts();
            expect(mockSoarInsuranceEstimateHttpService.calculateDiscountAndTaxAndInsuranceEstimate).toHaveBeenCalled();
            expect(component.isResetAllowedAmountsDisabled).toBe(true);
        });

    });

    describe('calculateInsuranceOrder function ->', () => {

        it('should set 1 as insurance order when component services are empty', () => {
            component.services = [];
            let servicesToAdd = [];
            servicesToAdd.push({ Fee: 125, Tax: 12.50, Discount: 5 });
            servicesToAdd[0].InsuranceOrder = component.calculateInsuranceOrder();

            expect(servicesToAdd[0].InsuranceOrder).toBe(1);
        });

        it('should increment insurance order for services to add when component services\' insurance order is undefined', () => {
            component.services = [
                { EncounterId: 1, ServiceTransactionId: 1 },
                { EncounterId: 1, ServiceTransactionId: 2 }
            ];
            let servicesToAdd = [];
            servicesToAdd.push({ Fee: 125, Tax: 12.50, Discount: 5 });
            servicesToAdd.push({ Fee: 125, Tax: 12.50, Discount: 5 });

            servicesToAdd.forEach(service => {
                service.InsuranceOrder = component.calculateInsuranceOrder();
                component.services.push(service);
            });

            expect(servicesToAdd[0].InsuranceOrder).toBe(1);
            expect(servicesToAdd[1].InsuranceOrder).toBe(2);
        });

        it('should increment insurance order for services to add when all component services\' insurance order has value', () => {
            component.services = [
                { EncounterId: 1, ServiceTransactionId: 1, InsuranceOrder: 1 },
                { EncounterId: 1, ServiceTransactionId: 2, InsuranceOrder: 2 }
            ];
            let servicesToAdd = [];
            servicesToAdd.push({ Fee: 125, Tax: 12.50, Discount: 5 });
            servicesToAdd.push({ Fee: 125, Tax: 12.50, Discount: 5 });

            servicesToAdd.forEach(service => {
                service.InsuranceOrder = component.calculateInsuranceOrder();
                component.services.push(service);
            });

            expect(servicesToAdd[0].InsuranceOrder).toBe(3);
            expect(servicesToAdd[1].InsuranceOrder).toBe(4);
        });

        it('should increment insurance order for services to add when some component services\' insurance order has value', () => {
            component.services = [
                { EncounterId: 1, ServiceTransactionId: 1, InsuranceOrder: null },
                { EncounterId: 1, ServiceTransactionId: 2, InsuranceOrder: 1 }
            ];
            let servicesToAdd = [];
            servicesToAdd.push({ Fee: 125, Tax: 12.50, Discount: 5 });
            servicesToAdd.push({ Fee: 125, Tax: 12.50, Discount: 5 });

            servicesToAdd.forEach(service => {
                service.InsuranceOrder = component.calculateInsuranceOrder();
                component.services.push(service);
            });

            expect(servicesToAdd[0].InsuranceOrder).toBe(2);
            expect(servicesToAdd[1].InsuranceOrder).toBe(3);
        });
    })

});


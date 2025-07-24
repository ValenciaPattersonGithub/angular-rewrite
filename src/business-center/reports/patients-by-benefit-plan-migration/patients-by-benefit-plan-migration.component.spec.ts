import { ComponentFixture, TestBed, async, tick } from '@angular/core/testing';
import { PatientsByBenefitPlanMigrationComponent } from './patients-by-benefit-plan-migration.component';
import { SimpleChange } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

describe('PatientsByBenefitPlanMigrationComponent', () => {
    let component: PatientsByBenefitPlanMigrationComponent;
    let fixture: ComponentFixture<PatientsByBenefitPlanMigrationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PatientsByBenefitPlanMigrationComponent],
            imports: [
                TranslateModule.forRoot(),
            ],
            providers: [
                TranslateService,
            ],
        });
        fixture = TestBed.createComponent(PatientsByBenefitPlanMigrationComponent);
        component = fixture.componentInstance;
    });

    const testData = {
        benefitPatientBenefitPlans: [
            {
                benefitPlanName: 'AaronCase Benefit Plan',
                patientBenefitPlans: [
                    {
                        benefitPlan: { name: 'AaronCase Benefit Plan' },
                        patient: {
                            address: {},
                            appointments: [],
                            encounters: [],
                            lastServiceDate: '0001-01-01T00:00:00',
                            location: { appointments: [], nameLine1: 'Innovators', rooms: [] },
                            patientCode: 'GIBJE3',
                            totalBalance: 0,
                            serviceTransactions: [],
                            codePrefix: 'GIBJE',
                            codeSequence: '3',
                            firstName: 'Jerry',
                            lastName: 'Gibbson',
                            middleName: 'T',
                            suffixName: 'OL',
                        },
                        priority: 0,
                    },
                    {
                        benefitPlan: { name: 'AaronCase Benefit Plan' },
                        patient: {
                            address: {},
                            appointments: [],
                            encounters: [],
                            lastServiceDate: '0001-01-01T00:00:00',
                            location: { appointments: [], nameLine1: 'Innovators', rooms: [] },
                            patientCode: 'HUFJA10',
                            totalBalance: 0,
                            serviceTransactions: [],
                            codePrefix: 'HUFJA',
                            codeSequence: '10',
                            firstName: 'Jacob',
                            lastName: 'Huff',
                            middleName: 'T',
                            suffixName: 'M1',
                        },
                        priority: 0,
                    },
                ],
            },
            {
                benefitPlanName: 'InnoPlan',
                patientBenefitPlans: [
                    {
                        benefitPlan: { name: 'InnoPlan' },
                        patient: {
                            address: {},
                            appointments: [],
                            encounters: [],
                            lastServiceDate: '0001-01-01T00:00:00',
                            location: { appointments: [], nameLine1: 'Innovators', rooms: [] },
                            patientCode: 'AATCS1',
                            totalBalance: 0,
                            serviceTransactions: [],
                            codePrefix: 'AATCS',
                            codeSequence: '1',
                            firstName: 'CSTPT2',
                            lastName: 'AAT',
                            middleName: 'T',
                            suffixName: 'Sr',
                        },
                        priority: 0,
                    },
                    {
                        benefitPlan: { name: 'InnoPlan' },
                        patient: {
                            address: {},
                            appointments: [],
                            encounters: [],
                            lastServiceDate: '0001-01-01T00:00:00',
                            location: { appointments: [], nameLine1: 'Innovators', rooms: [] },
                            patientCode: 'ADJPR1',
                            totalBalance: 0,
                            serviceTransactions: [],
                            codePrefix: 'ADJPR',
                            codeSequence: '1',
                            firstName: 'Provider',
                            lastName: 'AdjustmentBy',
                            middleName: 'T',
                            suffixName: '',
                        },
                        priority: 0,
                    },
                    {
                        benefitPlan: { name: 'InnoPlan' },
                        patient: {
                            address: {},
                            appointments: [],
                            encounters: [],
                            lastServiceDate: '0001-01-01T00:00:00',
                            location: { appointments: [], nameLine1: 'Innovators', rooms: [] },
                            patientCode: 'PATCO8',
                            totalBalance: 0,
                            serviceTransactions: [],
                            codePrefix: 'PATCO',
                            codeSequence: '8',
                            firstName: 'Coordinator',
                            lastName: 'Patient',
                            middleName: 'T',
                            suffixName: '',
                        },
                        priority: 0,
                    },
                    {
                        benefitPlan: { name: 'InnoPlan' },
                        patient: {
                            address: {},
                            appointments: [],
                            encounters: [],
                            lastServiceDate: '0001-01-01T00:00:00',
                            location: { appointments: [], nameLine1: 'Innovators', rooms: [] },
                            patientCode: 'MARCO16',
                            totalBalance: 0,
                            serviceTransactions: [],
                            codePrefix: 'MARCO',
                            codeSequence: '16',
                            firstName: 'Collin',
                            lastName: 'Martin',
                            middleName: 'T',
                            suffixName: 'Jr',
                        },
                        priority: 0,
                    },
                    {
                        benefitPlan: { name: 'InnoPlan' },
                        patient: {
                            address: {},
                            appointments: [],
                            encounters: [],
                            lastServiceDate: '0001-01-01T00:00:00',
                            location: { appointments: [], nameLine1: 'Innovators', rooms: [] },
                            patientCode: 'GASCH1',
                            totalBalance: 0,
                            serviceTransactions: [],
                            codePrefix: 'GASCH',
                            codeSequence: '1',
                            firstName: 'Chase_Duplicate Check',
                            lastName: 'Gasper',
                            middleName: 'T',
                            suffixName: 'Jr',
                        },
                        priority: 0,
                    },
                    {
                        benefitPlan: { name: 'InnoPlan' },
                        patient: {
                            address: {},
                            appointments: [],
                            encounters: [],
                            lastServiceDate: '0001-01-01T00:00:00',
                            location: { appointments: [], nameLine1: 'Innovators', rooms: [] },
                            patientCode: 'FRATE1',
                            totalBalance: 0,
                            serviceTransactions: [],
                            codePrefix: 'FRATE',
                            codeSequence: '1',
                            firstName: 'Terrance',
                            lastName: 'Frank',
                            middleName: 'T',
                            suffixName: 'Jr',
                        },
                        priority: 0,
                    },
                ],
            },
        ],
        generatedAtDateTime: '2023-09-04T10:43:23.7231704Z',
        generatedByUserCode: 'ADMFU1',
        locationOrPracticeEmail: 'info@test.com',
        locationOrPracticeName: 'PracticePerf26899',
        locationOrPracticePhone: '11111-222',
        reportTitle: 'Patients By Benefit Plan',
    };

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should set isDataLoaded to true when reportData$ emits data', async(() => {
        
        component.ngOnChanges({
            data: {
                previousValue: null,
                currentValue: testData,
                firstChange: true,
                isFirstChange: () => true,
            },
        });

        expect(component.isDataLoaded).toBe(false);

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(component.isDataLoaded).toBe(true);
        });
    }));

    it('should call ngOnChanges when data changes', () => {
        
        spyOn(component, 'ngOnChanges').and.callThrough();

        const changes: { [key: string]: SimpleChange } = {
            data: new SimpleChange(null, testData, false),
        };

        component.ngOnChanges(changes);

        expect(component.ngOnChanges).toHaveBeenCalledWith(changes);
    });
});

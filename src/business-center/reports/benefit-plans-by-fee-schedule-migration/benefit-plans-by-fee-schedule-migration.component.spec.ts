import { ComponentFixture, TestBed, async, tick } from '@angular/core/testing';
import { BenefitPlansByFeeScheduleMigrationComponent } from './benefit-plans-by-fee-schedule-migration.component';
import { SimpleChange } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

describe('BenefitPlansByFeeScheduleMigrationComponent', () => {
    let component: BenefitPlansByFeeScheduleMigrationComponent;
    let fixture: ComponentFixture<BenefitPlansByFeeScheduleMigrationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BenefitPlansByFeeScheduleMigrationComponent],
            imports: [TranslateModule.forRoot()]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BenefitPlansByFeeScheduleMigrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const testData = {
        "feeSchedulesBenefitPlans": [
            {
                "feeSchedule": "000 Fee schedule for Progressive.",
                "benefitPlans": [
                    {
                        "name": "Becky Plan",
                        "planGroupNumber": "12345",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "Copy of Test Plan",
                        "planGroupNumber": "1231231312",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "Test Plan",
                        "planGroupNumber": "1231231312",
                        "patientBenefitPlans": []
                    }
                ]
            },
            {
                "feeSchedule": "463536_01_Fee",
                "benefitPlans": [
                    {
                        "name": "463536_01plan",
                        "planGroupNumber": "444444",
                        "patientBenefitPlans": []
                    }
                ]
            },
            {
                "feeSchedule": "463536_02",
                "benefitPlans": [
                    {
                        "name": "463536_02",
                        "planGroupNumber": "33335",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "463536_03PLAN",
                        "planGroupNumber": "44444",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "Copy of 463536_03PLAN",
                        "planGroupNumber": "44444",
                        "patientBenefitPlans": []
                    }
                ]
            }

        ],
        "generatedAtDateTime": "2023-09-11T14:33:19.7931929Z",
        "generatedByUserCode": "ADMFU1",
        "locationOrPracticeEmail": "info@test.com",
        "locationOrPracticeName": "PracticePerf26899",
        "locationOrPracticePhone": "11111-222",
        "reportTitle": "Benefit Plans By FeeSchedule"
    };

    describe('Refresh the data', () => {
        it('should create the component', () => {
           
            component.data = testData;
            component.refreshData = jasmine.createSpy();
            component.ngOnChanges();
            expect(component.refreshData).toHaveBeenCalled();
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    


  
});
